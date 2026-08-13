import "server-only";

import { getVariantWithProduct } from "@/modules/catalog";
import { getSetting } from "@/modules/content";
import { GoldPriceUnavailableError, lineTotal, priceVariant } from "@/modules/pricing";
import {
  clearAnonCartToken,
  getOrCreateAnonCartToken,
  readAnonCartToken,
} from "@/server/auth/session";
import type { CartItemRow, CartRow } from "@/server/db/types";

import type { Cart, CartItem } from "../domain/types";
import {
  deleteCartItem,
  findCartByAnonToken,
  findCartById,
  findCartByUserId,
  findCartItemById,
  findCartItems,
  findOpenCartItemForVariant,
  insertCart,
  insertCartItem,
  updateCartItemQty,
  updateCartOwner,
  updateCartStatus,
} from "../repo/order.repo";

const MAX_ITEM_QTY = 20;

export class CartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartError";
  }
}

async function getOrCreateOpenCart(userId: string | null): Promise<CartRow> {
  if (userId) {
    const existing = await findCartByUserId(userId);
    if (existing) return existing;
    return insertCart({ userId });
  }

  const anonToken = await getOrCreateAnonCartToken();
  const existing = await findCartByAnonToken(anonToken);
  if (existing) return existing;
  return insertCart({ anonToken });
}

/**
 * اگر کاربر وارد شده و سبد مهمان هم دارد، اقلام مهمان به سبد کاربر ادغام
 * می‌شوند تا با ورود، خرید ناتمام از بین نرود.
 */
async function mergeAnonCartIfNeeded(userId: string): Promise<CartRow | null> {
  const anonToken = await readAnonCartToken();
  const [userCart, anonCart] = await Promise.all([
    findCartByUserId(userId),
    anonToken ? findCartByAnonToken(anonToken) : Promise.resolve(null),
  ]);

  if (anonCart && !userCart) {
    await updateCartOwner(anonCart.id, { userId, anonToken: null });
    await clearAnonCartToken();
    const adopted = await findCartById(anonCart.id);
    if (!adopted) throw new CartError("سبد خرید پیدا نشد.");
    return adopted;
  }

  if (anonCart && userCart && anonCart.id !== userCart.id) {
    const anonItems = await findCartItems(anonCart.id);

    for (const item of anonItems) {
      const existing = await findOpenCartItemForVariant({
        cartId: userCart.id,
        variantId: item.variantId,
        personalizationId: item.personalizationId,
        treasureId: item.treasureId,
      });

      if (existing) {
        const merged = Math.min(existing.quantity + item.quantity, MAX_ITEM_QTY);
        await updateCartItemQty(existing.id, merged);
        await deleteCartItem(item.id);
      } else {
        await insertCartItem({
          cartId: userCart.id,
          variantId: item.variantId,
          quantity: Math.min(item.quantity, MAX_ITEM_QTY),
          personalizationId: item.personalizationId,
          treasureId: item.treasureId,
        });
        await deleteCartItem(item.id);
      }
    }

    await updateCartStatus(anonCart.id, "abandoned");
    await clearAnonCartToken();
    return userCart;
  }

  return userCart;
}

async function toLiveCartItem(row: CartItemRow): Promise<CartItem> {
  const loaded = await getVariantWithProduct(row.variantId);

  if (!loaded) {
    return {
      id: row.id,
      cartId: row.cartId,
      variantId: row.variantId,
      quantity: row.quantity,
      personalizationId: row.personalizationId,
      treasureId: row.treasureId,
      productTitle: "محصول ناموجود",
      variantTitle: "",
      slug: "",
      weightMg: 0,
      karat: 18,
      stockQty: 0,
      unitPriceRial: null,
      lineTotalRial: null,
      breakdown: null,
    };
  }

  let unitPriceRial: number | null = null;
  let lineTotalRial: number | null = null;
  let breakdown: CartItem["breakdown"] = null;

  try {
    breakdown = await priceVariant(loaded.pricingParams, {
      withPersonalization: Boolean(row.personalizationId),
    });
    unitPriceRial = breakdown.unitPriceRial;
    lineTotalRial = lineTotal(breakdown.unitPriceRial, row.quantity);
  } catch (error) {
    if (!(error instanceof GoldPriceUnavailableError)) throw error;
  }

  return {
    id: row.id,
    cartId: row.cartId,
    variantId: row.variantId,
    quantity: row.quantity,
    personalizationId: row.personalizationId,
    treasureId: row.treasureId,
    productTitle: loaded.product.title,
    variantTitle: loaded.variant.title,
    slug: loaded.product.slug,
    weightMg: loaded.variant.weightMg,
    karat: loaded.variant.karat,
    stockQty: loaded.variant.stockQty,
    unitPriceRial,
    lineTotalRial,
    breakdown,
  };
}

async function buildCartView(row: CartRow | null, userId: string | null): Promise<Cart> {
  if (!row) {
    return {
      id: null,
      userId,
      items: [],
      itemCount: 0,
      subtotalRial: 0,
      goldTotalMg: 0,
      shippingRial: 0,
      totalRial: 0,
      priceAvailable: true,
    };
  }

  const rows = await findCartItems(row.id);
  const items = await Promise.all(rows.map(toLiveCartItem));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const priceAvailable = items.every((item) => item.lineTotalRial !== null);
  const subtotalRial = priceAvailable
    ? items.reduce((sum, item) => sum + (item.lineTotalRial ?? 0), 0)
    : null;
  const goldTotalMg = items.reduce((sum, item) => sum + item.weightMg * item.quantity, 0);

  let shippingRial: number | null = null;
  let totalRial: number | null = null;

  if (subtotalRial !== null) {
    const [flatRate, freeThreshold] = await Promise.all([
      getSetting("shipping.flat_rate_rial"),
      getSetting("shipping.free_threshold_rial"),
    ]);
    shippingRial = freeThreshold > 0 && subtotalRial >= freeThreshold ? 0 : flatRate;
    totalRial = subtotalRial + shippingRial;
  }

  return {
    id: row.id,
    userId: row.userId,
    items,
    itemCount,
    subtotalRial,
    goldTotalMg,
    shippingRial,
    totalRial,
    priceAvailable,
  };
}

export async function getCart(userId: string | null): Promise<Cart> {
  if (userId) {
    const row = await mergeAnonCartIfNeeded(userId);
    return buildCartView(row, userId);
  }

  const anonToken = await readAnonCartToken();
  const row = anonToken ? await findCartByAnonToken(anonToken) : null;
  return buildCartView(row, null);
}

async function assertCartItemOwner(
  itemId: string,
  userId: string | null,
): Promise<CartItemRow> {
  const item = await findCartItemById(itemId);
  if (!item) throw new CartError("این قلم در سبد پیدا نشد.");

  const cart = await findCartById(item.cartId);
  if (!cart || cart.status !== "open") throw new CartError("این قلم در سبد پیدا نشد.");

  if (userId) {
    if (cart.userId !== userId) throw new CartError("این قلم در سبد پیدا نشد.");
    return item;
  }

  const anonToken = await readAnonCartToken();
  if (!anonToken || cart.anonToken !== anonToken) {
    throw new CartError("این قلم در سبد پیدا نشد.");
  }

  return item;
}

export async function addToCart(input: {
  userId: string | null;
  variantId: string;
  quantity: number;
  personalizationId?: string;
  treasureId?: string;
}): Promise<Cart> {
  if (input.quantity < 1) throw new CartError("تعداد باید بزرگ‌تر از صفر باشد.");

  const loaded = await getVariantWithProduct(input.variantId);

  if (!loaded || loaded.product.status !== "active" || !loaded.variant.isActive) {
    throw new CartError("این محصول در حال حاضر برای فروش موجود نیست.");
  }

  if (loaded.variant.stockQty < 1) {
    throw new CartError(`موجودی «${loaded.product.title}» تمام شده است.`);
  }

  const cart = await getOrCreateOpenCart(input.userId);

  const existing = await findOpenCartItemForVariant({
    cartId: cart.id,
    variantId: input.variantId,
    personalizationId: input.personalizationId ?? null,
    treasureId: input.treasureId ?? null,
  });

  const nextQty = (existing?.quantity ?? 0) + input.quantity;

  if (nextQty > MAX_ITEM_QTY) {
    throw new CartError("حداکثر ۲۰ عدد از هر قلم می‌توانید به سبد اضافه کنید.");
  }

  if (nextQty > loaded.variant.stockQty) {
    throw new CartError(`موجودی «${loaded.product.title}» برای این تعداد کافی نیست.`);
  }

  if (existing) {
    await updateCartItemQty(existing.id, nextQty);
  } else {
    await insertCartItem({
      cartId: cart.id,
      variantId: input.variantId,
      quantity: input.quantity,
      personalizationId: input.personalizationId ?? null,
      treasureId: input.treasureId ?? null,
    });
  }

  return getCart(input.userId);
}

export async function updateItem(input: {
  userId: string | null;
  itemId: string;
  quantity: number;
}): Promise<Cart> {
  if (input.quantity < 1) throw new CartError("تعداد باید بزرگ‌تر از صفر باشد.");
  if (input.quantity > MAX_ITEM_QTY) {
    throw new CartError("حداکثر ۲۰ عدد از هر قلم می‌توانید بخرید.");
  }

  const item = await assertCartItemOwner(input.itemId, input.userId);
  const loaded = await getVariantWithProduct(item.variantId);

  if (loaded && input.quantity > loaded.variant.stockQty) {
    throw new CartError(`موجودی «${loaded.product.title}» برای این تعداد کافی نیست.`);
  }

  await updateCartItemQty(item.id, input.quantity);
  return getCart(input.userId);
}

export async function removeItem(input: {
  userId: string | null;
  itemId: string;
}): Promise<Cart> {
  const item = await assertCartItemOwner(input.itemId, input.userId);
  await deleteCartItem(item.id);
  return getCart(input.userId);
}

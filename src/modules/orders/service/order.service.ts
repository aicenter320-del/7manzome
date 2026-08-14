import "server-only";

import { decrementStock, getVariantWithProduct, incrementStock } from "@/modules/catalog";
import { getSetting } from "@/modules/content";
import { notify, sendTemplatedSms } from "@/modules/notifications";
import { createPayment } from "@/modules/payments";
import {
  GoldPriceUnavailableError,
  getAllCurrentGoldPrices,
  lineTotal,
  priceVariant,
} from "@/modules/pricing";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";
import type { NewOrderItemRow, OrderItemRow, OrderRow, ShipmentRow } from "@/server/db/types";
import { logger } from "@/server/logger";
import { currentJalaliYear, fromJalali } from "@/shared/lib/jalali";
import { sanitizeText } from "@/shared/lib/persian";
import type { GoldKarat } from "@/shared/types/enums";

import { buildOrderNumber } from "../domain/order-status";
import type {
  Order,
  OrderItem,
  OrderStatusEvent,
  OrderSummary,
  PlaceOrderResult,
  Shipment,
  ShippingAddress,
} from "../domain/types";
import {
  countItemsForOrders,
  countOrdersForAdmin,
  countOrdersForUser,
  findOrderById,
  findOrderItems,
  findOrdersForAdmin,
  findOrdersForUser,
  findShipmentByOrderId,
  findStatusHistory,
  insertOrder,
  insertOrderItems,
  insertStatusHistory,
  nextOrderSequence,
  updateCartStatus,
} from "../repo/order.repo";
import { CartError, getCart } from "./cart.service";

export class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
}

export class ShopClosedError extends OrderError {
  constructor(message: string) {
    super(message);
    this.name = "ShopClosedError";
  }
}

export class EmptyCartError extends OrderError {
  constructor() {
    super("سبد خرید خالی است. ابتدا محصولی اضافه کنید.");
    this.name = "EmptyCartError";
  }
}

export class OutOfStockError extends OrderError {
  constructor(title: string) {
    super(`موجودی «${title}» برای این تعداد کافی نیست.`);
    this.name = "OutOfStockError";
  }
}

export class PriceUnavailableError extends OrderError {
  constructor() {
    super("قیمت طلا در حال حاضر در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.");
    this.name = "PriceUnavailableError";
  }
}

export class OrderAccessError extends OrderError {
  constructor() {
    super("این سفارش پیدا نشد.");
    this.name = "OrderAccessError";
  }
}

function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.orderId,
    variantId: row.variantId,
    productTitle: row.productTitle,
    variantTitle: row.variantTitle,
    sku: row.sku,
    quantity: row.quantity,
    weightMg: row.weightMg,
    karat: row.karat,
    goldPricePerGramRial: row.goldPricePerGramRial,
    goldValueRial: row.goldValueRial,
    makingFeeBp: row.makingFeeBp,
    makingFeeRial: row.makingFeeRial,
    profitBp: row.profitBp,
    profitRial: row.profitRial,
    premiumRial: row.premiumRial,
    packagingRial: row.packagingRial,
    personalizationRial: row.personalizationRial,
    vatBp: row.vatBp,
    vatRial: row.vatRial,
    unitPriceRial: row.unitPriceRial,
    lineTotalRial: row.lineTotalRial,
    personalizationId: row.personalizationId,
  };
}

function toShipment(row: ShipmentRow): Shipment {
  return {
    id: row.id,
    orderId: row.orderId,
    carrier: row.carrier,
    trackingCode: row.trackingCode,
    status: row.status,
    costRial: row.costRial,
    shippedAt: row.shippedAt,
    deliveredAt: row.deliveredAt,
  };
}

function toOrder(
  row: OrderRow,
  items: OrderItemRow[],
  history: OrderStatusEvent[],
  shipment: Shipment | null,
): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    userId: row.userId,
    status: row.status,
    subtotalRial: row.subtotalRial,
    discountRial: row.discountRial,
    shippingRial: row.shippingRial,
    vatRial: row.vatRial,
    totalRial: row.totalRial,
    goldTotalMg: row.goldTotalMg,
    goldPriceSnapshot: row.goldPriceSnapshot,
    recipientName: row.recipientName,
    recipientPhone: row.recipientPhone,
    shippingAddress: row.shippingAddress,
    customerNote: row.customerNote,
    internalNote: row.internalNote,
    treasureId: row.treasureId,
    placedAt: row.placedAt,
    paidAt: row.paidAt,
    cancelledAt: row.cancelledAt,
    cancellationReason: row.cancellationReason,
    createdAt: row.createdAt,
    items: items.map(toOrderItem),
    history,
    shipment,
  };
}

function toHistory(
  rows: Awaited<ReturnType<typeof findStatusHistory>>,
): OrderStatusEvent[] {
  return rows.map((row) => ({
    id: row.id,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    note: row.note,
    actorUserId: row.actorUserId,
    createdAt: row.createdAt,
  }));
}

function toSummary(row: OrderRow, itemCount: number): OrderSummary {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    status: row.status,
    totalRial: row.totalRial,
    goldTotalMg: row.goldTotalMg,
    itemCount,
    recipientName: row.recipientName,
    placedAt: row.placedAt,
    createdAt: row.createdAt,
  };
}

async function hydrateOrder(row: OrderRow): Promise<Order> {
  const [items, historyRows, shipmentRow] = await Promise.all([
    findOrderItems(row.id),
    findStatusHistory(row.id),
    findShipmentByOrderId(row.id),
  ]);

  return toOrder(
    row,
    items,
    toHistory(historyRows),
    shipmentRow ? toShipment(shipmentRow) : null,
  );
}

interface PricedLine {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  weightMg: number;
  karat: GoldKarat;
  personalizationId: string | null;
  unitPriceRial: number;
  lineTotalRial: number;
  vatRial: number;
  goldPricePerGramRial: number;
  goldValueRial: number;
  makingFeeBp: number;
  makingFeeRial: number;
  profitBp: number;
  profitRial: number;
  premiumRial: number;
  packagingRial: number;
  personalizationRial: number;
  vatBp: number;
}

/**
 * ثبت سفارش با قفل قیمت.
 *
 * کسر موجودی، ساخت سفارش و تبدیل سبد در یک تلاش انجام می‌شود؛ اگر هر کدام
 * شکست بخورد، موجودی برمی‌گردد تا رزرو یتیم نماند.
 */
export async function placeOrder(input: {
  userId: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: ShippingAddress;
  customerNote?: string;
  treasureId?: string;
}): Promise<PlaceOrderResult> {
  const isOpen = await getSetting("shop.is_open");
  if (!isOpen) {
    const message = await getSetting("shop.closed_message");
    throw new ShopClosedError(message);
  }

  const cart = await getCart(input.userId);

  if (!cart.id || cart.items.length === 0) throw new EmptyCartError();

  if (!cart.priceAvailable) throw new PriceUnavailableError();

  const pricedLines: PricedLine[] = [];

  for (const item of cart.items) {
    const loaded = await getVariantWithProduct(item.variantId);

    if (!loaded || loaded.product.status !== "active" || !loaded.variant.isActive) {
      throw new OrderError(`«${item.productTitle}» دیگر برای فروش موجود نیست.`);
    }

    if (loaded.variant.stockQty < item.quantity) {
      throw new OutOfStockError(loaded.product.title);
    }

    let breakdown;
    try {
      breakdown = await priceVariant(loaded.pricingParams, {
        withPersonalization: Boolean(item.personalizationId),
      });
    } catch (error) {
      if (error instanceof GoldPriceUnavailableError) throw new PriceUnavailableError();
      throw error;
    }

    const lineTotalRial = lineTotal(breakdown.unitPriceRial, item.quantity);

    pricedLines.push({
      variantId: loaded.variant.id,
      productTitle: loaded.product.title,
      variantTitle: loaded.variant.title,
      sku: loaded.variant.sku,
      quantity: item.quantity,
      weightMg: breakdown.weightMg,
      karat: breakdown.karat,
      personalizationId: item.personalizationId,
      unitPriceRial: breakdown.unitPriceRial,
      lineTotalRial,
      vatRial: breakdown.vatRial,
      goldPricePerGramRial: breakdown.goldPricePerGramRial,
      goldValueRial: breakdown.goldValueRial,
      makingFeeBp: breakdown.makingFeeBp,
      makingFeeRial: breakdown.makingFeeRial,
      profitBp: breakdown.profitBp,
      profitRial: breakdown.profitRial,
      premiumRial: breakdown.premiumRial,
      packagingRial: breakdown.packagingRial,
      personalizationRial: breakdown.personalizationRial,
      vatBp: breakdown.vatBp,
    });
  }

  // جمع کل از جمع مبالغ گردشده اقلام؛ نه گرد کردن مجدد جمع (قانون دامنه ۲).
  const subtotalRial = pricedLines.reduce((sum, line) => sum + line.lineTotalRial, 0);
  const vatRial = pricedLines.reduce((sum, line) => sum + line.vatRial * line.quantity, 0);
  const goldTotalMg = pricedLines.reduce(
    (sum, line) => sum + line.weightMg * line.quantity,
    0,
  );

  const [flatRate, freeThreshold, goldPriceSnapshot] = await Promise.all([
    getSetting("shipping.flat_rate_rial"),
    getSetting("shipping.free_threshold_rial"),
    getAllCurrentGoldPrices(),
  ]);

  const shippingRial =
    freeThreshold > 0 && subtotalRial >= freeThreshold ? 0 : flatRate;
  const discountRial = 0;
  const totalRial = subtotalRial - discountRial + shippingRial;

  const year = currentJalaliYear();
  const yearStartAt = fromJalali({ year, month: 1, day: 1 });
  const now = Date.now();

  const address: ShippingAddress = {
    province: sanitizeText(input.shippingAddress.province, 50),
    city: sanitizeText(input.shippingAddress.city, 50),
    addressLine: sanitizeText(input.shippingAddress.addressLine, 300),
    ...(input.shippingAddress.postalCode
      ? { postalCode: input.shippingAddress.postalCode }
      : {}),
    ...(input.shippingAddress.plate
      ? { plate: sanitizeText(input.shippingAddress.plate, 20) }
      : {}),
    ...(input.shippingAddress.unit
      ? { unit: sanitizeText(input.shippingAddress.unit, 20) }
      : {}),
  };

  const decremented: Array<{ variantId: string; quantity: number }> = [];

  let orderRow: OrderRow;

  try {
    for (const line of pricedLines) {
      await decrementStock(line.variantId, line.quantity);
      decremented.push({ variantId: line.variantId, quantity: line.quantity });
    }

    orderRow = await db.transaction(async (tx) => {
      const sequence = await nextOrderSequence(yearStartAt, tx);
      const orderNumber = buildOrderNumber(year, sequence);

      const created = await insertOrder(
        {
          orderNumber,
          userId: input.userId,
          status: "created",
          subtotalRial,
          discountRial,
          shippingRial,
          vatRial,
          totalRial,
          goldTotalMg,
          goldPriceSnapshot,
          recipientName: sanitizeText(input.recipientName, 80),
          recipientPhone: input.recipientPhone,
          shippingAddress: address,
          customerNote: input.customerNote
            ? sanitizeText(input.customerNote, 500)
            : null,
          treasureId: input.treasureId ?? cart.items.find((item) => item.treasureId)?.treasureId ?? null,
          placedAt: now,
        },
        tx,
      );

      const itemRows: NewOrderItemRow[] = pricedLines.map((line) => ({
        orderId: created.id,
        variantId: line.variantId,
        productTitle: line.productTitle,
        variantTitle: line.variantTitle,
        sku: line.sku,
        quantity: line.quantity,
        weightMg: line.weightMg,
        karat: line.karat,
        goldPricePerGramRial: line.goldPricePerGramRial,
        goldValueRial: line.goldValueRial,
        makingFeeBp: line.makingFeeBp,
        makingFeeRial: line.makingFeeRial,
        profitBp: line.profitBp,
        profitRial: line.profitRial,
        premiumRial: line.premiumRial,
        packagingRial: line.packagingRial,
        personalizationRial: line.personalizationRial,
        vatBp: line.vatBp,
        vatRial: line.vatRial,
        unitPriceRial: line.unitPriceRial,
        lineTotalRial: line.lineTotalRial,
        personalizationId: line.personalizationId,
      }));

      await insertOrderItems(itemRows, tx);

      await insertStatusHistory(
        {
          orderId: created.id,
          fromStatus: null,
          toStatus: "created",
          actorUserId: input.userId,
        },
        tx,
      );

      await updateCartStatus(cart.id!, "converted", tx);

      return created;
    });
  } catch (error) {
    for (const item of decremented) {
      await incrementStock(item.variantId, item.quantity).catch((restoreError: unknown) => {
        logger.error("stock restore after failed placeOrder failed", {
          variantId: item.variantId,
          error: String(restoreError),
        });
      });
    }
    throw error;
  }

  let payment: { paymentId: string; paymentNumber: string; nextUrl: string };

  try {
    payment = await createPayment({
      purpose: "order",
      orderId: orderRow.id,
      amountRial: totalRial,
      payerUserId: input.userId,
    });
  } catch (error) {
    logger.error("createPayment after placeOrder failed", {
      orderId: orderRow.id,
      error: String(error),
    });
    const message =
      error instanceof Error
        ? error.message
        : "ثبت پرداخت سفارش با خطا مواجه شد. لطفاً دوباره تلاش کنید.";
    throw new OrderError(message);
  }

  const { transitionOrder } = await import("./order-status.service");
  await transitionOrder({
    orderId: orderRow.id,
    to: "payment_pending",
    actorUserId: input.userId,
  });

  await sendTemplatedSms(input.recipientPhone, "orderPlaced", {
    orderNumber: orderRow.orderNumber,
  }).catch((error: unknown) => {
    logger.warn("order placed sms failed", { orderId: orderRow.id, error: String(error) });
  });

  await notify({
    userId: input.userId,
    kind: "order_placed",
    body: `سفارش ${orderRow.orderNumber} ثبت شد. پس از تایید پرداخت، آماده‌سازی آغاز می‌شود.`,
    link: `/dashboard/orders/${orderRow.id}`,
  }).catch((error: unknown) => {
    logger.warn("order placed notification failed", {
      orderId: orderRow.id,
      error: String(error),
    });
  });

  await recordAudit({
    actorUserId: input.userId,
    actorRole: "customer",
    action: "order.placed",
    entityType: "order",
    entityId: orderRow.id,
    summary: `ثبت سفارش ${orderRow.orderNumber} به مبلغ ${totalRial} ریال`,
    meta: { orderNumber: orderRow.orderNumber, totalRial, paymentId: payment.paymentId },
  });

  logger.info("order placed", {
    orderId: orderRow.id,
    orderNumber: orderRow.orderNumber,
    userId: input.userId,
  });

  return {
    orderId: orderRow.id,
    orderNumber: orderRow.orderNumber,
    paymentId: payment.paymentId,
    nextUrl: payment.nextUrl,
  };
}

export async function getOrderForUser(orderId: string, userId: string): Promise<Order> {
  const row = await findOrderById(orderId);
  if (!row || row.userId !== userId) throw new OrderAccessError();
  return hydrateOrder(row);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const row = await findOrderById(orderId);
  if (!row) return null;
  return hydrateOrder(row);
}

export async function getOrdersForUser(
  userId: string,
  options?: { limit?: number; offset?: number },
): Promise<{ orders: OrderSummary[]; total: number }> {
  const [rows, total] = await Promise.all([
    findOrdersForUser(userId, options),
    countOrdersForUser(userId),
  ]);

  const counts = await countItemsForOrders(rows.map((row) => row.id));

  return {
    orders: rows.map((row) => toSummary(row, counts.get(row.id) ?? 0)),
    total,
  };
}

export async function listOrdersForAdmin(filters: {
  status?: Order["status"];
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: OrderSummary[]; total: number }> {
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const query = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search ? { search: filters.search } : {}),
  };

  const [rows, total] = await Promise.all([
    findOrdersForAdmin({ ...query, limit, offset }),
    countOrdersForAdmin(query),
  ]);

  const counts = await countItemsForOrders(rows.map((row) => row.id));

  return {
    orders: rows.map((row) => toSummary(row, counts.get(row.id) ?? 0)),
    total,
  };
}

export {
  countOrders,
  countOrdersByStatus,
  countOrdersSince,
  countReturnedShipments,
  countStuckOrders,
  findBuyerStats,
  findCountedOrdersBetween,
  findOrderItemMarginsBetween,
  sumGoldTotalMgSince,
} from "../repo/order.repo";

export type {
  BuyerStatRow,
  CountedOrderSlice,
  OrderItemMarginRow,
} from "../repo/order.repo";

export { CartError, getCart };

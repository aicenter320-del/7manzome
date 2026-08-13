"use server";

import { revalidatePath } from "next/cache";

import { ActionError, createAction } from "@/server/actions/action-kit";

import {
  addToCartSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from "../schema/order.schema";
import { addToCart, CartError, removeItem, updateItem } from "../service/cart.service";

function rethrowCartError(error: unknown): never {
  if (error instanceof CartError) throw new ActionError(error.message);
  throw error;
}

export const addToCartAction = createAction({
  name: "orders.addToCart",
  schema: addToCartSchema,
  auth: "guest",
  handler: async ({ input, user }) => {
    try {
      const cart = await addToCart({
        userId: user?.id ?? null,
        variantId: input.variantId,
        quantity: input.quantity,
        ...(input.personalizationId ? { personalizationId: input.personalizationId } : {}),
        ...(input.treasureId ? { treasureId: input.treasureId } : {}),
      });

      revalidatePath("/cart");
      revalidatePath("/checkout");

      return { itemCount: cart.itemCount };
    } catch (error) {
      rethrowCartError(error);
    }
  },
});

export const updateCartItemAction = createAction({
  name: "orders.updateCartItem",
  schema: updateCartItemSchema,
  auth: "guest",
  handler: async ({ input, user }) => {
    try {
      const cart = await updateItem({
        userId: user?.id ?? null,
        itemId: input.itemId,
        quantity: input.quantity,
      });

      revalidatePath("/cart");
      revalidatePath("/checkout");

      return { itemCount: cart.itemCount };
    } catch (error) {
      rethrowCartError(error);
    }
  },
});

export const removeCartItemAction = createAction({
  name: "orders.removeCartItem",
  schema: removeCartItemSchema,
  auth: "guest",
  handler: async ({ input, user }) => {
    try {
      await removeItem({
        userId: user?.id ?? null,
        itemId: input.itemId,
      });

      revalidatePath("/cart");
      revalidatePath("/checkout");

      return { ok: true as const };
    } catch (error) {
      rethrowCartError(error);
    }
  },
});

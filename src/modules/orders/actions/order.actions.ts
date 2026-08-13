"use server";

import { revalidatePath } from "next/cache";

import { ActionError, createAction } from "@/server/actions/action-kit";

import {
  cancelOrderSchema,
  placeOrderSchema,
  transitionOrderSchema,
  updateShipmentSchema,
} from "../schema/order.schema";
import {
  EmptyCartError,
  OrderAccessError,
  OrderError,
  OutOfStockError,
  placeOrder,
  PriceUnavailableError,
  ShopClosedError,
} from "../service/order.service";
import {
  cancelOrder,
  InvalidTransitionError,
  transitionOrder,
  updateShipmentForOrder,
} from "../service/order-status.service";

function rethrowOrderError(error: unknown): never {
  if (
    error instanceof OrderError ||
    error instanceof ShopClosedError ||
    error instanceof EmptyCartError ||
    error instanceof OutOfStockError ||
    error instanceof PriceUnavailableError ||
    error instanceof OrderAccessError ||
    error instanceof InvalidTransitionError
  ) {
    throw new ActionError(error.message);
  }
  throw error;
}

export const placeOrderAction = createAction({
  name: "orders.placeOrder",
  schema: placeOrderSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      const result = await placeOrder({
        userId: user.id,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        shippingAddress: input.shippingAddress,
        ...(input.customerNote ? { customerNote: input.customerNote } : {}),
        ...(input.treasureId ? { treasureId: input.treasureId } : {}),
      });

      revalidatePath("/cart");
      revalidatePath("/checkout");
      revalidatePath("/dashboard/orders");

      return result;
    } catch (error) {
      rethrowOrderError(error);
    }
  },
});

export const cancelOrderAction = createAction({
  name: "orders.cancelOrder",
  schema: cancelOrderSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await cancelOrder({
        orderId: input.orderId,
        userId: user.id,
        ...(input.reason ? { reason: input.reason } : {}),
      });

      revalidatePath("/dashboard/orders");
      revalidatePath(`/dashboard/orders/${input.orderId}`);

      return { ok: true as const };
    } catch (error) {
      rethrowOrderError(error);
    }
  },
});

export const transitionOrderAction = createAction({
  name: "orders.transitionOrder",
  schema: transitionOrderSchema,
  auth: "required",
  permissions: ["order:transition"],
  handler: async ({ input, user }) => {
    try {
      await transitionOrder({
        orderId: input.orderId,
        to: input.to,
        actorUserId: user.id,
        ...(input.note ? { note: input.note } : {}),
        ...(input.trackingCode ? { trackingCode: input.trackingCode } : {}),
        ...(input.carrier ? { carrier: input.carrier } : {}),
      });

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${input.orderId}`);
      revalidatePath(`/dashboard/orders/${input.orderId}`);

      return { ok: true as const };
    } catch (error) {
      rethrowOrderError(error);
    }
  },
});

export const updateShipmentAction = createAction({
  name: "orders.updateShipment",
  schema: updateShipmentSchema,
  auth: "required",
  permissions: ["shipment:write"],
  handler: async ({ input, user }) => {
    try {
      const shipment = await updateShipmentForOrder({
        orderId: input.orderId,
        actorUserId: user.id,
        ...(input.carrier ? { carrier: input.carrier } : {}),
        ...(input.trackingCode ? { trackingCode: input.trackingCode } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.costRial !== undefined ? { costRial: input.costRial } : {}),
      });

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${input.orderId}`);

      return { shipmentId: shipment.id };
    } catch (error) {
      rethrowOrderError(error);
    }
  },
});

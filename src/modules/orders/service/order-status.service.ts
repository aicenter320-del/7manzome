import "server-only";

import { incrementStock } from "@/modules/catalog";
import { notify, sendTemplatedSms } from "@/modules/notifications";
import { creditGold, getBalanceFromEntries } from "@/modules/treasury";
import { recordAudit } from "@/server/audit";
import { logger } from "@/server/logger";
import { sanitizeText } from "@/shared/lib/persian";
import { ORDER_STATUS_LABELS, type OrderStatus, type ShipmentStatus } from "@/shared/types/enums";

import { canCustomerCancel, canTransition } from "../domain/order-status";
import type { Order, Shipment } from "../domain/types";
import {
  findOrderById,
  findOrderItems,
  findShipmentByOrderId,
  insertShipment,
  insertStatusHistory,
  updateOrderStatus,
  updateShipment,
} from "../repo/order.repo";
import { getOrderById, OrderAccessError, OrderError } from "./order.service";

export class InvalidTransitionError extends OrderError {
  constructor() {
    super("این تغییر وضعیت برای سفارش مجاز نیست.");
    this.name = "InvalidTransitionError";
  }
}

function toShipmentView(row: {
  id: string;
  orderId: string;
  carrier: string | null;
  trackingCode: string | null;
  status: ShipmentStatus;
  costRial: number;
  shippedAt: number | null;
  deliveredAt: number | null;
}): Shipment {
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

async function restoreStock(orderId: string): Promise<void> {
  const items = await findOrderItems(orderId);

  for (const item of items) {
    if (!item.variantId) continue;
    await incrementStock(item.variantId, item.quantity);
  }
}

async function upsertShipmentForShip(input: {
  orderId: string;
  carrier?: string;
  trackingCode?: string;
}): Promise<void> {
  const existing = await findShipmentByOrderId(input.orderId);
  const now = Date.now();

  if (existing) {
    await updateShipment(existing.id, {
      status: "shipped",
      shippedAt: existing.shippedAt ?? now,
      ...(input.carrier !== undefined ? { carrier: input.carrier } : {}),
      ...(input.trackingCode !== undefined ? { trackingCode: input.trackingCode } : {}),
    });
    return;
  }

  await insertShipment({
    orderId: input.orderId,
    status: "shipped",
    shippedAt: now,
    carrier: input.carrier ?? null,
    trackingCode: input.trackingCode ?? null,
  });
}

/**
 * گذار وضعیت سفارش. تنها نقطهٔ مجاز برای عوض کردن status.
 * هیچ‌جا نباید مستقیم `UPDATE orders SET status` زده شود.
 */
export async function transitionOrder(input: {
  orderId: string;
  to: OrderStatus;
  actorUserId?: string | null;
  note?: string;
  trackingCode?: string;
  carrier?: string;
}): Promise<Order> {
  const row = await findOrderById(input.orderId);
  if (!row) throw new OrderAccessError();

  if (!canTransition(row.status, input.to)) {
    throw new InvalidTransitionError();
  }

  const now = Date.now();
  const note = input.note ? sanitizeText(input.note, 300) : null;

  await updateOrderStatus(input.orderId, {
    status: input.to,
    ...(input.to === "paid" ? { paidAt: now } : {}),
    ...(input.to === "cancelled" ? { cancelledAt: now, cancellationReason: note } : {}),
  });

  if (input.to === "cancelled") {
    await restoreStock(input.orderId);
  }

  if (input.to === "shipped") {
    await upsertShipmentForShip({
      orderId: input.orderId,
      ...(input.carrier ? { carrier: input.carrier } : {}),
      ...(input.trackingCode ? { trackingCode: input.trackingCode } : {}),
    });
  }

  if (input.to === "delivered") {
    const shipment = await findShipmentByOrderId(input.orderId);
    if (shipment) {
      await updateShipment(shipment.id, { status: "delivered", deliveredAt: now });
    }
  }

  await insertStatusHistory({
    orderId: input.orderId,
    fromStatus: row.status,
    toStatus: input.to,
    actorUserId: input.actorUserId,
    note,
  });

  await recordAudit({
    actorUserId: input.actorUserId,
    action: `order.${input.to}`,
    entityType: "order",
    entityId: input.orderId,
    summary: `تغییر وضعیت سفارش ${row.orderNumber} از ${ORDER_STATUS_LABELS[row.status]} به ${ORDER_STATUS_LABELS[input.to]}`,
    meta: { from: row.status, to: input.to },
  });

  if (input.to === "shipped") {
    const trackingCode = input.trackingCode;
    await sendTemplatedSms(row.recipientPhone, "orderShipped", {
      orderNumber: row.orderNumber,
      ...(trackingCode ? { trackingCode } : {}),
    }).catch((error: unknown) => {
      logger.warn("order shipped sms failed", {
        orderId: input.orderId,
        error: String(error),
      });
    });

    await notify({
      userId: row.userId,
      kind: "order_shipped",
      body: trackingCode
        ? `سفارش ${row.orderNumber} ارسال شد. کد رهگیری: ${trackingCode}`
        : `سفارش ${row.orderNumber} ارسال شد.`,
      link: `/dashboard/orders/${row.id}`,
    }).catch((error: unknown) => {
      logger.warn("order shipped notification failed", {
        orderId: input.orderId,
        error: String(error),
      });
    });
  }

  if (input.to === "delivered") {
    await notify({
      userId: row.userId,
      kind: "order_delivered",
      body: `سفارش ${row.orderNumber} تحویل شد.`,
      link: `/dashboard/orders/${row.id}`,
    }).catch((error: unknown) => {
      logger.warn("order delivered notification failed", {
        orderId: input.orderId,
        error: String(error),
      });
    });
  }

  const updated = await getOrderById(input.orderId);
  if (!updated) throw new OrderAccessError();
  return updated;
}

/**
 * تسویه سفارش پس از تایید قطعی پرداخت.
 *
 * ⚠️ payments این تابع را صدا نمی‌زند (جلوگیری از دور وابستگی).
 * ماژول admin بعداً پس از تایید پرداخت آن را فراخوانی می‌کند.
 *
 * اگر سفارش از قبل paid باشد برمی‌گردد. اعتبار طلا اگر قبلاً برای همین
 * سفارش در دفتر کل آمده باشد تکرار نمی‌شود.
 */
export async function settlePaidOrder(
  orderId: string,
  actorUserId?: string | null,
): Promise<Order> {
  const row = await findOrderById(orderId);
  if (!row) throw new OrderAccessError();

  if (row.status === "cancelled" || row.status === "refunded") {
    throw new OrderError("این سفارش قابل تسویه نیست.");
  }

  if (row.status === "created" || row.status === "payment_pending") {
    await transitionOrder({
      orderId,
      to: "paid",
      actorUserId,
      note: "تایید پرداخت",
    });
  }

  const settled = await getOrderById(orderId);
  if (!settled) throw new OrderAccessError();

  if (!settled.treasureId) return settled;

  const { entries } = await getBalanceFromEntries(settled.treasureId);
  const alreadyCredited = entries.some(
    (entry) => entry.referenceType === "order" && entry.referenceId === orderId,
  );

  if (alreadyCredited) return settled;

  for (const item of settled.items) {
    await creditGold({
      treasureId: settled.treasureId,
      amountMg: item.weightMg * item.quantity,
      karat: item.karat,
      source: "purchase",
      referenceType: "order",
      referenceId: orderId,
      goldPricePerGramRial: item.goldPricePerGramRial,
      valueRial: item.goldValueRial * item.quantity,
      actorUserId,
    });
  }

  return settled;
}

export async function cancelOrder(input: {
  orderId: string;
  userId: string;
  reason?: string;
}): Promise<Order> {
  const row = await findOrderById(input.orderId);
  if (!row || row.userId !== input.userId) throw new OrderAccessError();

  if (!canCustomerCancel(row.status)) {
    throw new OrderError("این سفارش دیگر قابل لغو نیست.");
  }

  return transitionOrder({
    orderId: input.orderId,
    to: "cancelled",
    actorUserId: input.userId,
    note: input.reason,
  });
}

export async function updateShipmentForOrder(input: {
  orderId: string;
  actorUserId: string;
  carrier?: string;
  trackingCode?: string;
  status?: ShipmentStatus;
  costRial?: number;
}): Promise<Shipment> {
  const row = await findOrderById(input.orderId);
  if (!row) throw new OrderAccessError();

  const existing = await findShipmentByOrderId(input.orderId);

  if (!existing) {
    const created = await insertShipment({
      orderId: input.orderId,
      carrier: input.carrier ?? null,
      trackingCode: input.trackingCode ?? null,
      status: input.status ?? "pending",
      costRial: input.costRial ?? 0,
    });

    await recordAudit({
      actorUserId: input.actorUserId,
      action: "shipment.created",
      entityType: "order",
      entityId: input.orderId,
      summary: `ثبت مرسوله برای سفارش ${row.orderNumber}`,
    });

    return toShipmentView(created);
  }

  await updateShipment(existing.id, {
    ...(input.carrier !== undefined ? { carrier: input.carrier } : {}),
    ...(input.trackingCode !== undefined ? { trackingCode: input.trackingCode } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.costRial !== undefined ? { costRial: input.costRial } : {}),
  });

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "shipment.updated",
    entityType: "order",
    entityId: input.orderId,
    summary: `به‌روزرسانی مرسوله سفارش ${row.orderNumber}`,
  });

  const updated = await findShipmentByOrderId(input.orderId);
  if (!updated) throw new OrderError("مرسوله پیدا نشد.");
  return toShipmentView(updated);
}

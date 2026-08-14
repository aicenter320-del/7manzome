import "server-only";

import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  max,
  or,
  sum,
  type SQL,
} from "drizzle-orm";

import { db, type Database } from "@/server/db";
import {
  cartItems,
  carts,
  orderItems,
  orders,
  orderStatusHistory,
  shipments,
} from "@/server/db/schema";
import type {
  CartItemRow,
  CartRow,
  NewOrderItemRow,
  NewOrderRow,
  OrderItemRow,
  OrderRow,
  OrderStatusHistoryRow,
  ShipmentRow,
} from "@/server/db/types";
import type { CartStatus, OrderStatus, ShipmentStatus } from "@/shared/types/enums";

import { COUNTED_GOLD_STATUSES } from "../domain/order-status";

/** تراکنش Drizzle؛ برای عملیاتی که باید اتمیک باشند. */
export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

function conn(tx?: Tx) {
  return tx ?? db;
}

// ------------------------------------------------------------------
// سبد
// ------------------------------------------------------------------

export async function findCartByUserId(
  userId: string,
  status: CartStatus = "open",
): Promise<CartRow | null> {
  const rows = await db
    .select()
    .from(carts)
    .where(and(eq(carts.userId, userId), eq(carts.status, status)))
    .orderBy(desc(carts.updatedAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function findCartByAnonToken(
  anonToken: string,
  status: CartStatus = "open",
): Promise<CartRow | null> {
  const rows = await db
    .select()
    .from(carts)
    .where(and(eq(carts.anonToken, anonToken), eq(carts.status, status)))
    .orderBy(desc(carts.updatedAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function findCartById(cartId: string): Promise<CartRow | null> {
  const rows = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
  return rows[0] ?? null;
}

export async function insertCart(input: {
  userId?: string | null;
  anonToken?: string | null;
}): Promise<CartRow> {
  const [row] = await db
    .insert(carts)
    .values({
      userId: input.userId ?? null,
      anonToken: input.anonToken ?? null,
      status: "open",
    })
    .returning();

  if (!row) throw new Error("ساخت سبد خرید شکست خورد.");
  return row;
}

export async function updateCartStatus(
  cartId: string,
  status: CartStatus,
  tx?: Tx,
): Promise<void> {
  await conn(tx).update(carts).set({ status }).where(eq(carts.id, cartId));
}

export async function updateCartOwner(
  cartId: string,
  input: { userId: string; anonToken: string | null },
): Promise<void> {
  await db
    .update(carts)
    .set({ userId: input.userId, anonToken: input.anonToken })
    .where(eq(carts.id, cartId));
}

export async function findCartItems(cartId: string): Promise<CartItemRow[]> {
  return db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId))
    .orderBy(desc(cartItems.createdAt));
}

export async function findCartItemById(itemId: string): Promise<CartItemRow | null> {
  const rows = await db.select().from(cartItems).where(eq(cartItems.id, itemId)).limit(1);
  return rows[0] ?? null;
}

/**
 * قلم باز با همان گونه و همان شخصی‌سازی و گنجینه؛ برای ادغام تعداد.
 * مقایسه NULL در SQL با `=` کار نمی‌کند، برای همین صریح isNull می‌گذاریم.
 */
export async function findOpenCartItemForVariant(input: {
  cartId: string;
  variantId: string;
  personalizationId?: string | null;
  treasureId?: string | null;
}): Promise<CartItemRow | null> {
  const personalizationClause = input.personalizationId
    ? eq(cartItems.personalizationId, input.personalizationId)
    : isNull(cartItems.personalizationId);

  const treasureClause = input.treasureId
    ? eq(cartItems.treasureId, input.treasureId)
    : isNull(cartItems.treasureId);

  const rows = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, input.cartId),
        eq(cartItems.variantId, input.variantId),
        personalizationClause,
        treasureClause,
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function insertCartItem(input: {
  cartId: string;
  variantId: string;
  quantity: number;
  personalizationId?: string | null;
  treasureId?: string | null;
}): Promise<CartItemRow> {
  const [row] = await db
    .insert(cartItems)
    .values({
      cartId: input.cartId,
      variantId: input.variantId,
      quantity: input.quantity,
      personalizationId: input.personalizationId ?? null,
      treasureId: input.treasureId ?? null,
    })
    .returning();

  if (!row) throw new Error("افزودن قلم به سبد شکست خورد.");
  return row;
}

export async function updateCartItemQty(itemId: string, quantity: number): Promise<void> {
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
}

export async function deleteCartItem(itemId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
}

// ------------------------------------------------------------------
// سفارش
// ------------------------------------------------------------------

/** شماره ترتیبی بعدی سفارش در سال شمسی جاری. */
export async function nextOrderSequence(yearStartAt: number, tx?: Tx): Promise<number> {
  const rows = await conn(tx)
    .select({ value: count() })
    .from(orders)
    .where(gte(orders.createdAt, yearStartAt));

  return (rows[0]?.value ?? 0) + 1;
}

export async function insertOrder(input: NewOrderRow, tx?: Tx): Promise<OrderRow> {
  const [row] = await conn(tx).insert(orders).values(input).returning();
  if (!row) throw new Error("ثبت سفارش شکست خورد.");
  return row;
}

export async function insertOrderItems(
  items: NewOrderItemRow[],
  tx?: Tx,
): Promise<OrderItemRow[]> {
  if (items.length === 0) return [];

  const rows = await conn(tx).insert(orderItems).values(items).returning();
  return rows;
}

export async function insertStatusHistory(
  input: {
    orderId: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    actorUserId?: string | null;
    note?: string | null;
  },
  tx?: Tx,
): Promise<OrderStatusHistoryRow> {
  const [row] = await conn(tx)
    .insert(orderStatusHistory)
    .values({
      orderId: input.orderId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      actorUserId: input.actorUserId ?? null,
      note: input.note ?? null,
    })
    .returning();

  if (!row) throw new Error("ثبت تاریخچه وضعیت سفارش شکست خورد.");
  return row;
}

export async function findOrderById(orderId: string): Promise<OrderRow | null> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return rows[0] ?? null;
}

export async function findOrderByNumber(orderNumber: string): Promise<OrderRow | null> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  return rows[0] ?? null;
}

export async function findOrdersForUser(
  userId: string,
  options?: { limit?: number; offset?: number },
): Promise<OrderRow[]> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function findOrdersForAdmin(filters: {
  status?: OrderStatus;
  search?: string;
  limit: number;
  offset: number;
}): Promise<OrderRow[]> {
  const conditions: SQL[] = [];

  if (filters.status) conditions.push(eq(orders.status, filters.status));

  if (filters.search) {
    const pattern = `%${filters.search.replace(/[%_]/g, "")}%`;
    const searchClause = or(
      like(orders.orderNumber, pattern),
      like(orders.recipientName, pattern),
      like(orders.recipientPhone, pattern),
    );
    if (searchClause) conditions.push(searchClause);
  }

  const query = db.select().from(orders);

  return (
    conditions.length > 0 ? query.where(and(...conditions)) : query
  )
    .orderBy(desc(orders.createdAt))
    .limit(filters.limit)
    .offset(filters.offset);
}

export async function findOrderItems(orderId: string): Promise<OrderItemRow[]> {
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function findStatusHistory(orderId: string): Promise<OrderStatusHistoryRow[]> {
  return db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(desc(orderStatusHistory.createdAt));
}

export async function countItemsForOrders(
  orderIds: string[],
): Promise<Map<string, number>> {
  if (orderIds.length === 0) return new Map();

  const rows = await db
    .select({ orderId: orderItems.orderId, value: count() })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);

  return new Map(rows.map((row) => [row.orderId, row.value]));
}

export async function updateOrderStatus(
  orderId: string,
  input: {
    status: OrderStatus;
    paidAt?: number | null;
    cancelledAt?: number | null;
    cancellationReason?: string | null;
  },
  tx?: Tx,
): Promise<void> {
  await conn(tx)
    .update(orders)
    .set({
      status: input.status,
      ...(input.paidAt !== undefined ? { paidAt: input.paidAt } : {}),
      ...(input.cancelledAt !== undefined ? { cancelledAt: input.cancelledAt } : {}),
      ...(input.cancellationReason !== undefined
        ? { cancellationReason: input.cancellationReason }
        : {}),
    })
    .where(eq(orders.id, orderId));
}

export async function updateOrderInternalNote(
  orderId: string,
  internalNote: string | null,
): Promise<void> {
  await db.update(orders).set({ internalNote }).where(eq(orders.id, orderId));
}

export async function countOrders(): Promise<number> {
  const rows = await db.select({ value: count() }).from(orders);
  return rows[0]?.value ?? 0;
}

export async function countOrdersByStatus(): Promise<Record<OrderStatus, number>> {
  const rows = await db
    .select({ status: orders.status, value: count() })
    .from(orders)
    .groupBy(orders.status);

  const result = {} as Record<OrderStatus, number>;
  for (const row of rows) {
    result[row.status] = row.value;
  }
  return result;
}

export async function countOrdersForUser(userId: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.userId, userId));
  return rows[0]?.value ?? 0;
}

export async function countOrdersForAdmin(filters: {
  status?: OrderStatus;
  search?: string;
}): Promise<number> {
  const conditions: SQL[] = [];

  if (filters.status) conditions.push(eq(orders.status, filters.status));

  if (filters.search) {
    const pattern = `%${filters.search.replace(/[%_]/g, "")}%`;
    const searchClause = or(
      like(orders.orderNumber, pattern),
      like(orders.recipientName, pattern),
      like(orders.recipientPhone, pattern),
    );
    if (searchClause) conditions.push(searchClause);
  }

  const query = db.select({ value: count() }).from(orders);
  const rows =
    conditions.length > 0 ? await query.where(and(...conditions)) : await query;

  return rows[0]?.value ?? 0;
}

/** جمع وزن طلای سفارش‌های پرداخت‌شده از یک زمان به بعد. */
export async function sumGoldTotalMgSince(fromAt: number): Promise<number> {
  const rows = await db
    .select({ value: sum(orders.goldTotalMg) })
    .from(orders)
    .where(
      and(
        inArray(orders.status, [...COUNTED_GOLD_STATUSES]),
        gte(orders.paidAt, fromAt),
      ),
    );

  return Number(rows[0]?.value ?? 0);
}

/** تعداد سفارش‌های پرداخت‌شده از یک زمان به بعد. */
export async function countOrdersSince(fromAt: number): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(orders)
    .where(
      and(
        inArray(orders.status, [...COUNTED_GOLD_STATUSES]),
        gte(orders.paidAt, fromAt),
      ),
    );

  return rows[0]?.value ?? 0;
}

// ------------------------------------------------------------------
// مرسوله
// ------------------------------------------------------------------

export async function insertShipment(input: {
  orderId: string;
  carrier?: string | null;
  trackingCode?: string | null;
  status?: ShipmentStatus;
  costRial?: number;
  shippedAt?: number | null;
  deliveredAt?: number | null;
}): Promise<ShipmentRow> {
  const [row] = await db
    .insert(shipments)
    .values({
      orderId: input.orderId,
      carrier: input.carrier ?? null,
      trackingCode: input.trackingCode ?? null,
      status: input.status ?? "pending",
      costRial: input.costRial ?? 0,
      shippedAt: input.shippedAt ?? null,
      deliveredAt: input.deliveredAt ?? null,
    })
    .returning();

  if (!row) throw new Error("ثبت مرسوله شکست خورد.");
  return row;
}

export async function updateShipment(
  shipmentId: string,
  input: {
    carrier?: string | null;
    trackingCode?: string | null;
    status?: ShipmentStatus;
    costRial?: number;
    shippedAt?: number | null;
    deliveredAt?: number | null;
  },
): Promise<void> {
  await db
    .update(shipments)
    .set({
      ...(input.carrier !== undefined ? { carrier: input.carrier } : {}),
      ...(input.trackingCode !== undefined ? { trackingCode: input.trackingCode } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.costRial !== undefined ? { costRial: input.costRial } : {}),
      ...(input.shippedAt !== undefined ? { shippedAt: input.shippedAt } : {}),
      ...(input.deliveredAt !== undefined ? { deliveredAt: input.deliveredAt } : {}),
    })
    .where(eq(shipments.id, shipmentId));
}

export async function findShipmentByOrderId(orderId: string): Promise<ShipmentRow | null> {
  const rows = await db
    .select()
    .from(shipments)
    .where(eq(shipments.orderId, orderId))
    .orderBy(desc(shipments.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export interface CountedOrderSlice {
  id: string;
  userId: string;
  paidAt: number;
  goldTotalMg: number;
  totalRial: number;
  status: OrderStatus;
}

export async function findCountedOrdersBetween(
  fromAt: number,
  toAt: number,
): Promise<CountedOrderSlice[]> {
  const rows = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      paidAt: orders.paidAt,
      goldTotalMg: orders.goldTotalMg,
      totalRial: orders.totalRial,
      status: orders.status,
    })
    .from(orders)
    .where(
      and(
        inArray(orders.status, [...COUNTED_GOLD_STATUSES]),
        isNotNull(orders.paidAt),
        gte(orders.paidAt, fromAt),
        lt(orders.paidAt, toAt),
      ),
    );

  return rows.filter((row): row is CountedOrderSlice => row.paidAt !== null);
}

export interface OrderItemMarginRow {
  orderId: string;
  paidAt: number;
  productTitle: string;
  quantity: number;
  profitRial: number;
  premiumRial: number;
  lineTotalRial: number;
  weightMg: number;
}

export async function findOrderItemMarginsBetween(
  fromAt: number,
  toAt: number,
): Promise<OrderItemMarginRow[]> {
  const rows = await db
    .select({
      orderId: orderItems.orderId,
      paidAt: orders.paidAt,
      productTitle: orderItems.productTitle,
      quantity: orderItems.quantity,
      profitRial: orderItems.profitRial,
      premiumRial: orderItems.premiumRial,
      lineTotalRial: orderItems.lineTotalRial,
      weightMg: orderItems.weightMg,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(
      and(
        inArray(orders.status, [...COUNTED_GOLD_STATUSES]),
        isNotNull(orders.paidAt),
        gte(orders.paidAt, fromAt),
        lt(orders.paidAt, toAt),
      ),
    );

  return rows.filter((row): row is OrderItemMarginRow => row.paidAt !== null);
}

const STUCK_STATUSES: OrderStatus[] = ["paid", "processing", "packed"];

export async function countStuckOrders(updatedBeforeAt: number): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(orders)
    .where(
      and(
        inArray(orders.status, STUCK_STATUSES),
        isNotNull(orders.paidAt),
        lt(orders.paidAt, updatedBeforeAt),
      ),
    );

  return rows[0]?.value ?? 0;
}

export async function countReturnedShipments(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(shipments)
    .where(eq(shipments.status, "returned"));

  return rows[0]?.value ?? 0;
}

export interface BuyerStatRow {
  userId: string;
  orderCount: number;
  lastPaidAt: number;
  spentRial: number;
}

export async function findBuyerStats(): Promise<BuyerStatRow[]> {
  const rows = await db
    .select({
      userId: orders.userId,
      orderCount: count(),
      lastPaidAt: max(orders.paidAt),
      spentRial: sum(orders.totalRial),
    })
    .from(orders)
    .where(and(inArray(orders.status, [...COUNTED_GOLD_STATUSES]), isNotNull(orders.paidAt)))
    .groupBy(orders.userId);

  return rows.flatMap((row) => {
    if (row.lastPaidAt === null) return [];
    return [
      {
        userId: row.userId,
        orderCount: row.orderCount,
        lastPaidAt: row.lastPaidAt,
        spentRial: Number(row.spentRial ?? 0),
      },
    ];
  });
}

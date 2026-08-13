import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type {
  CartStatus,
  GoldKarat,
  OrderStatus,
  ShipmentStatus,
} from "@/shared/types/enums";

import {
  basisPoints,
  counter,
  createdAt,
  idRef,
  jsonColumn,
  mg,
  primaryId,
  rial,
  timestamp,
  updatedAt,
} from "../columns";
import { personalizations, productVariants } from "./catalog";
import { users } from "./identity";
import { treasures } from "./treasury";

/** آدرس تحویل؛ به‌صورت JSON ذخیره می‌شود چون همراه سفارش قفل می‌گردد. */
export interface ShippingAddress {
  province: string;
  city: string;
  addressLine: string;
  postalCode?: string;
  plate?: string;
  unit?: string;
}

/** سبد کاربر واردشده با userId، سبد مهمان با anonToken روی کوکی. */
export const carts = sqliteTable(
  "carts",
  {
    id: primaryId(),
    userId: idRef("user_id").references(() => users.id, { onDelete: "cascade" }),
    anonToken: text("anon_token"),
    status: text("status").$type<CartStatus>().notNull().default("open"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("carts_user_id_idx").on(table.userId),
    uniqueIndex("carts_anon_token_unique").on(table.anonToken),
    index("carts_status_idx").on(table.status),
  ],
);

/**
 * قلم سبد خرید.
 * عمداً هیچ ستون قیمتی ندارد؛ سبد همیشه با قیمت زنده نمایش داده می‌شود. (ADR-0007)
 */
export const cartItems = sqliteTable(
  "cart_items",
  {
    id: primaryId(),
    cartId: idRef("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: idRef("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: counter("quantity").notNull().default(1),

    personalizationId: idRef("personalization_id").references(() => personalizations.id, {
      onDelete: "set null",
    }),

    /** اگر خرید برای گنجینه یک کودک است. */
    treasureId: idRef("treasure_id").references(() => treasures.id, {
      onDelete: "set null",
    }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("cart_items_cart_id_idx").on(table.cartId)],
);

export const orders = sqliteTable(
  "orders",
  {
    id: primaryId(),

    /** شماره قابل‌نمایش با الگوی HM-<سال شمسی>-<شماره ترتیبی>. */
    orderNumber: text("order_number").notNull(),

    userId: idRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    status: text("status").$type<OrderStatus>().notNull().default("created"),

    // --- مبالغ قفل‌شده در لحظه ثبت سفارش ---
    subtotalRial: rial("subtotal_rial").notNull(),
    discountRial: rial("discount_rial").notNull().default(0),
    shippingRial: rial("shipping_rial").notNull().default(0),
    vatRial: rial("vat_rial").notNull().default(0),
    totalRial: rial("total_rial").notNull(),

    /** جمع وزن طلای سفارش. */
    goldTotalMg: mg("gold_total_mg").notNull().default(0),

    /** قیمت مرجع طلا در لحظه ثبت، به تفکیک عیار. */
    goldPriceSnapshot: jsonColumn<Record<string, number>>("gold_price_snapshot"),

    recipientName: text("recipient_name").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    shippingAddress: jsonColumn<ShippingAddress>("shipping_address"),
    customerNote: text("customer_note"),
    internalNote: text("internal_note"),

    /** اگر سفارش برای گنجینه یک کودک ثبت شده. */
    treasureId: idRef("treasure_id").references(() => treasures.id, {
      onDelete: "set null",
    }),

    placedAt: timestamp("placed_at"),
    paidAt: timestamp("paid_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancellationReason: text("cancellation_reason"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("orders_order_number_unique").on(table.orderNumber),
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_treasure_idx").on(table.treasureId),
  ],
);

/**
 * قلم سفارش با تمام ریزمحاسبات قیمت.
 *
 * عنوان محصول و گونه هم کپی می‌شود تا اگر محصول بعداً تغییر کرد یا بایگانی شد،
 * سفارش قدیمی همان چیزی را نشان دهد که مشتری خریده است.
 */
export const orderItems = sqliteTable(
  "order_items",
  {
    id: primaryId(),
    orderId: idRef("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: idRef("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),

    productTitle: text("product_title").notNull(),
    variantTitle: text("variant_title").notNull(),
    sku: text("sku").notNull(),

    quantity: counter("quantity").notNull().default(1),

    weightMg: mg("weight_mg").notNull(),
    karat: counter("karat").$type<GoldKarat>().notNull(),

    // --- ریزمحاسبات قفل‌شده ---
    goldPricePerGramRial: rial("gold_price_per_gram_rial").notNull(),
    goldValueRial: rial("gold_value_rial").notNull(),
    makingFeeBp: basisPoints("making_fee_bp").notNull().default(0),
    makingFeeRial: rial("making_fee_rial").notNull().default(0),
    profitBp: basisPoints("profit_bp").notNull().default(0),
    profitRial: rial("profit_rial").notNull().default(0),
    premiumRial: rial("premium_rial").notNull().default(0),
    packagingRial: rial("packaging_rial").notNull().default(0),
    personalizationRial: rial("personalization_rial").notNull().default(0),
    vatBp: basisPoints("vat_bp").notNull().default(0),
    vatRial: rial("vat_rial").notNull().default(0),
    unitPriceRial: rial("unit_price_rial").notNull(),
    lineTotalRial: rial("line_total_rial").notNull(),

    personalizationId: idRef("personalization_id").references(() => personalizations.id, {
      onDelete: "set null",
    }),

    createdAt: createdAt(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);

/** تاریخچه گذارهای وضعیت سفارش. */
export const orderStatusHistory = sqliteTable(
  "order_status_history",
  {
    id: primaryId(),
    orderId: idRef("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: text("from_status").$type<OrderStatus>(),
    toStatus: text("to_status").$type<OrderStatus>().notNull(),
    actorUserId: idRef("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: createdAt(),
  },
  (table) => [index("order_status_history_order_idx").on(table.orderId)],
);

export const shipments = sqliteTable(
  "shipments",
  {
    id: primaryId(),
    orderId: idRef("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    carrier: text("carrier"),
    trackingCode: text("tracking_code"),
    status: text("status").$type<ShipmentStatus>().notNull().default("pending"),
    costRial: rial("cost_rial").notNull().default(0),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("shipments_order_id_idx").on(table.orderId),
    index("shipments_status_idx").on(table.status),
  ],
);

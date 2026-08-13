import type { PriceBreakdown } from "@/modules/pricing/domain/types";
import type { GoldKarat, OrderStatus, ShipmentStatus } from "@/shared/types/enums";

export type { OrderStatus, ShipmentStatus };

/** آدرس تحویل؛ همراه سفارش قفل می‌شود و بعداً عوض نمی‌شود. */
export interface ShippingAddress {
  province: string;
  city: string;
  addressLine: string;
  postalCode?: string;
  plate?: string;
  unit?: string;
}

/**
 * قلم سبد با قیمت زنده.
 * سبد قیمت ذخیره نمی‌کند؛ این فیلدها هنگام نمایش محاسبه می‌شوند (ADR-0007).
 */
export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  personalizationId: string | null;
  treasureId: string | null;
  productTitle: string;
  variantTitle: string;
  slug: string;
  weightMg: number;
  karat: GoldKarat;
  stockQty: number;
  /** null یعنی قیمت طلا موجود نیست و این ردیف قابل خرید نیست. */
  unitPriceRial: number | null;
  lineTotalRial: number | null;
  breakdown: PriceBreakdown | null;
}

export interface Cart {
  id: string | null;
  userId: string | null;
  items: CartItem[];
  itemCount: number;
  /** null اگر دست‌کم یک قلم بدون قیمت باشد. */
  subtotalRial: number | null;
  goldTotalMg: number;
  shippingRial: number | null;
  totalRial: number | null;
  priceAvailable: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string | null;
  productTitle: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  weightMg: number;
  karat: GoldKarat;
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
  vatRial: number;
  unitPriceRial: number;
  lineTotalRial: number;
  personalizationId: string | null;
}

export interface OrderStatusEvent {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  actorUserId: string | null;
  createdAt: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string | null;
  trackingCode: string | null;
  status: ShipmentStatus;
  costRial: number;
  shippedAt: number | null;
  deliveredAt: number | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotalRial: number;
  discountRial: number;
  shippingRial: number;
  vatRial: number;
  totalRial: number;
  goldTotalMg: number;
  goldPriceSnapshot: Record<string, number> | null;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: ShippingAddress | null;
  customerNote: string | null;
  internalNote: string | null;
  treasureId: string | null;
  placedAt: number | null;
  paidAt: number | null;
  cancelledAt: number | null;
  cancellationReason: string | null;
  createdAt: number;
  items: OrderItem[];
  history: OrderStatusEvent[];
  shipment: Shipment | null;
}

/** نمای فشرده برای فهرست سفارش‌ها. */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalRial: number;
  goldTotalMg: number;
  itemCount: number;
  recipientName: string;
  placedAt: number | null;
  createdAt: number;
}

export interface PlaceOrderResult {
  orderId: string;
  orderNumber: string;
  paymentId: string;
  nextUrl: string;
}

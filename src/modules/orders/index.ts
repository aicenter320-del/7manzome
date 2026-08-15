/**
 * ماژول سفارش‌ها — API عمومی.
 *
 * مسئول: سبد خرید، ثبت سفارش با قفل قیمت، ماشین حالت سفارش و مرسوله.
 *
 * ⚠️ تسویه سفارش پرداخت‌شده (`settlePaidOrder`) از این ماژول صادر می‌شود و
 * توسط admin صدا زده می‌شود؛ payments حق import این ماژول را ندارد.
 *
 * مستندات: docs/03-modules/orders.md
 */

export type {
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEvent,
  OrderSummary,
  PlaceOrderResult,
  Shipment,
  ShippingAddress,
} from "./domain/types";

export {
  TRANSITIONS,
  canTransition,
  nextStatuses,
  isFinalStatus,
  canCustomerCancel,
  isStaffOnlyTransition,
  buildOrderNumber,
  latestCustomerOrderStatus,
  ORDER_STATUSES,
  CUSTOMER_CANCELLABLE_STATUSES,
  COUNTED_GOLD_STATUSES,
} from "./domain/order-status";

export {
  ORDER_JOURNEY_STATIONS,
  ORDER_JOURNEY_CLOSED,
  journeyStationOf,
  isClosedJourneyStatus,
  preferredForwardStatus,
  parseJourneyStation,
} from "./domain/order-journey";
export type { OrderJourneyStationKey } from "./domain/order-journey";

export {
  getCart,
  addToCart,
  updateItem,
  removeItem,
  CartError,
} from "./service/cart.service";

export {
  placeOrder,
  getOrderForUser,
  getOrderById,
  getOrdersForUser,
  getLatestOrderStatusByUserIds,
  listOrdersForAdmin,
  OrderError,
  ShopClosedError,
  EmptyCartError,
  OutOfStockError,
  PriceUnavailableError,
  OrderAccessError,
  countOrders,
  countOrdersByStatus,
  countOrdersSince,
  countReturnedShipments,
  countStuckOrders,
  findBuyerStats,
  findCountedOrdersBetween,
  findOrderItemMarginsBetween,
  sumGoldTotalMgSince,
} from "./service/order.service";

export {
  transitionOrder,
  settlePaidOrder,
  cancelOrder,
  updateShipmentForOrder,
  InvalidTransitionError,
} from "./service/order-status.service";

export {
  addToCartAction,
  updateCartItemAction,
  removeCartItemAction,
} from "./actions/cart.actions";

export {
  placeOrderAction,
  cancelOrderAction,
  transitionOrderAction,
  updateShipmentAction,
} from "./actions/order.actions";

export { CartLine } from "./ui/cart-line";
export { CartPanel } from "./ui/cart-panel";
export { OrderStatusBadge } from "./ui/order-status-badge";
export { OrderJourneyActions } from "./ui/order-journey-actions";
export { CheckoutForm } from "./ui/checkout-form";
export { AddToCartPanel } from "./ui/add-to-cart-panel";
export { ProductBuySection } from "./ui/product-buy-section";

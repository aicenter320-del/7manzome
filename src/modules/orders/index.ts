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
  ORDER_STATUSES,
  CUSTOMER_CANCELLABLE_STATUSES,
  COUNTED_GOLD_STATUSES,
} from "./domain/order-status";

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
export { OrderStatusBadge } from "./ui/order-status-badge";
export { CheckoutForm } from "./ui/checkout-form";
export { AddToCartPanel } from "./ui/add-to-cart-panel";

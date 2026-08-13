# ماژول: سفارش‌ها (`orders`)

**وضعیت:** ✅ کامل

## مسئولیت

سبد خرید، ثبت سفارش با قفل قیمت، ماشین حالت سفارش، و مرسوله.

## API عمومی

```ts
export { addToCartAction, updateCartItemAction, removeCartItemAction } from "./actions/cart.actions";
export { placeOrderAction, cancelOrderAction, transitionOrderAction, updateShipmentAction } from "./actions/order.actions";
export { getCart, addToCart, CartError } from "./service/cart.service";
export { getOrderById, getOrdersForUser, listOrdersForAdmin, placeOrder } from "./service/order.service";
export { transitionOrder, settlePaidOrder, cancelOrder } from "./service/order-status.service";
export { canTransition, nextStatuses, ORDER_STATUSES, buildOrderNumber } from "./domain/order-status";
export type { Cart, Order, OrderItem, OrderStatus, Shipment } from "./domain/types";
```

`settlePaidOrder` را ماژول `payments` صدا نمی‌زند (جلوگیری از دور وابستگی). پس از تایید پرداخت، `admin` آن را فراخوانی می‌کند تا سفارش به `paid` برود و در صورت وجود `treasureId` طلا وارد دفتر کل شود.

## جدول‌های دیتابیس

`carts`، `cart_items`، `orders`، `order_items`، `order_status_history`، `shipments`

## وابستگی‌ها

`catalog`، `pricing`، `payments`، `personalization`، `notifications`، `content`، `treasury`

نباید import کند: `gifting`، `admin`، `identity` (سشن و rbac از `server/`).

## قوانین دامنه

- **قیمت در لحظه `placeOrder` قفل می‌شود** و تمام ریزمحاسبات در `order_items` ذخیره می‌گردد.
  سفارش قدیمی هرگز بازمحاسبه نمی‌شود.
- سبد خرید قیمت ذخیره نمی‌کند؛ همیشه با قیمت زنده نمایش داده می‌شود. اگر قیمت طلا موجود نباشد،
  اقلام با `price=null` و پرچم `priceAvailable=false` نشان داده می‌شوند و ثبت سفارش متوقف می‌شود.
- ثبت سفارش، کسر موجودی و تبدیل سبد با هم انجام می‌شوند؛ اگر ثبت شکست بخورد موجودی برمی‌گردد.
- تغییر وضعیت فقط از طریق `transitionOrder`؛ گذارهای نامعتبر خطا می‌دهند.
- هر تغییر وضعیت در `order_status_history` با عامل و زمان ثبت می‌شود.
- `order_number` قابل‌نمایش با الگوی `HM-<سال شمسی>-<شماره ترتیبی>` ساخته می‌شود.
- سبد مهمان با کوکی `anon_token` نگه داشته می‌شود و هنگام ورود به سبد کاربر ادغام می‌گردد.
- طلا فقط در `settlePaidOrder` (پس از تایید قطعی پرداخت) و فقط اگر `treasureId` روی سفارش باشد وارد دفتر کل می‌شود.

## مسیرها

- `app/(site)/cart`
- `app/(site)/checkout`
- `app/(dashboard)/dashboard/orders` و `[orderId]`
- `app/admin/orders`

صفحات مسیر بالا روی API عمومی این ماژول ساخته شده‌اند؛ `AddToCartPanel` گونه را انتخاب و به سبد اضافه می‌کند.

## نقاط باز

- کد تخفیف و کمپین: خارج از دامنه MVP، اما ستون `discount_rial` از ابتدا وجود دارد.

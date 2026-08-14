import { eq } from "drizzle-orm";

import { buildOrderNumber } from "@/modules/orders/domain/order-status";
import { calculateVariantPrice, lineTotal } from "@/modules/pricing/domain/pricing-engine";
import { buildPaymentNumber } from "@/modules/payments/domain/payment-status";
import * as schema from "@/server/db/schema";
import { currentJalaliYear } from "@/shared/lib/jalali";
import type { OrderStatus, PaymentStatus, ShipmentStatus } from "@/shared/types/enums";

import { saveReceiptImage } from "./media";
import { creditSeedGold } from "./treasury";
import type {
  SeedCatalog,
  SeedContext,
  SeedPeople,
  SeedTreasury,
  SeedUser,
  SeedVariant,
} from "./types";

const DAY = 86_400_000;

interface OrderSeedSpec {
  sequence: number;
  daysAgo: number;
  parentIndex: number;
  sku: string;
  quantity: number;
  treasureIndex: number | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  withPersonalization: boolean;
  customerNote: string | null;
  trackingCode: string | null;
  shipmentStatus: ShipmentStatus | null;
}

function goldPriceFor(ctx: SeedContext, variant: SeedVariant): number {
  return variant.karat === 24 ? ctx.goldPrice24 : ctx.goldPrice18;
}

function variantBySku(catalog: SeedCatalog, sku: string): SeedVariant {
  const variant = catalog.variants.find((item) => item.sku === sku);
  if (!variant) throw new Error(`گونه ${sku} در داده نمونه پیدا نشد.`);
  return variant;
}

async function insertHistory(
  ctx: SeedContext,
  orderId: string,
  steps: Array<{ from: OrderStatus | null; to: OrderStatus; at: number; note: string }>,
  actorUserId: string,
): Promise<void> {
  await ctx.db.insert(schema.orderStatusHistory).values(
    steps.map((step) => ({
      orderId,
      fromStatus: step.from,
      toStatus: step.to,
      actorUserId,
      note: step.note,
      createdAt: step.at,
    })),
  );
}

export async function seedCommerce(
  ctx: SeedContext,
  catalog: SeedCatalog,
  people: SeedPeople,
  treasury: SeedTreasury,
): Promise<void> {
  const year = currentJalaliYear(ctx.now);
  const banks = await ctx.db.select({ id: schema.bankAccounts.id }).from(schema.bankAccounts);
  const bankId = banks[0]?.id;
  if (!bankId) throw new Error("حساب بانکی نمونه موجود نیست.");

  const addresses = [
    {
      province: "تهران",
      city: "تهران",
      addressLine: "خیابان شریعتی، بالاتر از مطهری، پلاک ۲۱۰، واحد ۴",
      postalCode: "1911811111",
      plate: "۲۱۰",
      unit: "۴",
    },
    {
      province: "اصفهان",
      city: "اصفهان",
      addressLine: "خیابان چهارباغ بالا، کوچه گلستان، پلاک ۱۲",
      postalCode: "8135812345",
      plate: "۱۲",
    },
    {
      province: "فارس",
      city: "شیراز",
      addressLine: "بلوار چمران، مجتمع سپهر، واحد ۸",
      postalCode: "7187654321",
      plate: "۸",
      unit: "۸",
    },
  ];

  const specs: OrderSeedSpec[] = [
    {
      sequence: 1,
      daysAgo: 2,
      parentIndex: 0,
      sku: "PLQ-18-0800",
      quantity: 1,
      treasureIndex: 0,
      status: "payment_pending",
      paymentStatus: "awaiting_transfer",
      withPersonalization: true,
      customerNote: "لطفاً نام آوا به لاتین حک شود.",
      trackingCode: null,
      shipmentStatus: null,
    },
    {
      sequence: 2,
      daysAgo: 4,
      parentIndex: 1,
      sku: "BNG-18-1500",
      quantity: 1,
      treasureIndex: 2,
      status: "payment_pending",
      paymentStatus: "under_review",
      withPersonalization: false,
      customerNote: null,
      trackingCode: null,
      shipmentStatus: null,
    },
    {
      sequence: 3,
      daysAgo: 20,
      parentIndex: 0,
      sku: "STR-18-0900",
      quantity: 1,
      treasureIndex: 1,
      status: "paid",
      paymentStatus: "confirmed",
      withPersonalization: false,
      customerNote: "برای گنجینه رادین.",
      trackingCode: null,
      shipmentStatus: null,
    },
    {
      sequence: 4,
      daysAgo: 16,
      parentIndex: 3,
      sku: "RNG-18-1100",
      quantity: 1,
      treasureIndex: 4,
      status: "processing",
      paymentStatus: "confirmed",
      withPersonalization: true,
      customerNote: "حکاکی Parham.",
      trackingCode: null,
      shipmentStatus: null,
    },
    {
      sequence: 5,
      daysAgo: 12,
      parentIndex: 2,
      sku: "ERP-18-0600",
      quantity: 1,
      treasureIndex: 3,
      status: "shipped",
      paymentStatus: "confirmed",
      withPersonalization: false,
      customerNote: null,
      trackingCode: "IR1234567890",
      shipmentStatus: "shipped",
    },
    {
      sequence: 6,
      daysAgo: 35,
      parentIndex: 0,
      sku: "BNG-18-1500",
      quantity: 1,
      treasureIndex: 0,
      status: "delivered",
      paymentStatus: "confirmed",
      withPersonalization: false,
      customerNote: "هدیه بدو تولد آوا.",
      trackingCode: "IR9988776655",
      shipmentStatus: "delivered",
    },
    {
      sequence: 7,
      daysAgo: 50,
      parentIndex: 7,
      sku: "COIN-HF-24",
      quantity: 1,
      treasureIndex: 8,
      status: "delivered",
      paymentStatus: "confirmed",
      withPersonalization: false,
      customerNote: "برای گنجینه سامان.",
      trackingCode: "IR5544332211",
      shipmentStatus: "delivered",
    },
    {
      sequence: 8,
      daysAgo: 7,
      parentIndex: 5,
      sku: "BAR-1G-24",
      quantity: 1,
      treasureIndex: 6,
      status: "cancelled",
      paymentStatus: null,
      withPersonalization: false,
      customerNote: "آدرس را اشتباه وارد کردم.",
      trackingCode: null,
      shipmentStatus: null,
    },
    {
      sequence: 9,
      daysAgo: 9,
      parentIndex: 4,
      sku: "ANK-18-1700",
      quantity: 1,
      treasureIndex: 5,
      status: "packed",
      paymentStatus: "confirmed",
      withPersonalization: false,
      customerNote: null,
      trackingCode: null,
      shipmentStatus: "pending",
    },
    {
      sequence: 10,
      daysAgo: 22,
      parentIndex: 3,
      sku: "COIN-RB-24",
      quantity: 1,
      treasureIndex: 9,
      status: "paid",
      paymentStatus: "confirmed",
      withPersonalization: false,
      customerNote: "ربع سکه برای رها.",
      trackingCode: null,
      shipmentStatus: null,
    },
  ];

  let paymentSequence = 1;

  for (const spec of specs) {
    const parent = people.parents[spec.parentIndex];
    if (!parent) throw new Error("والد سفارش نمونه پیدا نشد.");
    const variant = variantBySku(catalog, spec.sku);
    const treasure =
      spec.treasureIndex === null ? null : (treasury.treasures[spec.treasureIndex] ?? null);
    const placedAt = ctx.now - spec.daysAgo * DAY;
    const pricePerGram = goldPriceFor(ctx, variant);
    const breakdown = calculateVariantPrice({
      params: {
        kind: variant.kind,
        weightMg: variant.weightMg,
        karat: variant.karat,
        makingFeeBp: variant.makingFeeBp,
        profitBp: variant.profitBp,
        premiumRial: variant.premiumRial,
        packagingRial: variant.packagingRial,
        personalizationRial: variant.personalizationRial,
      },
      goldPricePerGramRial: pricePerGram,
      vatBp: ctx.vatBp,
      withPersonalization: spec.withPersonalization,
    });
    const lineTotalRial = lineTotal(breakdown.unitPriceRial, spec.quantity);
    const vatRial = breakdown.vatRial * spec.quantity;
    const goldTotalMg = variant.weightMg * spec.quantity;
    const shippingRial = lineTotalRial >= ctx.freeThresholdRial ? 0 : ctx.shippingRial;
    const totalRial = lineTotalRial + shippingRial;
    const address = addresses[spec.parentIndex % addresses.length] ?? addresses[0];
    const recipient: SeedUser = parent;

    let personalizationId: string | null = null;
    if (spec.withPersonalization && treasure) {
      const child = people.children.find((item) => item.id === treasure.childId);
      const [personalization] = await ctx.db
        .insert(schema.personalizations)
        .values({
          childId: treasure.childId,
          childNameFa: child?.firstName ?? treasure.childFirstName,
          childNameEn: child?.nameEn ?? treasure.childFirstName,
          message: child?.nameEn ?? treasure.childFirstName,
          createdAt: placedAt,
        })
        .returning({ id: schema.personalizations.id });
      personalizationId = personalization?.id ?? null;
    }

    const [order] = await ctx.db
      .insert(schema.orders)
      .values({
        orderNumber: buildOrderNumber(year, spec.sequence),
        userId: parent.id,
        status: spec.status,
        subtotalRial: lineTotalRial,
        discountRial: 0,
        shippingRial,
        vatRial,
        totalRial,
        goldTotalMg,
        goldPriceSnapshot: { "18": ctx.goldPrice18, "24": ctx.goldPrice24 },
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        recipientPhone: recipient.phone,
        shippingAddress: address,
        customerNote: spec.customerNote,
        treasureId: treasure?.id ?? null,
        placedAt,
        paidAt: spec.paymentStatus === "confirmed" ? placedAt + DAY : null,
        cancelledAt: spec.status === "cancelled" ? placedAt + 8 * 3_600_000 : null,
        cancellationReason: spec.status === "cancelled" ? spec.customerNote : null,
        createdAt: placedAt,
        updatedAt: placedAt,
      })
      .returning();

    if (!order) throw new Error("ساخت سفارش نمونه شکست خورد.");

    await ctx.db.insert(schema.orderItems).values({
      orderId: order.id,
      variantId: variant.id,
      productTitle: variant.productTitle,
      variantTitle: variant.title,
      sku: variant.sku,
      quantity: spec.quantity,
      weightMg: breakdown.weightMg,
      karat: breakdown.karat,
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
      vatRial: breakdown.vatRial,
      unitPriceRial: breakdown.unitPriceRial,
      lineTotalRial,
      personalizationId,
      createdAt: placedAt,
    });

    if (spec.status !== "cancelled") {
      variant.stockQty -= spec.quantity;
      await ctx.db
        .update(schema.productVariants)
        .set({ stockQty: variant.stockQty })
        .where(eq(schema.productVariants.id, variant.id));
    }

    const history = historyFor(spec, placedAt);
    await insertHistory(ctx, order.id, history, people.orderManager.id);

    if (spec.shipmentStatus) {
      await ctx.db.insert(schema.shipments).values({
        orderId: order.id,
        carrier: "پست پیشتاز",
        trackingCode: spec.trackingCode,
        status: spec.shipmentStatus,
        costRial: shippingRial,
        shippedAt: spec.status === "shipped" || spec.status === "delivered" ? placedAt + 4 * DAY : null,
        deliveredAt: spec.status === "delivered" ? placedAt + 7 * DAY : null,
        createdAt: placedAt + 3 * DAY,
      });
    }

    if (spec.paymentStatus) {
      const paymentNumber = buildPaymentNumber(year, paymentSequence);
      paymentSequence += 1;
      const [payment] = await ctx.db
        .insert(schema.payments)
        .values({
          paymentNumber,
          provider: "card_transfer",
          purpose: "order",
          orderId: order.id,
          payerUserId: parent.id,
          amountRial: totalRial,
          bankAccountId: bankId,
          status: spec.paymentStatus,
          expiresAt: placedAt + 3 * DAY,
          confirmedAt: spec.paymentStatus === "confirmed" ? placedAt + DAY : null,
          reviewedByUserId: spec.paymentStatus === "confirmed" ? people.finance.id : null,
          createdAt: placedAt,
          updatedAt: placedAt,
        })
        .returning();

      if (!payment) throw new Error("ساخت پرداخت سفارش شکست خورد.");

      if (spec.paymentStatus === "under_review" || spec.paymentStatus === "confirmed") {
        const referenceNumber = `SEED-ORD-${String(spec.sequence).padStart(4, "0")}`;
        const receipt = await saveReceiptImage(ctx, referenceNumber, totalRial);
        await ctx.db.insert(schema.cardTransferReceipts).values({
          paymentId: payment.id,
          referenceNumber,
          paidAmountRial: totalRial,
          payerName: `${parent.firstName} ${parent.lastName}`,
          payerCardLast4: `12${String(spec.sequence).padStart(2, "0")}`,
          bankName: "ملت",
          paidAt: placedAt + 6 * 3_600_000,
          receiptFileId: receipt.id,
          note: "رسید نمونه seed",
          createdAt: placedAt + 6 * 3_600_000,
        });
      }

      if (
        spec.paymentStatus === "confirmed" &&
        treasure &&
        ["paid", "processing", "packed", "shipped", "delivered"].includes(spec.status)
      ) {
        await creditSeedGold(ctx, {
          treasureId: treasure.id,
          amountMg: goldTotalMg,
          karat: variant.karat,
          source: "purchase",
          referenceType: "order",
          referenceId: order.id,
          goldPricePerGramRial: breakdown.goldPricePerGramRial,
          valueRial: breakdown.goldValueRial * spec.quantity,
          occurredAt: placedAt + DAY,
          actorUserId: people.finance.id,
        });
      }
    }
  }

  for (const [index, contribution] of treasury.contributions.entries()) {
    const occurredAt = ctx.now - (index + 1) * DAY;
    const status: PaymentStatus = contribution.confirmed ? "confirmed" : "under_review";
    const paymentNumber = buildPaymentNumber(year, paymentSequence);
    paymentSequence += 1;
    const [payment] = await ctx.db
      .insert(schema.payments)
      .values({
        paymentNumber,
        provider: "card_transfer",
        purpose: "contribution",
        contributionId: contribution.id,
        amountRial: contribution.amountRial,
        bankAccountId: bankId,
        status,
        expiresAt: occurredAt + 3 * DAY,
        confirmedAt: contribution.confirmed ? occurredAt + DAY : null,
        reviewedByUserId: contribution.confirmed ? people.finance.id : null,
        createdAt: occurredAt,
        updatedAt: occurredAt,
      })
      .returning();

    if (!payment) throw new Error("ساخت پرداخت مشارکت شکست خورد.");

    const referenceNumber = `SEED-GFT-${String(index + 1).padStart(4, "0")}`;
    const receipt = await saveReceiptImage(ctx, referenceNumber, contribution.amountRial);
    await ctx.db.insert(schema.cardTransferReceipts).values({
      paymentId: payment.id,
      referenceNumber,
      paidAmountRial: contribution.amountRial,
      payerName: contribution.contributorName,
      payerCardLast4: `34${String(index).padStart(2, "0")}`,
      bankName: index % 2 === 0 ? "ملت" : "سامان",
      paidAt: occurredAt,
      receiptFileId: receipt.id,
      note: "رسید مشارکت نمونه",
      createdAt: occurredAt,
    });
  }
}

function historyFor(
  spec: OrderSeedSpec,
  placedAt: number,
): Array<{ from: OrderStatus | null; to: OrderStatus; at: number; note: string }> {
  const steps: Array<{ from: OrderStatus | null; to: OrderStatus; at: number; note: string }> = [
    { from: null, to: "created", at: placedAt, note: "ثبت سفارش نمونه" },
  ];

  if (spec.status === "cancelled") {
    steps.push({
      from: "created",
      to: "payment_pending",
      at: placedAt + 60_000,
      note: "منتظر واریز",
    });
    steps.push({
      from: "payment_pending",
      to: "cancelled",
      at: placedAt + 8 * 3_600_000,
      note: spec.customerNote ?? "لغو توسط مشتری",
    });
    return steps;
  }

  steps.push({
    from: "created",
    to: "payment_pending",
    at: placedAt + 60_000,
    note: "منتظر واریز کارت‌به‌کارت",
  });

  const chain: OrderStatus[] = [
    "paid",
    "processing",
    "quality_check",
    "packed",
    "shipped",
    "delivered",
  ];
  const stopAt = spec.status;
  if (stopAt === "payment_pending") return steps;

  let from: OrderStatus = "payment_pending";
  let at = placedAt + DAY;
  for (const to of chain) {
    steps.push({ from, to, at, note: `گذار به ${to}` });
    from = to;
    at += DAY;
    if (to === stopAt) break;
  }

  return steps;
}

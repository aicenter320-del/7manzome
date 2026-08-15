import { NOTIFICATION_TITLES } from "@/modules/notifications/domain/templates";
import * as schema from "@/server/db/schema";

import type { SeedContext, SeedPeople, SeedTreasury } from "./types";

export async function seedPublicContent(ctx: SeedContext): Promise<void> {
  await ctx.db.insert(schema.contentPages).values([
    {
      slug: "about",
      title: "چرا هفت منظومه",
      bodyMarkdown: `هفت منظومه طلافروشی تخصصی کودک است؛ با یک تفاوت روشن: هر هدیه می‌تواند وارد گنجینه طلای او شود.

به‌جای اسباب‌بازی که کهنه می‌شود، زیور، سکه یا شمش می‌خرید. خانواده با یک لینک و بدون ساخت حساب سهم می‌گذارد. کودک قهرمان قصه است؛ در این نسخه مالک قانونی دارایی دارنده حساب است.

## چرا طلا، نه هدیه مصرفی؟

لباس از مد می‌افتد. اسباب‌بازی در کمد گم می‌شود. طلا در گنجینه می‌ماند و با هر مناسبت سنگین‌تر می‌شود. وزن را به میلی‌گرم ثبت می‌کنیم تا سال‌ها بعد همان عدد قابل اتکا باشد.

## قیمت و پرداخت

روی هر محصول وزن، عیار، ارزش طلا، اجرت، سود و مالیات را می‌بینید. سفارش با همان عدد قفل می‌شود. پرداخت فعلاً کارت‌به‌کارت است. طلا فقط پس از تایید قطعی پرداخت وارد دفتر کل می‌شود.

## آنچه در این نسخه نیست

فروش و بازخرید طلا از شما، خرید دوره‌ای خودکار و پیام ویدیویی ارائه نمی‌شود. تمرکز روی ساختن گنجینه کودک است.`,
      status: "published",
      seoTitle: "چرا هفت منظومه | طلای کودک و گنجینه",
      seoDescription: "طلایی که برای کودک می‌ماند: ویترین تخصصی، قیمت شفاف، و هدیه‌ای که خانواده بدون حساب به گنجینه او اضافه می‌کند.",
    },
    {
      slug: "shipping",
      title: "ارسال و بسته‌بندی",
      bodyMarkdown: `سفارش‌ها پس از تایید پرداخت وارد آماده‌سازی می‌شوند.

هزینه ارسال ثابت است مگر اینکه مبلغ سفارش به آستانه ارسال رایگان برسد. زیورآلات در جعبه مقوایی طلایی و سکه/شمش با پلمب ارسال می‌شوند.

ارسال معمولاً با پست پیشتاز است و کد رهگیری پس از خروج از کارگاه در حساب شما دیده می‌شود.`,
      status: "published",
      seoTitle: "ارسال طلای کودک | هفت منظومه",
      seoDescription: "بسته‌بندی هدیه و ارسال امن زیور، سکه و شمش کودک پس از تایید پرداخت.",
    },
    {
      slug: "faq",
      title: "پرسش‌های متداول",
      bodyMarkdown: `پاسخ پرسش‌های رایج درباره گنجینه، پرداخت و هدیه را در همین صفحه و فهرست پایین ببینید.

اگر سوال شما اینجا نیست، از حساب کاربری با پشتیبانی پیام بگذارید.`,
      status: "published",
      seoTitle: "پرسش‌های متداول | هفت منظومه",
      seoDescription: "پاسخ سوال‌های رایج درباره گنجینه طلای کودک و خرید از هفت منظومه.",
    },
  ]);

  await ctx.db.insert(schema.faqs).values([
    {
      question: "گنجینه چیست و چرا بهتر از اسباب‌بازی است؟",
      answer:
        "گنجینه ظرف طلای یک کودک است. هر خرید یا هدیه تاییدشده به‌صورت وزن طلا ثبت می‌شود. اسباب‌بازی کهنه می‌شود؛ گرم طلا در گنجینه می‌ماند.",
      category: "گنجینه",
      sortOrder: 1,
    },
    {
      question: "بدون ساخت حساب چطور طلا هدیه بدهم؟",
      answer:
        "والد لینک گنجینه را برایتان می‌فرستد. مبلغ را انتخاب می‌کنید، یادگاری می‌نویسید و کارت‌به‌کارت واریز می‌کنید. بعد از تایید پرداخت، وزن طلا به گنجینه اضافه می‌شود.",
      category: "هدیه",
      sortOrder: 2,
    },
    {
      question: "پرداخت چطور انجام می‌شود؟",
      answer:
        "فعلاً فقط کارت‌به‌کارت. پس از واریز، تصویر رسید و شماره پیگیری را ارسال می‌کنید تا تیم مالی تایید کند. طلا فقط بعد از تایید وارد گنجینه می‌شود.",
      category: "پرداخت",
      sortOrder: 3,
    },
    {
      question: "آیا می‌توانم طلا را بفروشم یا بازخرید کنم؟",
      answer:
        "در این نسخه فروش و بازخرید طلا از شما نیست. گنجینه برای ماندن طلا پیش کودک ساخته شده، نه برای معامله روزانه.",
      category: "گنجینه",
      sortOrder: 4,
    },
    {
      question: "اگر تا فردا قیمت طلا عوض شود، سفارشم گران می‌شود؟",
      answer:
        "خیر. با ثبت سفارش همان عدد قفل می‌شود. سفارش قدیمی هرگز با نرخ امروز دوباره حساب نمی‌شود.",
      category: "سفارش",
      sortOrder: 5,
    },
    {
      question: "عیار ۱۸ و ۲۴ با هم جمع می‌شوند؟",
      answer:
        "در نمایش، موجودی به عیار ۱۸ نشان داده می‌شود. در داخل سیستم وزن خالص (معادل ۲۴) ذخیره می‌شود تا عیارهای مختلف درست جمع شوند.",
      category: "گنجینه",
      sortOrder: 6,
    },
    {
      question: "حکاکی نام چقدر طول می‌کشد؟",
      answer:
        "پس از تایید پرداخت، سفارش وارد مرحله شخصی‌سازی می‌شود. متن حکاکی همان چیزی است که هنگام ثبت نوشته‌اید و بعد از قفل شدن قابل تغییر نیست.",
      category: "سفارش",
      sortOrder: 7,
    },
    {
      question: "اگر رسید را اشتباه بفرستم چه می‌شود؟",
      answer:
        "پرداخت رد می‌شود و دلیل برای شما نمایش داده می‌شود. می‌توانید رسید درست را دوباره ارسال کنید. طلا تا تایید قطعی وارد گنجینه نمی‌شود.",
      category: "پرداخت",
      sortOrder: 8,
    },
    {
      question: "طلا مال خود کودک است؟",
      answer:
        "کودک قهرمان قصه است. در این نسخه مالک قانونی دارایی دارنده حساب است. این سه نقش عمداً جدا نگه داشته می‌شوند.",
      category: "گنجینه",
      sortOrder: 9,
    },
    {
      question: "از چه مبلغی می‌توانم هدیه بدهم؟",
      answer:
        "حداقل مبلغ روی صفحه هدیه مشخص است. مبالغ پیشنهادی هم هست؛ اگر بخواهید مبلغ دیگری وارد می‌کنید.",
      category: "هدیه",
      sortOrder: 10,
    },
  ]);
}

export async function seedContent(
  ctx: SeedContext,
  people: SeedPeople,
  treasury: SeedTreasury,
): Promise<void> {
  await seedPublicContent(ctx);

  const giftCardSpecs: Array<{
    code: string;
    design: string;
    treasureIndex: number | null;
    contributionIndex: number | null;
    status: "unassigned" | "assigned" | "printed" | "redeemed";
    note: string;
  }> = [
    { code: "HMGC0001", design: "classic", treasureIndex: null, contributionIndex: null, status: "unassigned", note: "کارت خام انبار" },
    { code: "HMGC0002", design: "classic", treasureIndex: null, contributionIndex: null, status: "unassigned", note: "کارت خام انبار" },
    { code: "HMGC0003", design: "star", treasureIndex: 0, contributionIndex: 0, status: "assigned", note: "برای تولد آوا" },
    { code: "HMGC0004", design: "star", treasureIndex: 1, contributionIndex: 2, status: "assigned", note: "مدرسه رادین" },
    { code: "HMGC0005", design: "classic", treasureIndex: 2, contributionIndex: 3, status: "printed", note: "عقیقه کیان" },
    { code: "HMGC0006", design: "moon", treasureIndex: 3, contributionIndex: 4, status: "printed", note: "جشن تکلیف نیکو" },
    { code: "HMGC0007", design: "classic", treasureIndex: 8, contributionIndex: 7, status: "redeemed", note: "گنجینه سامان" },
    { code: "HMGC0008", design: "star", treasureIndex: 4, contributionIndex: 5, status: "redeemed", note: "عیدی پرهام" },
    { code: "HMGC0009", design: "moon", treasureIndex: null, contributionIndex: null, status: "unassigned", note: "رزرو فروشگاه" },
    { code: "HMGC0010", design: "classic", treasureIndex: 5, contributionIndex: 6, status: "assigned", note: "یلدا باران" },
  ];

  for (const card of giftCardSpecs) {
    const treasure = card.treasureIndex === null ? null : treasury.treasures[card.treasureIndex];
    const contribution =
      card.contributionIndex === null ? null : treasury.contributions[card.contributionIndex];
    const assignedAt = card.status === "unassigned" ? null : ctx.now - 10 * 86_400_000;
    await ctx.db.insert(schema.giftCards).values({
      code: card.code,
      design: card.design,
      treasureId: treasure?.id ?? null,
      contributionId: contribution?.id ?? null,
      status: card.status,
      note: card.note,
      assignedAt,
      printedAt: card.status === "printed" || card.status === "redeemed" ? ctx.now - 8 * 86_400_000 : null,
      redeemedAt: card.status === "redeemed" ? ctx.now - 3 * 86_400_000 : null,
      createdByUserId: ctx.adminId,
    });
  }

  const firstParent = people.parents[0];
  const secondParent = people.parents[1];
  const thirdParent = people.parents[7];
  if (!firstParent || !secondParent || !thirdParent) return;

  const avaLink = treasury.giftLinks[0];

  await ctx.db.insert(schema.notifications).values([
    {
      userId: firstParent.id,
      kind: "order_placed",
      title: NOTIFICATION_TITLES.order_placed,
      body: "سفارش شما ثبت شد. پس از تایید پرداخت، آماده‌سازی آغاز می‌شود.",
      link: "/dashboard/orders",
      meta: { orderNumber: "HM-SEED" },
    },
    {
      userId: firstParent.id,
      kind: "payment_confirmed",
      title: NOTIFICATION_TITLES.payment_confirmed,
      body: "پرداخت سفارش دستبند نوزادی تایید شد.",
      link: "/dashboard/orders",
    },
    {
      userId: firstParent.id,
      kind: "gift_received",
      title: NOTIFICATION_TITLES.gift_received,
      body: "خاله نسرین به گنجینه آوا طلا اضافه کرد.",
      link: avaLink ? `/g/${avaLink.token}` : "/dashboard",
    },
    {
      userId: firstParent.id,
      kind: "milestone_reached",
      title: NOTIFICATION_TITLES.milestone_reached,
      body: "گنجینه آوا به یک نقطه عطف جدید رسید.",
      link: "/dashboard",
    },
    {
      userId: secondParent.id,
      kind: "order_placed",
      title: NOTIFICATION_TITLES.order_placed,
      body: "سفارش دستبند نوزادی برای کیان ثبت شد.",
      link: "/dashboard/orders",
    },
    {
      userId: thirdParent.id,
      kind: "order_delivered",
      title: NOTIFICATION_TITLES.order_delivered,
      body: "نیم سکه گنجینه سامان تحویل شد.",
      link: "/dashboard/orders",
    },
    {
      userId: people.finance.id,
      kind: "payment_review_needed",
      title: NOTIFICATION_TITLES.payment_review_needed,
      body: "چند رسید کارت‌به‌کارت در صف تایید است.",
      link: "/admin/payments",
    },
  ]);
}

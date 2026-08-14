/**
 * داده اولیه محیط توسعه و اولین راه‌اندازی.
 *
 * این اسکریپت مستقل از Next است تا به `server-only` وابسته نشود.
 * اگر جدولی users خالی نباشد، از نو نمی‌نویسد تا داده production بازنویسی نشود.
 *
 * اجرا: npm run db:seed
 */

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { createClient } from "@libsql/client";
import { config as loadEnv } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";

import { settingsDefaults, settingsLabels } from "../src/modules/content/domain/settings-keys";
import * as schema from "../src/server/db/schema";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/haft.db";
const adminPhone = process.env.ADMIN_BOOTSTRAP_PHONE ?? "09120000000";

if (databaseUrl.startsWith("file:")) {
  mkdirSync(dirname(databaseUrl.slice("file:".length)), { recursive: true });
}

const client = createClient({
  url: databaseUrl,
  ...(process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}),
});

const db = drizzle(client, { schema, casing: "snake_case" });

async function main(): Promise<void> {
  await client.executeMultiple(
    ["PRAGMA journal_mode = WAL;", "PRAGMA foreign_keys = ON;"].join("\n"),
  );

  const existingUser = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .limit(1);

  if (existingUser[0]) {
    console.log("Seed skipped: users table is not empty.");
    return;
  }

  console.log("در حال ریختن داده اولیه...");

  const [admin] = await db
    .insert(schema.users)
    .values({
      phone: adminPhone,
      firstName: "مدیر",
      lastName: "هفت‌منظومه",
      status: "active",
      kycStatus: "verified",
      kycVerifiedAt: Date.now(),
    })
    .returning();

  if (!admin) throw new Error("ساخت کاربر ادمین شکست خورد.");

  await db.insert(schema.userRoles).values({
    userId: admin.id,
    role: "super_admin",
  });

  const now = Date.now();

  await db.insert(schema.goldPrices).values([
    {
      karat: 18,
      pricePerGramRial: 65_000_000,
      source: "manual",
      sourceRef: "قیمت اولیه seed",
      effectiveAt: now,
      createdByUserId: admin.id,
    },
    {
      karat: 24,
      pricePerGramRial: 86_670_000,
      source: "manual",
      sourceRef: "قیمت اولیه seed",
      effectiveAt: now,
      createdByUserId: admin.id,
    },
  ]);

  await db.insert(schema.bankAccounts).values({
    title: "حساب اصلی فروشگاه",
    bankName: "ملت",
    cardNumber: "6219861034529007",
    iban: "IR120120000000000123456789",
    accountHolder: "هفت منظومه",
    isActive: true,
    sortOrder: 0,
  });

  for (const key of Object.keys(settingsDefaults) as Array<keyof typeof settingsDefaults>) {
    await db.insert(schema.settings).values({
      key,
      value: settingsDefaults[key],
      description: settingsLabels[key],
    });
  }

  const [bracelet, necklace, earring, coinCat] = await db
    .insert(schema.categories)
    .values([
      { slug: "bracelet", title: "دستبند", description: "دستبند طلای کودک", sortOrder: 1 },
      { slug: "necklace", title: "گردنبند و پلاک", description: "پلاک و گردنبند با امکان حکاکی نام", sortOrder: 2 },
      { slug: "earring", title: "گوشواره", description: "گوشواره سبک کودکانه", sortOrder: 3 },
      { slug: "coin-bar", title: "سکه و شمش", description: "طلای سرمایه‌ای برای گنجینه", sortOrder: 4 },
    ])
    .returning();

  const [birthday, firstTooth, nowruz, taklif] = await db
    .insert(schema.occasions)
    .values([
      {
        slug: "birthday",
        title: "تولد",
        description: "هدیه‌ای که هر سال به گنجینه او اضافه می‌شود.",
        emoji: "🎂",
        ageMinMonths: 0,
        ageMaxMonths: 216,
        isRecurring: true,
        sortOrder: 1,
      },
      {
        slug: "first-tooth",
        title: "اولین دندان",
        description: "یادگاری اولین دندان، ماندگارتر از یک هدیه مصرفی.",
        emoji: "🦷",
        ageMinMonths: 4,
        ageMaxMonths: 18,
        isRecurring: false,
        sortOrder: 2,
      },
      {
        slug: "nowruz",
        title: "نوروز",
        description: "عیدی طلایی برای شروع سال نو.",
        emoji: "🌸",
        ageMinMonths: 0,
        ageMaxMonths: 216,
        isRecurring: true,
        sortOrder: 3,
      },
      {
        slug: "jashn-taklif",
        title: "جشن تکلیف",
        description: "هدیه‌ای سنگین و معنادار برای این نقطه عطف.",
        emoji: "✨",
        ageMinMonths: 96,
        ageMaxMonths: 120,
        isRecurring: false,
        sortOrder: 4,
      },
    ])
    .returning();

  if (!bracelet || !necklace || !earring || !coinCat || !birthday || !firstTooth || !nowruz || !taklif) {
    throw new Error("ساخت دسته‌بندی یا مناسبت شکست خورد.");
  }

  const [plaque] = await db
    .insert(schema.products)
    .values({
      slug: "name-plaque",
      title: "پلاک نام کودک",
      subtitle: "با حکاکی نام کوچک او",
      description:
        "پلاک طلای ۱۸ عیار که نام کودک روی آن حک می‌شود. هدیه‌ای شخصی که سال‌ها بعد هنوز معنا دارد.",
      categoryId: necklace.id,
      kind: "jewelry",
      brandLine: "signature",
      status: "active",
      isPersonalizable: true,
      ageMinMonths: 0,
      ageMaxMonths: 144,
      highlights: ["قابل حکاکی نام", "طلای ۱۸ عیار", "بسته‌بندی هدیه"],
      seoTitle: "پلاک نام کودک | هفت منظومه",
      seoDescription: "پلاک طلا با حکاکی نام کودک؛ هدیه‌ای ماندگار برای گنجینه او.",
      sortOrder: 1,
    })
    .returning();

  const [bangle] = await db
    .insert(schema.products)
    .values({
      slug: "baby-bangle",
      title: "دستبند نوزادی",
      subtitle: "سبک و ایمن برای ماه‌های اول",
      description: "دستبند طلای ظریف برای نوزاد و شیرخوار؛ مناسب هدیه تولد و اولین دندان.",
      categoryId: bracelet.id,
      kind: "jewelry",
      brandLine: "standard",
      status: "active",
      isPersonalizable: false,
      ageMinMonths: 0,
      ageMaxMonths: 24,
      highlights: ["وزن سبک", "مناسب نوزاد", "طلای ۱۸ عیار"],
      seoTitle: "دستبند نوزادی طلا | هفت منظومه",
      sortOrder: 2,
    })
    .returning();

  const [coin] = await db
    .insert(schema.products)
    .values({
      slug: "quarter-bahar",
      title: "ربع سکه بهار آزادی",
      subtitle: "برای گنجینه، نه برای ویترین",
      description:
        "ربع سکه طرح جدید. قیمت شفاف: ارزش طلا به‌علاوه حباب روز. مناسب مشارکت در گنجینه.",
      categoryId: coinCat.id,
      kind: "coin",
      brandLine: "standard",
      status: "active",
      isPersonalizable: false,
      highlights: ["قیمت شفاف", "حباب مشخص", "مناسب گنجینه"],
      seoTitle: "ربع سکه کودک | هفت منظومه",
      sortOrder: 3,
    })
    .returning();

  if (!plaque || !bangle || !coin) throw new Error("ساخت محصول شکست خورد.");

  await db.insert(schema.productVariants).values([
    {
      productId: plaque.id,
      sku: "PLQ-18-0800",
      title: "۰٫۸ گرم، ۱۸ عیار",
      weightMg: 800,
      karat: 18,
      makingFeeBp: 1_200,
      profitBp: 700,
      packagingRial: 250_000,
      personalizationRial: 400_000,
      engravingMaxChars: 24,
      stockQty: 25,
    },
    {
      productId: plaque.id,
      sku: "PLQ-18-1200",
      title: "۱٫۲ گرم، ۱۸ عیار",
      weightMg: 1_200,
      karat: 18,
      makingFeeBp: 1_200,
      profitBp: 700,
      packagingRial: 250_000,
      personalizationRial: 400_000,
      engravingMaxChars: 24,
      stockQty: 18,
    },
    {
      productId: bangle.id,
      sku: "BNG-18-1500",
      title: "۱٫۵ گرم، ۱۸ عیار",
      weightMg: 1_500,
      karat: 18,
      makingFeeBp: 1_400,
      profitBp: 700,
      packagingRial: 200_000,
      stockQty: 12,
    },
    {
      productId: coin.id,
      sku: "COIN-RB-24",
      title: "ربع سکه، ۲۴ عیار",
      weightMg: 2_033,
      karat: 24,
      premiumRial: 4_500_000,
      packagingRial: 150_000,
      stockQty: 40,
    },
  ]);

  await db.insert(schema.productOccasions).values([
    { productId: plaque.id, occasionId: birthday.id },
    { productId: plaque.id, occasionId: taklif.id },
    { productId: bangle.id, occasionId: birthday.id },
    { productId: bangle.id, occasionId: firstTooth.id },
    { productId: coin.id, occasionId: nowruz.id },
    { productId: coin.id, occasionId: birthday.id },
  ]);

  await db.insert(schema.contentPages).values({
    slug: "about",
    title: "درباره هفت منظومه",
    bodyMarkdown: `هفت منظومه طلافروشی آنلاین تخصصی کودکان است.

زیر پوسته فروش طلا، یک گنجینه ساخته می‌شود: والدین و اطرافیان کودک به‌جای هدایای مصرفی، طلا می‌خرند و به مرور یک دارایی واقعی برای او می‌سازند.

هدیه‌دهندگان با یک لینک و بدون ساخت حساب مشارکت می‌کنند. کودک قهرمان روایت است؛ مالک قانونی دارایی در این نسخه دارنده حساب است.`,
    status: "published",
    seoTitle: "درباره هفت منظومه",
    seoDescription: "طلافروشی تخصصی کودکان و گنجینه طلای فرزند شما.",
  });

  await db.insert(schema.faqs).values([
    {
      question: "گنجینه دقیقاً چیست؟",
      answer:
        "گنجینه ظرف دارایی طلای یک کودک است. هر خرید یا هدیه تاییدشده به‌صورت وزن طلا در دفتر کل ثبت می‌شود.",
      category: "گنجینه",
      sortOrder: 1,
    },
    {
      question: "چطور بدون حساب هدیه بدهم؟",
      answer:
        "والد لینک هدیه را برای شما می‌فرستد. مبلغ را کارت‌به‌کارت واریز می‌کنید، رسید را می‌فرستید و می‌توانید یک پیام یادگاری بگذارید.",
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
        "در این نسخه فروش و بازخرید طلا از کاربر ارائه نمی‌شود. گنجینه برای ساختن دارایی کودک است، نه معامله روزانه.",
      category: "گنجینه",
      sortOrder: 4,
    },
  ]);

  console.log("داده اولیه آماده شد.");
  console.log(`  سوپرادمین: ${adminPhone}`);
  console.log("  ورود: صفحه /login — در توسعه کد یک‌بارمصرف در ترمینال چاپ می‌شود.");
}

main()
  .catch((error: unknown) => {
    console.error("ریختن داده اولیه شکست خورد:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    client.close();
  });

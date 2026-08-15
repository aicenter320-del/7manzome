import * as schema from "@/server/db/schema";
import type { GoldKarat, ProductKind } from "@/shared/types/enums";

import { saveProductPhoto } from "./media";
import type { SeedCatalog, SeedContext, SeedVariant } from "./types";

interface ProductSeed {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  categorySlug: string;
  kind: ProductKind;
  brandLine: "standard" | "signature";
  isPersonalizable: boolean;
  ageMinMonths: number | null;
  ageMaxMonths: number | null;
  highlights: string[];
  seoTitle: string;
  seoDescription: string;
  occasionSlugs: string[];
  variants: Array<{
    sku: string;
    title: string;
    weightMg: number;
    karat: GoldKarat;
    makingFeeBp: number;
    profitBp: number;
    premiumRial: number;
    packagingRial: number;
    personalizationRial: number;
    engravingMaxChars: number;
    stockQty: number;
  }>;
}

const PRODUCTS: ProductSeed[] = [
  {
    slug: "name-plaque",
    title: "پلاک نام کودک",
    subtitle: "با حکاکی نام کوچک او",
    description: `پلاک طلای ۱۸ عیار که نام کودک روی آن حک می‌شود. هدیه‌ای شخصی که سال‌ها بعد هنوز معنا دارد.

وزن سبک است تا روی گردن کودک راحت بنشیند و زنجیر قفل ایمنی دارد. حکاکی با حروف فارسی یا لاتین انجام می‌شود و در لحظه ثبت سفارش قفل می‌گردد.

بسته‌بندی هدیه با کارت دست‌نویس همراه است تا هدیه‌دهنده بتواند پیام کوتاهی برای گنجینه بگذارد.`,
    categorySlug: "necklace",
    kind: "jewelry",
    brandLine: "signature",
    isPersonalizable: true,
    ageMinMonths: 0,
    ageMaxMonths: 144,
    highlights: ["قابل حکاکی نام", "طلای ۱۸ عیار", "قفل ایمنی کودک", "بسته‌بندی هدیه"],
    seoTitle: "پلاک نام کودک | هفت منظومه",
    seoDescription: "پلاک طلا با حکاکی نام کودک؛ هدیه‌ای ماندگار برای گنجینه او.",
    occasionSlugs: ["birthday", "jashn-taklif", "newborn"],
    variants: [
      {
        sku: "PLQ-18-0800",
        title: "۰٫۸ گرم، ۱۸ عیار",
        weightMg: 800,
        karat: 18,
        makingFeeBp: 1_200,
        profitBp: 700,
        premiumRial: 0,
        packagingRial: 250_000,
        personalizationRial: 400_000,
        engravingMaxChars: 24,
        stockQty: 25,
      },
      {
        sku: "PLQ-18-1200",
        title: "۱٫۲ گرم، ۱۸ عیار",
        weightMg: 1_200,
        karat: 18,
        makingFeeBp: 1_200,
        profitBp: 700,
        premiumRial: 0,
        packagingRial: 250_000,
        personalizationRial: 400_000,
        engravingMaxChars: 24,
        stockQty: 18,
      },
    ],
  },
  {
    slug: "baby-bangle",
    title: "دستبند نوزادی",
    subtitle: "سبک و ایمن برای ماه‌های اول",
    description: `دستبند طلای ظریف برای نوزاد و شیرخوار؛ مناسب هدیه تولد و اولین دندان.

لبه‌ها پرداخت نرم دارند و قفل پیچشی باز شدن تصادفی را سخت می‌کند. این قطعه برای استفاده روزمره طراحی نشده؛ یادگاری است که بعداً به گنجینه اضافه می‌شود.

وزن دقیق روی فاکتور قفل می‌شود تا ارزش طلا شفاف بماند.`,
    categorySlug: "bracelet",
    kind: "jewelry",
    brandLine: "standard",
    isPersonalizable: false,
    ageMinMonths: 0,
    ageMaxMonths: 24,
    highlights: ["وزن سبک", "مناسب نوزاد", "طلای ۱۸ عیار", "قفل پیچشی"],
    seoTitle: "دستبند نوزادی طلا | هفت منظومه",
    seoDescription: "دستبند طلای نوزاد؛ هدیه‌ای ایمن برای تولد و اولین دندان.",
    occasionSlugs: ["birthday", "first-tooth", "newborn", "chelleh"],
    variants: [
      {
        sku: "BNG-18-1500",
        title: "۱٫۵ گرم، ۱۸ عیار",
        weightMg: 1_500,
        karat: 18,
        makingFeeBp: 1_400,
        profitBp: 700,
        premiumRial: 0,
        packagingRial: 200_000,
        personalizationRial: 0,
        engravingMaxChars: 0,
        stockQty: 12,
      },
    ],
  },
  {
    slug: "quarter-bahar",
    title: "ربع سکه بهار آزادی",
    subtitle: "برای گنجینه، نه برای ویترین",
    description: `ربع سکه طرح جدید. قیمت شفاف: ارزش طلا به‌علاوه حباب روز. مناسب مشارکت در گنجینه.

اجرت ساخت و سود فروشنده روی سکه اعمال نمی‌شود. آنچه می‌پردازید ارزش طلای خام به‌علاوه حباب اعلام‌شده و بسته‌بندی است.

سکه در کاور ضدخش و جعبه مقوایی طلایی ارسال می‌شود.`,
    categorySlug: "coin-bar",
    kind: "coin",
    brandLine: "standard",
    isPersonalizable: false,
    ageMinMonths: null,
    ageMaxMonths: null,
    highlights: ["قیمت شفاف", "حباب مشخص", "مناسب گنجینه", "بدون اجرت ساخت"],
    seoTitle: "ربع سکه کودک | هفت منظومه",
    seoDescription: "ربع سکه بهار آزادی برای گنجینه طلای کودک با قیمت شفاف.",
    occasionSlugs: ["nowruz", "birthday", "yalda"],
    variants: [
      {
        sku: "COIN-RB-24",
        title: "ربع سکه، ۲۴ عیار",
        weightMg: 2_033,
        karat: 24,
        makingFeeBp: 0,
        profitBp: 0,
        premiumRial: 4_500_000,
        packagingRial: 150_000,
        personalizationRial: 0,
        engravingMaxChars: 0,
        stockQty: 40,
      },
    ],
  },
  {
    slug: "star-pendant",
    title: "آویز ستاره کودک",
    subtitle: "طرح ستاره با زنجیر کوتاه",
    description: `آویز ستارهٔ پنج‌پر از طلای ۱۸ عیار، مخصوص کودکان پیش‌دبستانی.

سطح ستاره پرداخت براق دارد و پشت کار صاف است تا روی پوست نزند. زنجیر قابل تنظیم است و قفل خرچنگی با حلقه ایمنی بسته می‌شود.

این طرح برای تولد و شروع مدرسه انتخاب رایجی است؛ سبک است و با لباس روزمره کودک هماهنگ می‌ماند.`,
    categorySlug: "necklace",
    kind: "jewelry",
    brandLine: "signature",
    isPersonalizable: false,
    ageMinMonths: 24,
    ageMaxMonths: 120,
    highlights: ["طرح ستاره", "زنجیر قابل تنظیم", "طلای ۱۸ عیار", "قفل ایمنی"],
    seoTitle: "آویز ستاره طلای کودک | هفت منظومه",
    seoDescription: "گردنبند ستاره طلا برای کودک؛ هدیه‌ای سبک برای تولد و مدرسه.",
    occasionSlugs: ["birthday", "school-start"],
    variants: [
      {
        sku: "STR-18-0900",
        title: "۰٫۹ گرم، ۱۸ عیار",
        weightMg: 900,
        karat: 18,
        makingFeeBp: 1_300,
        profitBp: 700,
        premiumRial: 0,
        packagingRial: 220_000,
        personalizationRial: 0,
        engravingMaxChars: 0,
        stockQty: 16,
      },
      {
        sku: "STR-18-1400",
        title: "۱٫۴ گرم، ۱۸ عیار",
        weightMg: 1_400,
        karat: 18,
        makingFeeBp: 1_300,
        profitBp: 700,
        premiumRial: 0,
        packagingRial: 220_000,
        personalizationRial: 0,
        engravingMaxChars: 0,
        stockQty: 10,
      },
    ],
  },
  {
    slug: "tiny-hoops",
    title: "گوشواره حلقه‌ای ظریف",
    subtitle: "حلقه کوچک با قفل پیچی",
    description: `گوشواره حلقه‌ای خیلی کوچک برای کودکانی که گوششان سوراخ شده است.

قفل پیچی باز شدن هنگام بازی را سخت می‌کند. سطح کار بدون سنگ است تا نگهداری ساده بماند و با شست‌وشو آسیب نبیند.

مناسب جشن تکلیف و تولدهای سال‌های میانی کودکی.`,
    categorySlug: "earring",
    kind: "jewelry",
    brandLine: "standard",
    isPersonalizable: false,
    ageMinMonths: 36,
    ageMaxMonths: 168,
    highlights: ["قفل پیچی", "بدون نگین", "وزن متقارن", "طلای ۱۸ عیار"],
    seoTitle: "گوشواره حلقه‌ای کودک | هفت منظومه",
    seoDescription: "گوشواره طلای ظریف با قفل پیچی برای کودک.",
    occasionSlugs: ["birthday", "jashn-taklif"],
    variants: [
      {
        sku: "ERP-18-0600",
        title: "جفت ۰٫۶ گرم، ۱۸ عیار",
        weightMg: 600,
        karat: 18,
        makingFeeBp: 1_500,
        profitBp: 800,
        premiumRial: 0,
        packagingRial: 180_000,
        personalizationRial: 0,
        engravingMaxChars: 0,
        stockQty: 20,
      },
    ],
  },
  {
    slug: "name-ring",
    title: "انگشتر نام کودک",
    subtitle: "حلقه باریک با حکاکی داخلی",
    description: `انگشتر باریک طلای ۱۸ عیار با امکان حکاکی نام یا تاریخ تولد در داخل حلقه.

سایز برای انگشت کودک تنظیم می‌شود و لبه کار گرد است. این قطعه برای استفاده مداوم در بازی توصیه نمی‌شود؛ یادگاری گنجینه است.

حکاکی حداکثر ۱۲ کاراکتر لاتین یا فارسی دارد.`,
    categorySlug: "ring",
    kind: "jewelry",
    brandLine: "signature",
    isPersonalizable: true,
    ageMinMonths: 48,
    ageMaxMonths: 156,
    highlights: ["حکاکی داخلی", "لبه گرد", "طلای ۱۸ عیار", "سایز کودک"],
    seoTitle: "انگشتر نام کودک | هفت منظومه",
    seoDescription: "انگشتر طلا با حکاکی نام کودک برای گنجینه او.",
    occasionSlugs: ["birthday", "jashn-taklif", "school-start"],
    variants: [
      {
        sku: "RNG-18-1100",
        title: "۱٫۱ گرم، ۱۸ عیار",
        weightMg: 1_100,
        karat: 18,
        makingFeeBp: 1_600,
        profitBp: 700,
        premiumRial: 0,
        packagingRial: 200_000,
        personalizationRial: 350_000,
        engravingMaxChars: 12,
        stockQty: 14,
      },
    ],
  },
  {
    slug: "anklet-bell",
    title: "پابند زنگوله‌دار",
    subtitle: "صدای آرام برای ماه‌های خزیدن",
    description: `پابند طلا با یک زنگوله کوچک؛ سنتی که هنوز برای نوزاد معنا دارد.

زنجیر ظریف است و قفل آن دو حلقه ایمنی دارد. زنگوله پرچ شده تا جدا نشود. این طرح برای عقیقه و چله نوزاد انتخاب می‌شود.

وزن اعلام‌شده شامل زنگوله است و روی فاکتور قفل می‌گردد.`,
    categorySlug: "anklet",
    kind: "jewelry",
    brandLine: "standard",
    isPersonalizable: false,
    ageMinMonths: 0,
    ageMaxMonths: 18,
    highlights: ["زنگوله پرچ‌شده", "قفل دو حلقه", "مناسب نوزاد", "طلای ۱۸ عیار"],
    seoTitle: "پابند زنگوله‌دار نوزاد | هفت منظومه",
    seoDescription: "پابند طلای نوزاد با زنگوله؛ مناسب عقیقه و چله.",
    occasionSlugs: ["aqiqah", "chelleh", "newborn", "first-tooth"],
    variants: [
      {
        sku: "ANK-18-1700",
        title: "۱٫۷ گرم، ۱۸ عیار",
        weightMg: 1_700,
        karat: 18,
        makingFeeBp: 1_350,
        profitBp: 700,
        premiumRial: 0,
        packagingRial: 210_000,
        personalizationRial: 0,
        engravingMaxChars: 0,
        stockQty: 11,
      },
    ],
  },
  {
    slug: "half-bahar",
    title: "نیم سکه بهار آزادی",
    subtitle: "وزن بیشتر برای هدف گنجینه",
    description: `نیم سکه طرح جدید برای خانواده‌هایی که می‌خواهند یک‌جا وزن بیشتری به گنجینه اضافه کنند.

مثل ربع سکه، قیمت برابر است با ارزش طلا به‌علاوه حباب و بسته‌بندی. مالیات بر اجرت اینجا معنا ندارد چون اجرتی نیست.

ارسال با پلمب و فاکتور قفل‌شده انجام می‌شود.`,
    categorySlug: "coin-bar",
    kind: "coin",
    brandLine: "standard",
    isPersonalizable: false,
    ageMinMonths: null,
    ageMaxMonths: null,
    highlights: ["وزن بالاتر", "حباب شفاف", "بدون اجرت", "مناسب هدف گنجینه"],
    seoTitle: "نیم سکه برای گنجینه کودک | هفت منظومه",
    seoDescription: "نیم سکه بهار آزادی با قیمت شفاف برای گنجینه کودک.",
    occasionSlugs: ["nowruz", "birthday", "yalda"],
    variants: [
      {
        sku: "COIN-HF-24",
        title: "نیم سکه، ۲۴ عیار",
        weightMg: 4_066,
        karat: 24,
        makingFeeBp: 0,
        profitBp: 0,
        premiumRial: 8_200_000,
        packagingRial: 150_000,
        personalizationRial: 0,
        engravingMaxChars: 0,
        stockQty: 22,
      },
    ],
  },
  {
    slug: "baby-bar-1g",
    title: "شمش یک گرمی کودک",
    subtitle: "طلای خالص با گواهی وزن، برای گنجینه",
    description: `شمش یک گرمی ۲۴ عیار در بسته وکیوم؛ برای افزودن وزن به گنجینه، نه برای زیور.

روی قطعه وزن و عیار حک شده و حباب جداگانه اعلام می‌شود. هدیه‌ای که مستقیم به طلا تبدیل می‌شود.

مناسب نوروز، یلدا و سهم مهمان‌ها در لینک هدیه.`,
    categorySlug: "coin-bar",
    kind: "bar",
    brandLine: "standard",
    isPersonalizable: false,
    ageMinMonths: null,
    ageMaxMonths: null,
    highlights: ["یک گرم خالص", "بسته وکیوم", "گواهی وزن", "حباب مشخص"],
    seoTitle: "شمش یک گرمی کودک | هفت منظومه",
    seoDescription: "شمش طلای یک گرمی برای گنجینه کودک با قیمت شفاف.",
    occasionSlugs: ["nowruz", "birthday", "yalda", "school-start"],
    variants: [
      {
        sku: "BAR-1G-24",
        title: "شمش ۱ گرم، ۲۴ عیار",
        weightMg: 1_000,
        karat: 24,
        makingFeeBp: 0,
        profitBp: 0,
        premiumRial: 1_200_000,
        packagingRial: 120_000,
        personalizationRial: 0,
        engravingMaxChars: 0,
        stockQty: 35,
      },
    ],
  },
  {
    slug: "moon-locket",
    title: "گردنبند ماه و ستاره",
    subtitle: "قفل کوچک برای یک عکس یا دعا",
    description: `مدال ماه‌شکل با فضای خیلی کوچک داخل قفل؛ جای یک تار مو، دعا، یا عکس بندانگشتی.

زنجیر کوتاه کودکانه است و قفل ایمنی دارد. سطح ماه پرداخت مات و ستاره براق است تا تضاد دیده شود.

طرح امضای مجموعه؛ مناسب تولد و جشن تکلیف.`,
    categorySlug: "necklace",
    kind: "jewelry",
    brandLine: "signature",
    isPersonalizable: true,
    ageMinMonths: 12,
    ageMaxMonths: 168,
    highlights: ["قفل کوچک داخلی", "پرداخت مات و براق", "طلای ۱۸ عیار", "طرح امضا"],
    seoTitle: "گردنبند ماه و ستاره کودک | هفت منظومه",
    seoDescription: "مدال ماه و ستاره طلا با فضای کوچک یادگاری برای کودک.",
    occasionSlugs: ["birthday", "jashn-taklif", "milk-tooth"],
    variants: [
      {
        sku: "MON-18-1600",
        title: "۱٫۶ گرم، ۱۸ عیار",
        weightMg: 1_600,
        karat: 18,
        makingFeeBp: 1_450,
        profitBp: 750,
        premiumRial: 0,
        packagingRial: 260_000,
        personalizationRial: 300_000,
        engravingMaxChars: 16,
        stockQty: 9,
      },
    ],
  },
];

export async function seedCatalog(ctx: SeedContext): Promise<SeedCatalog> {
  const categoryRows = await ctx.db
    .insert(schema.categories)
    .values([
      { slug: "bracelet", title: "دستبند", description: "دستبند ظریف برای نوزاد تا کودک", sortOrder: 1 },
      { slug: "necklace", title: "گردنبند و پلاک", description: "پلاک با نام او؛ هدیه‌ای که روی سینه می‌ماند", sortOrder: 2 },
      { slug: "earring", title: "گوشواره", description: "گوشواره سبک با قفل ایمن کودک", sortOrder: 3 },
      { slug: "coin-bar", title: "سکه و شمش", description: "سکه و شمش برای سنگین‌تر کردن گنجینه", sortOrder: 4 },
      { slug: "ring", title: "انگشتر", description: "انگشتر باریک با امکان حکاکی نام", sortOrder: 5 },
      { slug: "anklet", title: "پابند", description: "پابند نوزادی؛ سنت با وزن طلا", sortOrder: 6 },
    ])
    .returning();

  const categoryIds = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id]));

  const occasionRows = await ctx.db
    .insert(schema.occasions)
    .values([
      {
        slug: "birthday",
        title: "تولد",
        description: "هر سال یک قطعه طلا؛ قصه‌ای که با او بزرگ می‌شود، نه هدیه‌ای که تا هفته بعد فراموش شود.",
        emoji: "🎂",
        ageMinMonths: 0,
        ageMaxMonths: 216,
        isRecurring: true,
        sortOrder: 1,
      },
      {
        slug: "first-tooth",
        title: "اولین دندان",
        description: "اولین دندان را با طلا جشن بگیرید؛ یادگاری که در گنجینه می‌ماند.",
        emoji: "🦷",
        ageMinMonths: 4,
        ageMaxMonths: 18,
        isRecurring: false,
        sortOrder: 2,
      },
      {
        slug: "nowruz",
        title: "نوروز",
        description: "عیدی که خرج نمی‌شود: سکه یا شمش برای گنجینه سال نو او.",
        emoji: "🌸",
        ageMinMonths: 0,
        ageMaxMonths: 216,
        isRecurring: true,
        sortOrder: 3,
      },
      {
        slug: "jashn-taklif",
        title: "جشن تکلیف",
        description: "برای این نقطه عطف، قطعه‌ای بدهید که سال‌ها با او بماند.",
        emoji: "✨",
        ageMinMonths: 96,
        ageMaxMonths: 120,
        isRecurring: false,
        sortOrder: 4,
      },
      {
        slug: "aqiqah",
        title: "عقیقه",
        description: "سنت عقیقه با طلایی که در گنجینه می‌ماند، نه هدیه‌ای که مصرف می‌شود.",
        emoji: "🌙",
        ageMinMonths: 0,
        ageMaxMonths: 12,
        isRecurring: false,
        sortOrder: 5,
      },
      {
        slug: "yalda",
        title: "یلدا",
        description: "شب چله خانواده؛ سهمی از طلا برای گنجینه کودک روی سفره.",
        emoji: "🍉",
        ageMinMonths: 0,
        ageMaxMonths: 216,
        isRecurring: true,
        sortOrder: 6,
      },
      {
        slug: "newborn",
        title: "بدو تولد",
        description: "اولین قطعه گنجینه، از همان روزهای ورود به دنیا.",
        emoji: "🍼",
        ageMinMonths: 0,
        ageMaxMonths: 3,
        isRecurring: false,
        sortOrder: 7,
      },
      {
        slug: "school-start",
        title: "شروع مدرسه",
        description: "یادگاری سال اول دبستان؛ قطعه‌ای سبک که گاه‌به‌گاه با او می‌ماند.",
        emoji: "📚",
        ageMinMonths: 72,
        ageMaxMonths: 96,
        isRecurring: false,
        sortOrder: 8,
      },
      {
        slug: "milk-tooth",
        title: "دندان شیری",
        description: "دندان شیری افتاد؛ به‌جای سکه زیر بالش، سهمی به گنجینه اضافه کنید.",
        emoji: "✨",
        ageMinMonths: 60,
        ageMaxMonths: 108,
        isRecurring: false,
        sortOrder: 9,
      },
      {
        slug: "chelleh",
        title: "شب چله نوزاد",
        description: "چهلمین شب؛ دستبند یا پابند نوزادی که اولین گرم گنجینه باشد.",
        emoji: "🕯️",
        ageMinMonths: 0,
        ageMaxMonths: 2,
        isRecurring: false,
        sortOrder: 10,
      },
    ])
    .returning();

  const occasionIds = Object.fromEntries(occasionRows.map((row) => [row.slug, row.id]));

  const variants: SeedVariant[] = [];

  for (const [productIndex, product] of PRODUCTS.entries()) {
    const categoryId = categoryIds[product.categorySlug];
    if (!categoryId) throw new Error(`دسته ${product.categorySlug} پیدا نشد.`);

    const hero = await saveProductPhoto(ctx, product.slug, productIndex * 3);
    const galleryA = await saveProductPhoto(ctx, product.slug, productIndex * 3 + 1);
    const galleryB = await saveProductPhoto(ctx, product.slug, productIndex * 3 + 2);

    const [row] = await ctx.db
      .insert(schema.products)
      .values({
        slug: product.slug,
        title: product.title,
        subtitle: product.subtitle,
        description: product.description,
        categoryId,
        kind: product.kind,
        brandLine: product.brandLine,
        status: "active",
        isPersonalizable: product.isPersonalizable,
        ageMinMonths: product.ageMinMonths,
        ageMaxMonths: product.ageMaxMonths,
        heroFileId: hero.id,
        highlights: product.highlights,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        sortOrder: productIndex + 1,
      })
      .returning();

    if (!row) throw new Error(`ساخت محصول ${product.slug} شکست خورد.`);

    await ctx.db.insert(schema.productMedia).values([
      { productId: row.id, fileId: hero.id, alt: `${product.title} — نمای اصلی`, sortOrder: 0 },
      { productId: row.id, fileId: galleryA.id, alt: `${product.title} — نمای نزدیک`, sortOrder: 1 },
      { productId: row.id, fileId: galleryB.id, alt: `${product.title} — بسته‌بندی`, sortOrder: 2 },
    ]);

    const occasionLinks = product.occasionSlugs
      .map((slug) => occasionIds[slug])
      .filter((id): id is string => Boolean(id))
      .map((occasionId) => ({ productId: row.id, occasionId }));

    if (occasionLinks.length > 0) {
      await ctx.db.insert(schema.productOccasions).values(occasionLinks);
    }

    for (const [variantIndex, variant] of product.variants.entries()) {
      const [variantRow] = await ctx.db
        .insert(schema.productVariants)
        .values({
          productId: row.id,
          sku: variant.sku,
          title: variant.title,
          weightMg: variant.weightMg,
          karat: variant.karat,
          makingFeeBp: variant.makingFeeBp,
          profitBp: variant.profitBp,
          premiumRial: variant.premiumRial,
          packagingRial: variant.packagingRial,
          personalizationRial: variant.personalizationRial,
          engravingMaxChars: variant.engravingMaxChars,
          stockQty: variant.stockQty,
          sortOrder: variantIndex,
        })
        .returning();

      if (!variantRow) throw new Error(`ساخت گونه ${variant.sku} شکست خورد.`);

      variants.push({
        id: variantRow.id,
        productId: row.id,
        productTitle: product.title,
        sku: variant.sku,
        title: variant.title,
        kind: product.kind,
        weightMg: variant.weightMg,
        karat: variant.karat,
        makingFeeBp: variant.makingFeeBp,
        profitBp: variant.profitBp,
        premiumRial: variant.premiumRial,
        packagingRial: variant.packagingRial,
        personalizationRial: variant.personalizationRial,
        stockQty: variant.stockQty,
      });
    }
  }

  return { variants, occasionIds };
}

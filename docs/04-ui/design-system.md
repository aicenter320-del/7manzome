# دیزاین سیستم

## شخصیت برند

گرم، باارزش، قابل‌اعتماد، مدرن، احساسی — و **بچه‌گانه نه**.

هدف: یک برند لوکس خانوادگی. نه فروشگاه اسباب‌بازی، نه اپلیکیشن بانکی.

## زبان بصری

بله:

- فضای سفید زیاد و پس‌زمینهٔ روشن گرم
- شیشهٔ مات با بردر گرادیانی طلایی و سایهٔ رنگی نرم
- تایپوگرافی قدرتمند و سلسله‌مراتب واضح
- تصاویر واقعی کودک
- طلایی **به‌عنوان لهجه** (بردر، درخشش هیرو، دیسک آیکون)
- حرکت ملایم (فشردن ژله‌ای آیکون)

نه:

- تم تیره / دارک‌مود
- پر کردن سطح با طلا یا گرادیان طلایی به‌جای محتوا
- تاج و الماس و تصویرسازی کارتونی
- صورتی نوزادی
- رابطی که شبیه پنل بانک باشد
- لنز شکست‌نور روی هر ردیف جدول

## تم

سایت **فقط روشن** است. روی `<html>` کلاس `light` قفل می‌شود. سوئیچ تم ساخته نمی‌شود.

## توکن‌های رنگ

منبع واقعی: `src/app/globals.css`. **هیچ رنگی خارج از این فایل تعریف نمی‌شود.**

| توکن | کلاس Tailwind | نقش |
| --- | --- | --- |
| `--background` | `bg-background` | کاغذ گرم پشت صفحه (نه سفید خالص) |
| `--foreground` | `text-foreground` | جوهر گرم (نه سیاه خالص) |
| `--card` | `bg-card` | سطح کارت‌ها |
| `--primary` | `bg-primary` | شب‌آبی منظومه؛ کنش اصلی |
| `--secondary` | `bg-secondary` | شنی گرم؛ سطح ثانویه |
| `--muted` | `bg-muted` | پس‌زمینه خنثی |
| `--accent` / `--gold` | `bg-gold` | طلایی برند؛ فقط برای تاکید |
| `--gold-soft` | `bg-gold-soft` | طلایی محو برای پس‌زمینه نشان‌ها |
| `--gold-deep` | `text-gold-deep` | طلایی تیره؛ برای متن روی زمینه روشن |
| `--success` `--warning` `--destructive` `--info` | `bg-success` ... | وضعیت‌ها |
| `--border` | `border-border` | خط جداکننده |
| `--ring` | `ring-ring` | حلقه فوکوس |
| `--glass` | `bg-glass` / کلاس `.glass` | سطح شیشه‌ای روشن |
| `--shadow-glow-gold` | `.shadow-glow` | سایهٔ پهن طلایی |

قانون: **هیچ رنگ hard-coded.** نه `#fff`، نه `text-gray-500`، نه `bg-yellow-400`.
سطح شیشه‌ای با کلاس `.glass` یا `.glass-strong`؛ دیسک آیکون با `GlassIconButton`.

```tsx
// ❌
<div className="bg-white text-gray-700 border-yellow-500">

// ✅
<div className="bg-card text-muted-foreground border-gold">
```

## تایپوگرافی

فونت: **ایران‌سنس‌ایکس** به‌صورت لوکال در `src/assets/fonts/iransansx/` (خانوادهٔ ایستا، نه variable).

| وزن Tailwind | فایل |
| --- | --- |
| `font-thin` (100) | Thin |
| `font-extralight` (200) | UltraLight |
| `font-light` (300) | Light |
| `font-normal` (400) | Regular |
| `font-medium` (500) | Medium |
| `font-semibold` (600) | DemiBold |
| `font-bold` (700) | Bold |
| `font-extrabold` (800) | ExtraBold |
| ۸۵۰ | Heavy |
| `font-black` (900) | Black |
| ۹۵۰ | ExtraBlack |

- ارتفاع سطر بدنه `1.85` است، بازتر از پیش‌فرض لاتین، چون فارسی به فضای عمودی بیشتری نیاز دارد.
- عناوین `line-height: 1.5` و `text-wrap: balance`.
- برای اعداد و شناسه‌های لاتین داخل متن فارسی از کلاس `.ltr-nums` استفاده کنید.

## شعاع و سایه

- شعاع پایه: `1.25rem` (توکن `--radius`)؛ پنل‌های شاخص `rounded-3xl` یا کپسول.
- سایهٔ کارت و شیشه: `.shadow-glow` (طلایی نرم)، نه `shadow-xs` تخت.
- درخشش هیرو: کامپوننت `GoldGlow` و کلاس `.gold-glow`.
- هیرو خانه تمام‌عرض از بالای صفحه (پشت منوی شناور) است؛ پس‌زمینهٔ لوکال محصولات طلا و کارت `GlassSurface` همان شیشهٔ هدر.
  در موبایل ارتفاع هیرو به کارت می‌رسد تا زیر عکس خالی نماند؛ دسکتاپ تمام‌صفحه است.

## شیشه

موتور از [website-glass](https://websiteglass.com/) در `src/shared/ui/glass.tsx` است
(ADR-0011). `GlassSurface` و `GlassButton` برای هدر، کارت هیرو، شیت موبایل و دیسک آیکون؛
کارت‌ها و فرم‌ها با کلاس CSS `.glass` تا جدول ادمین سنگین نشود.

آیکون عملیاتی (سبد، منو، بستن) باید `GlassIconButton` باشد؛ آیکون تزئینی داخل متن نه.
در رابط کاربری از ایموجی استفاده نمی‌شود؛ مناسبت‌ها با `OccasionIcon` (Lucide) نمایش داده می‌شوند.

## کامپوننت‌های پایه

همه در `src/shared/ui/` و سبک shadcn (کد داخل مخزن، نه وابستگی خارجی):

`button`، `input`، `textarea`، `label`، `card`، `badge`، `separator`، `skeleton`،
`dialog`، `dropdown-menu`، `select`، `tabs`، `progress`، `avatar`، `checkbox`،
`switch`، `radio-group`، `table`، `alert`، `accordion`، `form-field`، `page-header`،
`empty-state`، `glass`، `glass-button`، `glass-icon-button`، `glass-sheet`،
`gold-glow`، `app-nav-shell`

**قانون مهم:** کامپوننت‌های `shared/ui/` هیچ دانشی از دامنه ندارند. کامپوننتی که بداند
«گنجینه» چیست، باید در `modules/<x>/ui/` باشد.

## کامپوننت‌های دامنه

| کامپوننت | جای آن | کار |
| --- | --- | --- |
| `Money` | `shared/ui/money.tsx` | نمایش مبلغ ریالی به‌صورت تومان با ارقام فارسی |
| `GoldWeight` | `shared/ui/gold-weight.tsx` | نمایش میلی‌گرم به‌صورت گرم |
| `JalaliDate` | `shared/ui/jalali-date.tsx` | نمایش epoch به‌صورت تاریخ شمسی |
| `PriceBreakdownTable` | `modules/pricing/ui/` | جدول شفاف اجزای قیمت |
| `TreasureProgress` | `modules/treasury/ui/` | نوار پیشرفت گنجینه |
| `OccasionIcon` / `OccasionLabel` / `OccasionCard` | `modules/catalog/ui/` | آیکون مناسبت؛ در کارت‌ها به‌صورت واترمارک بزرگ و کم‌رنگ در انتهای پس‌زمینه |

## اصل مهم رابط کاربری

هر صفحه ابتدا باید به این سؤال جواب دهد: **«این برای چه کودکی است؟»**
نه اینکه اول قیمت طلا را نشان دهد.

قیمت طلا مهم است، اما روایت برند نباید تبدیل به یک رابط معاملاتی شود.

و در نمایش موجودی:

- معیار اصلی و بزرگ: **وزن طلا**
- معیار ثانویه و کوچک‌تر: ارزش ریالی

## دسترسی‌پذیری

- کنتراست متن حداقل ۴.۵ به ۱.
- هر ورودی فرم `label` متصل دارد (از `FormField` استفاده کنید).
- فوکوس همیشه دیده می‌شود (`:focus-visible` سراسری تعریف شده).
- هدف لمسی حداقل ۴۴ پیکسل — به‌همین دلیل ارتفاع پیش‌فرض دکمه و ورودی `h-11` است.
- برای پرسونای پدربزرگ و مادربزرگ، صفحه هدیه فونت و دکمه بزرگ‌تر دارد.

/**
 * قرارداد دادهٔ نمونه.
 *
 * هر جدول اسکیما باید اینجا یک ردیف داشته باشد. جدول جدید بدون ردیف،
 * `npm run check:arch` را می‌شکند تا ماک فراموش نشود.
 *
 * seeded: seed باید حداقل یک ردیف بسازد.
 * runtime_empty: عمداً خالی می‌ماند (نشست، رمز یک‌بارمصرف، محدودیت نرخ).
 */

export type SeedTablePolicy = "seeded" | "runtime_empty";

export interface SeedTableEntry {
  table: string;
  policy: SeedTablePolicy;
  /** فایل seeder نسبت به `scripts/` یا دلیل خالی بودن. */
  seeder: string;
}

export const SEED_TABLE_REGISTRY: readonly SeedTableEntry[] = [
  { table: "users", policy: "seeded", seeder: "db-seed.ts / seed/people.ts" },
  { table: "user_roles", policy: "seeded", seeder: "db-seed.ts / seed/people.ts" },
  { table: "staff_roles", policy: "seeded", seeder: "seed/staff-roles.ts" },
  { table: "staff_role_grants", policy: "seeded", seeder: "seed/staff-roles.ts" },
  {
    table: "otp_codes",
    policy: "runtime_empty",
    seeder: "ورود واقعی کد می‌سازد؛ هش نمونه ذخیره نمی‌شود",
  },
  {
    table: "sessions",
    policy: "runtime_empty",
    seeder: "نشست فقط پس از ورود ساخته می‌شود",
  },
  {
    table: "rate_limits",
    policy: "runtime_empty",
    seeder: "سطل محدودیت نرخ در زمان اجرا پر می‌شود",
  },
  { table: "audit_logs", policy: "seeded", seeder: "seed/ops.ts" },
  { table: "children", policy: "seeded", seeder: "seed/people.ts" },
  { table: "guardianships", policy: "seeded", seeder: "seed/people.ts" },
  { table: "child_timeline_events", policy: "seeded", seeder: "seed/people.ts" },
  { table: "treasures", policy: "seeded", seeder: "seed/treasury.ts" },
  { table: "gold_ledger_entries", policy: "seeded", seeder: "seed/treasury.ts / seed/commerce.ts" },
  { table: "treasure_goals", policy: "seeded", seeder: "seed/treasury.ts" },
  { table: "treasure_milestones", policy: "seeded", seeder: "seed/treasury.ts" },
  { table: "gold_cover_entries", policy: "seeded", seeder: "seed/treasury.ts" },
  { table: "gift_links", policy: "seeded", seeder: "seed/treasury.ts" },
  { table: "contributions", policy: "seeded", seeder: "seed/treasury.ts" },
  { table: "gift_cards", policy: "seeded", seeder: "seed/content.ts" },
  { table: "categories", policy: "seeded", seeder: "seed/catalog.ts" },
  { table: "occasions", policy: "seeded", seeder: "seed/catalog.ts" },
  { table: "products", policy: "seeded", seeder: "seed/catalog.ts" },
  { table: "product_variants", policy: "seeded", seeder: "seed/catalog.ts" },
  { table: "product_media", policy: "seeded", seeder: "seed/catalog.ts" },
  { table: "product_occasions", policy: "seeded", seeder: "seed/catalog.ts" },
  { table: "personalizations", policy: "seeded", seeder: "seed/commerce.ts" },
  { table: "media_files", policy: "seeded", seeder: "seed/media.ts" },
  { table: "gold_prices", policy: "seeded", seeder: "db-seed.ts" },
  { table: "carts", policy: "seeded", seeder: "seed/commerce.ts" },
  { table: "cart_items", policy: "seeded", seeder: "seed/commerce.ts" },
  { table: "orders", policy: "seeded", seeder: "seed/commerce.ts" },
  { table: "order_items", policy: "seeded", seeder: "seed/commerce.ts" },
  { table: "order_status_history", policy: "seeded", seeder: "seed/commerce.ts" },
  { table: "shipments", policy: "seeded", seeder: "seed/commerce.ts" },
  { table: "bank_accounts", policy: "seeded", seeder: "db-seed.ts" },
  { table: "payments", policy: "seeded", seeder: "seed/commerce.ts" },
  { table: "card_transfer_receipts", policy: "seeded", seeder: "seed/commerce.ts" },
  { table: "notifications", policy: "seeded", seeder: "seed/content.ts" },
  { table: "sms_messages", policy: "seeded", seeder: "seed/ops.ts" },
  { table: "settings", policy: "seeded", seeder: "db-seed.ts" },
  { table: "content_pages", policy: "seeded", seeder: "seed/content.ts" },
  { table: "faqs", policy: "seeded", seeder: "seed/content.ts" },
];

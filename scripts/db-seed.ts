/**
 * داده اولیه محیط توسعه و اولین راه‌اندازی.
 *
 * این اسکریپت مستقل از Next است تا به `server-only` وابسته نشود.
 * اگر جدول users خالی نباشد، از نو نمی‌نویسد تا داده production بازنویسی نشود.
 *
 * اجرا: npm run db:seed
 * برای دیدن دموی کامل روی دیتابیس از قبل seedشده: npm run db:reset
 */

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { config as loadEnv } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";

import { settingsDefaults, settingsLabels } from "@/modules/content/domain/settings-keys";
import * as schema from "@/server/db/schema";

import { seedCatalog } from "./seed/catalog";
import { seedCommerce } from "./seed/commerce";
import { seedContent } from "./seed/content";
import { seedPeople } from "./seed/people";
import { ensureStaffRoles } from "./seed/staff-roles";
import { seedTreasury } from "./seed/treasury";
import type { SeedContext } from "./seed/types";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/haft.db";
const adminPhone = process.env.ADMIN_BOOTSTRAP_PHONE ?? "09120000000";
const storageDir = resolve(process.env.STORAGE_DIR ?? "./storage");

if (databaseUrl.startsWith("file:")) {
  mkdirSync(dirname(resolve(databaseUrl.slice("file:".length))), { recursive: true });
}

mkdirSync(storageDir, { recursive: true });

const client = createClient({
  url: databaseUrl,
  ...(process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}),
});

const db = drizzle(client, { schema, casing: "snake_case" });

const GOLD_PRICE_18 = 65_000_000;
const GOLD_PRICE_24 = 86_670_000;

async function main(): Promise<void> {
  await client.executeMultiple(
    ["PRAGMA journal_mode = WAL;", "PRAGMA foreign_keys = ON;"].join("\n"),
  );

  await ensureStaffRoles(db);

  const existingUser = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .limit(1);

  if (existingUser[0]) {
    console.log("Seed skipped: users table is not empty.");
    console.log("نقش‌های سیستمی در صورت نبودن ساخته شدند.");
    console.log("برای ریختن دموی کامل روی محیط توسعه: npm run db:reset");
    return;
  }

  console.log("در حال ریختن داده نمونه کامل...");

  const now = Date.now();

  const [admin] = await db
    .insert(schema.users)
    .values({
      phone: adminPhone,
      firstName: "مدیر",
      lastName: "هفت‌منظومه",
      status: "active",
      kycStatus: "verified",
      kycVerifiedAt: now,
    })
    .returning();

  if (!admin) throw new Error("ساخت کاربر ادمین شکست خورد.");

  await db.insert(schema.userRoles).values({
    userId: admin.id,
    role: "super_admin",
  });

  await db.insert(schema.goldPrices).values([
    {
      karat: 18,
      pricePerGramRial: GOLD_PRICE_18,
      source: "manual",
      sourceRef: "قیمت اولیه seed",
      effectiveAt: now,
      createdByUserId: admin.id,
    },
    {
      karat: 24,
      pricePerGramRial: GOLD_PRICE_24,
      source: "manual",
      sourceRef: "قیمت اولیه seed",
      effectiveAt: now,
      createdByUserId: admin.id,
    },
  ]);

  await db.insert(schema.bankAccounts).values([
    {
      title: "حساب اصلی فروشگاه",
      bankName: "ملت",
      cardNumber: "6219861034529007",
      iban: "IR120120000000000123456789",
      accountHolder: "هفت منظومه",
      isActive: true,
      sortOrder: 0,
    },
    {
      title: "حساب دوم کارت‌به‌کارت",
      bankName: "سامان",
      cardNumber: "6219861912345678",
      iban: "IR560560000000000987654321",
      accountHolder: "هفت منظومه",
      isActive: true,
      sortOrder: 1,
    },
    {
      title: "حساب پشتیبان",
      bankName: "پاسارگاد",
      cardNumber: "5022291012345678",
      iban: "IR570570000000000112233445",
      accountHolder: "هفت منظومه",
      isActive: true,
      sortOrder: 2,
    },
  ]);

  for (const key of Object.keys(settingsDefaults) as Array<keyof typeof settingsDefaults>) {
    await db.insert(schema.settings).values({
      key,
      value: settingsDefaults[key],
      description: settingsLabels[key],
    });
  }

  const ctx: SeedContext = {
    db,
    now,
    adminId: admin.id,
    storageDir,
    goldPrice18: GOLD_PRICE_18,
    goldPrice24: GOLD_PRICE_24,
    vatBp: settingsDefaults["pricing.vat_bp"],
    shippingRial: settingsDefaults["shipping.flat_rate_rial"],
    freeThresholdRial: settingsDefaults["shipping.free_threshold_rial"],
    milestoneThresholdsMg: settingsDefaults["treasury.milestones_mg"],
  };

  const catalog = await seedCatalog(ctx);
  const people = await seedPeople(ctx);
  const treasury = await seedTreasury(ctx, people);
  await seedCommerce(ctx, catalog, people, treasury);
  await seedContent(ctx, people, treasury);

  const demoParent = people.parents[0];
  const demoLink = treasury.giftLinks[0];

  console.log("داده نمونه کامل آماده شد.");
  console.log(`  سوپرادمین: ${adminPhone}`);
  console.log("  مالی: 09120000001");
  console.log(`  والد نمونه: ${demoParent?.phone ?? "09121111111"}`);
  if (demoLink) {
    console.log(`  لینک هدیه نمونه: /g/${demoLink.token}`);
  }
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

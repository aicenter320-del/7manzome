import { randomBytes } from "node:crypto";

import { prepareCoverEntry } from "@/modules/treasury/domain/gold-cover";
import {
  detectMilestones,
  milestoneTitle,
  prepareEntry,
} from "@/modules/treasury/domain/gold-ledger";
import * as schema from "@/server/db/schema";
import { DISPLAY_KARAT, fromPureMg, rialToGoldMg } from "@/shared/lib/gold";
import type { GoldKarat, LedgerSource } from "@/shared/types/enums";

import type {
  SeedContext,
  SeedContribution,
  SeedPeople,
  SeedTreasure,
  SeedTreasury,
} from "./types";

interface TreasureLedgerState {
  previousPureMg: number;
  achievedMg: number[];
}

const ledgerState = new Map<string, TreasureLedgerState>();

function displayBalance(pureMg: number): number {
  return pureMg > 0 ? fromPureMg(pureMg, DISPLAY_KARAT) : 0;
}

export async function creditSeedGold(
  ctx: SeedContext,
  input: {
    treasureId: string;
    amountMg: number;
    karat: GoldKarat;
    source: LedgerSource;
    referenceType: string;
    referenceId: string;
    goldPricePerGramRial: number;
    valueRial: number;
    note?: string;
    occurredAt: number;
    actorUserId: string;
  },
): Promise<string> {
  const prepared = prepareEntry(
    {
      treasureId: input.treasureId,
      direction: "in",
      amountMg: input.amountMg,
      karat: input.karat,
      source: input.source,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      goldPricePerGramRial: input.goldPricePerGramRial,
      valueRial: input.valueRial,
      note: input.note ?? null,
      occurredAt: input.occurredAt,
    },
    input.occurredAt,
  );

  const [entry] = await ctx.db
    .insert(schema.goldLedgerEntries)
    .values({
      treasureId: prepared.treasureId,
      direction: prepared.direction,
      amountMg: prepared.amountMg,
      karat: prepared.karat,
      pureMg: prepared.pureMg,
      source: prepared.source,
      referenceType: prepared.referenceType,
      referenceId: prepared.referenceId,
      goldPricePerGramRial: prepared.goldPricePerGramRial,
      valueRial: prepared.valueRial,
      note: prepared.note ?? null,
      createdByUserId: input.actorUserId,
      occurredAt: prepared.occurredAt,
      createdAt: prepared.occurredAt,
    })
    .returning({ id: schema.goldLedgerEntries.id });

  if (!entry) throw new Error("ثبت قلم دفتر کل نمونه شکست خورد.");

  const state = ledgerState.get(input.treasureId) ?? { previousPureMg: 0, achievedMg: [] };
  const previousBalanceMg = displayBalance(state.previousPureMg);
  const newPure = state.previousPureMg + prepared.pureMg;
  const newBalanceMg = displayBalance(newPure);
  const thresholds = detectMilestones({
    previousBalanceMg,
    newBalanceMg,
    thresholdsMg: ctx.milestoneThresholdsMg,
    alreadyAchievedMg: state.achievedMg,
  });

  for (const threshold of thresholds) {
    await ctx.db.insert(schema.treasureMilestones).values({
      treasureId: input.treasureId,
      thresholdMg: threshold,
      title: milestoneTitle(threshold),
      ledgerEntryId: entry.id,
      achievedAt: input.occurredAt,
      createdAt: input.occurredAt,
    });
    state.achievedMg.push(threshold);
  }

  ledgerState.set(input.treasureId, { previousPureMg: newPure, achievedMg: state.achievedMg });

  return entry.id;
}

function giftToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function seedTreasury(
  ctx: SeedContext,
  people: SeedPeople,
): Promise<SeedTreasury> {
  const treasures: SeedTreasure[] = [];

  for (const child of people.children) {
    const [treasure] = await ctx.db
      .insert(schema.treasures)
      .values({
        childId: child.id,
        title: `گنجینه ${child.firstName}`,
        kind: "personal",
        inviteMessage: `سلام؛ این گنجینه ${child.firstName} است. به‌جای هدیه مصرفی، طلایی ماندگار برای او بگذارید.`,
        status: "active",
        visibility: "link",
        createdByUserId: child.ownerUserId,
        assetOwnerUserId: child.ownerUserId,
      })
      .returning();

    if (!treasure) throw new Error(`ساخت گنجینه ${child.firstName} شکست خورد.`);

    treasures.push({
      id: treasure.id,
      childId: child.id,
      ownerUserId: child.ownerUserId,
      childFirstName: child.firstName,
    });
  }

  const ava = treasures[0];
  const kian = treasures[2];
  const niku = treasures[3];
  if (!ava || !kian || !niku) throw new Error("گنجینه‌های رویدادی نمونه ناقص است.");

  const eventSpecs = [
    {
      base: kian,
      title: "عقیقه کیان",
      occasionSlug: "aqiqah",
      inviteMessage: "برای عقیقه کیان، سهمی از طلا به گنجینه او اضافه کنید.",
      daysAhead: 20,
    },
    {
      base: niku,
      title: "جشن تکلیف نیکو",
      occasionSlug: "jashn-taklif",
      inviteMessage: "نیکو به جشن تکلیف نزدیک است؛ هدیه‌ای ماندگار برایش بگذارید.",
      daysAhead: 80,
    },
    {
      base: ava,
      title: "تولد آوا",
      occasionSlug: "birthday",
      inviteMessage: "تولد آوا نزدیک است. به‌جای اسباب‌بازی، طلا به گنجینه‌اش اضافه کنید.",
      daysAhead: 45,
    },
  ];

  for (const spec of eventSpecs) {
    const [eventTreasure] = await ctx.db
      .insert(schema.treasures)
      .values({
        childId: spec.base.childId,
        title: spec.title,
        kind: "event",
        occasionSlug: spec.occasionSlug,
        eventDateAt: ctx.now + spec.daysAhead * 86_400_000,
        inviteMessage: spec.inviteMessage,
        status: "active",
        visibility: "link",
        createdByUserId: spec.base.ownerUserId,
        assetOwnerUserId: spec.base.ownerUserId,
      })
      .returning();

    if (!eventTreasure) throw new Error(`ساخت گنجینه رویدادی ${spec.title} شکست خورد.`);

    treasures.push({
      id: eventTreasure.id,
      childId: spec.base.childId,
      ownerUserId: spec.base.ownerUserId,
      childFirstName: spec.base.childFirstName,
    });
  }

  const goalTargets: Array<{ index: number; targetMg: number; note: string; days: number }> = [
    { index: 0, targetMg: 5_000, note: "هدف یک‌ساله آوا: پنج گرم طلای ۱۸ عیار.", days: 280 },
    { index: 1, targetMg: 10_000, note: "هدف رادین تا پایان دبستان.", days: 600 },
    { index: 4, targetMg: 3_000, note: "سه گرم تا نوروز بعد.", days: 200 },
    { index: 8, targetMg: 15_000, note: "گنجینه سامان برای سال‌های نوجوانی.", days: 900 },
  ];

  for (const goal of goalTargets) {
    const treasure = treasures[goal.index];
    if (!treasure) continue;
    await ctx.db.insert(schema.treasureGoals).values({
      treasureId: treasure.id,
      targetMg: goal.targetMg,
      targetDateAt: ctx.now + goal.days * 86_400_000,
      note: goal.note,
      status: "active",
      createdByUserId: treasure.ownerUserId,
    });
  }

  const suggested = [5_000_000, 10_000_000, 20_000_000, 50_000_000];
  const giftLinks: SeedTreasury["giftLinks"] = [];

  for (const [index, treasure] of treasures.slice(0, 8).entries()) {
    const expired = index === 7;
    const token = giftToken();
    const [link] = await ctx.db
      .insert(schema.giftLinks)
      .values({
        treasureId: treasure.id,
        token,
        title: expired ? `لینک منقضی ${treasure.childFirstName}` : `هدیه به ${treasure.childFirstName}`,
        message: `با هر مبلغی می‌توانید به گنجینه ${treasure.childFirstName} اضافه کنید.`,
        suggestedAmountsRial: suggested,
        targetMg: index % 2 === 0 ? 1_000 : null,
        status: expired ? "expired" : "active",
        expiresAt: expired ? ctx.now - 5 * 86_400_000 : ctx.now + 60 * 86_400_000,
        viewCount: 12 + index * 3,
        createdByUserId: treasure.ownerUserId,
      })
      .returning();

    if (!link) throw new Error("ساخت لینک هدیه شکست خورد.");
    giftLinks.push({ id: link.id, treasureId: treasure.id, token });
  }

  const contributionSpecs: Array<{
    treasureIndex: number;
    linkIndex: number | null;
    name: string;
    phone: string | null;
    relation: string;
    amountRial: number;
    keepsake: string;
    anonymous: boolean;
    confirmed: boolean;
    daysAgo: number;
  }> = [
    {
      treasureIndex: 0,
      linkIndex: 0,
      name: "خاله نسرین",
      phone: "09123334401",
      relation: "خاله",
      amountRial: 20_000_000,
      keepsake: "آوا جان، این سهم کوچک از طلا برای روزهایی است که بزرگ می‌شوی.",
      anonymous: false,
      confirmed: true,
      daysAgo: 18,
    },
    {
      treasureIndex: 0,
      linkIndex: 0,
      name: "دوست مامان",
      phone: null,
      relation: "دوست خانوادگی",
      amountRial: 10_000_000,
      keepsake: "با عشق برای گنجینه تو.",
      anonymous: true,
      confirmed: true,
      daysAgo: 12,
    },
    {
      treasureIndex: 1,
      linkIndex: 1,
      name: "عمو حامد",
      phone: "09123334402",
      relation: "عمو",
      amountRial: 50_000_000,
      keepsake: "رادین، برای شروع مدرسه‌ات طلایی ماندگار.",
      anonymous: false,
      confirmed: true,
      daysAgo: 40,
    },
    {
      treasureIndex: 2,
      linkIndex: 2,
      name: "مادربزرگ",
      phone: "09123334403",
      relation: "مادربزرگ",
      amountRial: 5_000_000,
      keepsake: "نوه عزیزم، این عقیقه توست.",
      anonymous: false,
      confirmed: true,
      daysAgo: 8,
    },
    {
      treasureIndex: 3,
      linkIndex: 3,
      name: "خاله مهسا",
      phone: "09123334404",
      relation: "خاله",
      amountRial: 20_000_000,
      keepsake: "برای جشن تکلیفت، نیکو جان.",
      anonymous: false,
      confirmed: true,
      daysAgo: 6,
    },
    {
      treasureIndex: 4,
      linkIndex: 4,
      name: "پدربزرگ",
      phone: "09123334405",
      relation: "پدربزرگ",
      amountRial: 10_000_000,
      keepsake: "عیدی نوروز پرهام.",
      anonymous: false,
      confirmed: true,
      daysAgo: 25,
    },
    {
      treasureIndex: 5,
      linkIndex: 5,
      name: "عمه لیلا",
      phone: null,
      relation: "عمه",
      amountRial: 5_000_000,
      keepsake: "یلدایت مبارک باران.",
      anonymous: false,
      confirmed: true,
      daysAgo: 15,
    },
    {
      treasureIndex: 8,
      linkIndex: null,
      name: "دایی کیوان",
      phone: "09123334406",
      relation: "دایی",
      amountRial: 50_000_000,
      keepsake: "سامان، این سهم برای سال‌های دور است.",
      anonymous: false,
      confirmed: true,
      daysAgo: 50,
    },
    {
      treasureIndex: 6,
      linkIndex: 6,
      name: "همسایه",
      phone: "09123334407",
      relation: "دوست خانوادگی",
      amountRial: 10_000_000,
      keepsake: "برای آریا با آرزوی سلامتی.",
      anonymous: false,
      confirmed: false,
      daysAgo: 1,
    },
    {
      treasureIndex: 7,
      linkIndex: null,
      name: "خاله سارا",
      phone: "09123334408",
      relation: "خاله",
      amountRial: 5_000_000,
      keepsake: "هلنا کوچولو، این اولین هدیه‌ات باشد.",
      anonymous: false,
      confirmed: false,
      daysAgo: 0,
    },
  ];

  const contributions: SeedContribution[] = [];

  for (const spec of contributionSpecs) {
    const treasure = treasures[spec.treasureIndex];
    if (!treasure) continue;
    const link = spec.linkIndex === null ? null : (giftLinks[spec.linkIndex] ?? null);
    const occurredAt = ctx.now - spec.daysAgo * 86_400_000;
    const goldMg = spec.confirmed ? rialToGoldMg(spec.amountRial, ctx.goldPrice18) : null;

    const [row] = await ctx.db
      .insert(schema.contributions)
      .values({
        treasureId: treasure.id,
        giftLinkId: link?.id ?? null,
        contributorName: spec.name,
        contributorPhone: spec.phone,
        relationLabel: spec.relation,
        amountRial: spec.amountRial,
        goldMg,
        karat: spec.confirmed ? DISPLAY_KARAT : null,
        goldPricePerGramRial: spec.confirmed ? ctx.goldPrice18 : null,
        status: spec.confirmed ? "confirmed" : "awaiting_payment",
        keepsakeMessage: spec.keepsake,
        isAnonymous: spec.anonymous,
        confirmedAt: spec.confirmed ? occurredAt : null,
        createdAt: occurredAt,
        updatedAt: occurredAt,
      })
      .returning();

    if (!row) throw new Error("ساخت مشارکت نمونه شکست خورد.");

    contributions.push({
      id: row.id,
      treasureId: treasure.id,
      ownerUserId: treasure.ownerUserId,
      childFirstName: treasure.childFirstName,
      contributorName: spec.anonymous ? "یک دوست" : spec.name,
      amountRial: spec.amountRial,
      confirmed: spec.confirmed,
    });

    if (spec.confirmed && goldMg && goldMg > 0) {
      await creditSeedGold(ctx, {
        treasureId: treasure.id,
        amountMg: goldMg,
        karat: DISPLAY_KARAT,
        source: "contribution",
        referenceType: "contribution",
        referenceId: row.id,
        goldPricePerGramRial: ctx.goldPrice18,
        valueRial: spec.amountRial,
        note: `مشارکت ${spec.name}`,
        occurredAt,
        actorUserId: ctx.adminId,
      });
    }
  }

  const coverPurchases = [
    {
      amountMg: 8_000,
      karat: 18 as const,
      paidRial: 520_000_000,
      purchasedDaysAgo: 12,
      note: "خرید پوشش بازار — شمش ۱۸ عیار",
    },
    {
      amountMg: 3_000,
      karat: 24 as const,
      paidRial: 260_000_000,
      purchasedDaysAgo: 5,
      note: "خرید پوشش بازار — طلای ۲۴ عیار",
    },
  ];

  for (const purchase of coverPurchases) {
    const purchasedAt = ctx.now - purchase.purchasedDaysAgo * 86_400_000;
    const prepared = prepareCoverEntry({
      amountMg: purchase.amountMg,
      karat: purchase.karat,
      paidRial: purchase.paidRial,
      source: "purchase",
      note: purchase.note,
      purchasedAt,
    });

    await ctx.db.insert(schema.goldCoverEntries).values({
      amountMg: prepared.amountMg,
      karat: prepared.karat,
      pureMg: prepared.pureMg,
      paidRial: prepared.paidRial,
      source: prepared.source,
      note: prepared.note,
      purchasedAt: prepared.purchasedAt,
      createdByUserId: ctx.adminId,
      createdAt: purchasedAt,
    });
  }

  return { treasures, giftLinks, contributions };
}

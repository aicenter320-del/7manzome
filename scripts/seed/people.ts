import * as schema from "@/server/db/schema";
import { fromJalali } from "@/shared/lib/jalali";
import type { AccessLevel, ChildGender, GuardianRelation, KycStatus, UserRole } from "@/shared/types/enums";

import { saveChildAvatar } from "./media";
import type { SeedChild, SeedContext, SeedPeople, SeedUser } from "./types";

function initials(nameEn: string): string {
  const parts = nameEn.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "A";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "M";
  return `${first}${second}`;
}

async function insertUser(
  ctx: SeedContext,
  input: {
    phone: string;
    firstName: string;
    lastName: string;
    kycStatus: KycStatus;
    role?: UserRole;
    createdAtOffsetDays: number;
  },
): Promise<SeedUser> {
  const createdAt = ctx.now - input.createdAtOffsetDays * 86_400_000;
  const [user] = await ctx.db
    .insert(schema.users)
    .values({
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
      status: "active",
      kycStatus: input.kycStatus,
      kycVerifiedAt: input.kycStatus === "verified" ? createdAt + 86_400_000 : null,
      createdAt,
      updatedAt: createdAt,
    })
    .returning();

  if (!user) throw new Error(`ساخت کاربر ${input.phone} شکست خورد.`);

  if (input.role) {
    await ctx.db.insert(schema.userRoles).values({
      userId: user.id,
      role: input.role,
      grantedByUserId: ctx.adminId,
      createdAt,
    });
  }

  return {
    id: user.id,
    phone: user.phone,
    firstName: input.firstName,
    lastName: input.lastName,
  };
}

export async function seedPeople(ctx: SeedContext): Promise<SeedPeople> {
  const finance = await insertUser(ctx, {
    phone: "09120000001",
    firstName: "نگار",
    lastName: "مالی",
    kycStatus: "verified",
    role: "finance",
    createdAtOffsetDays: 40,
  });
  const orderManager = await insertUser(ctx, {
    phone: "09120000002",
    firstName: "بهرام",
    lastName: "سفارش",
    kycStatus: "verified",
    role: "order_manager",
    createdAtOffsetDays: 38,
  });
  await insertUser(ctx, {
    phone: "09120000003",
    firstName: "پریسا",
    lastName: "محتوا",
    kycStatus: "verified",
    role: "content_manager",
    createdAtOffsetDays: 36,
  });
  await insertUser(ctx, {
    phone: "09120000004",
    firstName: "سمیرا",
    lastName: "پشتیبانی",
    kycStatus: "verified",
    role: "customer_support",
    createdAtOffsetDays: 34,
  });
  await insertUser(ctx, {
    phone: "09120000005",
    firstName: "کامران",
    lastName: "ارسال",
    kycStatus: "verified",
    role: "fulfillment",
    createdAtOffsetDays: 32,
  });

  const parentSpecs: Array<{
    phone: string;
    firstName: string;
    lastName: string;
    kycStatus: KycStatus;
  }> = [
    { phone: "09121111111", firstName: "سارا", lastName: "محمدی", kycStatus: "verified" },
    { phone: "09121111112", firstName: "رضا", lastName: "کریمی", kycStatus: "verified" },
    { phone: "09121111113", firstName: "نازنین", lastName: "حسینی", kycStatus: "pending" },
    { phone: "09121111114", firstName: "امیر", lastName: "عباسی", kycStatus: "verified" },
    { phone: "09121111115", firstName: "لیلا", lastName: "رضایی", kycStatus: "none" },
    { phone: "09121111116", firstName: "مهدی", lastName: "نوری", kycStatus: "verified" },
    { phone: "09121111117", firstName: "فاطمه", lastName: "احمدی", kycStatus: "pending" },
    { phone: "09121111118", firstName: "حسین", lastName: "مرادی", kycStatus: "verified" },
  ];

  const parents: SeedUser[] = [];
  for (const [index, spec] of parentSpecs.entries()) {
    parents.push(
      await insertUser(ctx, {
        ...spec,
        createdAtOffsetDays: 28 - index,
      }),
    );
  }

  const childSpecs: Array<{
    ownerIndex: number;
    firstName: string;
    lastName: string;
    nameEn: string;
    gender: ChildGender;
    birth: { year: number; month: number; day: number };
    note: string;
    extraGuardian?: { parentIndex: number; relation: GuardianRelation; accessLevel: AccessLevel };
    timeline?: Array<{ occasionSlug: string; title: string; note: string; daysAfterBirth: number }>;
  }> = [
    {
      ownerIndex: 0,
      firstName: "آوا",
      lastName: "محمدی",
      nameEn: "Ava Mohammadi",
      gender: "girl",
      birth: { year: 1402, month: 2, day: 14 },
      note: "عاشق رنگ زرد و قصه‌های شب است.",
      extraGuardian: { parentIndex: 7, relation: "grandfather", accessLevel: "viewer" },
      timeline: [
        { occasionSlug: "newborn", title: "بدو تولد", note: "اولین روز گنجینه آوا.", daysAfterBirth: 0 },
        { occasionSlug: "first-tooth", title: "اولین دندان", note: "دندان پایین درآمد.", daysAfterBirth: 220 },
      ],
    },
    {
      ownerIndex: 0,
      firstName: "رادین",
      lastName: "محمدی",
      nameEn: "Radin Mohammadi",
      gender: "boy",
      birth: { year: 1400, month: 8, day: 3 },
      note: "برادر بزرگ‌تر آوا؛ مدرسه را تازه شروع کرده.",
      timeline: [
        { occasionSlug: "school-start", title: "شروع مدرسه", note: "کلاس اول.", daysAfterBirth: 2_400 },
      ],
    },
    {
      ownerIndex: 1,
      firstName: "کیان",
      lastName: "کریمی",
      nameEn: "Kian Karimi",
      gender: "boy",
      birth: { year: 1403, month: 5, day: 21 },
      note: "نوزاد خانواده؛ هنوز پابند زنگوله دارد.",
      extraGuardian: { parentIndex: 2, relation: "aunt", accessLevel: "viewer" },
      timeline: [
        { occasionSlug: "chelleh", title: "شب چله نوزاد", note: "چهلمین شب.", daysAfterBirth: 40 },
      ],
    },
    {
      ownerIndex: 2,
      firstName: "نیکو",
      lastName: "حسینی",
      nameEn: "Niku Hosseini",
      gender: "girl",
      birth: { year: 1398, month: 11, day: 9 },
      note: "نزدیک جشن تکلیف.",
    },
    {
      ownerIndex: 3,
      firstName: "پرهام",
      lastName: "عباسی",
      nameEn: "Parham Abbasi",
      gender: "boy",
      birth: { year: 1401, month: 1, day: 1 },
      note: "نوروز تولدش است؛ هر سال عیدی طلا می‌گیرد.",
      timeline: [
        { occasionSlug: "birthday", title: "تولد نوروزی", note: "چهارمین سال.", daysAfterBirth: 1_460 },
      ],
    },
    {
      ownerIndex: 4,
      firstName: "باران",
      lastName: "رضایی",
      nameEn: "Baran Rezaei",
      gender: "girl",
      birth: { year: 1402, month: 9, day: 27 },
      note: "یلدا نزدیک تولدش است.",
    },
    {
      ownerIndex: 5,
      firstName: "آریا",
      lastName: "نوری",
      nameEn: "Arya Nouri",
      gender: "boy",
      birth: { year: 1399, month: 6, day: 18 },
      note: "دندان شیری‌اش تازه افتاده.",
      timeline: [
        { occasionSlug: "milk-tooth", title: "دندان شیری", note: "اولین دندان شیری افتاد.", daysAfterBirth: 2_100 },
      ],
    },
    {
      ownerIndex: 6,
      firstName: "هلنا",
      lastName: "احمدی",
      nameEn: "Helena Ahmadi",
      gender: "girl",
      birth: { year: 1403, month: 11, day: 2 },
      note: "شیرخوار؛ گنجینه تازه ساخته شده.",
    },
    {
      ownerIndex: 7,
      firstName: "سامان",
      lastName: "مرادی",
      nameEn: "Saman Moradi",
      gender: "boy",
      birth: { year: 1397, month: 4, day: 12 },
      note: "بزرگ‌ترین کودک نمونه؛ گنجینه‌اش سنگین‌تر است.",
    },
    {
      ownerIndex: 3,
      firstName: "رها",
      lastName: "عباسی",
      nameEn: "Raha Abbasi",
      gender: "girl",
      birth: { year: 1404, month: 1, day: 20 },
      note: "خواهر کوچک پرهام.",
      extraGuardian: { parentIndex: 0, relation: "family_friend", accessLevel: "viewer" },
    },
  ];

  const children: SeedChild[] = [];

  for (const [index, spec] of childSpecs.entries()) {
    const owner = parents[spec.ownerIndex];
    if (!owner) throw new Error("والد کودک نمونه پیدا نشد.");

    const avatar = await saveChildAvatar(ctx, initials(spec.nameEn), index);
    const birthDateAt = fromJalali(spec.birth);
    const createdAt = birthDateAt + 3 * 86_400_000;

    const [child] = await ctx.db
      .insert(schema.children)
      .values({
        ownerUserId: owner.id,
        firstName: spec.firstName,
        lastName: spec.lastName,
        nameEn: spec.nameEn,
        gender: spec.gender,
        birthDateAt,
        avatarFileId: avatar.id,
        note: spec.note,
        createdAt,
        updatedAt: createdAt,
      })
      .returning();

    if (!child) throw new Error(`ساخت کودک ${spec.firstName} شکست خورد.`);

    await ctx.db.insert(schema.guardianships).values({
      childId: child.id,
      userId: owner.id,
      relation: spec.gender === "girl" ? "mother" : "father",
      accessLevel: "owner",
      createdAt,
    });

    if (spec.extraGuardian) {
      const extra = parents[spec.extraGuardian.parentIndex];
      if (extra && extra.id !== owner.id) {
        await ctx.db.insert(schema.guardianships).values({
          childId: child.id,
          userId: extra.id,
          relation: spec.extraGuardian.relation,
          accessLevel: spec.extraGuardian.accessLevel,
          createdAt: createdAt + 86_400_000,
        });
      }
    }

    if (spec.timeline) {
      await ctx.db.insert(schema.childTimelineEvents).values(
        spec.timeline.map((event) => ({
          childId: child.id,
          occasionSlug: event.occasionSlug,
          title: event.title,
          occurredAt: birthDateAt + event.daysAfterBirth * 86_400_000,
          note: event.note,
          createdByUserId: owner.id,
        })),
      );
    }

    children.push({
      id: child.id,
      ownerUserId: owner.id,
      firstName: spec.firstName,
      nameEn: spec.nameEn,
    });
  }

  return { finance, orderManager, parents, children };
}

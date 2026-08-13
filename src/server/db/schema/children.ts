import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import type { AccessLevel, ChildGender, GuardianRelation } from "@/shared/types/enums";

import { createdAt, idRef, primaryId, timestamp, updatedAt } from "../columns";
import { users } from "./identity";
import { mediaFiles } from "./media";

/**
 * پروفایل هویتی کودک.
 *
 * توجه: کودک قهرمان محصول است اما مالک قانونی دارایی نیست. تفکیک مالکیت
 * در جدول treasures انجام شده است. (ADR-0006)
 */
export const children = sqliteTable(
  "children",
  {
    id: primaryId(),

    /** دارنده حساب؛ کاربر بزرگسالی که پروفایل را ساخته و مدیریت می‌کند. */
    ownerUserId: idRef("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    firstName: text("first_name").notNull(),
    lastName: text("last_name"),

    /** نام لاتین برای حکاکی روی محصول. */
    nameEn: text("name_en"),

    gender: text("gender").$type<ChildGender>().notNull().default("unspecified"),

    /** اجباری؛ کل موتور مناسبت و پیشنهاد هدیه به آن وابسته است. */
    birthDateAt: timestamp("birth_date_at").notNull(),

    avatarFileId: idRef("avatar_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),
    note: text("note"),

    /** رکورد کودک هرگز فیزیکی حذف نمی‌شود چون رکوردهای مالی به آن وصل‌اند. */
    archivedAt: timestamp("archived_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("children_owner_user_id_idx").on(table.ownerUserId),
    index("children_birth_date_at_idx").on(table.birthDateAt),
    index("children_archived_at_idx").on(table.archivedAt),
  ],
);

/** رابطه سرپرستی بین کاربر و کودک. */
export const guardianships = sqliteTable(
  "guardianships",
  {
    id: primaryId(),
    childId: idRef("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    userId: idRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    relation: text("relation").$type<GuardianRelation>().notNull(),
    accessLevel: text("access_level").$type<AccessLevel>().notNull().default("viewer"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("guardianships_child_user_unique").on(table.childId, table.userId),
    index("guardianships_user_id_idx").on(table.userId),
  ],
);

/** تایم‌لاین رویدادهای زندگی کودک؛ پایه موتور مناسبت و پیشنهاد هدیه. */
export const childTimelineEvents = sqliteTable(
  "child_timeline_events",
  {
    id: primaryId(),
    childId: idRef("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),

    /** اسلاگ مناسبت؛ به جدول occasions ارجاع منطقی دارد. */
    occasionSlug: text("occasion_slug"),
    title: text("title").notNull(),
    occurredAt: timestamp("occurred_at").notNull(),
    note: text("note"),
    createdByUserId: idRef("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
  },
  (table) => [
    index("child_timeline_events_child_id_idx").on(table.childId),
    index("child_timeline_events_occurred_at_idx").on(table.occurredAt),
  ],
);

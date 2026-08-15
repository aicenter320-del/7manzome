import type { AccessLevel, ChildGender, GuardianRelation } from "@/shared/types/enums";

export interface Child {
  id: string;
  ownerUserId: string;
  firstName: string;
  lastName: string | null;
  nameEn: string | null;
  displayName: string;
  gender: ChildGender;
  birthDateAt: number;
  avatarFileId: string | null;
  note: string | null;
  archivedAt: number | null;
  createdAt: number;
}

/** نمایه کودک با اطلاعات محاسبه‌شده سن و مناسبت بعدی. */
export interface ChildSummary extends Child {
  ageMonths: number;
  ageLabel: string;
  nextBirthdayAt: number;
  daysToBirthday: number;
}

export interface Guardianship {
  id: string;
  childId: string;
  userId: string;
  relation: GuardianRelation;
  accessLevel: AccessLevel;
  createdAt: number;
}

export interface TimelineEvent {
  id: string;
  childId: string;
  occasionSlug: string | null;
  title: string;
  occurredAt: number;
  note: string | null;
}

/** فهرست عملیاتی پنل؛ بدون کد ملی و آدرس. */
export interface AdminChildListItem {
  id: string;
  firstName: string;
  ageLabel: string;
  ownerUserId: string;
  ownerDisplayName: string;
  ownerPhone: string;
}

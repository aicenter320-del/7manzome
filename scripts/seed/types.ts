import type { LibSQLDatabase } from "drizzle-orm/libsql";

import type * as schema from "@/server/db/schema";
import type { GoldKarat, ProductKind } from "@/shared/types/enums";

export type SeedDb = LibSQLDatabase<typeof schema>;

export interface SeedContext {
  db: SeedDb;
  now: number;
  adminId: string;
  storageDir: string;
  goldPrice18: number;
  goldPrice24: number;
  vatBp: number;
  shippingRial: number;
  freeThresholdRial: number;
  milestoneThresholdsMg: readonly number[];
}

export interface SeedUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export interface SeedChild {
  id: string;
  ownerUserId: string;
  firstName: string;
  nameEn: string;
}

export interface SeedVariant {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  title: string;
  kind: ProductKind;
  weightMg: number;
  karat: GoldKarat;
  makingFeeBp: number;
  profitBp: number;
  premiumRial: number;
  packagingRial: number;
  personalizationRial: number;
  stockQty: number;
}

export interface SeedCatalog {
  variants: SeedVariant[];
  occasionIds: Record<string, string>;
}

export interface SeedPeople {
  finance: SeedUser;
  orderManager: SeedUser;
  parents: SeedUser[];
  children: SeedChild[];
}

export interface SeedTreasure {
  id: string;
  childId: string;
  ownerUserId: string;
  childFirstName: string;
}

export interface SeedGiftLink {
  id: string;
  treasureId: string;
  token: string;
}

export interface SeedContribution {
  id: string;
  treasureId: string;
  ownerUserId: string;
  childFirstName: string;
  contributorName: string;
  amountRial: number;
  confirmed: boolean;
}

export interface SeedTreasury {
  treasures: SeedTreasure[];
  giftLinks: SeedGiftLink[];
  contributions: SeedContribution[];
}

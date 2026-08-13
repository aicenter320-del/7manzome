import "server-only";

import type { ContentPageRow, FaqRow } from "@/server/db/types";

import { findActiveFaqs, findAllPages, findPageBySlug } from "../repo/content.repo";

export async function getPageBySlug(slug: string): Promise<ContentPageRow | null> {
  return findPageBySlug(slug);
}

export async function listPages(): Promise<ContentPageRow[]> {
  return findAllPages();
}

export async function listFaqs(): Promise<FaqRow[]> {
  return findActiveFaqs();
}

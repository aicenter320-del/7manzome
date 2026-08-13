import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { contentPages, faqs, settings } from "@/server/db/schema";
import type { ContentPageRow, FaqRow } from "@/server/db/types";

export async function findAllSettings(): Promise<Array<{ key: string; value: unknown }>> {
  return db.select({ key: settings.key, value: settings.value }).from(settings);
}

export async function upsertSetting(
  key: string,
  value: unknown,
  description?: string,
): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value, description: description ?? null })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: Date.now() },
    });
}

export async function findPageBySlug(slug: string): Promise<ContentPageRow | null> {
  const rows = await db
    .select()
    .from(contentPages)
    .where(and(eq(contentPages.slug, slug), eq(contentPages.status, "published")))
    .limit(1);

  return rows[0] ?? null;
}

export async function findAllPages(): Promise<ContentPageRow[]> {
  return db.select().from(contentPages).orderBy(asc(contentPages.slug));
}

export async function upsertPage(input: {
  slug: string;
  title: string;
  bodyMarkdown: string;
  status: "draft" | "published";
  seoTitle?: string | null;
  seoDescription?: string | null;
}): Promise<void> {
  await db
    .insert(contentPages)
    .values({
      slug: input.slug,
      title: input.title,
      bodyMarkdown: input.bodyMarkdown,
      status: input.status,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    })
    .onConflictDoUpdate({
      target: contentPages.slug,
      set: {
        title: input.title,
        bodyMarkdown: input.bodyMarkdown,
        status: input.status,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        updatedAt: Date.now(),
      },
    });
}

export async function findActiveFaqs(): Promise<FaqRow[]> {
  return db
    .select()
    .from(faqs)
    .where(eq(faqs.isActive, true))
    .orderBy(asc(faqs.sortOrder));
}

export async function insertFaq(input: {
  question: string;
  answer: string;
  category?: string | null;
  sortOrder?: number;
}): Promise<void> {
  await db.insert(faqs).values({
    question: input.question,
    answer: input.answer,
    category: input.category ?? null,
    sortOrder: input.sortOrder ?? 0,
  });
}

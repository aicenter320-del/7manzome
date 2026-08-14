import * as schema from "@/server/db/schema";
import { systemStaffRoleSeedData } from "@/shared/lib/access-matrix";

import type { SeedDb } from "./types";

/** شش نقش سیستمی را اگر نیستند می‌سازد. برای دیتابیس از قبل seedشده هم امن است. */
export async function ensureStaffRoles(db: SeedDb): Promise<void> {
  const existing = await db.select({ slug: schema.staffRoles.slug }).from(schema.staffRoles);
  const have = new Set(existing.map((row) => row.slug));

  for (const role of systemStaffRoleSeedData()) {
    if (have.has(role.slug)) continue;

    const [row] = await db
      .insert(schema.staffRoles)
      .values({
        slug: role.slug,
        title: role.title,
        description: null,
        isSystem: true,
      })
      .returning();

    if (!row) throw new Error(`ساخت نقش ${role.slug} شکست خورد.`);

    const grants = role.grants.filter((grant) => grant.level !== "none");
    if (grants.length === 0) continue;

    await db.insert(schema.staffRoleGrants).values(
      grants.map((grant) => ({
        roleId: row.id,
        section: grant.section,
        level: grant.level,
      })),
    );
  }
}

import "server-only";

import {
  parseSetting,
  settingsDefaults,
  settingsSchemas,
  type SettingKey,
  type SettingValue,
} from "../domain/settings-keys";
import { findAllSettings, upsertSetting } from "../repo/content.repo";

/**
 * خواندن و نوشتن تنظیمات.
 *
 * تنظیمات با کش کوتاه خوانده می‌شوند تا هر درخواست به دیتابیس نزند، اما کش
 * عمداً کوتاه است تا تغییر ادمین سریع اثر کند.
 */

const CACHE_TTL_MS = 30_000;

let cache: { values: Map<string, unknown>; expiresAt: number } | null = null;

async function loadSettings(): Promise<Map<string, unknown>> {
  if (cache && cache.expiresAt > Date.now()) return cache.values;

  const rows = await findAllSettings();
  const values = new Map(rows.map((row) => [row.key, row.value]));

  cache = { values, expiresAt: Date.now() + CACHE_TTL_MS };
  return values;
}

/** خواندن یک تنظیم؛ اگر نبود یا خراب بود، مقدار پیش‌فرض برمی‌گردد. */
export async function getSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  const values = await loadSettings();

  if (!values.has(key)) return settingsDefaults[key];

  return parseSetting(key, values.get(key));
}

/** خواندن چند تنظیم با یک بار مراجعه به کش. */
export async function getSettings<K extends SettingKey>(
  keys: readonly K[],
): Promise<{ [P in K]: SettingValue<P> }> {
  const values = await loadSettings();

  const result = {} as { [P in K]: SettingValue<P> };
  for (const key of keys) {
    result[key] = values.has(key) ? parseSetting(key, values.get(key)) : settingsDefaults[key];
  }

  return result;
}

/** نوشتن یک تنظیم با اعتبارسنجی مقدار. */
export async function setSetting<K extends SettingKey>(
  key: K,
  value: SettingValue<K>,
): Promise<void> {
  const parsed = settingsSchemas[key].safeParse(value);

  if (!parsed.success) {
    throw new Error(`مقدار تنظیم «${key}» معتبر نیست.`);
  }

  await upsertSetting(key, parsed.data);
  cache = null;
}

/** بی‌اعتبار کردن کش؛ پس از seed یا تغییر دسته‌ای لازم است. */
export function invalidateSettingsCache(): void {
  cache = null;
}

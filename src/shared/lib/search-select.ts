import { normalizePersianText, toEnglishDigits } from "./persian";

export type SearchSelectOption = {
  value: string;
  label: string;
  keywords?: readonly string[];
};

/** نرمال جست‌وجو: ارقام لاتین، ی/ک فارسی، فاصله یکدست، بدون اعراب. */
export function normalizeSearchQuery(query: string): string {
  return normalizePersianText(toEnglishDigits(query))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * پیشوندهایی مثل «بانک» که کاربر می‌نویسد ولی در برچسب گزینه نیست.
 * اگر کوئری با یکی از آن‌ها شروع شود، بقیه‌اش برای تطبیق استفاده می‌شود.
 */
export function stripLeadingAliases(
  normalizedQuery: string,
  aliases: readonly string[],
): string {
  if (!normalizedQuery) {
    return normalizedQuery;
  }

  for (const alias of aliases) {
    const normalizedAlias = normalizeSearchQuery(alias);
    if (!normalizedAlias) {
      continue;
    }
    if (normalizedQuery === normalizedAlias) {
      return "";
    }
    if (normalizedQuery.startsWith(`${normalizedAlias} `)) {
      return normalizedQuery.slice(normalizedAlias.length).trim();
    }
  }

  return normalizedQuery;
}

function haystackMatchesPrefix(haystack: string, needle: string): boolean {
  if (!needle) {
    return true;
  }
  if (haystack.startsWith(needle)) {
    return true;
  }
  return haystack.split(" ").some((token) => token.startsWith(needle));
}

export function optionMatchesQuery(
  option: SearchSelectOption,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const label = normalizeSearchQuery(option.label);
  if (haystackMatchesPrefix(label, normalizedQuery)) {
    return true;
  }

  const value = normalizeSearchQuery(option.value);
  if (value !== label && haystackMatchesPrefix(value, normalizedQuery)) {
    return true;
  }

  for (const keyword of option.keywords ?? []) {
    if (haystackMatchesPrefix(normalizeSearchQuery(keyword), normalizedQuery)) {
      return true;
    }
  }

  return false;
}

export function filterSearchOptions(
  options: readonly SearchSelectOption[],
  query: string,
  aliases: readonly string[] = [],
): SearchSelectOption[] {
  const normalizedQuery = stripLeadingAliases(normalizeSearchQuery(query), aliases);
  return options.filter((option) => optionMatchesQuery(option, normalizedQuery));
}

/**
 * اگر فقط یک گزینه مانده باشد، ادامهٔ کمرنگ برچسب را برای تکمیل خودکار برمی‌گرداند.
 * فقط وقتی کوئری پیشوند خود برچسب است (نه تطبیق از وسط کلمه).
 */
export function uniqueCompletion(
  options: readonly SearchSelectOption[],
  query: string,
  aliases: readonly string[] = [],
): { option: SearchSelectOption; remainder: string } | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const filtered = filterSearchOptions(options, query, aliases);
  if (filtered.length !== 1) {
    return null;
  }

  const option = filtered[0];
  if (!option) {
    return null;
  }

  const normalizedQuery = stripLeadingAliases(normalizeSearchQuery(query), aliases);
  const normalizedLabel = normalizeSearchQuery(option.label);
  if (!normalizedQuery || !normalizedLabel.startsWith(normalizedQuery)) {
    return { option, remainder: "" };
  }

  return {
    option,
    remainder: option.label.slice(normalizedQuery.length),
  };
}

/** تطبیق دقیق برچسب یا مقدار؛ برای ثبت با Enter وقتی کاربر کل اسم را نوشته. */
export function exactSearchOption(
  options: readonly SearchSelectOption[],
  query: string,
  aliases: readonly string[] = [],
): SearchSelectOption | null {
  const normalizedQuery = stripLeadingAliases(normalizeSearchQuery(query), aliases);
  if (!normalizedQuery) {
    return null;
  }

  const exact = options.find((option) => {
    const label = normalizeSearchQuery(option.label);
    const value = normalizeSearchQuery(option.value);
    return label === normalizedQuery || value === normalizedQuery;
  });

  return exact ?? null;
}

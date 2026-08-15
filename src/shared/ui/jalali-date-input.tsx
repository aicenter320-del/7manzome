"use client";

import { useMemo, useState } from "react";

import { fromJalali, JALALI_MONTHS, jalaliMonthDays, toJalali } from "@/shared/lib/jalali";
import { toPersianDigits } from "@/shared/lib/persian";
import type { SearchSelectOption } from "@/shared/lib/search-select";

import { SearchSelect } from "./search-select";

function digitKeywords(value: number, padded?: string): string[] {
  const raw = String(value);
  const keys = [raw, toPersianDigits(raw)];
  if (padded && padded !== raw) {
    keys.push(padded, toPersianDigits(padded));
  }
  return keys;
}

/**
 * ورودی تاریخ شمسی: هم از فهرست انتخاب می‌شود و هم با تایپ عدد یا نام ماه.
 *
 * تقویم میلادی مرورگر (`type="date"` / `datetime-local`) در این پروژه استفاده نمی‌شود.
 * خروجی epoch میلی‌ثانیه است.
 */
export function JalaliDateInput({
  id,
  value,
  onChange,
  minYear,
  maxYear,
  withTime = false,
  dateLabel,
  timeLabel = "ساعت",
}: {
  id: string;
  /** epoch میلی‌ثانیه یا null */
  value: number | null;
  onChange: (epochMs: number | null) => void;
  minYear?: number;
  maxYear?: number;
  /** اگر true باشد ساعت و دقیقه هم انتخاب می‌شود. */
  withTime?: boolean;
  /** برچسب ردیف تاریخ؛ اگر خالی باشد فقط انتخابگرها دیده می‌شوند. */
  dateLabel?: string;
  /** برچسب ردیف ساعت؛ پیش‌فرض «ساعت». */
  timeLabel?: string;
}) {
  // خواندن زمان جاری در بدنه رندر ناخالص است؛ با مقدار‌دهی تنبل state
  // یک بار محاسبه می‌شود و در رندرهای بعدی ثابت می‌ماند.
  const [currentYear] = useState(() => toJalali(Date.now()).year);
  const [initial] = useState(() => (value === null ? null : toJalali(value)));

  const [year, setYear] = useState<number | null>(initial?.year ?? null);
  const [month, setMonth] = useState<number | null>(initial?.month ?? null);
  const [day, setDay] = useState<number | null>(initial?.day ?? null);
  const [hour, setHour] = useState<number | null>(withTime ? (initial?.hour ?? null) : 0);
  const [minute, setMinute] = useState<number | null>(withTime ? (initial?.minute ?? null) : 0);

  const years = useMemo(() => {
    const from = minYear ?? currentYear - 20;
    const to = maxYear ?? currentYear;
    return Array.from({ length: to - from + 1 }, (_, index) => to - index);
  }, [currentYear, minYear, maxYear]);

  const daysInMonth = year !== null && month !== null ? jalaliMonthDays(year, month) : 31;

  const dayOptions = useMemo<SearchSelectOption[]>(
    () =>
      Array.from({ length: daysInMonth }, (_, index) => {
        const item = index + 1;
        return {
          value: String(item),
          label: toPersianDigits(item),
          keywords: digitKeywords(item),
        };
      }),
    [daysInMonth],
  );

  const monthOptions = useMemo<SearchSelectOption[]>(
    () =>
      JALALI_MONTHS.map((name, index) => {
        const item = index + 1;
        return {
          value: String(item),
          label: name,
          keywords: digitKeywords(item),
        };
      }),
    [],
  );

  const yearOptions = useMemo<SearchSelectOption[]>(
    () =>
      years.map((item) => ({
        value: String(item),
        label: toPersianDigits(item),
        keywords: digitKeywords(item),
      })),
    [years],
  );

  const hourOptions = useMemo<SearchSelectOption[]>(
    () =>
      Array.from({ length: 24 }, (_, item) => {
        const padded = String(item).padStart(2, "0");
        return {
          value: String(item),
          label: toPersianDigits(padded),
          keywords: digitKeywords(item, padded),
        };
      }),
    [],
  );

  const minuteOptions = useMemo<SearchSelectOption[]>(
    () =>
      Array.from({ length: 60 }, (_, item) => {
        const padded = String(item).padStart(2, "0");
        return {
          value: String(item),
          label: toPersianDigits(padded),
          keywords: digitKeywords(item, padded),
        };
      }),
    [],
  );

  const commit = (next: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
  }) => {
    const y = next.year ?? year;
    const m = next.month ?? month;
    let d = next.day ?? day;
    const h = next.hour ?? hour;
    const min = next.minute ?? minute;

    if (y === null || m === null || d === null) {
      onChange(null);
      return;
    }

    if (withTime && (h === null || min === null)) {
      onChange(null);
      return;
    }

    // تغییر ماه یا سال می‌تواند روز انتخاب‌شده را نامعتبر کند (مثلاً ۳۱ مهر).
    const maxDay = jalaliMonthDays(y, m);
    if (d > maxDay) {
      d = maxDay;
      setDay(maxDay);
    }

    onChange(
      fromJalali(
        { year: y, month: m, day: d },
        withTime && h !== null && min !== null ? { hour: h, minute: min } : undefined,
      ),
    );
  };

  const parsePart = (next: string): number | null => {
    if (!next) {
      return null;
    }
    const parsed = Number(next);
    return Number.isInteger(parsed) ? parsed : null;
  };

  const dateHeadingId = `${id}-date`;
  const timeHeadingId = `${id}-time`;

  return (
    <div className="grid gap-4" id={id}>
      <div className="grid gap-2">
        {dateLabel ? (
          <p id={dateHeadingId} className="text-xs font-medium text-muted-foreground">
            {dateLabel}
          </p>
        ) : null}
        <div
          className="grid grid-cols-3 gap-2"
          {...(dateLabel ? { "aria-labelledby": dateHeadingId } : {})}
        >
          <SearchSelect
            id={`${id}-day`}
            aria-label="روز"
            placeholder="روز"
            value={day === null ? "" : String(day)}
            options={dayOptions}
            inputMode="numeric"
            dir="ltr"
            onChange={(next) => {
              const parsed = parsePart(next);
              setDay(parsed);
              if (parsed === null) {
                onChange(null);
                return;
              }
              commit({ day: parsed });
            }}
          />

          <SearchSelect
            id={`${id}-month`}
            aria-label="ماه"
            placeholder="ماه"
            value={month === null ? "" : String(month)}
            options={monthOptions}
            onChange={(next) => {
              const parsed = parsePart(next);
              setMonth(parsed);
              if (parsed === null) {
                onChange(null);
                return;
              }
              commit({ month: parsed });
            }}
          />

          <SearchSelect
            id={`${id}-year`}
            aria-label="سال"
            placeholder="سال"
            value={year === null ? "" : String(year)}
            options={yearOptions}
            inputMode="numeric"
            dir="ltr"
            onChange={(next) => {
              const parsed = parsePart(next);
              setYear(parsed);
              if (parsed === null) {
                onChange(null);
                return;
              }
              commit({ year: parsed });
            }}
          />
        </div>
      </div>

      {withTime ? (
        <div className="grid gap-2">
          <p id={timeHeadingId} className="text-xs font-medium text-muted-foreground">
            {timeLabel}
          </p>
          <div className="grid grid-cols-2 gap-2" aria-labelledby={timeHeadingId}>
            <SearchSelect
              id={`${id}-hour`}
              aria-label="ساعت"
              placeholder="ساعت"
              value={hour === null ? "" : String(hour)}
              options={hourOptions}
              inputMode="numeric"
              dir="ltr"
              onChange={(next) => {
                const parsed = parsePart(next);
                setHour(parsed);
                if (parsed === null) {
                  onChange(null);
                  return;
                }
                commit({ hour: parsed });
              }}
            />

            <SearchSelect
              id={`${id}-minute`}
              aria-label="دقیقه"
              placeholder="دقیقه"
              value={minute === null ? "" : String(minute)}
              options={minuteOptions}
              inputMode="numeric"
              dir="ltr"
              onChange={(next) => {
                const parsed = parsePart(next);
                setMinute(parsed);
                if (parsed === null) {
                  onChange(null);
                  return;
                }
                commit({ minute: parsed });
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

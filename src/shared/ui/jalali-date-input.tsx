"use client";

import { useMemo, useState } from "react";

import { fromJalali, JALALI_MONTHS, jalaliMonthDays, toJalali } from "@/shared/lib/jalali";
import { toPersianDigits } from "@/shared/lib/persian";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

/**
 * ورودی تاریخ شمسی با سه انتخابگر سال، ماه و روز.
 *
 * عمداً تقویم بازشو ساخته نشده: برای پرسونای پدربزرگ و مادربزرگ سه انتخابگر
 * ساده قابل‌فهم‌تر از یک تقویم است. خروجی epoch میلی‌ثانیه است.
 */
export function JalaliDateInput({
  id,
  value,
  onChange,
  minYear,
  maxYear,
}: {
  id: string;
  /** epoch میلی‌ثانیه یا null */
  value: number | null;
  onChange: (epochMs: number | null) => void;
  minYear?: number;
  maxYear?: number;
}) {
  // خواندن زمان جاری در بدنه رندر ناخالص است؛ با مقدار‌دهی تنبل state
  // یک بار محاسبه می‌شود و در رندرهای بعدی ثابت می‌ماند.
  const [currentYear] = useState(() => toJalali(Date.now()).year);
  const [initial] = useState(() => (value === null ? null : toJalali(value)));

  const [year, setYear] = useState<number | null>(initial?.year ?? null);
  const [month, setMonth] = useState<number | null>(initial?.month ?? null);
  const [day, setDay] = useState<number | null>(initial?.day ?? null);

  const years = useMemo(() => {
    const from = minYear ?? currentYear - 20;
    const to = maxYear ?? currentYear;
    return Array.from({ length: to - from + 1 }, (_, index) => to - index);
  }, [currentYear, minYear, maxYear]);

  const daysInMonth = year !== null && month !== null ? jalaliMonthDays(year, month) : 31;

  const commit = (next: { year?: number; month?: number; day?: number }) => {
    const y = next.year ?? year;
    const m = next.month ?? month;
    let d = next.day ?? day;

    if (y === null || m === null || d === null) {
      onChange(null);
      return;
    }

    // تغییر ماه یا سال می‌تواند روز انتخاب‌شده را نامعتبر کند (مثلاً ۳۱ مهر).
    const maxDay = jalaliMonthDays(y, m);
    if (d > maxDay) {
      d = maxDay;
      setDay(maxDay);
    }

    onChange(fromJalali({ year: y, month: m, day: d }));
  };

  return (
    <div className="grid grid-cols-3 gap-2" id={id}>
      <Select
        value={day === null ? undefined : String(day)}
        onValueChange={(next) => {
          const parsed = Number(next);
          setDay(parsed);
          commit({ day: parsed });
        }}
      >
        <SelectTrigger aria-label="روز">
          <SelectValue placeholder="روز" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((item) => (
            <SelectItem key={item} value={String(item)}>
              {toPersianDigits(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={month === null ? undefined : String(month)}
        onValueChange={(next) => {
          const parsed = Number(next);
          setMonth(parsed);
          commit({ month: parsed });
        }}
      >
        <SelectTrigger aria-label="ماه">
          <SelectValue placeholder="ماه" />
        </SelectTrigger>
        <SelectContent>
          {JALALI_MONTHS.map((name, index) => (
            <SelectItem key={name} value={String(index + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={year === null ? undefined : String(year)}
        onValueChange={(next) => {
          const parsed = Number(next);
          setYear(parsed);
          commit({ year: parsed });
        }}
      >
        <SelectTrigger aria-label="سال">
          <SelectValue placeholder="سال" />
        </SelectTrigger>
        <SelectContent>
          {years.map((item) => (
            <SelectItem key={item} value={String(item)}>
              {toPersianDigits(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

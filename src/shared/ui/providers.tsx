"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import type * as React from "react";

/**
 * پرووایدرهای سراسری سمت کلاینت.
 *
 * DirectionProvider لازم است چون Radix جهت را از context می‌خواند، نه از DOM.
 * بدون آن جهت کلیدهای جهت‌دار صفحه‌کلید و محاسبه align منوها اشتباه می‌شود.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <DirectionProvider dir="rtl">{children}</DirectionProvider>;
}

"use client";

import type { ReactNode } from "react";

import { AppTabBar } from "@/shared/ui/app-tab-bar";

import { CustomerTabActions } from "./customer-tab-actions";

/** قاب کلاینت: هدر و تب ثابت؛ فقط میانه اسکرول می‌شود. */
export function CustomerFrame({
  signedIn,
  isStaffUser,
  cartCount,
  header,
  children,
}: {
  signedIn: boolean;
  isStaffUser: boolean;
  cartCount: number;
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      <AppTabBar
        signedIn={signedIn}
        endActions={
          <CustomerTabActions
            signedIn={signedIn}
            isStaffUser={isStaffUser}
            cartCount={cartCount}
          />
        }
      />
    </div>
  );
}

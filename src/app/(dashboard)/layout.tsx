import type { ReactNode } from "react";

import { countUnread } from "@/modules/notifications";
import { requireUser } from "@/server/auth/guards";

import { CustomerShell } from "../customer-shell";
import { DashboardSubnav } from "./dashboard-subnav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/dashboard");
  const unread = await countUnread(user.id);

  return (
    <CustomerShell>
      <div className="grid gap-6 px-4 py-6">
        <DashboardSubnav unread={unread} />
        {children}
      </div>
    </CustomerShell>
  );
}

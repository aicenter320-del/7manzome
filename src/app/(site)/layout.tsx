import type { ReactNode } from "react";

import { CustomerShell } from "../customer-shell";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>;
}

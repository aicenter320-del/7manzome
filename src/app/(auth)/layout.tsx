import type { ReactNode } from "react";

import { CustomerShell } from "../customer-shell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <CustomerShell>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="glass-strong w-full max-w-md rounded-3xl p-6">{children}</div>
      </div>
    </CustomerShell>
  );
}

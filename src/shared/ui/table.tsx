import type * as React from "react";

import { cn } from "@/shared/lib/cn";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl glass">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b [&_tr]:border-border", className)} {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot className={cn("border-t border-border bg-muted/50 font-medium", className)} {...props} />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-b border-border transition-colors hover:bg-muted/40", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-11 px-3 text-start align-middle text-xs font-medium whitespace-nowrap text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-3 py-3 align-middle", className)} {...props} />;
}

export function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption className={cn("mt-4 text-xs text-muted-foreground", className)} {...props} />;
}

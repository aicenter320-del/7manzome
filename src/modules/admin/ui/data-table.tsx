import type { ReactNode } from "react";

import { EmptyState } from "@/shared/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export { TableCell, TableRow };

export function DataTable({
  columns,
  children,
  isEmpty,
  emptyTitle = "موردی برای نمایش نیست.",
  emptyDescription,
  align = "start",
}: {
  columns: readonly string[];
  children: ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  align?: "start" | "center";
}) {
  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Table>
      <TableHeader className={align === "center" ? "text-center" : undefined}>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column} className={align === "center" ? "text-center" : undefined}>
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className={align === "center" ? "text-center" : undefined}>{children}</TableBody>
    </Table>
  );
}

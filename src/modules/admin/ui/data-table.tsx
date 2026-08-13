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
}: {
  columns: readonly string[];
  children: ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}

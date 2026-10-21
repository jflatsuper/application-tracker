import type React from "react";

export interface TableHeading {
  label: string;
  align?: "end";
}
export interface TableRowItem extends React.HTMLAttributes<HTMLTableCellElement> {
  label: React.ReactNode;
}

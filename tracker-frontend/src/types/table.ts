import type React from "react";

export interface TableHeading {
  label: string;
}
export interface TableRowItem extends React.HTMLAttributes<HTMLTableCellElement> {
  label: string | number;
}

import type { TableHeading, TableRowItem } from "@/types/table";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
type Props = {
  tableHeaders: TableHeading[];
  tableRowItems: TableRowItem[][];
};

const Table = ({ tableHeaders, tableRowItems }: Props) => {
  return (
    <table>
      <TableHeader tableHeaders={tableHeaders} />
      <TableBody tableRowItems={tableRowItems} />
    </table>
  );
};
export default Table;

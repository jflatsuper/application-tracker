import type { TableHeading, TableRowItem } from "@/types/table";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import "./style.scss";
type Props = {
  tableHeaders: TableHeading[];
  tableRowItems: TableRowItem[][];
  caption?: string;
};

const Table = ({ tableHeaders, tableRowItems, caption }: Props) => {
  return (
    <div className="table-wrap">
      <table className="table">
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <TableHeader tableHeaders={tableHeaders} />
        <TableBody tableHeaders={tableHeaders} tableRowItems={tableRowItems} />
      </table>
    </div>
  );
};
export default Table;

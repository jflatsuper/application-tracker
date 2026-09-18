import type { TableHeading } from "@/types/table";

type Props = {
  tableHeaders: TableHeading[];
};
const TableHeader = ({ tableHeaders }: Props) => {
  return (
    <thead>
      <tr>
        {tableHeaders.map(({ label }) => (
          <th key={label}>{label}</th>
        ))}
      </tr>
    </thead>
  );
};
export default TableHeader;

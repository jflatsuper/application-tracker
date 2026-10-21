import type { TableHeading } from "@/types/table";

type Props = {
  tableHeaders: TableHeading[];
};
const TableHeader = ({ tableHeaders }: Props) => {
  return (
    <thead>
      <tr>
        {tableHeaders.map(({ label, align }) => (
          <th
            key={label}
            scope="col"
            className={align === "end" ? "table__cell--end" : undefined}
          >
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
};
export default TableHeader;

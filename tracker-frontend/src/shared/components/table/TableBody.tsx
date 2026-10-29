import type { TableHeading, TableRowItem } from "@/types/table";

type Props = {
  tableHeaders: TableHeading[];
  tableRowItems: TableRowItem[][];
};
const TableBody = ({ tableHeaders, tableRowItems }: Props) => {
  return (
    <tbody>
      {tableRowItems.map((tableRow, i) => (
        <tr key={i}>
          {tableRow.map(({ label, ...cellProps }, j) => (
            <td key={j} data-label={tableHeaders[j]?.label} {...cellProps}>
              {label}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};
export default TableBody;

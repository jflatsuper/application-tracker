import type { TableRowItem } from "@/types/table";

type Props = {
  tableRowItems: TableRowItem[][];
};
const TableBody = ({ tableRowItems }: Props) => {
  return (
    <tbody>
      {tableRowItems.map((tableRow, i) => (
        <tr key={i}>
          {tableRow.map(({ label, ...cellProps }, j) => (
            <td key={j} {...cellProps}>
              {label}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};
export default TableBody;

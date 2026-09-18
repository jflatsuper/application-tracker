import type { TableRowItem } from "@/types/table";

type Props = {
  tableRowItems: TableRowItem[][];
};
const TableBody = ({ tableRowItems }: Props) => {
  return (
    <tbody>
      {tableRowItems.map((tableRow, i) => (
        <tr key={i}>
          {tableRow.map((item) => (
            <td key={item.label}>{item.label}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};
export default TableBody;

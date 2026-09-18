import { forwardRef } from "react";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  dropdownOptions: { label: string; value: any }[];
}
const Select = forwardRef<HTMLSelectElement, Props>(
  ({ dropdownOptions }, ref) => {
    return (
      <select ref={ref}>
        {dropdownOptions.map(({ value, label }) => (
          <option value={value} key={label}>
            {label}
          </option>
        ))}
      </select>
    );
  },
);
Select.displayName = "Select";
export default Select;

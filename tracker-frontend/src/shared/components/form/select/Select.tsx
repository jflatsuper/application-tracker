import { forwardRef, useId } from "react";
import Field from "../field";
import { describedBy } from "../field/describedBy";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  dropdownOptions: { label: string; value: string | number }[];
  label?: string;
  error?: string;
  help?: string;
}
const Select = forwardRef<HTMLSelectElement, Props>(
  ({ dropdownOptions, label, id, error, help, className, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <Field label={label} controlId={selectId} error={error} help={help}>
        <select
          {...props}
          id={selectId}
          ref={ref}
          className={["field__input", className].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, error, help)}
        >
          {dropdownOptions.map(({ value, label }) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
    );
  },
);
Select.displayName = "Select";
export default Select;

import { forwardRef, useId } from "react";
import FieldMessage from "./FieldMessage";
import "./style.scss";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  dropdownOptions: { label: string; value: string | number }[];
  label?: string;
  error?: string;
  help?: string;
}
const Select = forwardRef<HTMLSelectElement, Props>(
  (
    { dropdownOptions, label, id, error, help, className, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const describedBy = error
      ? `${selectId}-error`
      : help
        ? `${selectId}-help`
        : undefined;

    return (
      <div className="field">
        {label && (
          <label className="field__label" htmlFor={selectId}>
            {label}
          </label>
        )}
        <select
          {...props}
          id={selectId}
          ref={ref}
          className={["field__input", className].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        >
          {dropdownOptions.map(({ value, label }) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        <FieldMessage baseId={selectId} error={error} help={help} />
      </div>
    );
  },
);
Select.displayName = "Select";
export default Select;

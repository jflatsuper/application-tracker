import { forwardRef, useId } from "react";
import FieldMessage from "./FieldMessage";
import "./style.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, help, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = error
      ? `${inputId}-error`
      : help
        ? `${inputId}-help`
        : undefined;

    return (
      <div className="field">
        {label && (
          <label className="field__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          {...props}
          id={inputId}
          ref={ref}
          className={["field__input", className].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <FieldMessage baseId={inputId} error={error} help={help} />
      </div>
    );
  },
);
Input.displayName = "Input";
export default Input;

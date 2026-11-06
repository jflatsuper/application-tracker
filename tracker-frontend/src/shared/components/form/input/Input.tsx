import { forwardRef, useId } from "react";
import Field from "../field";
import { describedBy } from "../field/describedBy";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, help, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <Field label={label} controlId={inputId} error={error} help={help}>
        <input
          {...props}
          id={inputId}
          ref={ref}
          className={["field__input", className].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, help)}
        />
      </Field>
    );
  },
);
Input.displayName = "Input";
export default Input;

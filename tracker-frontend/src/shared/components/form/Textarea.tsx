import { forwardRef, useId } from "react";
import FieldMessage from "./FieldMessage";
import "./style.scss";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  help?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, id, error, help, className, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const describedBy = error
      ? `${textareaId}-error`
      : help
        ? `${textareaId}-help`
        : undefined;

    return (
      <div className="field">
        {label && (
          <label className="field__label" htmlFor={textareaId}>
            {label}
          </label>
        )}
        <textarea
          {...props}
          id={textareaId}
          ref={ref}
          rows={rows}
          className={["field__input", "field__textarea", className]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <FieldMessage baseId={textareaId} error={error} help={help} />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
export default Textarea;

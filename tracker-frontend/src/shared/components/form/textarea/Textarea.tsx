import { forwardRef, useId } from "react";
import Field from "../field";
import { describedBy } from "../field/describedBy";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  help?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, id, error, help, className, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <Field label={label} controlId={textareaId} error={error} help={help}>
        <textarea
          {...props}
          id={textareaId}
          ref={ref}
          rows={rows}
          className={["field__input", "field__textarea", className]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(textareaId, error, help)}
        />
      </Field>
    );
  },
);
Textarea.displayName = "Textarea";
export default Textarea;

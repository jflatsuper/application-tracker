import type { ReactNode } from "react";
import FieldMessage from "./FieldMessage";
import "./field.scss";

type Props = {
  label?: string;
  // The id of the control inside, so the label and messages point at it.
  controlId: string;
  error?: string;
  help?: string;
  children: ReactNode;
};

// The label, control and message that every form control shares.
const Field = ({ label, controlId, error, help, children }: Props) => (
  <div className="field">
    {label && (
      <label className="field__label" htmlFor={controlId}>
        {label}
      </label>
    )}
    {children}
    <FieldMessage baseId={controlId} error={error} help={help} />
  </div>
);

export default Field;

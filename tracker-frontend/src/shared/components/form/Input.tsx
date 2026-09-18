import { forwardRef, useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div>
        {label && <label htmlFor={inputId}>{label}</label>}
        <input {...props} ref={ref} />
        {error && <p>{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
export default Input;

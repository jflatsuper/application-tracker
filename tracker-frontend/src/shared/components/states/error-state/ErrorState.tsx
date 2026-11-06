import type { ReactNode } from "react";
import Alert from "../../alert";
import Button from "../../button";
import "./error-state.scss";

type Props = {
  children: ReactNode;
  onRetry: () => void;
};

// A failed load: what went wrong, and a way to try again.
const ErrorState = ({ children, onRetry }: Props) => (
  <div className="error-state">
    <Alert>{children}</Alert>
    <Button onClick={onRetry}>Try again</Button>
  </div>
);

export default ErrorState;

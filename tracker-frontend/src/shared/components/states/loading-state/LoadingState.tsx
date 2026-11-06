import type { ReactNode } from "react";
import "./loading-state.scss";

// Shown in place of content while it loads.
const LoadingState = ({ children }: { children: ReactNode }) => (
  <p className="loading-state" role="status">
    {children}
  </p>
);

export default LoadingState;

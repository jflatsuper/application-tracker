import type { ReactNode } from "react";
import Icon from "./Icon";
import "./alert.scss";

const Alert = ({ children }: { children: ReactNode }) => (
  <div role="alert" className="alert">
    <Icon name="alert-circle" />
    <span>{children}</span>
  </div>
);

export default Alert;

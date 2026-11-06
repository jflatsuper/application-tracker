import type { ReactNode } from "react";
import type { IconName } from "@/assets/icons";
import Icon from "../icon";
import "./banner.scss";

type Props = {
  tone?: "info" | "warning";
  icon: IconName;
  // Usually a small Button, such as <Button size="sm">.
  action?: ReactNode;
  children: ReactNode;
};

// A full-width strip across the top of the page: a message and one action.
const Banner = ({ tone = "info", icon, action, children }: Props) => (
  <div className={tone === "info" ? "banner" : `banner banner--${tone}`}>
    <Icon name={icon} size={18} />
    <span>{children}</span>
    {action}
  </div>
);

export default Banner;

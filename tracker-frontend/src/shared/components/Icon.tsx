import { icons, type IconName } from "@/assets/icons";
import "./icon.scss";

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

// The SVGs are our own files from assets/icons, inlined so they pick up
// the surrounding text colour through currentColor.
const Icon = ({ name, size = 16, className }: Props) => (
  <span
    className={className ? `icon ${className}` : "icon"}
    style={{ width: size, height: size }}
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: icons[name] }}
  />
);

export default Icon;

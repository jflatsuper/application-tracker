import type { ComponentProps } from "react";
import { Link } from "react-router";
import "./button.scss";

type Variant = "default" | "primary" | "ghost" | "danger";
type Size = "md" | "sm";

type Shared = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

type AsButton = Shared &
  Omit<ComponentProps<"button">, "className"> & {
    to?: undefined;
    href?: undefined;
  };
type AsLink = Shared &
  Omit<ComponentProps<typeof Link>, "className"> & { href?: undefined };
type AsAnchor = Shared &
  Omit<ComponentProps<"a">, "className"> & { href: string; to?: undefined };

type ButtonProps = AsButton | AsLink | AsAnchor;

// The one button of the app. Give it `to` for an in-app link, `href` for an
// ordinary link, or neither for a real button (which defaults to type="button"
// so it never submits a form by accident).
const Button = ({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonProps) => {
  const classes = [
    "btn",
    variant !== "default" && `btn--${variant}`,
    size === "sm" && "btn--sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.to !== undefined) {
    return <Link {...(props as AsLink)} className={classes} />;
  }
  if (props.href !== undefined) {
    return <a {...(props as AsAnchor)} className={classes} />;
  }
  const { type = "button", ...rest } = props as AsButton;
  return <button {...rest} type={type} className={classes} />;
};

export default Button;

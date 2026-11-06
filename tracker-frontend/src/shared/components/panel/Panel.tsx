import type { ComponentProps } from "react";
import "./panel.scss";

type PanelProps = Omit<ComponentProps<"form">, "className"> & {
  // The element to draw: a <form> panel submits, the others just group.
  as?: "section" | "div" | "form";
  // "danger" for destructive actions, "dev" for developer-only tools.
  tone?: "danger" | "dev";
  className?: string;
};

// A bordered card for one group of content: a title, some text and actions.
const Panel = ({ as = "section", tone, className, ...props }: PanelProps) => {
  // The three elements share every prop a panel is given.
  const Tag = as as "form";
  const classes = ["panel", tone && `panel--${tone}`, className]
    .filter(Boolean)
    .join(" ");
  return <Tag {...props} className={classes} />;
};

export const PanelTitle = ({
  className,
  ...props
}: Omit<ComponentProps<"h2">, "className"> & { className?: string }) => (
  <h2
    {...props}
    className={["panel__title", className].filter(Boolean).join(" ")}
  />
);

export const PanelText = ({
  className,
  ...props
}: Omit<ComponentProps<"p">, "className"> & { className?: string }) => (
  <p
    {...props}
    className={["panel__text", className].filter(Boolean).join(" ")}
  />
);

// The row of buttons at the bottom of a panel.
export const PanelActions = ({
  className,
  ...props
}: Omit<ComponentProps<"div">, "className"> & { className?: string }) => (
  <div
    {...props}
    className={["panel__actions", className].filter(Boolean).join(" ")}
  />
);

export default Panel;

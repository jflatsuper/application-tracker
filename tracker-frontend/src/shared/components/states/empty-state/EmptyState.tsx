import type { ReactNode } from "react";
import "./empty-state.scss";

type Props = {
  title: ReactNode;
  text: ReactNode;
  // "h1" when this is the whole page, "h2" (the default) inside one.
  heading?: "h1" | "h2";
  // What to do next, usually a Button.
  children?: ReactNode;
};

// Nothing to show here: says why, and offers a way forward.
const EmptyState = ({
  title,
  text,
  heading: Heading = "h2",
  children,
}: Props) => (
  <div className="empty-state">
    <Heading>{title}</Heading>
    <p>{text}</p>
    {children}
  </div>
);

export default EmptyState;

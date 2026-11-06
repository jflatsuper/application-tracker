import type { ReactNode } from "react";
import type { IconName } from "@/assets/icons";
import Icon from "@/shared/components/icon";
import "./error-page.scss";

type Props = {
  icon: IconName;
  // A short code above the heading, such as "404".
  code?: string;
  title: string;
  children: ReactNode;
  // Smaller print under the text: the address, or the error message.
  detail?: ReactNode;
  actions: ReactNode;
};

// The page shown when something is missing or broken.
const ErrorPage = ({ icon, code, title, children, detail, actions }: Props) => (
  <section className="error-page" aria-labelledby="error-title">
    <div className="error-page__icon" aria-hidden="true">
      <Icon name={icon} size={24} />
    </div>
    {code && <p className="error-page__code">{code}</p>}
    <h1 id="error-title">{title}</h1>
    <p className="error-page__text">{children}</p>
    {detail && <p className="error-page__detail">{detail}</p>}
    <div className="error-page__actions">{actions}</div>
  </section>
);

export default ErrorPage;

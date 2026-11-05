import type { ReactNode } from "react";
import "../style.scss";

type Props = {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
};

const LegalDocument = ({ title, updated, intro, children }: Props) => (
  <>
    <title>{title}</title>
    <article className="legal">
      <header className="legal__head">
        <h1>{title}</h1>
        <p className="legal__updated">Last updated {updated}</p>
        {intro && <p className="legal__intro">{intro}</p>}
      </header>
      {children}
    </article>
  </>
);

export default LegalDocument;

import type { ReactNode } from "react";
import PageMeta from "@/shared/components/page-meta";
import "../style.scss";

type Props = {
  title: string;
  path: "/privacy" | "/terms";
  updated: string;
  intro?: string;
  children: ReactNode;
};

const LegalDocument = ({ title, path, updated, intro, children }: Props) => (
  <>
    <PageMeta path={path} />
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

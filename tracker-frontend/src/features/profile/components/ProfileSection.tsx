import type { ReactNode } from "react";
import "../style.scss";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

const ProfileSection = ({ title, description, children }: Props) => (
  <>
    <title>{`${title} · Account`}</title>
    <section className="profile-section">
      <header className="profile-section__head">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  </>
);

export default ProfileSection;

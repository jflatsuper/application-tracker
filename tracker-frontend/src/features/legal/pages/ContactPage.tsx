import { Link } from "react-router";
import { SUPPORT_EMAIL } from "@/constants/site";
import PageMeta from "@/shared/components/page-meta";
import "../style.scss";

import Button from "@/shared/components/button";
const QUESTIONS = [
  {
    q: "I can't sign in.",
    a: "Check the email and password, or try the Google or LinkedIn button if that's how you signed up. If you started as a guest and signed out, that account can't be recovered.",
  },
  {
    q: "A notification didn't show up.",
    a: "Browser notifications are off by default. Turn them on in Settings, and make sure your browser or system isn't blocking them for this site.",
  },
  {
    q: "How do I cancel my plan?",
    a: "Open Billing and choose Cancel. You keep your plan until the end of the period you've paid for, and you can resume any time before then.",
  },
];

const ContactPage = () => (
  <>
    <PageMeta path="/contact" />
    <section className="legal">
      <header className="legal__head">
        <h1>Contact</h1>
        <p className="legal__intro">
          Questions, problems or something that doesn't look right? We'd like to
          hear about it.
        </p>
      </header>

      {SUPPORT_EMAIL && (
        <p className="legal__contact">
          <Button variant="primary" href={`mailto:${SUPPORT_EMAIL}`}>
            Email {SUPPORT_EMAIL}
          </Button>
        </p>
      )}

      <section>
        <h2>Quick answers</h2>
        <dl className="legal__faq">
          {QUESTIONS.map(({ q, a }) => (
            <div key={q}>
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="legal__updated">
        See also the <Link to="/privacy">privacy policy</Link> and{" "}
        <Link to="/terms">terms of service</Link>.
      </p>
    </section>
  </>
);

export default ContactPage;

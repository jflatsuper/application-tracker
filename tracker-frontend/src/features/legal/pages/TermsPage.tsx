import { Link } from "react-router";
import { SUPPORT_EMAIL } from "@/constants/site";
import LegalDocument from "../components/LegalDocument";

const TermsPage = () => (
  <LegalDocument
    title="Terms of service"
    path="/terms"
    updated="5 November 2026"
    intro="These terms apply when you use Refresha. By creating an account or continuing as a guest, you agree to them."
  >
    <section>
      <h2>Using Refresha</h2>
      <p>
        Refresha helps you keep track of job applications. You can use it as a
        guest or with an account. You're responsible for what you put in it and
        for keeping your sign-in details safe. Please don't use Refresha to
        break the law, to attack or overload the service, or to access someone
        else's account.
      </p>
    </section>

    <section>
      <h2>Your content</h2>
      <p>
        The applications, notes and other details you add belong to you. You
        give us permission to store and process them only so we can run the
        service for you. See our <Link to="/privacy">privacy policy</Link> for
        how.
      </p>
    </section>

    <section>
      <h2>Guest accounts</h2>
      <p>
        A guest account has no email, so we can't help you recover it. Create an
        account to keep your applications safe and to use paid features.
      </p>
    </section>

    <section>
      <h2>Plans and payments</h2>
      <p>
        Some features need a paid plan. Prices are shown at checkout and
        payments are taken by our payment provider. Plans renew each billing
        period until you cancel. You can cancel from{" "}
        <Link to="/profile/billing">Billing</Link>, and you keep your plan until
        the end of the period you've paid for.
      </p>
    </section>

    <section>
      <h2>AI-read postings</h2>
      <p>
        Details read from a job posting, by link or by AI, may be incomplete or
        wrong. Check them before you rely on them.
      </p>
    </section>

    <section>
      <h2>Availability</h2>
      <p>
        We work to keep Refresha running, but we can't promise it will always be
        available or error-free. We may change or remove features, and we'll
        give notice where we reasonably can.
      </p>
    </section>

    <section>
      <h2>Ending your account</h2>
      <p>
        You can stop using Refresha at any time. We may suspend or close
        accounts that break these terms.
      </p>
    </section>

    <section>
      <h2>Liability</h2>
      <p>
        Refresha is provided "as is". To the extent the law allows, we aren't
        liable for lost opportunities, lost data or other indirect losses
        arising from your use of it.
      </p>
    </section>

    <section>
      <h2>Changes and contact</h2>
      <p>
        We may update these terms; the date above shows the latest version, and
        continuing to use Refresha means you accept the update.
        {SUPPORT_EMAIL ? (
          <>
            {" "}
            Questions? Write to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </>
        ) : null}
      </p>
    </section>
  </LegalDocument>
);

export default TermsPage;

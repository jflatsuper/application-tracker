import { Link } from "react-router";
import { SUPPORT_EMAIL } from "@/constants/site";
import LegalDocument from "../components/LegalDocument";

const PrivacyPage = () => (
  <LegalDocument
    title="Privacy policy"
    path="/privacy"
    updated="5 November 2026"
    intro="Refresha keeps track of the jobs you apply for. This page explains what we store about you, why, and the choices you have."
  >
    <section>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details.</strong> Your email address and, if you give
          one, your name. If you sign in with Google or LinkedIn, we receive the
          email and name that account shares with us. Guest accounts have
          neither.
        </li>
        <li>
          <strong>Your applications.</strong> Everything you add: companies,
          roles, locations, statuses, dates, notes and the history of status
          changes and follow-ups.
        </li>
        <li>
          <strong>Your settings.</strong> Follow-up interval, digest preference
          and time zone.
        </li>
        <li>
          <strong>Notifications.</strong> The notices we send you and whether
          you've read them. If you turn on browser notifications, we also store
          the address your browser gives us for sending them.
        </li>
        <li>
          <strong>Billing status.</strong> Your plan and when it renews.
          Payments are handled by our payment provider; we never see or store
          your card number.
        </li>
      </ul>
    </section>

    <section>
      <h2>Reading job postings</h2>
      <p>
        When you add an application from a link, we fetch that page to read the
        job details. When you paste a posting and use Refresha's AI, the text
        you paste is sent to an AI provider to be read, and the result is
        returned to you.
      </p>
      <p>
        If you use your own Anthropic key instead, the posting goes straight
        from your browser to Anthropic. The key is kept only in your browser
        (for this tab, or on this device if you choose to remember it) and is
        never sent to us.
      </p>
    </section>

    <section>
      <h2>Cookies and browser storage</h2>
      <p>
        We use a sign-in cookie to keep you signed in, and a few small items in
        your browser's storage to remember that you have a session, whether the
        account sidebar is collapsed, and your own AI key if you saved one. We
        don't use advertising or analytics cookies.
      </p>
    </section>

    <section>
      <h2>Who we share it with</h2>
      <p>
        We don't sell your data. We use service providers to run Refresha:
        hosting, payments, sending notifications and reading job postings with
        AI. They only receive what they need to do that job.
      </p>
    </section>

    <section>
      <h2>How long we keep it</h2>
      <p>
        We keep your data while your account exists. Dismissed notifications and
        applications you delete are removed from your account.
      </p>
    </section>

    <section>
      <h2>Your choices</h2>
      <ul>
        <li>
          Edit your name, settings and applications at any time from{" "}
          <Link to="/profile">your account</Link>.
        </li>
        <li>
          Turn browser notifications off in{" "}
          <Link to="/profile/settings">Settings</Link>, or in your browser.
        </li>
        <li>
          Download your data or delete your account from{" "}
          <Link to="/profile">your account</Link>
          {SUPPORT_EMAIL ? (
            <>
              , or ask us to by writing to{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </>
          ) : null}
          .
        </li>
      </ul>
    </section>

    <section>
      <h2>Children</h2>
      <p>Refresha isn't meant for anyone under 16.</p>
    </section>

    <section>
      <h2>Changes</h2>
      <p>
        If we change this policy in a way that matters, we'll update the date
        above and tell you in the app.
      </p>
    </section>
  </LegalDocument>
);

export default PrivacyPage;

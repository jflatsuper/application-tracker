import { Link } from "react-router";
import { COOKIE_CATEGORIES } from "@/constants/cookies";
import { SUPPORT_EMAIL } from "@/constants/site";
import { openCookieSettings } from "@/shared/libs/consent";

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer__inner">
      <span>© {new Date().getFullYear()} Refresha</span>
      <nav aria-label="Legal and help">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        {COOKIE_CATEGORIES.length > 0 && (
          <button type="button" onClick={openCookieSettings}>
            Cookie settings
          </button>
        )}
        {SUPPORT_EMAIL && <Link to="/contact">Contact</Link>}
      </nav>
    </div>
  </footer>
);

export default Footer;

import { Link } from "react-router";
import { SUPPORT_EMAIL } from "@/constants/site";

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer__inner">
      <span>© {new Date().getFullYear()} Refresha</span>
      <nav aria-label="Legal and help">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        {SUPPORT_EMAIL && <Link to="/contact">Contact</Link>}
      </nav>
    </div>
  </footer>
);

export default Footer;

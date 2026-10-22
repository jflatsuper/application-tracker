import { Link, useLocation } from "react-router";
import Icon from "@/shared/components/Icon";
import "./style.scss";

const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <>
      <title>Page not found</title>
      <meta name="robots" content="noindex" />
      <section className="error-page" aria-labelledby="error-title">
        <div className="error-page__icon" aria-hidden="true">
          <Icon name="compass" size={24} />
        </div>
        <p className="error-page__code">404</p>
        <h1 id="error-title">We can't find that page</h1>
        <p className="error-page__text">
          The link may be broken, or the page may have moved. Check the
          address, or head back to your applications.
        </p>
        <p className="error-page__detail">
          No page at <code>{pathname}</code>
        </p>
        <div className="error-page__actions">
          <Link to="/applications" className="btn btn--primary">
            Go to applications
          </Link>
          <Link to="/" className="btn btn--ghost">
            Go home
          </Link>
        </div>
      </section>
    </>
  );
};

export default NotFound;

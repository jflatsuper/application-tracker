import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import Icon from "@/shared/components/Icon";
import NotFound from "./NotFound";
import "./style.scss";

const RouteError = ({ standalone = false }: { standalone?: boolean }) => {
  const error = useRouteError();

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : null;

  const content =
    isRouteErrorResponse(error) && error.status === 404 ? (
      <NotFound />
    ) : (
      <>
        <title>Something went wrong</title>
        <section className="error-page" aria-labelledby="error-title">
          <div className="error-page__icon" aria-hidden="true">
            <Icon name="alert-triangle" size={24} />
          </div>
          <h1 id="error-title">Something went wrong</h1>
          <p className="error-page__text">
            This page hit an error. Reload to try again, or head back to your
            applications.
          </p>
          {import.meta.env.DEV && detail && (
            <p className="error-page__detail">
              <code>{detail}</code>
            </p>
          )}
          <div className="error-page__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
            <Link to="/applications" className="btn btn--ghost">
              Go to applications
            </Link>
          </div>
        </section>
      </>
    );

  return standalone ? (
    <main className="error-page-shell">{content}</main>
  ) : (
    content
  );
};

export default RouteError;

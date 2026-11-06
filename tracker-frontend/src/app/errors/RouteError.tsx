import { isRouteErrorResponse, useRouteError } from "react-router";
import Button from "@/shared/components/button";
import ErrorPage from "../../shared/components/error-page";
import NotFound from "./NotFound";

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
        <ErrorPage
          icon="alert-triangle"
          title="Something went wrong"
          detail={
            import.meta.env.DEV && detail ? <code>{detail}</code> : undefined
          }
          actions={
            <>
              <Button
                type="button"
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Reload page
              </Button>
              <Button to="/applications" variant="ghost">
                Go to applications
              </Button>
            </>
          }
        >
          This page hit an error. Reload to try again, or head back to your
          applications.
        </ErrorPage>
      </>
    );

  return standalone ? (
    <main className="error-page-shell">{content}</main>
  ) : (
    content
  );
};

export default RouteError;

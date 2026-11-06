import { useLocation } from "react-router";
import Button from "@/shared/components/button";
import ErrorPage from "../../shared/components/error-page";

const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <>
      <title>Page not found</title>
      <meta name="robots" content="noindex" />
      <ErrorPage
        icon="compass"
        code="404"
        title="We can't find that page"
        detail={
          <>
            No page at <code>{pathname}</code>
          </>
        }
        actions={
          <>
            <Button to="/applications" variant="primary">
              Go to applications
            </Button>
            <Button to="/" variant="ghost">
              Go home
            </Button>
          </>
        }
      >
        The link may be broken, or the page may have moved. Check the address,
        or head back to your applications.
      </ErrorPage>
    </>
  );
};

export default NotFound;

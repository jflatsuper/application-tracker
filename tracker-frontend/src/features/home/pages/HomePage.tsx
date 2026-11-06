import PageMeta from "@/shared/components/page-meta";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Dashboard from "../components/Dashboard";
import Landing from "../components/Landing";

const HomePage = () => {
  const { status } = useAuth();

  return (
    <>
      {status === "authenticated" ? (
        <>
          <title>Home</title>
          <Dashboard />
        </>
      ) : (
        <>
          <PageMeta path="/" />
          <Landing />
        </>
      )}
    </>
  );
};

export default HomePage;

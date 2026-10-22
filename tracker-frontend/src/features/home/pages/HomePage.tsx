import { useAuth } from "@/features/auth/hooks/useAuth";
import Dashboard from "../components/Dashboard";
import Landing from "../components/Landing";

const HomePage = () => {
  const { status } = useAuth();

  return (
    <>
      <title>Home</title>
      {status === "authenticated" ? <Dashboard /> : <Landing />}
    </>
  );
};

export default HomePage;

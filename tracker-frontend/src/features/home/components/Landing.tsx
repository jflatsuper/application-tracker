import { useState } from "react";

import Alert from "@/shared/components/alert";
import { useAuth } from "@/features/auth/hooks/useAuth";
import "../style.scss";

import Button from "@/shared/components/button";
const FEATURES = [
  {
    title: "Nine clear statuses",
    text: "From saved to accepted, plus rejected, withdrawn and ghosted for when things go quiet.",
  },
  {
    title: "A history for every role",
    text: "Each status change and follow-up is recorded, so you can see how an application has moved.",
  },
  {
    title: "Follow-ups that don't slip",
    text: "Set when to chase next and see what's coming up as soon as you sign in.",
  },
];

const Landing = () => {
  const { continueAsGuest } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const onGuest = async () => {
    setError(null);
    try {
      await continueAsGuest();
    } catch {
      setError(
        "Couldn't start a guest session. Check your connection and try again.",
      );
    }
  };

  return (
    <section className="landing">
      <div className="landing__hero">
        <h1>Keep every application in view</h1>
        <p>
          Track roles from saved to offer, see where each one stands, and never
          lose a follow-up.
        </p>
        {error && <Alert>{error}</Alert>}
        <div className="landing__actions">
          <Button to="/register" variant="primary">
            Create account
          </Button>
          <Button to="/login">Sign in</Button>
          <Button type="button" variant="ghost" onClick={onGuest}>
            Continue as guest
          </Button>
        </div>
      </div>

      <ul className="landing__features">
        {FEATURES.map(({ title, text }) => (
          <li key={title} className="landing__feature">
            <h2>{title}</h2>
            <p>{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Landing;

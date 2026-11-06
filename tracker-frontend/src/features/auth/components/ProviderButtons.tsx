import { useAuth } from "@/features/auth/hooks/useAuth";
import type { OAuthProvider } from "@/features/auth/types";
import { rememberReturnTo } from "../returnTo";

import Button from "@/shared/components/button";
const PROVIDERS: { id: OAuthProvider; label: string; mark: string }[] = [
  { id: "google", label: "Google", mark: "G" },
  { id: "linkedin", label: "LinkedIn", mark: "in" },
];

type Props = {
  verb: string;
  // The page to come back to after signing in (if they were sent here from one).
  returnTo?: string;
};

const ProviderButtons = ({ verb, returnTo }: Props) => {
  const { loginWithProvider } = useAuth();

  return (
    <div className="auth-providers">
      {PROVIDERS.map(({ id, label, mark }) => (
        <Button
          key={id}
          type="button"
          onClick={() => {
            rememberReturnTo(returnTo);
            loginWithProvider(id);
          }}
        >
          <span className="auth-provider-mark" aria-hidden="true">
            {mark}
          </span>
          {verb} {label}
        </Button>
      ))}
    </div>
  );
};

export default ProviderButtons;

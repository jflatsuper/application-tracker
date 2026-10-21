import { useAuth } from "@/features/auth/hooks/useAuth";
import type { OAuthProvider } from "@/features/auth/types";

const PROVIDERS: { id: OAuthProvider; label: string; mark: string }[] = [
  { id: "google", label: "Google", mark: "G" },
  { id: "linkedin", label: "LinkedIn", mark: "in" },
];

const ProviderButtons = ({ verb }: { verb: string }) => {
  const { loginWithProvider } = useAuth();

  return (
    <div className="auth-providers">
      {PROVIDERS.map(({ id, label, mark }) => (
        <button
          key={id}
          type="button"
          className="btn"
          onClick={() => loginWithProvider(id)}
        >
          <span className="auth-provider-mark" aria-hidden="true">
            {mark}
          </span>
          {verb} {label}
        </button>
      ))}
    </div>
  );
};

export default ProviderButtons;

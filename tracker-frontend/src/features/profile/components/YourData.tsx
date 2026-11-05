import { useState } from "react";
import { ApiError } from "@/shared/libs/apiClient";
import { UNAVAILABLE_MESSAGE, isUnavailable } from "@/shared/libs/apiAvailability";
import { retryHint } from "@/shared/libs/retryAfter";
import Alert from "@/shared/components/Alert";
import Input from "@/shared/components/form/Input";
import { useDeleteAccount, useExportData } from "../hooks/useAccountData";

const CONFIRM_WORD = "DELETE";

function failureMessage(error: unknown, fallback: string) {
  if (isUnavailable(error)) return UNAVAILABLE_MESSAGE;
  if (error instanceof ApiError && error.status === 429) {
    return `Too many attempts. ${retryHint(error.retryAfter, "Wait a moment and try again.")}`;
  }
  return fallback;
}

// Download everything we hold about you, or delete the account for good.
const YourData = () => {
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  const stopConfirming = () => {
    setConfirming(false);
    setTyped("");
    deleteAccount.reset();
  };

  return (
    <>
      <section className="panel">
        <h2 className="panel__title">Export your data</h2>
        <p className="panel__text">
          Download your profile, settings, applications and their history as a
          JSON file.
        </p>
        {exportData.isError && (
          <Alert>
            {failureMessage(
              exportData.error,
              "Couldn't export your data. Try again in a moment.",
            )}
          </Alert>
        )}
        <div className="panel__actions">
          <button
            type="button"
            className="btn"
            disabled={exportData.isPending}
            onClick={() => exportData.mutate()}
          >
            {exportData.isPending ? "Preparing…" : "Download my data"}
          </button>
        </div>
      </section>

      <section className="panel panel--danger">
        <h2 className="panel__title">Delete account</h2>
        <p className="panel__text">
          This permanently removes your account, applications and settings. It
          can't be undone. If you have a paid plan, cancel it first from
          Billing, and download your data above if you want a copy.
        </p>

        {deleteAccount.isError && (
          <Alert>
            {failureMessage(
              deleteAccount.error,
              "Couldn't delete your account. Try again in a moment.",
            )}
          </Alert>
        )}

        {confirming ? (
          <form
            className="your-data__confirm"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (typed === CONFIRM_WORD && !deleteAccount.isPending) {
                deleteAccount.mutate();
              }
            }}
          >
            <Input
              label={`Type ${CONFIRM_WORD} to confirm`}
              autoComplete="off"
              autoCapitalize="characters"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
            />
            <div className="panel__actions">
              <button
                type="submit"
                className="btn btn--danger"
                disabled={typed !== CONFIRM_WORD || deleteAccount.isPending}
              >
                {deleteAccount.isPending ? "Deleting…" : "Delete my account"}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={stopConfirming}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="panel__actions">
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => setConfirming(true)}
            >
              Delete account…
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default YourData;

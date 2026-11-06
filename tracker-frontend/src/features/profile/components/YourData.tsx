import { useState } from "react";
import { ApiError } from "@/shared/libs/apiClient";
import {
  UNAVAILABLE_MESSAGE,
  isUnavailable,
} from "@/shared/libs/apiAvailability";
import { retryHint } from "@/shared/libs/retryAfter";
import Alert from "@/shared/components/alert";
import Input from "@/shared/components/form/input";
import { useDeleteAccount, useExportData } from "../hooks/useAccountData";

import Button from "@/shared/components/button";
import Panel from "@/shared/components/panel";
import {
  PanelTitle,
  PanelText,
  PanelActions,
} from "@/shared/components/panel/Panel";
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
      <Panel>
        <PanelTitle>Export your data</PanelTitle>
        <PanelText>
          Download your profile, settings, applications and their history as a
          JSON file.
        </PanelText>
        {exportData.isError && (
          <Alert>
            {failureMessage(
              exportData.error,
              "Couldn't export your data. Try again in a moment.",
            )}
          </Alert>
        )}
        <PanelActions>
          <Button
            type="button"
            disabled={exportData.isPending}
            onClick={() => exportData.mutate()}
          >
            {exportData.isPending ? "Preparing…" : "Download my data"}
          </Button>
        </PanelActions>
      </Panel>

      <Panel tone="danger">
        <PanelTitle>Delete account</PanelTitle>
        <PanelText>
          This permanently removes your account, applications and settings. It
          can't be undone. If you have a paid plan, cancel it first from
          Billing, and download your data above if you want a copy.
        </PanelText>

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
            <PanelActions>
              <Button
                type="submit"
                variant="danger"
                disabled={typed !== CONFIRM_WORD || deleteAccount.isPending}
              >
                {deleteAccount.isPending ? "Deleting…" : "Delete my account"}
              </Button>
              <Button type="button" variant="ghost" onClick={stopConfirming}>
                Cancel
              </Button>
            </PanelActions>
          </form>
        ) : (
          <PanelActions>
            <Button
              type="button"
              variant="danger"
              onClick={() => setConfirming(true)}
            >
              Delete account…
            </Button>
          </PanelActions>
        )}
      </Panel>
    </>
  );
};

export default YourData;

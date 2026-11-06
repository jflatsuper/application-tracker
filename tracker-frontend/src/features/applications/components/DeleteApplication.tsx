import { useState } from "react";
import { useNavigate } from "react-router";
import Alert from "@/shared/components/alert";
import { useDeleteApplication } from "../hooks/useApplicationMutations";

import Button from "@/shared/components/button";
import Panel from "@/shared/components/panel";
import {
  PanelTitle,
  PanelText,
  PanelActions,
} from "@/shared/components/panel/Panel";
type Props = { id: string; name: string };

const DeleteApplication = ({ id, name }: Props) => {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const remove = useDeleteApplication();

  if (!confirming) {
    return (
      <Panel as="div" tone="danger">
        <PanelTitle>Delete application</PanelTitle>
        <PanelText>
          Removes {name} and its history. This can't be undone.
        </PanelText>
        <Button
          type="button"
          variant="danger"
          onClick={() => setConfirming(true)}
        >
          Delete application
        </Button>
      </Panel>
    );
  }

  return (
    <Panel
      as="div"
      tone="danger"
      role="alertdialog"
      aria-label="Confirm delete"
    >
      <PanelTitle>Delete {name}?</PanelTitle>
      <PanelText>The application and its history will be gone.</PanelText>
      {remove.isError && (
        <Alert>Couldn't delete it. Check your connection and try again.</Alert>
      )}
      <PanelActions>
        <Button
          type="button"
          variant="danger"
          aria-busy={remove.isPending}
          onClick={() =>
            remove.mutate(id, {
              onSuccess: () => navigate("/applications", { replace: true }),
            })
          }
        >
          {remove.isPending ? "Deleting…" : "Yes, delete it"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfirming(false)}
        >
          Keep it
        </Button>
      </PanelActions>
    </Panel>
  );
};

export default DeleteApplication;

import { useState } from "react";
import { useNavigate } from "react-router";
import Alert from "@/shared/components/Alert";
import { useDeleteApplication } from "../hooks/useApplicationMutations";

type Props = { id: string; name: string };

const DeleteApplication = ({ id, name }: Props) => {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const remove = useDeleteApplication();

  if (!confirming) {
    return (
      <div className="panel panel--danger">
        <h2 className="panel__title">Delete application</h2>
        <p className="panel__text">
          Removes {name} and its history. This can't be undone.
        </p>
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => setConfirming(true)}
        >
          Delete application
        </button>
      </div>
    );
  }

  return (
    <div className="panel panel--danger" role="alertdialog" aria-label="Confirm delete">
      <h2 className="panel__title">Delete {name}?</h2>
      <p className="panel__text">The application and its history will be gone.</p>
      {remove.isError && (
        <Alert>Couldn't delete it. Check your connection and try again.</Alert>
      )}
      <div className="panel__actions">
        <button
          type="button"
          className="btn btn--danger"
          aria-busy={remove.isPending}
          onClick={() =>
            remove.mutate(id, {
              onSuccess: () => navigate("/applications", { replace: true }),
            })
          }
        >
          {remove.isPending ? "Deleting…" : "Yes, delete it"}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setConfirming(false)}
        >
          Keep it
        </button>
      </div>
    </div>
  );
};

export default DeleteApplication;

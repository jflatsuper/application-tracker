import { useState } from "react";
import Alert from "@/shared/components/Alert";
import Select from "@/shared/components/form/Select";
import Textarea from "@/shared/components/form/Textarea";
import { formatDate } from "@/shared/libs/format";
import type { CancelReason, EntitlementsRead } from "@/features/billing/types";
import { CANCEL_REASONS, subscriptionAction } from "../entitlements";
import { useCancelSubscription, useResumeSubscription } from "../hooks/useBilling";
import "../style.scss";

const COMMENT_MAX = 500;

const reasonOptions = [
  { value: "", label: "Choose a reason" },
  ...CANCEL_REASONS,
];

const CancelSubscription = ({ billing }: { billing: EntitlementsRead }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();

  const action = subscriptionAction(billing);
  if (!action) return null;

  const until = formatDate(billing.current_period_end);

  if (action === "resume") {
    return (
      <div className="upgrade">
        {resume.isError && (
          <Alert>Couldn't resume your plan. Try again in a moment.</Alert>
        )}
        <button
          type="button"
          className="btn"
          aria-busy={resume.isPending}
          onClick={() => resume.mutate()}
        >
          {resume.isPending ? "Resuming…" : "Resume subscription"}
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn--danger billing-action"
        onClick={() => setOpen(true)}
      >
        Cancel subscription
      </button>
    );
  }

  return (
    <form
      className="cancel-form"
      onSubmit={(event) => {
        event.preventDefault();
        cancel.mutate(
          {
            reason: (reason || null) as CancelReason | null,
            comment: comment.trim() || null,
          },
          { onSuccess: () => setOpen(false) },
        );
      }}
    >
      <h3 className="billing__subtitle">
        Cancel {billing.plan_name}?
      </h3>
      <p className="panel__text">
        {until
          ? `You'll keep ${billing.plan_name} until ${until}, then move to the free plan. You can resume any time before then.`
          : `You'll keep ${billing.plan_name} until the end of the current period. You can resume any time before then.`}
      </p>
      {cancel.isError && (
        <Alert>Couldn't cancel. Try again in a moment.</Alert>
      )}
      <Select
        label="Why are you leaving? (optional)"
        dropdownOptions={reasonOptions}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <Textarea
        label="Anything else? (optional)"
        rows={3}
        maxLength={COMMENT_MAX}
        help={`${comment.length} of ${COMMENT_MAX} characters`}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <div className="cancel-form__actions">
        <button
          type="submit"
          className="btn btn--danger"
          aria-busy={cancel.isPending}
        >
          {cancel.isPending ? "Canceling…" : "Cancel subscription"}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setOpen(false)}
        >
          Keep my plan
        </button>
      </div>
    </form>
  );
};

export default CancelSubscription;

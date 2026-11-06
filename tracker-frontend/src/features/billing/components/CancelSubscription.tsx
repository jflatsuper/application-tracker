import { useState } from "react";
import Alert from "@/shared/components/alert";
import Select from "@/shared/components/form/select";
import Textarea from "@/shared/components/form/textarea";
import { formatDate } from "@/shared/libs/format";
import type { CancelReason, EntitlementsRead } from "@/features/billing/types";
import { CANCEL_REASONS, subscriptionAction } from "../entitlements";
import {
  useCancelSubscription,
  useResumeSubscription,
} from "../hooks/useBilling";
import "../style.scss";

import Button from "@/shared/components/button";
import { PanelText } from "@/shared/components/panel/Panel";
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
        <Button
          type="button"
          aria-busy={resume.isPending}
          onClick={() => resume.mutate()}
        >
          {resume.isPending ? "Resuming…" : "Resume subscription"}
        </Button>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="danger"
        className="billing-action"
        onClick={() => setOpen(true)}
      >
        Cancel subscription
      </Button>
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
      <h3 className="billing__subtitle">Cancel {billing.plan_name}?</h3>
      <PanelText>
        {until
          ? `You'll keep ${billing.plan_name} until ${until}, then move to the free plan. You can resume any time before then.`
          : `You'll keep ${billing.plan_name} until the end of the current period. You can resume any time before then.`}
      </PanelText>
      {cancel.isError && <Alert>Couldn't cancel. Try again in a moment.</Alert>}
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
        <Button type="submit" variant="danger" aria-busy={cancel.isPending}>
          {cancel.isPending ? "Canceling…" : "Cancel subscription"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Keep my plan
        </Button>
      </div>
    </form>
  );
};

export default CancelSubscription;

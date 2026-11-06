import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";
import Textarea from "@/shared/components/form/textarea";
import type { ApplicationStatus } from "../ApplicationSchema";
import {
  applicationEventSchema,
  todayLocal,
  type EventValues,
} from "../applicationFormValues";
import { STATUS_LABELS, STATUS_ORDER } from "../applicationStatus";

import Button from "@/shared/components/button";
type Props = {
  kind: "status" | "follow_up";
  currentStatus?: ApplicationStatus;
  isSaving: boolean;
  onSubmit: (values: EventValues, done: () => void) => void;
};

const ApplicationEventForm = ({
  kind,
  currentStatus,
  isSaving,
  onSubmit,
}: Props) => {
  const choices =
    kind === "status"
      ? STATUS_ORDER.filter((status) => status !== currentStatus).map(
          (status) => ({ value: status, label: STATUS_LABELS[status] }),
        )
      : [];
  const blank: EventValues = {
    to_status: choices[0]?.value ?? "",
    occurred_at: "",
    contact: "",
    note: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventValues>({
    resolver: zodResolver(applicationEventSchema),
    defaultValues: blank,
  });

  return (
    <form
      className="event-form"
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values, () => reset(blank)))}
    >
      {kind === "status" && (
        <Select
          label="Move to"
          dropdownOptions={choices}
          {...register("to_status")}
        />
      )}
      <Input
        label="Date"
        type="date"
        max={todayLocal()}
        help="Leave blank for today."
        error={errors.occurred_at?.message}
        {...register("occurred_at")}
      />
      <Input
        label="Contact (optional)"
        error={errors.contact?.message}
        {...register("contact")}
      />
      <Textarea
        label="Note (optional)"
        rows={3}
        error={errors.note?.message}
        {...register("note")}
      />
      <Button type="submit" variant="primary" aria-busy={isSaving}>
        {isSaving
          ? "Saving…"
          : kind === "status"
            ? "Update status"
            : "Log follow-up"}
      </Button>
    </form>
  );
};

export default ApplicationEventForm;

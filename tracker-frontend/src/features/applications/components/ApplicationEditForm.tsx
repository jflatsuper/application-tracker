import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { toast } from "react-toastify";
import Input from "@/shared/components/form/Input";
import Textarea from "@/shared/components/form/Textarea";
import type { ApplicationPatch, ApplicationRead } from "../ApplicationSchema";
import {
  applicationEditSchema,
  toEditValues,
  toPatch,
  todayLocal,
  type EditValues,
} from "../applicationFormValues";

type Props = {
  application: ApplicationRead;
  isSaving: boolean;
  onSave: (patch: ApplicationPatch) => void;
};

const ApplicationEditForm = ({ application, isSaving, onSave }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<EditValues>({
    resolver: zodResolver(applicationEditSchema),
    values: toEditValues(application),
    resetOptions: { keepDirtyValues: true },
  });

  const submit = (values: EditValues) => {
    const patch = toPatch(values, dirtyFields);
    if (Object.keys(patch).length === 0) {
      toast.info("No changes to save.");
      return;
    }
    onSave(patch);
  };

  return (
    <form className="panel" noValidate onSubmit={handleSubmit(submit)}>
      <h2 className="panel__title">Details</h2>
      <div className="form-grid">
        <Input
          label="Company"
          error={errors.company_name?.message}
          {...register("company_name")}
        />
        <Input
          label="Role"
          error={errors.title?.message}
          {...register("title")}
        />
        <Input
          label="Location"
          error={errors.location?.message}
          {...register("location")}
        />
        <Input
          label="Job posting link"
          type="url"
          placeholder="https://"
          error={errors.source_url?.message}
          {...register("source_url")}
        />
        <Input
          label="Date applied"
          type="date"
          max={todayLocal()}
          error={errors.applied_at?.message}
          {...register("applied_at")}
        />
        <Input
          label="Tier"
          type="number"
          min={0}
          max={5}
          step={1}
          help="From 0 to 5."
          error={errors.tier?.message}
          {...register("tier")}
        />
        <Input
          label="Next follow-up"
          type="date"
          error={errors.follow_up_at?.message}
          {...register("follow_up_at")}
        />
        <Input
          label="Follow up every (days)"
          type="number"
          min={1}
          max={365}
          step={1}
          error={errors.follow_up_interval_days?.message}
          {...register("follow_up_interval_days")}
        />
        <div className="form-grid__full">
          <Textarea
            label="Notes"
            rows={5}
            error={errors.notes?.message}
            {...register("notes")}
          />
        </div>
      </div>
      <div className="panel__actions">
        <button type="submit" className="btn btn--primary" aria-busy={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </button>
        <Link to="/applications" className="btn btn--ghost">
          Back to applications
        </Link>
      </div>
    </form>
  );
};

export default ApplicationEditForm;

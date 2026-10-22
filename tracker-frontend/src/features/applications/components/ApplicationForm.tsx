import {
  applicationCreateSchema,
  type Application,
  type ApplicationCreate,
  type ApplicationCreateInput,
} from "../ApplicationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import Input from "@/shared/components/form/Input";
import Select from "@/shared/components/form/Select";
import Textarea from "@/shared/components/form/Textarea";
import { atNoonUtc } from "../applicationFormValues";
import { STATUS_LABELS, STATUS_ORDER } from "../applicationStatus";
import "../style.scss";
type FormInputItem<T> = {
  label?: string;
  help?: string;
  min?: number;
  max?: number;
  name: keyof T;
  type?: "text" | "number" | "date" | "select" | "textarea";
  options?: { value: string; label: string }[];
};
const statusOptions = STATUS_ORDER.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));
const formItems: FormInputItem<Application>[] = [
  { label: "Company", name: "company_name" },
  { label: "Role", name: "title" },
  { label: "Location", name: "location" },
  { label: "Source", name: "source_url" },
  { label: "Status", name: "status", type: "select", options: statusOptions },
  { label: "Date applied", name: "applied_at", type: "date" },
  { label: "Tier", name: "tier", type: "number", min: 0, max: 5, help: "From 0 to 5." },
  {
    label: "Follow up every (days)",
    name: "follow_up_interval_days",
    type: "number",
    min: 1,
    max: 365,
    help: "Optional. From 1 to 365 days.",
  },
  { label: "Notes", name: "notes", type: "textarea" },
];
type ApplicationFormProps = {
  onSubmit: (data: ApplicationCreate) => void;
  defaultValues?: Partial<ApplicationCreateInput>;
  // Draft values (for example from a parsed job posting). They fill the
  // fields the user hasn't typed in, and never overwrite their own edits.
  prefill?: Partial<ApplicationCreateInput>;
  isSaving?: boolean;
};
const ApplicationForm = ({
  onSubmit,
  defaultValues,
  prefill,
  isSaving = false,
}: ApplicationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationCreateInput, unknown, ApplicationCreate>({
    mode: "onBlur",
    resolver: zodResolver(applicationCreateSchema),
    defaultValues: { status: "applied", tier: 0, ...defaultValues },
    values: prefill && {
      company_name: "",
      title: "",
      location: "",
      status: "applied",
      tier: 0,
      ...defaultValues,
      ...prefill,
    },
    resetOptions: { keepDirtyValues: true },
  });
  return (
    <form
      className="application-form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      {formItems.map(({ name, label, type, options, help, min, max }) => {
        if (type === "select") {
          return (
            <Select
              key={name}
              id={name}
              label={label}
              dropdownOptions={options ?? []}
              error={errors[name]?.message}
              {...register(name)}
            />
          );
        }
        if (type === "textarea") {
          return (
            <Textarea
              key={name}
              id={name}
              label={label}
              help={help}
              rows={5}
              error={errors[name]?.message}
              {...register(name)}
            />
          );
        }
        return (
          <Input
            key={name}
            id={name}
            type={type ?? "text"}
            label={label}
            help={help}
            min={min}
            max={max}
            step={type === "number" ? 1 : undefined}
            error={errors[name]?.message}
            {...register(name, {
              ...(type === "number" && {
                setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
              }),
              ...(type === "date" && {
                setValueAs: (v: string) => (v ? atNoonUtc(v) : undefined),
              }),
            })}
          />
        );
      })}
      <div className="application-form__actions">
        <button
          type="submit"
          className="btn btn--primary"
          aria-busy={isSaving}
        >
          {isSaving ? "Saving…" : "Save application"}
        </button>
        <Link to="/applications" className="btn btn--ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
};

export default ApplicationForm;

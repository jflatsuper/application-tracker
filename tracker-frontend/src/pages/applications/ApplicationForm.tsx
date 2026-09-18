import {
  applicationCreateSchema,
  Status,
  Track,
  type Application,
  type ApplicationCreate,
  type ApplicationCreateInput,
} from "./ApplicationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Input from "../../shared/components/form/Input";
import type { ReactNode } from "react";
import Select from "../../shared/components/form/Select";
import { Fragment } from "react";
type FormInputItem<T> = {
  label?: string;
  helperText?: string | ReactNode;
  placeholder?: string;
  name: keyof T;
  type?: "text" | "number" | "date" | "select";
  options?: { value: string; label: string }[];
};
const trackOptions = Object.values(Track).map((v) => ({ value: v, label: v }));
const statusOptions = Object.values(Status).map((v) => ({
  value: v,
  label: v,
}));
const formItems: FormInputItem<Application>[] = [
  { label: "Company", name: "company" },
  { label: "Role", name: "role" },
  { label: "Track", name: "track", type: "select", options: trackOptions },
  { label: "Tier", name: "tier", type: "number" },
  { label: "Source", name: "source" },
  { label: "Contact", name: "contact" },
  { label: "Status", name: "status", type: "select", options: statusOptions },
  { label: "Date applied", name: "date_applied", type: "date" },
  { label: "Follow up date", name: "follow_up_date", type: "date" },
  { label: "Notes", name: "notes" },
];
type ApplicationFormProps = {
  onSubmit: (data: ApplicationCreate) => void;
  defaultValues?: Partial<ApplicationCreateInput>;
};
const ApplicationForm = ({ onSubmit }: ApplicationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationCreateInput, unknown, ApplicationCreate>({
    mode: "onBlur",
    resolver: zodResolver(applicationCreateSchema),
  });
  console.log(errors);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {formItems.map(({ name, label, type, options }) => (
        <Fragment key={name}>
          {type == "select" ? (
            <Select dropdownOptions={options ?? []} {...register(name)} />
          ) : (
            <Input
              key={name}
              id={name}
              type={type ?? "text"}
              {...register(
                name,
                type === "number" ? { valueAsNumber: true } : {},
              )}
              label={label}
              error={errors[name]?.message}
            />
          )}
        </Fragment>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default ApplicationForm;

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Alert from "@/shared/components/Alert";
import Input from "@/shared/components/form/Input";
import Select from "@/shared/components/form/Select";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUpdateSettings } from "../hooks/useSettings";
import {
  DIGEST_DAYS,
  DIGEST_OPTIONS,
  deviceTimeZone,
  settingsSchema,
  timeZoneOptions,
  toSettingsUpdate,
  toSettingsValues,
  type SettingsValues,
} from "../settingsForm";
import type { UserSettings } from "../types";

const SettingsForm = ({ settings }: { settings: UserSettings }) => {
  const { user } = useAuth();
  const update = useUpdateSettings();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    values: toSettingsValues(settings),
    resetOptions: { keepDirtyValues: true },
  });

  const frequency = useWatch({ control, name: "digest_frequency" });
  const zones = timeZoneOptions(settings.timezone);
  const device = deviceTimeZone();

  const submit = (values: SettingsValues) => {
    const changes = toSettingsUpdate(values, dirtyFields);
    if (Object.keys(changes).length === 0) {
      toast.info("No changes to save.");
      return;
    }
    update.mutate(changes);
  };

  return (
    <form className="settings-form" noValidate onSubmit={handleSubmit(submit)}>
      {update.isError && (
        <Alert>Couldn't save. Check your connection and try again.</Alert>
      )}

      <section className="panel">
        <h2 className="panel__title">Follow-ups</h2>
        <Input
          label="Default follow-up interval (days)"
          type="number"
          min={1}
          max={365}
          step={1}
          help="Between 1 and 365 days."
          error={errors.follow_up_interval_days?.message}
          {...register("follow_up_interval_days")}
        />
      </section>

      <section className="panel">
        <h2 className="panel__title">Email digest</h2>
        {user?.is_anonymous && (
          <p className="panel__text">
            Digests need an account with an email address. Create an account
            to receive them.
          </p>
        )}
        <Select
          label="How often"
          dropdownOptions={DIGEST_OPTIONS}
          error={errors.digest_frequency?.message}
          {...register("digest_frequency")}
        />
        {frequency === "weekly" && (
          <Select
            label="Day of the week"
            dropdownOptions={DIGEST_DAYS}
            error={errors.digest_day?.message}
            {...register("digest_day")}
          />
        )}
        <Select
          label="Timezone"
          dropdownOptions={zones}
          error={errors.timezone?.message}
          {...register("timezone")}
        />
        <button
          type="button"
          className="btn btn--ghost settings-form__device"
          onClick={() =>
            setValue("timezone", device, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          Use my device's timezone ({device.replace(/_/g, " ")})
        </button>
      </section>

      <div>
        <button
          type="submit"
          className="btn btn--primary"
          aria-busy={update.isPending}
        >
          {update.isPending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;

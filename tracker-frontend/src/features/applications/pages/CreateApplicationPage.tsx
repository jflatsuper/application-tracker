import { useState } from "react";
import { useNavigate } from "react-router";
import Alert from "@/shared/components/Alert";
import ParsePanel from "@/features/parser/components/ParsePanel";
import ApplicationForm from "../components/ApplicationForm";
import { useCreateApplication } from "../hooks/useApplicationMutations";
import { parsedPostingToFormValues } from "../parsedPosting";
import type { ApplicationCreateInput } from "../ApplicationSchema";
import "../style.scss";

const CreateApplicationPage = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useCreateApplication();
  const [prefill, setPrefill] = useState<Partial<ApplicationCreateInput>>();

  return (
    <>
      <title>Add application</title>
      <section className="application-page">
        <div className="application-page__head">
          <h1>Add application</h1>
          <p>
            Track a role you've saved or applied for. You can edit everything
            later.
          </p>
        </div>
        <ParsePanel
          onParsed={(posting) => setPrefill(parsedPostingToFormValues(posting))}
        />
        {error && (
          <Alert>Couldn't save. Check your connection and try again.</Alert>
        )}
        <ApplicationForm
          isSaving={isPending}
          prefill={prefill}
          onSubmit={(data) =>
            mutate(data, { onSuccess: () => navigate("/applications") })
          }
        />
      </section>
    </>
  );
};

export default CreateApplicationPage;

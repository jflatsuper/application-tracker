import { useNavigate } from "react-router";
import Alert from "@/shared/components/Alert";
import ApplicationForm from "../components/ApplicationForm";
import { useCreateApplication } from "../hooks/useApplicationMutations";
import "../style.scss";

const CreateApplicationPage = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useCreateApplication();

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
        {error && (
          <Alert>Couldn't save. Check your connection and try again.</Alert>
        )}
        <ApplicationForm
          isSaving={isPending}
          onSubmit={(data) =>
            mutate(data, { onSuccess: () => navigate("/applications") })
          }
        />
      </section>
    </>
  );
};

export default CreateApplicationPage;

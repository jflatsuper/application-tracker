import ApplicationForm from "./ApplicationForm";
import { useCreateApplication } from "./useApplicationMutations";

const Application = () => {
  const { mutate, isPending, error } = useCreateApplication();

  return (
    <>
      <ApplicationForm onSubmit={mutate} />
      {isPending && <p>Saving...</p>}
      {error && <p>Something went wrong.</p>}
    </>
  );
};

export default Application;

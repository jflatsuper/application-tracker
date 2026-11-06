import { Link, useParams } from "react-router";
import Alert from "@/shared/components/alert";
import { ApiError } from "@/shared/libs/apiClient";
import { formatDate } from "@/shared/libs/format";
import ApplicationEditForm from "../components/ApplicationEditForm";
import ApplicationEventForm from "../components/ApplicationEventForm";
import ApplicationHistory from "../components/ApplicationHistory";
import DeleteApplication from "../components/DeleteApplication";
import StatusChip from "../components/StatusChip";
import { toEventFields } from "../applicationFormValues";
import type { ApplicationStatus } from "../ApplicationSchema";
import { useApplication } from "../hooks/useApplicationQueries";
import {
  useAddFollowUp,
  useChangeApplicationStatus,
  useUpdateApplication,
} from "../hooks/useApplicationMutations";
import "../style.scss";

import Button from "@/shared/components/button";
import Panel from "@/shared/components/panel";
import { PanelTitle, PanelText } from "@/shared/components/panel/Panel";
import EmptyState from "@/shared/components/states/empty-state";
import ErrorState from "@/shared/components/states/error-state";
import LoadingState from "@/shared/components/states/loading-state";
const SAVE_ERROR = "Couldn't save. Check your connection and try again.";

const EditApplicationPage = () => {
  const { applicationId = "" } = useParams();
  const {
    data: application,
    isPending,
    isError,
    error,
    refetch,
  } = useApplication(applicationId);
  const update = useUpdateApplication(applicationId);
  const changeStatus = useChangeApplicationStatus(applicationId);
  const followUp = useAddFollowUp(applicationId);

  if (isPending) {
    return <LoadingState>Loading application…</LoadingState>;
  }

  if (isError) {
    const missing =
      error instanceof ApiError &&
      (error.status === 404 || error.status === 422);
    return missing ? (
      <>
        <title>Application not found</title>
        <EmptyState
          heading="h1"
          title="We can't find that application"
          text="It may have been deleted, or the link may be wrong."
        >
          <Button to="/applications" variant="primary">
            Back to applications
          </Button>
        </EmptyState>
      </>
    ) : (
      <ErrorState onRetry={() => refetch()}>
        Couldn't load this application. Check your connection and try again.
      </ErrorState>
    );
  }

  const saveError = update.isError || changeStatus.isError || followUp.isError;

  return (
    <>
      <title>{`${application.company_name} · ${application.title}`}</title>
      <section className="application-edit">
        <nav className="application-edit__crumbs" aria-label="Breadcrumb">
          <Link to="/applications">Applications</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{application.company_name}</span>
        </nav>

        <header className="application-edit__head">
          <h1>{application.company_name}</h1>
          <p>
            {application.title}
            {application.location && ` · ${application.location}`}
          </p>
          <StatusChip status={application.status} />
        </header>

        {saveError && <Alert>{SAVE_ERROR}</Alert>}

        <div className="application-edit__grid">
          <div className="application-edit__main">
            <ApplicationEditForm
              application={application}
              isSaving={update.isPending}
              onSave={(patch) => update.mutate(patch)}
            />
            <DeleteApplication
              id={application.id}
              name={application.company_name}
            />
          </div>

          <aside className="application-edit__side">
            <Panel>
              <PanelTitle>Status</PanelTitle>
              <ApplicationEventForm
                key={application.status}
                kind="status"
                currentStatus={application.status}
                isSaving={changeStatus.isPending}
                onSubmit={(values, done) =>
                  changeStatus.mutate(
                    {
                      to_status: values.to_status as ApplicationStatus,
                      ...toEventFields(values),
                    },
                    { onSuccess: done },
                  )
                }
              />
            </Panel>

            <Panel>
              <PanelTitle>Follow-ups</PanelTitle>
              <PanelText>
                {application.follow_up_at
                  ? `Next follow-up: ${formatDate(application.follow_up_at, { utc: true })}`
                  : "No follow-up scheduled."}
              </PanelText>
              <ApplicationEventForm
                kind="follow_up"
                isSaving={followUp.isPending}
                onSubmit={(values, done) =>
                  followUp.mutate(toEventFields(values), { onSuccess: done })
                }
              />
            </Panel>

            <Panel>
              <PanelTitle>History</PanelTitle>
              <ApplicationHistory events={application.events} />
            </Panel>
          </aside>
        </div>
      </section>
    </>
  );
};

export default EditApplicationPage;

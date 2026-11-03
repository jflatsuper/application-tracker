// pages/applications/ApplicationsListPage.tsx
import { Link, useSearchParams } from "react-router";
import Table from "@/shared/components/table/Table";
import Alert from "@/shared/components/Alert";
import Icon from "@/shared/components/Icon";
import Pagination from "@/shared/components/Pagination";
import { formatDate } from "@/shared/libs/format";
import type { TableHeading, TableRowItem } from "@/types/table";
import { useApplications } from "../hooks/useApplicationQueries";
import type { ApplicationStatus } from "../ApplicationSchema";
import { STATUS_LABELS, STATUS_ORDER } from "../applicationStatus";
import StatusChip from "../components/StatusChip";
import "../style.scss";

const PAGE_SIZE = 20;

const tableHeaders: TableHeading[] = [
  { label: "Company" },
  { label: "Role" },
  { label: "Location" },
  { label: "Status" },
  { label: "Applied", align: "end" },
  { label: "Updated", align: "end" },
];

function ApplicationsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = STATUS_ORDER.find((s) => s === searchParams.get("status"));
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );

  const { data, isPending, isError, isPlaceholderData, refetch } =
    useApplications({
      status,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });

  const updateParams = (next: { status?: ApplicationStatus; page?: number }) => {
    const params = new URLSearchParams();
    if (next.status) params.set("status", next.status);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    setSearchParams(params);
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const rows: TableRowItem[][] = items.map((application) => {
    const applied = formatDate(application.applied_at, { utc: true });
    return [
      {
        label: (
          <Link
            to={`/applications/${application.id}`}
            className="table__link"
          >
            {application.company_name}
          </Link>
        ),
        className: "table__cell--strong cell-company",
      },
      { label: application.title, className: "cell-role" },
      application.location
        ? { label: application.location, className: "cell-location" }
        : {
            label: "Not set",
            className: "table__cell--muted cell-location",
          },
      {
        label: <StatusChip status={application.status} />,
        className: "cell-status",
      },
      applied
        ? { label: applied, className: "table__cell--end cell-date" }
        : {
            label: "Not applied",
            className: "table__cell--end table__cell--muted cell-date cell-date--empty",
          },
      {
        label: formatDate(application.updated_at),
        className: "table__cell--end cell-date",
      },
    ];
  });

  const renderBody = () => {
    if (isError) {
      return (
        <div className="applications__stack">
          <Alert>
            Couldn't load your applications. Check your connection and try
            again.
          </Alert>
          <button type="button" className="btn" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      );
    }

    if (isPending) {
      return (
        <p className="applications__state" role="status">
          Loading applications…
        </p>
      );
    }

    if (total === 0) {
      return status ? (
        <div className="applications__empty">
          <h2>No {STATUS_LABELS[status].toLowerCase()} applications</h2>
          <p>Nothing has this status right now.</p>
          <button type="button" className="btn" onClick={() => updateParams({})}>
            Show all applications
          </button>
        </div>
      ) : (
        <div className="applications__empty">
          <h2>No applications yet</h2>
          <p>Add the first one when you apply.</p>
          <Link to="/applications/create" className="btn btn--primary">
            Add application
          </Link>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="applications__empty">
          <h2>That page is empty</h2>
          <p>There are no more applications after page {page - 1}.</p>
          <button
            type="button"
            className="btn"
            onClick={() => updateParams({ status })}
          >
            Back to the first page
          </button>
        </div>
      );
    }

    return (
      <>
        <div
          className={
            isPlaceholderData
              ? "applications__table is-stale"
              : "applications__table"
          }
          aria-busy={isPlaceholderData}
        >
          <Table
            caption="Applications"
            tableHeaders={tableHeaders}
            tableRowItems={rows}
          />
        </div>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={(next) => updateParams({ status, page: next })}
        />
      </>
    );
  };

  return (
    <>
      <title>Applications</title>
      <section className="applications">
        <div className="applications__head">
          <div>
            <h1>Applications</h1>
            {data && (
              <p className="applications__sub">
                {total} {total === 1 ? "application" : "applications"}
                {status && ` with status ${STATUS_LABELS[status].toLowerCase()}`}
              </p>
            )}
          </div>
          <Link to="/applications/create" className="btn btn--primary">
            <Icon name="plus" />
            Add application
          </Link>
        </div>

        <div
          className="applications__filters"
          role="group"
          aria-label="Filter by status"
        >
          <button
            type="button"
            className="filter-pill"
            aria-pressed={!status}
            onClick={() => updateParams({})}
          >
            All
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              className="filter-pill"
              aria-pressed={status === s}
              onClick={() => updateParams({ status: s })}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {renderBody()}
      </section>
    </>
  );
}

export default ApplicationsListPage;

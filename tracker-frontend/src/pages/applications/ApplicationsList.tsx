// pages/applications/ApplicationsListPage.tsx
import Table from "@/shared/components/table/Table";
import { useApplications } from "./useApplicationQueries";
import type { TableHeading, TableRowItem } from "@/types/table";
import { useMemo } from "react";
import "./style.scss";

function ApplicationsListPage() {
  const { data: applications, isLoading, error } = useApplications();
  const tableHeaders: TableHeading[] = [
    { label: "Company" },
    { label: "Role" },
    { label: "Track" },
    { label: "Status" },
  ];
  const tableBodyItems: TableRowItem[][] = useMemo(
    () =>
      applications?.items?.map((items) => [
        { label: items.company_name },
        { label: items.title },
        { label: items.status },
        { label: items.location },
      ]) ?? [],
    [isLoading],
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;

  return (
    <div className="application-list">
      <div className="application-table-group">
        <Table tableHeaders={tableHeaders} tableRowItems={tableBodyItems} />
      </div>
    </div>
  );
}

export default ApplicationsListPage;
// company: z.string(),
// role: z.string(),
// track: z.enum(Track),
// tier: z.number(),
// source: z.string().optional(),
// contact: z.string().optional(),
// status: z.enum(Status),
// date_applied: z.coerce.date().optional(),
// follow_up_date: z.coerce.date().optional(),
// notes: z.string().optional(),

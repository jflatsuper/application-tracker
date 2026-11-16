// What the extension reads off a job posting. Any field can be empty.
export type JobDraft = {
  title: string;
  company: string;
  location: string;
  url: string;
};

export type ApplicationStatus = "saved" | "applied" | (string & {});

export type ApplicationSummary = {
  id: string;
  company_name: string;
  title: string;
  status: ApplicationStatus;
};

export type Entitlements = {
  plan_code: string;
  plan_name: string;
  status: string | null;
};

export type StoredUser = { email: string | null; full_name: string | null };

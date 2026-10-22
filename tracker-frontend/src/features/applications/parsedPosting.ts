import type { ParsedPosting } from "@/features/parser/types";
import type { ApplicationCreateInput } from "./ApplicationSchema";

// A parsed posting is only a draft: these values pre-fill the create form
// and the user confirms or edits them before anything is saved.
export function parsedPostingToFormValues(
  posting: ParsedPosting,
): Partial<ApplicationCreateInput> {
  const values: Partial<ApplicationCreateInput> = {};
  if (posting.company_name) values.company_name = posting.company_name;
  if (posting.title) values.title = posting.title;
  if (posting.location) values.location = posting.location;
  if (posting.source_url) values.source_url = posting.source_url;
  if (posting.salary_text) values.notes = `Salary: ${posting.salary_text}`;
  return values;
}

import { describe, expect, it } from "vitest";
import { companyFromUrl, isWatchedUrl } from "./sites";

describe("sites", () => {
  it("only watches the listed job boards, over https", () => {
    expect(isWatchedUrl("https://boards.greenhouse.io/acme/jobs/1")).toBe(true);
    expect(isWatchedUrl("http://boards.greenhouse.io/acme/jobs/1")).toBe(false);
    expect(isWatchedUrl("https://evil.example/boards.greenhouse.io/")).toBe(false);
    expect(isWatchedUrl("https://boards.greenhouse.io.evil.example/")).toBe(false);
    expect(isWatchedUrl(undefined)).toBe(false);
  });

  it("names the company from the first path segment", () => {
    expect(companyFromUrl("https://jobs.ashbyhq.com/big_corp/abc")).toBe(
      "Big Corp",
    );
    expect(companyFromUrl("https://example.com/acme/jobs")).toBe("");
  });
});

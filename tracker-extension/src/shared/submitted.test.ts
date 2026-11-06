import { describe, expect, it } from "vitest";
import { isSubmitted } from "./submitted";

const url = "https://jobs.lever.co/acme/123/thanks";

describe("isSubmitted", () => {
  it("needs confirmation wording", () => {
    expect(isSubmitted(url, "Senior Engineer. Apply now", true)).toBe(false);
  });

  it("accepts wording after we saw a posting in this tab", () => {
    expect(
      isSubmitted(
        "https://jobs.ashbyhq.com/acme/123/application",
        "Your application was successfully submitted.",
        true,
      ),
    ).toBe(true);
  });

  it("without a remembered posting, the address must agree too", () => {
    const text = "Thank you for applying!";
    expect(isSubmitted("https://jobs.lever.co/acme", text, false)).toBe(false);
    expect(isSubmitted(url, text, false)).toBe(true);
  });

  it.each([
    "We've received your application and will be in touch.",
    "Application submitted",
    "Thanks for your application",
  ])("recognises %s", (text) => {
    expect(isSubmitted(url, text, true)).toBe(true);
  });
});

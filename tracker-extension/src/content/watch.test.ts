import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMessage = vi.fn(async () => undefined);

// jsdom has no innerText (browsers do); textContent is close enough here.
Object.defineProperty(HTMLElement.prototype, "innerText", {
  configurable: true,
  get() {
    return this.textContent;
  },
});

async function load() {
  vi.resetModules();
  await import("./watch");
  await vi.advanceTimersByTimeAsync(700);
}

const posting = {
  "@type": "JobPosting",
  title: "Senior Engineer",
  hiringOrganization: { name: "Acme" },
};

function showPosting() {
  document.head.innerHTML = `<script type="application/ld+json">${JSON.stringify(posting)}</script>`;
  document.body.innerHTML = "<h1>Senior Engineer</h1><button>Apply</button>";
}

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  sendMessage.mockClear();
  vi.stubGlobal("chrome", { runtime: { sendMessage } });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the application watcher", () => {
  it("remembers a posting but sends nothing while you browse", async () => {
    showPosting();
    await load();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(JSON.parse(sessionStorage.getItem("refresha.job")!)).toMatchObject({
      title: "Senior Engineer",
      company: "Acme",
    });
  });

  it("reports the remembered job once the page confirms the application", async () => {
    showPosting();
    await load();

    document.head.innerHTML = "";
    document.body.innerHTML = "<h1>Thank you!</h1><p>Your application was submitted.</p>";
    await load();

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      type: "application-submitted",
      job: expect.objectContaining({ title: "Senior Engineer", company: "Acme" }),
    });

    // The same confirmation seen again (a re-render) isn't sent twice.
    await load();
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });

  it("ignores confirmation wording on a page where no posting was seen", async () => {
    document.body.innerHTML = "<p>Thank you for applying to our newsletter.</p>";
    await load();
    expect(sendMessage).not.toHaveBeenCalled();
  });
});

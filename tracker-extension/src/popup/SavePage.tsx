import { useEffect, useState, type FormEvent } from "react";
import { ProRequiredError, listApplications, parseText } from "../shared/api";
import { appLink } from "../shared/config";
import { findExisting, trackJob, type TrackResult } from "../shared/tracking";
import type { ApplicationSummary, JobDraft } from "../shared/types";
import { errorMessage } from "./errors";

type Page = { job: JobDraft; text: string };

// Reads the page behind the popup. This only works on the tab you clicked the
// icon on (activeTab), and only runs because you clicked.
async function readActivePage(): Promise<Page | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || !/^https?:/.test(tab.url)) return null;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["extract.js"],
  });
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () =>
      (window as unknown as { __refreshaPage?: unknown }).__refreshaPage,
  });
  return (result?.result as Page | undefined) ?? null;
}

const SavePage = () => {
  const [state, setState] = useState<"loading" | "none" | "form" | "done">(
    "loading",
  );
  const [text, setText] = useState("");
  const [job, setJob] = useState<JobDraft>({
    title: "",
    company: "",
    location: "",
    url: "",
  });
  const [status, setStatus] = useState<"saved" | "applied">("saved");
  const [existing, setExisting] = useState<ApplicationSummary>();
  const [result, setResult] = useState<TrackResult>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await readActivePage();
        if (cancelled) return;
        if (!page) return setState("none");
        setJob(page.job);
        setText(page.text);
        setState("form");
        // Tell them now if this job is already tracked.
        const found = findExisting(await listApplications(), page.job);
        if (!cancelled) setExisting(found);
      } catch {
        if (!cancelled) setState("none");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (field: keyof JobDraft) => (value: string) =>
    setJob((current) => ({ ...current, [field]: value }));

  const readWithAi = async () => {
    setBusy(true);
    setError(null);
    try {
      const parsed = await parseText(text);
      setJob((current) => ({
        ...current,
        title: parsed.title || current.title,
        company: parsed.company_name || current.company,
        location: parsed.location || current.location,
      }));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await trackJob(job, status));
      setState("done");
    } catch (caught) {
      setError(
        caught instanceof ProRequiredError
          ? "The extension is part of Pro."
          : errorMessage(caught),
      );
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") return <p className="muted">Reading this page…</p>;

  if (state === "none") {
    return (
      <p className="muted">
        Open a job posting, then click the Refresha icon to save it. This page
        can't be read.
      </p>
    );
  }

  if (state === "done" && result) {
    const message =
      result.kind === "created"
        ? "Added to Refresha."
        : result.kind === "updated"
          ? "Marked as applied."
          : "Already in Refresha.";
    return (
      <section className="stack" role="status">
        <p>
          <strong>{message}</strong>
        </p>
        <a
          className="btn btn--primary btn--block"
          href={appLink(`/applications/${result.application.id}`)}
          target="_blank"
          rel="noreferrer"
        >
          Open in Refresha
        </a>
      </section>
    );
  }

  const missing = !job.title.trim() || !job.company.trim();

  return (
    <form onSubmit={save} className="stack">
      {existing && (
        <p className="notice" role="status">
          Already in Refresha as {existing.status}.{" "}
          <a
            href={appLink(`/applications/${existing.id}`)}
            target="_blank"
            rel="noreferrer"
          >
            Open
          </a>
        </p>
      )}
      <label className="field">
        <span>Company</span>
        <input
          required
          value={job.company}
          onChange={(event) => set("company")(event.target.value)}
        />
      </label>
      <label className="field">
        <span>Role</span>
        <input
          required
          value={job.title}
          onChange={(event) => set("title")(event.target.value)}
        />
      </label>
      <label className="field">
        <span>Location</span>
        <input
          value={job.location}
          onChange={(event) => set("location")(event.target.value)}
        />
      </label>
      <label className="field">
        <span>Add as</span>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "saved" | "applied")
          }
        >
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
        </select>
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="row">
        <button className="btn btn--primary" disabled={busy || missing}>
          {busy ? "Working…" : existing ? "Update" : "Save"}
        </button>
        {missing && (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={readWithAi}
          >
            Read with AI
          </button>
        )}
      </div>
    </form>
  );
};

export default SavePage;

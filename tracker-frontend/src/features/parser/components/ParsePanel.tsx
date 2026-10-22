import { useState } from "react";
import { Link } from "react-router";
import Alert from "@/shared/components/Alert";
import Input from "@/shared/components/form/Input";
import Textarea from "@/shared/components/form/Textarea";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEntitlements } from "@/features/billing/hooks/useBilling";
import { TEXT_MAX, TEXT_MIN } from "../api/parserApi";
import { parseErrorMessage, type ParseMethod } from "../errors";
import { useOwnKey } from "../hooks/useOwnKey";
import {
  useParseText,
  useParseUrl,
  useParseWithOwnKey,
} from "../hooks/useParser";
import type { ParsedPosting } from "../types";
import OwnKeyField from "./OwnKeyField";
import "../style.scss";

type Props = { onParsed: (posting: ParsedPosting) => void };

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

const FIELDS = [
  "company_name",
  "title",
  "location",
  "salary_text",
  "source_url",
] as const;

const ParsePanel = ({ onParsed }: Props) => {
  const { user } = useAuth();
  const entitlements = useEntitlements();
  const canUseRefresha = entitlements.data?.entitlements.llm_parsing === true;

  const [source, setSource] = useState<"link" | "text">("link");
  // Paid plans read with Refresha AI. Everyone else brings their own key.
  const engine = canUseRefresha ? "refresha" : "own";

  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [filled, setFilled] = useState<{ count: number; confidence: number } | null>(
    null,
  );

  const ownKey = useOwnKey(user?.id);
  const parseUrl = useParseUrl();
  const parseText = useParseText();
  const parseOwn = useParseWithOwnKey();

  const method: ParseMethod =
    source === "link" ? "link" : engine === "refresha" ? "refresha" : "own";
  const active =
    method === "link" ? parseUrl : method === "refresha" ? parseText : parseOwn;

  const finish = (posting: ParsedPosting) => {
    const count = FIELDS.filter((field) => posting[field]).length;
    setFilled({ count, confidence: posting.confidence });
    if (count > 0) onParsed(posting);
  };

  const reset = () => {
    setInputError(null);
    setFilled(null);
  };

  const submitLink = (event: React.FormEvent) => {
    event.preventDefault();
    reset();
    const value = url.trim();
    if (!isHttpUrl(value)) {
      setInputError("Enter a full link, starting with https://");
      return;
    }
    parseUrl.mutate(value, { onSuccess: finish });
  };

  const submitText = (event: React.FormEvent) => {
    event.preventDefault();
    reset();
    const value = text.trim();
    if (value.length < TEXT_MIN) {
      setInputError(`Paste at least ${TEXT_MIN} characters of the posting.`);
      return;
    }
    if (method === "refresha") {
      parseText.mutate(value, { onSuccess: finish });
      return;
    }
    if (!ownKey.key) {
      setInputError("Add your Anthropic key first.");
      return;
    }
    parseOwn.mutate({ text: value, key: ownKey.key }, { onSuccess: finish });
  };

  return (
    <section className="panel parse-panel" aria-labelledby="parse-title">
      <div>
        <h2 id="parse-title" className="panel__title">
          Fill from a job posting
        </h2>
        <p className="panel__text">
          Paste a link or the posting text. You'll review everything before it
          is saved.
        </p>
      </div>

      <div className="parse-methods" role="group" aria-label="Where to read from">
        <button
          type="button"
          className="parse-method"
          aria-pressed={source === "link"}
          onClick={() => {
            setSource("link");
            reset();
          }}
        >
          From a link
        </button>
        <button
          type="button"
          className="parse-method"
          aria-pressed={source === "text"}
          onClick={() => {
            setSource("text");
            reset();
          }}
        >
          From pasted text
        </button>
      </div>

      {source === "link" ? (
        <form className="parse-form" noValidate onSubmit={submitLink}>
          <Input
            label="Job posting link"
            type="url"
            placeholder="https://"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            error={inputError ?? undefined}
            help="Free. Reads the page's own job posting data, with no AI involved."
          />
          <div className="parse-actions">
            <button
              type="submit"
              className="btn btn--primary"
              aria-busy={parseUrl.isPending}
            >
              {parseUrl.isPending ? "Reading page…" : "Fetch details"}
            </button>
          </div>
        </form>
      ) : (
        <form className="parse-form" noValidate onSubmit={submitText}>
          <Textarea
            label="Job posting text"
            rows={6}
            value={text}
            maxLength={TEXT_MAX}
            onChange={(event) => setText(event.target.value)}
            error={inputError ?? undefined}
            help={`${text.length.toLocaleString()} of ${TEXT_MAX.toLocaleString()} characters. At least ${TEXT_MIN}.`}
          />

          {entitlements.isPending ? (
            <p className="parse-note" role="status">
              Checking your plan…
            </p>
          ) : (
            <>
              {canUseRefresha ? (
                <p className="parse-note">
                  Read with Refresha AI, included in your plan.
                </p>
              ) : (
                <>
                  <OwnKeyField ownKey={ownKey} />
                  <p className="parse-note">
                    Refresha AI is included in Pro.{" "}
                    <Link to="/pricing">See plans</Link>
                  </p>
                </>
              )}
              <div className="parse-actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  aria-busy={active.isPending}
                >
                  {active.isPending ? "Reading text…" : "Extract details"}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {active.isError && (
        <Alert>{parseErrorMessage(active.error, method)}</Alert>
      )}

      {filled && (
        <p
          className={
            filled.count > 0 && filled.confidence < 0.6
              ? "parse-note parse-note--warn"
              : "parse-note"
          }
          role="status"
        >
          {filled.count === 0
            ? "Couldn't find any details there. Try pasting the text, or fill the form in by hand."
            : filled.confidence < 0.6
              ? `Filled in ${filled.count} ${filled.count === 1 ? "field" : "fields"}, but confidence is low (${Math.round(filled.confidence * 100)}%). Double-check them before saving.`
              : `Filled in ${filled.count} ${filled.count === 1 ? "field" : "fields"}. Check them before saving.`}
        </p>
      )}
    </section>
  );
};

export default ParsePanel;

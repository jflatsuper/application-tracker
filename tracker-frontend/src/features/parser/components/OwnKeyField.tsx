import { useState } from "react";
import Input from "@/shared/components/form/Input";
import { lastFour, looksLikeAnthropicKey } from "../byok/keyStore";
import type { useOwnKey } from "../hooks/useOwnKey";

type Props = { ownKey: ReturnType<typeof useOwnKey> };

const OwnKeyField = ({ ownKey }: Props) => {
  const [draft, setDraft] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ownKey.key) {
    return (
      <div className="parse-key">
        <div className="parse-key__row">
          <span>
            Using your Anthropic key ending <strong>{lastFour(ownKey.key)}</strong>
            <span className="parse-key__where">
              {ownKey.location === "device"
                ? " · saved on this device"
                : " · this tab only"}
            </span>
          </span>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => ownKey.clear()}
          >
            Remove key
          </button>
        </div>
      </div>
    );
  }

  const save = () => {
    if (!looksLikeAnthropicKey(draft)) {
      setError("That doesn't look like an Anthropic key. It starts with sk-ant-.");
      return;
    }
    try {
      ownKey.save(draft, remember);
      setDraft("");
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't save the key.");
    }
  };

  return (
    <div className="parse-key">
      <Input
        label="Anthropic API key"
        type="password"
        autoComplete="off"
        spellCheck={false}
        placeholder="sk-ant-…"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        error={error ?? undefined}
        help="Kept in this browser and sent only to Anthropic. Refresha never sees it."
      />
      <label className="parse-remember">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
        Remember on this device
      </label>
      <button type="button" className="btn" onClick={save}>
        Save key
      </button>
    </div>
  );
};

export default OwnKeyField;

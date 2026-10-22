import { useState } from "react";
import { clearKey, readKey, saveKey } from "../byok/keyStore";

export function useOwnKey(userId: string | undefined) {
  const [stored, setStored] = useState(() =>
    userId ? readKey(userId) : null,
  );

  return {
    key: stored?.key ?? null,
    location: stored?.location ?? null,
    save: (key: string, remember: boolean) => {
      if (!userId) return;
      saveKey(userId, key.trim(), remember);
      setStored(readKey(userId));
    },
    clear: () => {
      if (!userId) return;
      clearKey(userId);
      setStored(null);
    },
  };
}

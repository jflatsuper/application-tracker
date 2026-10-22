import { useMutation } from "@tanstack/react-query";
import { parserApi } from "../api/parserApi";
import { parseWithOwnKey } from "../byok/anthropic";

export function useParseUrl() {
  return useMutation({ mutationFn: parserApi.url });
}

export function useParseText() {
  return useMutation({ mutationFn: parserApi.text });
}

// Fetch the current prompt from the API (so it can change without a
// frontend release), then run it in the browser with the user's key.
export function useParseWithOwnKey() {
  return useMutation({
    mutationFn: async ({ text, key }: { text: string; key: string }) => {
      const prompt = await parserApi.prompt();
      return parseWithOwnKey({ key, prompt, text });
    },
  });
}

import type { ParsedPosting, ParsePrompt } from "../types";
import { normalizeParsed } from "./normalize";

const API_URL = "https://api.anthropic.com/v1/messages";
const TOOL_NAME = "record_job_posting";

export class AnthropicError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Params = {
  key: string;
  prompt: ParsePrompt;
  text: string;
  signal?: AbortSignal;
};

// The browser talks to Anthropic directly. The key goes in one header to
// api.anthropic.com and nowhere else, and never into an error message.
export async function parseWithOwnKey({
  key,
  prompt,
  text,
  signal,
}: Params): Promise<ParsedPosting> {
  const schema = { ...prompt.json_schema };
  delete schema.$schema;

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: prompt.model,
        max_tokens: 1024,
        system: prompt.prompt,
        tools: [
          {
            name: TOOL_NAME,
            description: "Record the details found in the job posting.",
            input_schema: { type: "object", ...schema },
          },
        ],
        tool_choice: { type: "tool", name: TOOL_NAME },
        messages: [{ role: "user", content: text }],
      }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new AnthropicError(0, "Couldn't reach Anthropic.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message;
    throw new AnthropicError(
      response.status,
      typeof message === "string" ? message : `Request failed: ${response.status}`,
    );
  }

  const data = await response.json();
  const block = Array.isArray(data?.content)
    ? data.content.find((part: { type?: string }) => part.type === "tool_use")
    : null;
  if (!block || typeof block.input !== "object" || block.input === null) {
    throw new AnthropicError(response.status, "The model didn't return any details.");
  }
  return normalizeParsed(block.input as Record<string, unknown>, "own_key");
}

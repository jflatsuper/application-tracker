export interface ParsedPosting {
  company_name?: string | null;
  title?: string | null;
  location?: string | null;
  salary_text?: string | null;
  source_url?: string | null;
  confidence: number;
  source: string;
}

// What the API serves for parsing with the user's own Anthropic key.
export interface ParsePrompt {
  prompt: string;
  json_schema: Record<string, unknown>;
  model: string;
}

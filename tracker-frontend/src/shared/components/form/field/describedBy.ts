// The `aria-describedby` value for a control: its error, else its help text.
export const describedBy = (id: string, error?: string, help?: string) =>
  error ? `${id}-error` : help ? `${id}-help` : undefined;

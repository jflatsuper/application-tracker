// "Did the person just finish applying?" Sites differ, so this leans on the
// wording and addresses of the confirmation they all show, not on page layout.

const CONFIRMATION_TEXT = [
  /your application (has been|was) (successfully )?(submitted|received|sent)/i,
  /application (has been )?(successfully )?(submitted|received)\b/i,
  /thank(s| you) for (applying|your application|your interest in)/i,
  /we(?:'|’)?ve received your application/i,
  /we have received your application/i,
];

const CONFIRMATION_PATH =
  /\/(confirmation|confirmed|thanks|thank-you|thankyou|success|submitted)(\/|$)/i;

export const looksLikeConfirmationText = (pageText: string) =>
  CONFIRMATION_TEXT.some((pattern) => pattern.test(pageText));

export function looksLikeConfirmationUrl(url: string): boolean {
  try {
    return CONFIRMATION_PATH.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

// Wording alone is enough only if we already saw this person on a posting in
// this tab. Without that, the address has to agree too: it keeps a stray
// "thank you for your interest" blurb from counting as an application.
export function isSubmitted(
  url: string,
  pageText: string,
  sawPosting: boolean,
): boolean {
  if (!looksLikeConfirmationText(pageText)) return false;
  return sawPosting || looksLikeConfirmationUrl(url);
}

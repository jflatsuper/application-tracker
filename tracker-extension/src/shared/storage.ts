// Small typed wrappers over chrome.storage.
//   local   survives restarts: the refresh token and the person's choices.
//   session cleared when the browser closes: the short-lived access token and
//           the cached plan. Neither is readable by web pages, only by us.

export const local = {
  get: async <T>(key: string): Promise<T | undefined> =>
    (await chrome.storage.local.get(key))[key] as T | undefined,
  set: (key: string, value: unknown) => chrome.storage.local.set({ [key]: value }),
  remove: (...keys: string[]) => chrome.storage.local.remove(keys),
};

export const session = {
  get: async <T>(key: string): Promise<T | undefined> =>
    (await chrome.storage.session.get(key))[key] as T | undefined,
  set: (key: string, value: unknown) => chrome.storage.session.set({ [key]: value }),
  remove: (...keys: string[]) => chrome.storage.session.remove(keys),
};

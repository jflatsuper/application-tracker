// index.html carries generic defaults for the crawlers that never run
// JavaScript, and the build writes each page's own tags into its HTML. A page
// replaces whatever is there in place (rather than adding a second tag, which
// React 19 would do and crawlers would read inconsistently). The returned
// function puts the default back when the page goes away, or, for tags that
// only ever belong to one page (canonical, robots), removes it.
type Key = { name: string } | { property: string };

function find(selector: string) {
  return document.head.querySelector<HTMLElement>(selector);
}

function upsert(
  selector: string,
  create: () => HTMLElement,
  attribute: "content" | "href",
  value: string,
  perPage: boolean,
) {
  let element = find(selector);
  const created = !element;
  if (!element) {
    element = create();
    document.head.append(element);
  }
  const previous = element.getAttribute(attribute);
  element.setAttribute(attribute, value);

  return () => {
    if (created || perPage) element?.remove();
    else if (previous !== null) element?.setAttribute(attribute, previous);
  };
}

export function setTitle(title: string) {
  let element = document.head.querySelector("title");
  const created = !element;
  if (!element) {
    element = document.createElement("title");
    document.head.append(element);
  }
  const previous = element.textContent;
  element.textContent = title;

  return () => {
    if (created) element?.remove();
    else element!.textContent = previous;
  };
}

export function setMeta(key: Key, content: string, perPage = false) {
  const [attribute, value] =
    "name" in key ? ["name", key.name] : ["property", key.property];
  return upsert(
    `meta[${attribute}="${value}"]`,
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute(attribute, value);
      return meta;
    },
    "content",
    content,
    perPage,
  );
}

export function setLink(rel: string, href: string) {
  return upsert(
    `link[rel="${rel}"]`,
    () => {
      const link = document.createElement("link");
      link.rel = rel;
      return link;
    },
    "href",
    href,
    true,
  );
}

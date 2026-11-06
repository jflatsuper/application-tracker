import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { PAGE_SEO, type PageSeo } from "../src/constants/pageSeo.ts";
import { PRIVATE_PATHS } from "../src/constants/seoRoutes.ts";

const clean = (value: string | undefined) =>
  value?.trim().replace(/\/+$/, "") || undefined;

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Swaps one tag of the base page for this page's version. Failing loudly beats
// quietly shipping the generic tags if index.html is ever reworded.
function replaceTag(html: string, pattern: RegExp, replacement: string) {
  if (!pattern.test(html)) {
    throw new Error(`site-seo: index.html has no tag matching ${pattern}`);
  }
  return html.replace(pattern, replacement);
}

function pageHtml(base: string, path: string, page: PageSeo, siteUrl?: string) {
  const title = escapeAttr(page.title);
  let html = replaceTag(base, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = replaceTag(html, /<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${title}" />`);

  if (page.description) {
    const description = escapeAttr(page.description);
    html = replaceTag(html, /<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${description}" />`);
    html = replaceTag(html, /<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${description}" />`);
  }

  const extra: string[] = [];
  if (page.noindex) extra.push('<meta name="robots" content="noindex" />');
  else if (siteUrl) {
    const url = `${siteUrl}${path}`;
    extra.push(`<link rel="canonical" href="${url}" />`, `<meta property="og:url" content="${url}" />`);
  }
  return extra.length ? html.replace("</head>", `    ${extra.join("\n    ")}\n  </head>`) : html;
}

// At build time: writes robots.txt and sitemap.xml, gives every public page its
// own HTML file with its own tags (so link previews and crawlers that don't run
// JavaScript see them), and adds the social-preview image. The sitemap, the
// canonical links and the image need the site's absolute address
// (VITE_SITE_URL).
export function siteSeo(): Plugin {
  let siteUrl: string | undefined;
  let hasContact = false;

  const pages = () =>
    Object.entries(PAGE_SEO as Record<string, PageSeo>).filter(
      ([path]) => path !== "/contact" || hasContact,
    );

  return {
    name: "site-seo",

    configResolved(config) {
      siteUrl = clean(config.env.VITE_SITE_URL);
      hasContact = !!config.env.VITE_SUPPORT_EMAIL?.trim();
    },

    transformIndexHtml() {
      if (!siteUrl) return;
      const image = `${siteUrl}/og-image.png`;
      return [
        { tag: "meta", attrs: { property: "og:image", content: image }, injectTo: "head" },
        { tag: "meta", attrs: { name: "twitter:image", content: image }, injectTo: "head" },
      ];
    },

    generateBundle() {
      const robots = [
        "User-agent: *",
        "Allow: /",
        ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
        ...(siteUrl ? ["", `Sitemap: ${siteUrl}/sitemap.xml`] : []),
        "",
      ].join("\n");
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });

      if (!siteUrl) return;
      const urls = pages()
        .filter(([, page]) => !page.noindex)
        .map(([path]) => `  <url><loc>${siteUrl}${path}</loc></url>`)
        .join("\n");
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
    },

    // The built index.html is the template for every page. Cloudflare Pages
    // serves /pricing from pricing/index.html, and keeps falling back to
    // index.html for every other path (the signed-in app).
    writeBundle(options, bundle) {
      const template = bundle["index.html"];
      if (template?.type !== "asset" || !options.dir) return;
      const base = String(template.source);

      for (const [path, page] of pages()) {
        const html = pageHtml(base, path, page, siteUrl);
        if (path === "/") {
          writeFileSync(join(options.dir, "index.html"), html);
          continue;
        }
        const folder = join(options.dir, path);
        mkdirSync(folder, { recursive: true });
        writeFileSync(join(folder, "index.html"), html);
      }
    },
  };
}

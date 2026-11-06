import { useEffect } from "react";
import { PAGE_SEO, type SeoPath } from "@/constants/pageSeo";
import { SITE_URL } from "@/constants/site";
import { setLink, setMeta, setTitle } from "@/shared/libs/headTags";

// Title and search/social tags for one of the pages listed in PAGE_SEO. The
// build already wrote the same tags into that page's HTML; this keeps them
// right when you arrive by clicking around, replacing the previous page's
// rather than adding a second set (see headTags).
const PageMeta = ({ path }: { path: SeoPath }) => {
  const { title, ...rest } = PAGE_SEO[path];
  const description = "description" in rest ? rest.description : undefined;
  const noindex = "noindex" in rest && rest.noindex;
  const canonical = SITE_URL && !noindex ? SITE_URL + path : undefined;

  useEffect(() => {
    const undo = [
      setTitle(title),
      setMeta({ property: "og:title" }, title),
      description && setMeta({ name: "description" }, description),
      description && setMeta({ property: "og:description" }, description),
      canonical && setLink("canonical", canonical),
      canonical && setMeta({ property: "og:url" }, canonical, true),
      noindex && setMeta({ name: "robots" }, "noindex", true),
    ];
    return () => undo.forEach((restore) => restore && restore());
  }, [title, description, canonical, noindex]);

  return null;
};

export default PageMeta;

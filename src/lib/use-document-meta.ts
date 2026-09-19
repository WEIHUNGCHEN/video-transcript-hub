import { useEffect } from "react";

type Meta = {
  title: string;
  description: string;
  robots?: string;
  twitterCard?: string;
};

function setTag(attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// Replaces TanStack Router's per-route head(): there is no SSR any more, so the
// tags are written on mount instead of being rendered into the HTML shell.
export function useDocumentMeta({ title, description, robots, twitterCard }: Meta) {
  useEffect(() => {
    document.title = title;
    setTag("name", "description", description);
    setTag("property", "og:title", title);
    setTag("property", "og:description", description);
    setTag("property", "og:type", "website");
    setTag("name", "twitter:card", twitterCard ?? "summary_large_image");
    if (robots) setTag("name", "robots", robots);
  }, [title, description, robots, twitterCard]);
}

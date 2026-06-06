import DOMPurify from "isomorphic-dompurify";

// Sanitize editor-produced HTML before persisting, to prevent stored XSS.
// Allows a conservative set of formatting tags + links + images.
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
      "img",
      "hr",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/)/i,
  });
}

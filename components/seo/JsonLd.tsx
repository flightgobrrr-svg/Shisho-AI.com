/**
 * Structured data for search engines. `<` is escaped so a value can never
 * close the script tag early. Only describe what the page truly is: a tool is
 * a WebApplication, a reference page is an Article — no ratings, reviews or
 * offers, because there are none.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

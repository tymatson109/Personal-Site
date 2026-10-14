import { describe, expect, it } from "vitest";
import { feedDate, parseSubstackFeed, postBlocks, postEntryInput, postSlug, type SubstackPost } from "./substack";

const item = (fields: string) => `<item>${fields}</item>`;

const feed = (...items: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0"><channel><title>Ty</title>${items.join("")}</channel></rss>`;

const FULL = item(
  `<title><![CDATA[On building & shipping]]></title>
   <description><![CDATA[Why small   apps win]]></description>
   <link>https://tymatson.substack.com/p/on-building</link>
   <pubDate>Mon, 06 Oct 2026 23:30:00 GMT</pubDate>
   <content:encoded><![CDATA[<p>First <strong>para</strong> &amp; more.</p><h2>A heading</h2>]]></content:encoded>`,
);

const post = (change: Partial<SubstackPost> = {}): SubstackPost => ({
  url: "https://tymatson.substack.com/p/on-building",
  title: "On building",
  summary: "",
  date: "2026-10-06",
  blocks: [],
  ...change,
});

describe("parseSubstackFeed", () => {
  it("reads a post's link, title, summary, date and story from the feed", () => {
    expect(parseSubstackFeed(feed(FULL))).toEqual([
      {
        url: "https://tymatson.substack.com/p/on-building",
        title: "On building & shipping",
        summary: "Why small apps win",
        date: "2026-10-06",
        blocks: [
          { type: "p", text: "First para & more." },
          { type: "h", text: "A heading" },
        ],
      },
    ]);
  });

  it("decodes the HTML entities Substack leaves inside a title and summary", () => {
    const encoded = item(
      `<title><![CDATA[Ty&#8217;s notes &amp; more]]></title>
       <description><![CDATA[Key evidence is individuals&#8217; cooperation &#8212; mostly.]]></description>
       <link>https://tymatson.substack.com/p/notes</link>
       <pubDate>Mon, 06 Oct 2026 23:30:00 GMT</pubDate>`,
    );
    const [parsed] = parseSubstackFeed(feed(encoded));
    expect(parsed.title).toBe("Ty’s notes & more");
    expect(parsed.summary).toBe("Key evidence is individuals’ cooperation — mostly.");
  });

  it("decodes entity-encoded text in a title and summary written without CDATA", () => {
    const plain = item(
      `<title>Henrich&amp;#8217;s mechanism</title>
       <description>Following Henrich&amp;#8217;s mechanism &amp;amp; more.</description>
       <link>https://x.substack.com/p/a</link>
       <pubDate>Mon, 06 Oct 2026 10:00:00 GMT</pubDate>`,
    );
    const [parsed] = parseSubstackFeed(feed(plain));
    expect(parsed.title).toBe("Henrich\u2019s mechanism");
    expect(parsed.summary).toBe("Following Henrich\u2019s mechanism & more.");
  });

  it("leaves out an item with no link, a link that isn't https, no title or no date", () => {
    const missing = [
      item(`<title>No link</title><pubDate>Mon, 06 Oct 2026 10:00:00 GMT</pubDate>`),
      item(`<title>Plain http</title><link>http://x.substack.com/p/a</link><pubDate>Mon, 06 Oct 2026 10:00:00 GMT</pubDate>`),
      item(`<link>https://x.substack.com/p/b</link><pubDate>Mon, 06 Oct 2026 10:00:00 GMT</pubDate>`),
      item(`<title>No date</title><link>https://x.substack.com/p/c</link>`),
    ];
    expect(parseSubstackFeed(feed(...missing))).toEqual([]);
  });

  it("returns nothing for text that isn't a feed", () => {
    expect(parseSubstackFeed("<html><body>Not found</body></html>")).toEqual([]);
  });
});

describe("postBlocks", () => {
  it("turns paragraphs, headings, quotes and code into the matching blocks", () => {
    const html = `<p>Hello</p><h3>Part two</h3><blockquote><p>One line.</p><p>Two line.</p></blockquote><pre><code>const x = 1;\nx++;\n</code></pre>`;
    expect(postBlocks(html)).toEqual([
      { type: "p", text: "Hello" },
      { type: "h", text: "Part two" },
      { type: "quote", text: "One line.\nTwo line." },
      { type: "code", text: "const x = 1;\nx++;" },
    ]);
  });

  it("writes list items as bullet and numbered lines", () => {
    expect(postBlocks("<ul><li>one</li><li>two</li></ul><ol><li>first</li></ol>")).toEqual([
      { type: "p", text: "• one" },
      { type: "p", text: "• two" },
      { type: "p", text: "1. first" },
    ]);
  });

  it("drops images, embeds and Substack's subscribe boxes", () => {
    const html = `<div class="captioned-image-container"><figure><img src="https://substackcdn.com/x.jpg"><figcaption>cap</figcaption></figure></div><div class="subscription-widget-wrap"><p>Thanks for reading!</p><form><input type="email"></form></div><iframe src="https://youtube.com"></iframe><p>Kept</p>`;
    expect(postBlocks(html)).toEqual([{ type: "p", text: "Kept" }]);
  });

  it("keeps line breaks, keeps link text and drops the markup around it", () => {
    expect(postBlocks(`<p>Last<br>line <a href="https://x.com">link</a> <script>alert(1)</script></p>`)).toEqual([
      { type: "p", text: "Last\nline link" },
    ]);
  });

  it("skips empty paragraphs", () => {
    expect(postBlocks("<p> </p><p>Text</p><p><br></p>")).toEqual([{ type: "p", text: "Text" }]);
  });
});

describe("feedDate", () => {
  it("gives the UTC day of a feed date and null for anything else", () => {
    expect(feedDate("Mon, 06 Oct 2026 23:30:00 GMT")).toBe("2026-10-06");
    expect(feedDate("not a date")).toBeNull();
  });
});

describe("postSlug", () => {
  it("uses Substack's own slug from the post's link", () => {
    expect(postSlug(post(), [])).toBe("on-building");
  });

  it("numbers the slug when the section already uses it", () => {
    expect(postSlug(post(), ["on-building"])).toBe("on-building-2");
  });

  it("falls back to the title when the link has no path", () => {
    expect(postSlug(post({ url: "https://tymatson.substack.com/", title: "Hello World" }), [])).toBe("hello-world");
  });
});

describe("postEntryInput", () => {
  it("publishes a synced post at once with no tags, quote, facts or feature", () => {
    expect(postEntryInput(post({ summary: "Line" }), "writing", "on-building")).toEqual({
      section: "writing",
      slug: "on-building",
      title: "On building",
      summary: "Line",
      date: "2026-10-06",
      tags: [],
      featured: false,
      status: "live",
      quote: "",
      facts: [],
      blocks: [],
    });
  });
});

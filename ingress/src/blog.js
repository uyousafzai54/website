import {
  THEME_BOOT_SCRIPT,
  THEME_PALETTE_CSS,
  THEME_TOGGLE_CSS,
  THEME_TOGGLE_HTML,
  THEME_TOGGLE_JS,
} from "./theme.js";
import { SITE_ORIGIN, AUTHOR } from "./site.js";

const BLOG_PATH = "/blog";
const SITE_TITLE = AUTHOR;
const BLOG_DESCRIPTION =
  "Umar Yousafzai's blog: numbered RFC-style notes on infrastructure, networking, " +
  "observability, and a TCP/IP stack for seL4.";

// Posts are numbered like IETF RFCs: `number` gives the canonical URL
// (/blog/rfc<number>) and the "RFC <number>: <title>" display title; `aliases`
// are old slugs that 301 to it. `date` is YYYY-MM-DD. `category` is the RFC
// category shown in the memo header (Informational, Experimental, ...); a post
// with `draft: true` is rendered as a work in progress ("currently writing")
// and left out of the feed and sitemap. `html` is the body and should use
// numbered <h2>s ("1. Introduction"). Titles are all lowercase. It lives inside a
// template literal, so avoid backticks and "${" in post content. Set `updated`
// (YYYY-MM-DD) when editing a published post. Atom entry ids are derived from
// `aliases[0]` when present so renaming a URL does not re-deliver the post.
// Newest first.
export const POSTS = [
  {
    number: 2,
    aliases: ["on-predicting-the-future"],
    title: "on predicting the future",
    date: "2026-10-09",
    draft: true,
    html: "<p>private cloud compute.</p>",
  },
  {
    number: 1,
    aliases: ["hello-world"],
    title: "on saying hello",
    date: "2026-10-09",
    updated: "2026-10-10",
    category: "Informational",
    html: `
<h2>1. Introduction</h2>

<p>Hello, world. This is the first document in the series, mostly to check that everything renders.</p>

<h2>2. Scope</h2>

<p>
  Documents in this blog cover infrastructure, networking, observability, and computer systems. An <a href="/blog/feed.xml">Atom feed</a> lists
  published documents.
</p>

<h2>3. Reference Implementation</h2>

<pre><code>#include &lt;stdio.h&gt;

int main(void) {
  printf("hello, world\\n");
  return 0;
}</code></pre>

<h2>4. Acknowledgements</h2>

<p>
  The blog itself was built by <a href="https://devin.ai">Devin</a>. All words
  and opinions are mine, however.
</p>
`,
  },
];

const BLOG_CSS = `
    html {
      -webkit-text-size-adjust: 100%;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--fg);
      font-family: "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
      font-size: 20px;
      line-height: 1.5;
    }

    @font-face {
      font-family: "Berkeley Mono";
      src: url("/fonts/BerkeleyMono-Regular.woff2") format("woff2");
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }

    h1, h2, h3, h4,
    .author__site-title,
    .postlist__date,
    .author__post-date,
    .adjacent-posts__relative,
    pre, code {
      font-family: "Berkeley Mono", "IBM Plex Mono", Menlo, monospace;
    }

    #main {
      max-width: 750px;
      width: 100%;
      margin: 0 auto 30px;
      padding: 0 10px;
      box-sizing: border-box;
    }

    .homepage #main {
      max-width: 520px;
    }

    a {
      color: var(--accent);
      text-decoration: none;
    }

    a:hover {
      border-bottom: 1px solid currentColor;
    }

    p {
      margin: 0 0 30px;
    }

    .author {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 48px auto 30px;
      text-align: center;
      line-height: 1.25;
    }

    .author__site-title {
      font-size: 30px;
      font-weight: 700;
      color: inherit;
    }

    .author__site-title:hover {
      border-bottom: none;
      color: var(--accent);
    }

    .author__elsewhere {
      margin-top: 6px;
      font-size: 16px;
      color: var(--muted);
    }

    .author__elsewhere a {
      color: inherit;
    }

    .author__elsewhere a + a::before {
      content: "·";
      margin: 0 8px;
      color: var(--muted);
    }

    .author__post-date {
      margin-top: 6px;
      font-size: 16px;
      color: var(--muted);
    }

    ul.postlist {
      margin: 0 0 30px;
      padding: 0;
      list-style: none;
    }

    .postlist li + li {
      margin-top: 15px;
    }

    .postlist__date {
      display: block;
      font-size: 16px;
      line-height: 1.25;
      color: var(--muted);
    }

    article > * {
      margin: 0 auto 30px;
    }

    h1, h2, h3, h4 {
      margin: 0 0 10px;
      line-height: 1.5;
      font-weight: 700;
    }

    h1.title {
      font-size: 34px;
      text-align: center;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }

    h2 {
      font-size: 26px;
      color: var(--text-strong);
    }

    h3 {
      font-size: 22px;
      color: var(--muted);
    }

    p + h2, p + h3 {
      margin-top: 45px;
    }

    p > code {
      font-size: 85%;
      padding: 0.1em 0.35em;
      background: var(--bar-bg);
      border-radius: 3px;
    }

    pre {
      font-size: 70%;
      line-height: 1.6;
      padding: 14px 18px;
      overflow-x: auto;
      background: var(--bar-bg);
      border-left: 4px solid var(--accent);
    }

    blockquote {
      margin: 0 0 30px;
      padding: 0 3em 0 2em;
      font-style: italic;
      color: var(--text);
    }

    ol, ul {
      padding-left: 1.75em;
    }

    li + li {
      margin-top: 15px;
    }

    img {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 0 auto;
    }

    hr {
      border: 0;
      border-bottom: 1px solid var(--rule);
      width: 80%;
      margin: 0 auto 30px;
    }

    .adjacent-posts {
      display: flex;
      justify-content: space-between;
      gap: 30px;
      margin-bottom: 30px;
    }

    .adjacent-posts__relative {
      display: block;
      text-transform: uppercase;
      font-size: 14px;
      line-height: 1;
      margin-bottom: 6px;
      color: var(--muted);
    }

    .adjacent-posts__next {
      margin-left: auto;
      text-align: right;
    }

    .postlist__num {
      font-family: "Berkeley Mono", monospace;
      font-size: 15px;
      color: var(--muted);
      margin-right: 0.6em;
    }

    .rfc-header {
      font-family: "Berkeley Mono", monospace;
      font-size: 13px;
      line-height: 1.6;
      color: var(--muted);
      margin: 0 0 36px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--rule-soft);
    }

    .rfc-header__row {
      display: flex;
      justify-content: space-between;
      gap: 1em;
    }

    .rfc-header__row span:last-child {
      text-align: right;
    }

    @media (max-width: 480px) {
      .rfc-header__row {
        flex-direction: column;
        gap: 0;
      }
      .rfc-header__row span:last-child {
        text-align: left;
        padding-left: 1.5em;
      }
    }

    article h2 {
      font-size: 22px;
      margin-top: 36px;
    }

    .rfc-address {
      font-family: "Berkeley Mono", monospace;
      font-size: 14px;
      line-height: 1.7;
      margin: 0 0 30px 1.5em;
    }

    table.keyfacts {
      border-collapse: collapse;
      margin: 0 0 24px;
      font-size: 16px;
    }

    table.keyfacts th {
      text-align: left;
      font-weight: 500;
      color: var(--muted);
      padding: 4px 1.5em 4px 0;
      white-space: nowrap;
      vertical-align: top;
    }

    table.keyfacts td {
      padding: 4px 0;
      font-family: "Berkeley Mono", monospace;
      font-size: 14px;
      word-break: break-word;
    }
`;

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function rfcLabel(post) {
  return `RFC ${post.number}`;
}

function displayTitle(post) {
  const t = `${rfcLabel(post)}: ${post.title}`;
  return post.draft ? `${t} (currently writing)` : t;
}

function categoryOf(post) {
  return post.draft ? "Internet-Draft" : post.category || "Informational";
}

function formatMonthYear(iso) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function memoHeader(post) {
  const rows = [
    ["umaryousafzai.net", "U. Yousafzai"],
    [`Request for Comments: ${post.number}`, "University of Waterloo"],
    [`Category: ${categoryOf(post)}`, formatMonthYear(post.date)],
  ];
  if (post.updated) rows.push([`Updated: ${post.updated}`, ""]);
  return `
      <div class="rfc-header">${rows
        .map(([l, r]) => `
        <div class="rfc-header__row"><span>${escapeHtml(l)}</span><span>${escapeHtml(r)}</span></div>`)
        .join("")}
      </div>`;
}

function authorAddress() {
  return `
      <h2>Author's Address</h2>
      <address class="rfc-address">
        Umar Yousafzai<br />
        University of Waterloo<br />
        uyousafz [at] icloud.com, uyousafz [at] poke.com, uyousafz [at] uwaterloo.ca<br />
        URI: <a href="${SITE_ORIGIN}/">${SITE_ORIGIN.replace("https://", "")}</a><br />
        GitHub: <a href="https://github.com/uyousafzai54">uyousafzai54</a><br />
        PGP: <a href="/gpg">A702 6E4B F9DC 4C64 BA78 5875 AC37 4434 5793 BB94</a>
      </address>`;
}

function lastModified(post) {
  return post.updated || post.date;
}

function newestModified(posts) {
  return posts.map(lastModified).sort().pop();
}

function postUrl(post) {
  return `${BLOG_PATH}/rfc${post.number}`;
}

function entryId(post) {
  const slug = (post.aliases && post.aliases[0]) || `rfc${post.number}`;
  return `${SITE_ORIGIN}${BLOG_PATH}/${slug}`;
}

export function authorBlock({ date } = {}) {
  return `
    <header class="author">
      <a href="${BLOG_PATH}" class="author__site-title">${escapeHtml(SITE_TITLE)}</a>
      <div class="author__elsewhere">
        <a href="/">home</a><a href="https://github.com/uyousafzai54">github</a><a href="${BLOG_PATH}/feed.xml">feed</a><a href="/gpg">gpg</a>
      </div>
      ${date ? `<span class="author__post-date">${escapeHtml(formatDate(date))}</span>` : ""}
    </header>`;
}

export function page({ title, path, bodyClass, content }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
${THEME_BOOT_SCRIPT}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="alternate" type="application/atom+xml" title="${escapeHtml(SITE_TITLE)}" href="${BLOG_PATH}/feed.xml">
  <link rel="canonical" href="${SITE_ORIGIN}${path}" />
  <meta name="description" content="${escapeHtml(BLOG_DESCRIPTION)}" />
  <meta property="og:type" content="${bodyClass === "post" ? "article" : "website"}" />
  <meta property="og:site_name" content="${escapeHtml(SITE_TITLE)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:url" content="${SITE_ORIGIN}${path}" />
  <meta name="twitter:card" content="summary" />
  <title>${escapeHtml(title)}</title>

  <style>
${THEME_PALETTE_CSS}
${BLOG_CSS}
${THEME_TOGGLE_CSS}
  </style>
</head>

<body class="${bodyClass}">
  ${THEME_TOGGLE_HTML}
  <div id="main">
${content}
  </div>

  <script>
${THEME_TOGGLE_JS}
  </script>
</body>
</html>
`;
}

export function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "cache-control": "public, max-age=60",
    },
  });
}

function renderIndex() {
  const items = POSTS.map(
    (p) => `
      <li>
        <span class="postlist__num">${escapeHtml(rfcLabel(p))}</span><a href="${postUrl(p)}">${escapeHtml(p.title)}</a>
        <span class="postlist__date">${escapeHtml(formatDate(p.date))} · ${escapeHtml(p.draft ? "Internet-Draft (currently writing)" : categoryOf(p))}</span>
      </li>`
  ).join("");

  return page({
    title: `Blog :: ${SITE_TITLE}`,
    path: BLOG_PATH,
    bodyClass: "homepage",
    content: `${authorBlock()}

    <p>Hi there! I'm Umar. Documents here are numbered like RFCs, newest first:</p>

    <ul class="postlist">${items}
    </ul>`,
  });
}

function renderPost(post) {
  const i = POSTS.indexOf(post);
  const newer = POSTS[i - 1];
  const older = POSTS[i + 1];
  const adjacent =
    newer || older
      ? `
    <nav class="adjacent-posts">
      ${older ? `<a class="adjacent-posts__prev" href="${postUrl(older)}"><span class="adjacent-posts__relative">Older</span>${escapeHtml(displayTitle(older))}</a>` : ""}
      ${newer ? `<a class="adjacent-posts__next" href="${postUrl(newer)}"><span class="adjacent-posts__relative">Newer</span>${escapeHtml(displayTitle(newer))}</a>` : ""}
    </nav>`
      : "";

  return page({
    title: `${displayTitle(post)} :: ${SITE_TITLE}`,
    path: postUrl(post),
    bodyClass: "post",
    content: `${authorBlock({ date: post.date })}

    <article>${memoHeader(post)}
      <h1 class="title">${escapeHtml(post.title)}</h1>
${post.html}${authorAddress()}
    </article>

    <hr />
${adjacent}
    <p><a href="${BLOG_PATH}">← all posts</a></p>`,
  });
}

function renderNotFound() {
  return page({
    title: `Not found :: ${SITE_TITLE}`,
    path: BLOG_PATH,
    bodyClass: "homepage",
    content: `${authorBlock()}

    <p>There's no post here.</p>

    <p><a href="${BLOG_PATH}">← all posts</a></p>`,
  });
}

function renderFeed() {
  const origin = SITE_ORIGIN;
  const published = POSTS.filter((p) => !p.draft);
  const updated = published.length ? `${newestModified(published)}T00:00:00Z` : new Date().toISOString();
  const entries = published.map(
    (p) => `
  <entry>
    <title>${escapeHtml(`${rfcLabel(p)}: ${p.title}`)}</title>
    <link href="${origin}${postUrl(p)}" />
    <id>${entryId(p)}</id>
    <published>${p.date}T00:00:00Z</published>
    <updated>${lastModified(p)}T00:00:00Z</updated>
    <content type="html">${escapeHtml(p.html)}</content>
  </entry>`
  ).join("");

  return new Response(
    `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeHtml(SITE_TITLE)}</title>
  <link href="${origin}${BLOG_PATH}" />
  <link href="${origin}${BLOG_PATH}/feed.xml" rel="self" />
  <id>${origin}${BLOG_PATH}</id>
  <updated>${updated}</updated>
  <author><name>${escapeHtml(AUTHOR)}</name></author>${entries}
</feed>
`,
    {
      headers: {
        "Content-Type": "application/atom+xml; charset=UTF-8",
        "cache-control": "public, max-age=300",
      },
    }
  );
}

// Sitemap for the whole site: homepage, blog index, and published posts.
export function renderSitemap() {
  const published = POSTS.filter((p) => !p.draft);
  const urls = [
    { loc: "/" },
    { loc: "/gpg" },
    { loc: BLOG_PATH, lastmod: newestModified(published) },
    ...published.map((p) => ({ loc: postUrl(p), lastmod: lastModified(p) })),
  ]
    .map(
      ({ loc, lastmod }) => `
  <url>
    <loc>${SITE_ORIGIN}${loc}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=UTF-8", "cache-control": "public, max-age=3600" } }
  );
}

// Returns a Response for /blog paths, or null if the request isn't for the blog.
export function handleBlog(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path !== BLOG_PATH && !path.startsWith(BLOG_PATH + "/")) return null;

  if (path.length > BLOG_PATH.length + 1 && path.endsWith("/")) {
    return Response.redirect(`${url.origin}${path.slice(0, -1)}${url.search}`, 301);
  }

  const rest = path.slice(BLOG_PATH.length + 1);
  if (rest === "") return htmlResponse(renderIndex());
  if (rest === "feed.xml") return renderFeed();

  const m = /^rfc(\d+)$/.exec(rest);
  const post = m ? POSTS.find((p) => p.number === Number(m[1])) : null;
  if (post) return htmlResponse(renderPost(post));

  const aliased = POSTS.find((p) => (p.aliases || []).includes(rest));
  if (aliased) return Response.redirect(`${url.origin}${postUrl(aliased)}${url.search}`, 301);

  return htmlResponse(renderNotFound(), 404);
}

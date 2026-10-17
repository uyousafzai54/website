import {
  THEME_BOOT_SCRIPT,
  THEME_PALETTE_CSS,
  THEME_TOGGLE_CSS,
  THEME_TOGGLE_HTML,
  THEME_TOGGLE_JS,
} from "./theme.js";
import { SITE_ORIGIN, BLOG_HOST, BLOG_ORIGIN, AUTHOR } from "./site.js";

// The blog used to live under umaryousafzai.net/blog; those paths 301 to
// BLOG_ORIGIN, and Atom ids keep the old form because ids are permanent.
const LEGACY_BLOG_PATH = "/blog";
const SITE_TITLE = AUTHOR;
const BLOG_DESCRIPTION =
  "Umar Yousafzai's blog: numbered RFC-style notes on infrastructure, networking, " +
  "observability, and a TCP/IP stack for seL4.";

// Posts live in ../posts/*.md (front matter + Markdown; format in posts/README.md)
// and are rendered into posts.generated.js by scripts/build-posts.mjs, which
// wrangler runs before every dev/deploy (`build.command`). Each post has
// `number` (URL <BLOG_ORIGIN>/rfc<number>, title "RFC <number>: <title>"), `title`
// (lowercase), `date`/`updated` (YYYY-MM-DD), `category`, `draft`, `aliases`
// (old slugs that 301; aliases[0] is the stable Atom id) and rendered `html`.
import { POSTS } from "./posts.generated.js";

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
    pre, code, .terminal__title {
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

    /* separator lives outside the <a> so the hover border only spans the word */
    .author__sep {
      margin: 0 8px;
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

    /* Terminal panel (same look as the homepage probe): --term-* inverts in dark mode. */
    .terminal {
      margin: 0 0 30px;
      background: var(--term-bg);
      border: 1px solid var(--term-border);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: var(--term-shadow);
    }

    .terminal__bar {
      height: 34px;
      display: flex;
      align-items: center;
      position: relative;
      padding: 0 12px;
      background: var(--term-bar);
      border-bottom: 1px solid var(--term-bar-border);
    }

    .terminal__dots {
      display: flex;
      gap: 6px;
    }

    .terminal__dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--term-dot);
    }

    .terminal__title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      letter-spacing: 0.04em;
      color: var(--term-title);
    }

    .terminal pre {
      margin: 0;
      padding: 18px 20px 20px;
      font-size: 60%;
      line-height: 1.65;
      color: var(--term-fg);
      background: none;
      border: 0;
      white-space: normal;
    }

    /* One line per span (the newlines between them collapse); wrapped
       continuations hang under the "gpg: " column. */
    .terminal__line {
      display: block;
      padding-left: 5ch;
      text-indent: -5ch;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }

    /* Commands are mostly URLs/paths: wrap them at the column edge like a real tty. */
    .terminal__line--cmd {
      word-break: break-all;
    }

    .terminal__prompt {
      color: var(--term-hint);
      user-select: none;
    }

    .terminal__cursor {
      display: inline-block;
      width: 0.6ch;
      height: 1.1em;
      vertical-align: text-bottom;
      background: var(--term-fg);
      animation: terminal-blink 1s steps(1) infinite;
    }

    @keyframes terminal-blink {
      50% { opacity: 0; }
    }

    blockquote {
      margin: 0 0 30px;
      padding: 0 3em 0 2em;
      font-family: "Berkeley Mono", "IBM Plex Mono", Menlo, monospace;
      font-size: 85%;
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

    article p {
      text-align: justify;
      text-indent: 1.5em;
      -webkit-hyphens: auto;
      hyphens: auto;
    }

    /* Figures are a lone <a><img></a> inside a <p>; don't nudge them off the left edge. */
    article p:has(> a:only-child > img:only-child) {
      text-indent: 0;
    }

    /* Reference entries: hanging indent, left aligned so a long URL does not stretch the line. */
article p.ref {
  text-align: left;
  text-indent: -2.5em;
  padding-left: 2.5em;
  overflow-wrap: anywhere;
  -webkit-hyphens: manual;
  hyphens: manual;
}

article blockquote p {
      text-align: left;
      text-indent: 0;
      -webkit-hyphens: manual;
      hyphens: manual;
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
  return `/rfc${post.number}`;
}

function entryId(post) {
  const slug = (post.aliases && post.aliases[0]) || `rfc${post.number}`;
  return `${SITE_ORIGIN}${LEGACY_BLOG_PATH}/${slug}`;
}

export function authorBlock({ date } = {}) {
  return `
    <header class="author">
      <a href="${BLOG_ORIGIN}/" class="author__site-title">${escapeHtml(SITE_TITLE)}</a>
      <div class="author__elsewhere">
        <a href="${SITE_ORIGIN}/">home</a><span class="author__sep">·</span><a href="https://github.com/uyousafzai54">github</a><span class="author__sep">·</span><a href="${BLOG_ORIGIN}/feed.xml">feed</a><span class="author__sep">·</span><a href="${SITE_ORIGIN}/gpg">gpg</a>
      </div>
      ${date ? `<span class="author__post-date">${escapeHtml(formatDate(date))}</span>` : ""}
    </header>`;
}

// Replays each .terminal once it scrolls into view: command lines are typed
// out, output lines appear after each command. The full transcript is in the
// HTML, so no-JS readers, feeds and crawlers still get it; reduced-motion
// users keep the static version.
const TERMINAL_REPLAY_JS = `    (function () {
      if (!("IntersectionObserver" in window)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var TYPE_MS = 28, LINE_MS = 60, RUN_MS = 350;
      function replay(pre) {
        var lines = Array.prototype.map.call(pre.querySelectorAll(".terminal__line"), function (el) {
          var prompt = el.querySelector(".terminal__prompt");
          return { prompt: !!prompt, text: prompt ? el.textContent.slice(prompt.textContent.length) : el.textContent };
        });
        if (!lines.length) return;
        pre.style.minHeight = pre.getBoundingClientRect().height + "px";
        pre.textContent = "";
        var cursor = document.createElement("span");
        cursor.className = "terminal__cursor";
        var i = 0;
        function next() {
          if (i >= lines.length) { pre.style.minHeight = ""; return; }
          var line = lines[i++];
          var el = document.createElement("span");
          el.className = line.prompt ? "terminal__line terminal__line--cmd" : "terminal__line";
          if (line.prompt) {
            var p = document.createElement("span");
            p.className = "terminal__prompt";
            p.textContent = "$";
            el.appendChild(p);
            var txt = document.createTextNode("");
            el.appendChild(txt);
            el.appendChild(cursor);
            pre.appendChild(el);
            pre.appendChild(document.createTextNode("\\n"));
            var j = 0;
            (function type() {
              if (j < line.text.length) {
                txt.data = line.text.slice(0, ++j);
                setTimeout(type, TYPE_MS);
              } else if (i < lines.length) {
                cursor.remove();
                setTimeout(next, RUN_MS);
              } else {
                pre.style.minHeight = "";
              }
            })();
          } else {
            el.textContent = line.text;
            pre.appendChild(el);
            pre.appendChild(document.createTextNode("\\n"));
            setTimeout(next, LINE_MS);
          }
        }
        next();
      }
      var seen = new WeakSet();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting || seen.has(e.target)) return;
          seen.add(e.target);
          io.unobserve(e.target);
          replay(e.target);
        });
      }, { threshold: 0.25 });
      document.querySelectorAll(".terminal pre").forEach(function (pre) { io.observe(pre); });
    })();`;

// `origin` is the host the page is served on (canonical/og:url); blog pages
// default to BLOG_ORIGIN, pages on the main site pass SITE_ORIGIN.
export function page({ title, path, bodyClass, content, origin = BLOG_ORIGIN }) {
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
  <link rel="alternate" type="application/atom+xml" title="${escapeHtml(SITE_TITLE)}" href="${BLOG_ORIGIN}/feed.xml">
  <link rel="canonical" href="${origin}${path}" />
  <meta name="description" content="${escapeHtml(BLOG_DESCRIPTION)}" />
  <meta property="og:type" content="${bodyClass === "post" ? "article" : "website"}" />
  <meta property="og:site_name" content="${escapeHtml(SITE_TITLE)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:url" content="${origin}${path}" />
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
${TERMINAL_REPLAY_JS}
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
    path: "/",
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
    <p><a href="/">← all posts</a></p>`,
  });
}

function renderNotFound() {
  return page({
    title: `Not found :: ${SITE_TITLE}`,
    path: "/",
    bodyClass: "homepage",
    content: `${authorBlock()}

    <p>There's no post here.</p>

    <p><a href="/">← all posts</a></p>`,
  });
}

function renderFeed() {
  const published = POSTS.filter((p) => !p.draft);
  const updated = published.length ? `${newestModified(published)}T00:00:00Z` : new Date().toISOString();
  const entries = published.map(
    (p) => `
  <entry>
    <title>${escapeHtml(`${rfcLabel(p)}: ${p.title}`)}</title>
    <link href="${BLOG_ORIGIN}${postUrl(p)}" />
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
  <link href="${BLOG_ORIGIN}/" />
  <link href="${BLOG_ORIGIN}/feed.xml" rel="self" />
  <id>${SITE_ORIGIN}${LEGACY_BLOG_PATH}</id>
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

// Sitemaps may only list URLs on the host that serves them, so each host gets
// its own: the blog host lists the index and published posts, the main site
// lists the homepage and /gpg.
export function renderSitemap(url) {
  const published = POSTS.filter((p) => !p.draft);
  const urls =
    url.hostname === BLOG_HOST
      ? [
          { loc: `${BLOG_ORIGIN}/`, lastmod: newestModified(published) },
          ...published.map((p) => ({ loc: `${BLOG_ORIGIN}${postUrl(p)}`, lastmod: lastModified(p) })),
        ]
      : [{ loc: `${SITE_ORIGIN}/` }, { loc: `${SITE_ORIGIN}/gpg` }];
  const body = urls
    .map(
      ({ loc, lastmod }) => `
  <url>
    <loc>${loc}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=UTF-8", "cache-control": "public, max-age=3600" } }
  );
}

// Old umaryousafzai.net/blog[/...] URLs (on any host) 301 to the same path on
// the blog host, trailing slash dropped so the hop lands on the final URL.
function redirectLegacyBlogPath(url) {
  const path = url.pathname;
  if (path !== LEGACY_BLOG_PATH && !path.startsWith(LEGACY_BLOG_PATH + "/")) return null;
  const rest = path.slice(LEGACY_BLOG_PATH.length).replace(/\/+$/, "") || "/";
  return Response.redirect(`${BLOG_ORIGIN}${rest}${url.search}`, 301);
}

// Returns a Response for the blog host (every path except the site-wide
// /robots.txt and /sitemap.xml, which worker.js serves per host) or for a
// legacy /blog path elsewhere; null otherwise.
export function handleBlog(request) {
  const url = new URL(request.url);
  const legacy = redirectLegacyBlogPath(url);
  if (legacy) return legacy;
  if (url.hostname !== BLOG_HOST) return null;

  const path = url.pathname;
  if (path === "/robots.txt" || path === "/sitemap.xml") return null;

  if (path.length > 1 && path.endsWith("/")) {
    return Response.redirect(`${url.origin}${path.slice(0, -1)}${url.search}`, 301);
  }

  if (path === "/") return htmlResponse(renderIndex());
  if (path === "/feed.xml") return renderFeed();

  const rest = path.slice(1);
  const m = /^rfc(\d+)$/.exec(rest);
  const post = m ? POSTS.find((p) => p.number === Number(m[1])) : null;
  if (post) return htmlResponse(renderPost(post));

  const aliased = POSTS.find((p) => (p.aliases || []).includes(rest));
  if (aliased) return Response.redirect(`${url.origin}${postUrl(aliased)}${url.search}`, 301);

  return htmlResponse(renderNotFound(), 404);
}

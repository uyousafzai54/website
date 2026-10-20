import {
  THEME_BOOT_SCRIPT,
  THEME_PALETTE_CSS,
  THEME_TOGGLE_CSS,
  THEME_TOGGLE_HTML,
  THEME_TOGGLE_JS,
} from "./theme.js";
import { handleBlog, renderSitemap } from "./blog.js";
import { handleGpg } from "./gpg.js";
import { SITE_ORIGIN, BLOG_HOST, BLOG_ORIGIN, AUTHOR, TAGLINE, DESCRIPTION, TOPICS } from "./site.js";

function robotsTxt(url) {
  const origin = url.hostname === BLOG_HOST ? BLOG_ORIGIN : SITE_ORIGIN;
  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}

const PERSON_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: AUTHOR,
  url: `${SITE_ORIGIN}/`,
  description: DESCRIPTION,
  jobTitle: "Software Engineer",
  worksFor: { "@type": "Organization", name: "Ramp", url: "https://ramp.com" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Waterloo" },
  knowsAbout: TOPICS,
  sameAs: ["https://github.com/uyousafzai54", "https://www.linkedin.com/in/uyousafz"],
});

// Inline 24x24 glyphs for the homepage nav. GitHub and LinkedIn are the
// brand marks from Simple Icons (CC0); blog and gpg are Lucide stroke icons.
const navIcon = (body, stroke = false) =>
  `<svg class="site-nav__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"` +
  (stroke
    ? ` fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`
    : ` fill="currentColor">`) +
  body +
  `</svg>`;

const NAV_ICONS = {
  blog: navIcon(
    '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
    true,
  ),
  github: navIcon(
    '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  ),
  linkedin: navIcon(
    '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  ),
  gpg: navIcon(
    '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    true,
  ),
};

const PROBE_V4_URL = "https://ipv4.icanhazip.com";
const PROBE_V6_URL = "https://ipv6.icanhazip.com";

function isProbeRequest(request) {
  const url = new URL(request.url);
  return url.pathname === "/ip";
}

function probeResponse(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "cache-control": "no-store, max-age=0",
    "cloudflare-cdn-cache-control": "no-store",
  };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  const family = ip.includes(":") ? "ipv6" : ip ? "ipv4" : "unknown";
  return new Response(JSON.stringify({ ip, family }), { headers });
}

export default {
  async fetch(request, env, ctx) {
    if (isProbeRequest(request)) return probeResponse(request);

    const blog = handleBlog(request);
    if (blog) return blog;
    const gpg = handleGpg(request);
    if (gpg) return gpg;

    const url = new URL(request.url);
    const { pathname } = url;
    if (pathname === "/sitemap.xml") return renderSitemap(url);
    if (pathname === "/robots.txt") {
      return new Response(robotsTxt(url), {
        headers: { "Content-Type": "text/plain; charset=UTF-8", "cache-control": "public, max-age=3600" },
      });
    }

    const probeV4 = env.PROBE_V4_URL || PROBE_V4_URL;
    const probeV6 = env.PROBE_V6_URL || PROBE_V6_URL;

    const cf = request.cf || {};
    const edge = cf.colo || "unknown";
    const rtt = cf.clientQuicRtt ?? cf.clientTcpRtt ?? "?";
    const network = cf.asOrganization || "unknown";
    const asn = cf.asn ? `AS${cf.asn}` : "unknown";
    const protocol = cf.httpProtocol || "unknown";
    const tls = cf.tlsVersion || "unknown";
    const mbps = cf.edgeL4?.deliveryRate ? ((cf.edgeL4.deliveryRate * 8) / 1_000_000).toFixed(1) : "?";
    
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const city = cf.city || "unknown";
    const region = cf.region || "";
    const country = cf.country || "unknown";
    const timezone = cf.timezone || "unknown";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
${THEME_BOOT_SCRIPT}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <title>${AUTHOR} — ${TAGLINE}</title>
  <meta name="description" content="${DESCRIPTION}" />
  <link rel="canonical" href="${SITE_ORIGIN}/" />
  <link rel="alternate" type="application/atom+xml" title="${AUTHOR} — blog" href="${BLOG_ORIGIN}/feed.xml" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${AUTHOR}" />
  <meta property="og:title" content="${AUTHOR} — ${TAGLINE}" />
  <meta property="og:description" content="${DESCRIPTION}" />
  <meta property="og:url" content="${SITE_ORIGIN}/" />
  <meta name="twitter:card" content="summary" />
  <script type="application/ld+json">${PERSON_JSON_LD}</script>

  <style>
${THEME_PALETTE_CSS}

    body {
  background: var(--bg);
  color: var(--fg);
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 16px;
  line-height: 1.65;
  letter-spacing: -0.01em;
}

h1, h2, h3 {
  font-weight: 600;
  letter-spacing: -0.025em;
}

code,
pre,
.terminal {
  font-family: "IBM Plex Mono", monospace;
}

@font-face {
  font-family: "Berkeley Mono";
  src: url("/fonts/BerkeleyMono-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: "Berkeley Mono", monospace;
}

    h4 {
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }

    p {
      font-size: 1.2rem;
      color: var(--text);
    }

    a {
      color: var(--link);
      font-weight: 600;
    }

    ul {
      padding-left: 1.4rem;
    }

    li {
      margin-bottom: 0.65rem;
    }

    .coursework .course-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 1rem;
      width: 100%;
      font-family: "Berkeley Mono", monospace;
    }

    .coursework .grade {
      margin-left: auto;
      white-space: nowrap;
      font-weight: 700;
      color: var(--accent);
      font-family: "Berkeley Mono", monospace;
    }

    .coursework summary {
      cursor: pointer;
      list-style: none;
      margin-top: 2rem;
      padding: 0.45rem 0.7rem;
      border-left: 4px solid var(--accent);
      background: var(--bar-bg);
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      font-family: "Berkeley Mono", monospace;
    }

    .coursework summary::-webkit-details-marker {
      display: none;
    }

    .coursework summary::before {
      content: "▸ ";
      color: var(--accent);
    }

    .coursework[open] summary::before {
      content: "▾ ";
    }

    .coursework h4 {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      padding: 0.45rem 0.7rem;
      border-left: 4px solid var(--accent);
      background: var(--bar-bg);
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      font-family: "Berkeley Mono", monospace;
    }

    .coursework li {
      margin-bottom: 0.9rem;
    }

    .research-section {
      margin: 4rem 0;
    }

  .research-section h2 {
    display: inline-block;
    margin: 0 0 1rem;
    padding: 0.15rem 0.45rem;
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    background: var(--highlight-bg);
    color: var(--highlight-fg);
    font-family: "Berkeley Mono", monospace;
  }

  .research-section p {
    margin: 0;
    font-size: 1.15rem;
    line-height: 1.75;
    color: var(--text-strong);
  }

  .side-project {
  margin: 3rem 0;
  padding: 1.25rem 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

.side-project {
  margin: 3rem 0;
  padding: 1.25rem 0;
  border-top: 1px solid var(--rule-soft);
}

.side-project small {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--muted);
  font-size: 0.9rem;
  font-style: italic;
}

.side-project h3 {
  margin: 0 0 0.4rem;
  font-size: 1.3rem;
}

.side-project p,
.side-project ul {
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-body);
}

.side-project ul {
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}

.readings-section {
  margin-top: 2.5rem;
}

.readings-section h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.readings-list {
  margin: 0;
  padding-left: 1.2rem;
}

.readings-list li {
  margin-bottom: 0.55rem;
  line-height: 1.5;
}

.readings-list a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgba(127, 127, 127, 0.35);
}

.readings-list a:hover {
  border-bottom-color: currentColor;
}

.reading-meta {
  margin-left: 0.45rem;
  font-size: 0.85rem;
  opacity: 0.55;
}

.site-nav {
  margin: -0.25rem 0 1.75rem;
  font-family: "Berkeley Mono", monospace;
  font-size: 1.05rem;
}

.site-nav a {
  color: var(--muted);
  text-decoration: none;
  white-space: nowrap;
  border-bottom: 1px solid var(--rule);
}

.site-nav__icon {
  width: 1em;
  height: 1em;
  margin-right: 0.4em;
  vertical-align: -0.15em;
}

.site-nav a:hover {
  color: var(--link);
  border-bottom-color: currentColor;
}

.site-nav__blog {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-left: 4px solid var(--accent);
  background: var(--bar-bg);
  color: var(--link) !important;
  border-bottom: none !important;
  font-weight: 800;
}

.site-nav__blog:hover {
  background: var(--highlight-bg);
  color: var(--highlight-fg) !important;
}

.site-nav__sep {
  margin: 0 0.6em;
  color: var(--muted);
}

.network {
  font-family: "Berkeley Mono", monospace;
  font-size: 12px;
  opacity: 0.5;
} 

.network-terminal {
  width: 100%;
  max-width: 480px;
  background: var(--term-bg);
  border: 1px solid var(--term-border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--term-shadow);
}

.terminal-bar {
  height: 34px;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 12px;
  background: var(--term-bar);
  border-bottom: 1px solid var(--term-bar-border);
}

.terminal-dots {
  display: flex;
  gap: 6px;
}

.terminal-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--term-dot);
}

.terminal-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Berkeley Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--term-title);
}

.network-output {
  margin: 0;
  padding: 18px 20px 20px;
  font-family: "SFMono-Regular","SF Mono",Menlo,Consolas,monospace;
  font-size: 12px;
  line-height: 1.65;
  color: var(--term-fg);
  white-space: pre-wrap;
  overflow-x: auto;
}

.probe-hint {
  color: var(--term-hint);
}

${THEME_TOGGLE_CSS}

.site-footer {
  margin: 4rem 0 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--rule-soft);
  font-family: "Berkeley Mono", monospace;
  font-size: 12px;
  color: var(--muted);
}

.site-footer a {
  color: inherit;
  font-weight: 400;
}

.cursor {
  margin-left: 4px;
  opacity: 0.8;
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}


  </style>
</head>

<body>
  ${THEME_TOGGLE_HTML}
  <main>
    <h1>Hi, I'm Umar 👋</h1>

    <nav class="site-nav" aria-label="Site">
      <a href="${BLOG_ORIGIN}/" class="site-nav__blog">${NAV_ICONS.blog}blog →</a><span class="site-nav__sep">·</span><a href="https://github.com/uyousafzai54">${NAV_ICONS.github}github</a><span class="site-nav__sep">·</span><a href="https://www.linkedin.com/in/uyousafz">${NAV_ICONS.linkedin}linkedin</a><span class="site-nav__sep">·</span><a href="/gpg">${NAV_ICONS.gpg}gpg</a>
    </nav>

    <p>
      This is my first personal website running on <s>an NVIDIA H100</s> Cloudflare Workers :)
    </p>

    <p>
      I'm currently a software engineer at
      <a href="https://ramp.com">Ramp</a>
      working on compute, CI/CD, networking &amp; observability.
      I previously interned at Stripe, Apple, Level Home, Carta and the
      Royal Canadian Air Force, all in infra engineering roles.
    </p>

    <p>
      I also write occasionally on my <a href="${BLOG_ORIGIN}/">blog</a>.
    </p>

   <div class="network-terminal">
  <div class="terminal-bar">
    <div class="terminal-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="terminal-title">connection</div>
  </div>
  <pre class="network-output">$ connection

    ip        ${ip}
    ipv4      <span id="probe-v4">probing...</span>
    ipv6      <span id="probe-v6">probing...</span>
    stack     <span id="probe-stack">probing...</span> <span class="probe-hint"># reachability, not end-to-end routing</span>
    location  ${city}${region ? ", " + region : ""}, ${country}
    timezone  ${timezone}
    network   ${network}
    asn       ${asn}
    =
    edge      ${edge}
    protocol  ${protocol}
    tls       ${tls}
    rtt       ${rtt} ms
    status    connected<span class="cursor">█</span></pre>
  </div>
    

  
    <section class="research-card">
    <h2>Research Interests</h2>
      <p>
        I'm interested in <strong>computer systems, networking, security, and privacy</strong>.
        I believe privacy is a fundamental human right and I enjoy problems where strong cryptographic and privacy
        guarantees have to coexist with systems performance. My academic learnings has included secure multi-party
        computation, private computation over encrypted data, high performance networking, multicore systems, and
        concurrent systems.
      </p>
  </section>

  <section class="side-project">
  <h3>What I'm hacking on</h3>
    <p>
      I'm experimenting with a lightweight and isolated TCP/IP stack implementation for the <a href="https://sel4.systems">seL4</a> kernel on AArch64 (and later Apple Silicon hardware) to take advantage of my home's 10 Gbps fiber. 
      I am currently learning <a href="https://github.com/au-ts/sddf">sDDF</a>; and working through the architecture and first prototype. Other ideas include:
    </p>
    <ul>
      <li>creating and running my own ASN</li>
      <li>creating a personal US - Canada VPN for Youtube</li>
      <li>building the fastest running at home server rack in my coat closet</li>
    </ul>
  </section>

  <section class="readings-section">
  <h2>tech talks</h2>

  <ul class="readings-list">
    <li>
      <a href="https://files.uyousafz.com/Carta_gRPC_error_handling.pdf" target="_blank">
        how to lower your ddog bill (woof woof)?
      </a>
    </li>

  </ul>
</section>

    <section class="education">
      <h2>Education</h2>

      <article class="education-entry">
        <header>
          <h3>University of Waterloo, Computer Science. </h3>

          <p>
            <strong>Grade:</strong>
            85% cumulative GPA over 5 years of study.
          </p>
        </header>

        <details class="coursework">
          <summary>Notable Coursework.</summary>

          <h4>Notable Graduate Coursework</h4>

          <ul>
            <li>
              <strong>
                <a href="https://mina.arashloo.net/courses/CS856-W26/index.html">
                  CS 856 — High Performance Networking
                </a>
              </strong>

              <div class="course-meta">
                <span>
                  Dr. Mina Arashloo · No grade because I left halfway to join Ramp as FTE.
                </span>
                <span class="grade">NA.</span>
              </div>
            </li>

            <li>
              <strong>
                <a href="https://sites.google.com/view/mdhajiabadi/home/cs858-winter-2025">
                  CS 858 — Advanced Topics in Cryptography, Security &amp; Privacy
                </a>
              </strong>

              <div class="course-meta">
                <span>
                  Computation over Encrypted Data · Dr. Mohammad Hajiabadi ·
                  <a
                    href="https://files.uyousafz.com/cs858_winter_2025.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Scribe Notes
                  </a>
                </span>

                <span class="grade">90%</span>
              </div>
            </li>

            <li>
              <strong>
                <a href="https://crysp.uwaterloo.ca/courses/privcc/s24/">
                  CS 798 — Privacy in Computation
                </a>
              </strong>

              <div class="course-meta">
                <span>Dr. Ian Goldberg</span>
                <span class="grade">97%</span>
              </div>
            </li>

            <li>
              <strong>
                <a href="https://mc.uwaterloo.ca/cs798/index_w21.htm">
                  CS 798 — Multicore Programming in C++
                </a>
              </strong>

              <div class="course-meta">
                <span>Dr. Trevor Brown · 6th highest final grade in class of 30. How fast can you make a concurrent hashtable on modern hardware with NUMA? </span>
                <span class="grade">97%</span>
              </div>
            </li>
          </ul>

          <h4>Notable Undergraduate Coursework</h4>

          <ul>
            <li class="course-meta">
              <strong>CS 456 — Networks</strong>
              <span class="grade">100%</span>
            </li>

            <li class="course-meta">
              <strong>CS 458 — Security</strong>
              <span class="grade">88%</span>
            </li>

            <li class="course-meta">
              <strong>CS 365 — Complexity Theory</strong>
              <span class="grade">CR</span>
            </li>

            <li class="course-meta">
              <strong>CS 343 — Concurrency</strong>
              <span class="grade">86%</span>
            </li>

            <li class="course-meta">
              <strong>CS 489 — Special Topics</strong>
              <span class="grade">86%</span>
            </li>

            <li class="course-meta">
              <strong>CS 453 — Linux Security</strong>
              <span class="grade">97%</span>
            </li>

            <li class="course-meta">
              <strong>MSCI 541 — Search Engines</strong>
              <span class="grade">80%</span>
            </li>

            <li class="course-meta">
              <strong>CS 370 — Numerical Computation</strong>
              <span class="grade">80%</span>
            </li>
          </ul>
        </details>
      </article>
    </section>

    <footer class="site-footer">
      <span>${AUTHOR}</span> ·
      <a href="https://github.com/uyousafzai54">github</a> ·
      <a href="${BLOG_ORIGIN}/">blog</a> ·
      <a href="/gpg">gpg</a>
    </footer>
  </main>

  <script>
${THEME_TOGGLE_JS}

    (function () {
      var probes = ${JSON.stringify({ v4: probeV4, v6: probeV6 }).replace(/</g, "\\u003c")};
      var out = function (id, text) { document.getElementById(id).textContent = text; };
      var V4 = /^(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}$/;
      var HEX = /^[0-9a-f]{1,4}$/i;

      function isV6(ip) {
        var halves = ip.split("::");
        if (halves.length > 2 || ip.indexOf(":::") !== -1) return false;
        var groups = halves.join(":").split(":").filter(function (g) { return g !== ""; });
        if (!groups.every(function (g) { return HEX.test(g); })) return false;
        return halves.length === 2 ? groups.length <= 7 : groups.length === 8;
      }

      function isIp(ip, family) {
        return family === "ipv4" ? V4.test(ip) : isV6(ip);
      }

      function probe(url, family) {
        var ctl = new AbortController();
        var timer = setTimeout(function () { ctl.abort(); }, 5000);
        return fetch(url, { cache: "no-store", signal: ctl.signal })
          .then(function (res) { return res.ok ? res.text() : ""; })
          .then(function (text) {
            var ip = text.trim();
            try { ip = String(JSON.parse(ip).ip || ""); } catch (e) {}
            return isIp(ip, family) ? ip : null;
          })
          .catch(function () { return null; })
          .finally(function () { clearTimeout(timer); });
      }

      var p4 = probe(probes.v4, "ipv4").then(function (ip) { out("probe-v4", ip || "unreachable"); return ip; });
      var p6 = probe(probes.v6, "ipv6").then(function (ip) { out("probe-v6", ip || "unreachable"); return ip; });
      Promise.all([p4, p6]).then(function (r) {
        var v4 = r[0], v6 = r[1];
        out("probe-stack", v4 && v6 ? "dual-stack" : v4 ? "ipv4 only" : v6 ? "ipv6 only" : "unknown");
      });
    })();
  </script>
</body>
</html>
`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "cache-control": "no-store, max-age=0",
        "cloudflare-cdn-cache-control": "no-store"
      },
    });
  },
};
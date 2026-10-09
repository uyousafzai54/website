import {
  THEME_BOOT_SCRIPT,
  THEME_PALETTE_CSS,
  THEME_TOGGLE_CSS,
  THEME_TOGGLE_HTML,
  THEME_TOGGLE_JS,
} from "./theme.js";
import { handleBlog } from "./blog.js";

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
  <title>Umar</title>

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

.side-project p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-body);
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

    <p>
      This is my first personal website running on <s>an NVIDIA H100</s> Cloudflare Workers :)
    </p>

    <p>
      I'm currently a software engineer at
      <a href="https://ramp.com">Ramp</a>
      working on compute, CI/CD, networking &amp; observability.
    </p>

    <p>
      I also write occasionally on my <a href="/blog">blog</a>.
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
    

  
  <p>Highlights include:</p>

    <ul>
      <li>
        Managing <strong>all</strong> monorepo "service" deploys to production
        in 8 minutes or less via AWS ECS Fargate.
      </li>

      <li>
        Keeping track of Ramp's MoM service reliability across 400+ services
        for SLIs → SLOs → contract SLAs (four & half 9s and < 2 sec p99 latency).
      </li>

      <li>
        Managing isolated, pre-deployment production infrastructure in
        Buildkite with cryptographically signed builds, enforcing artifact
        provenance across database migrations, agent registration,
        and other deployment-critical steps.
      </li>
    </ul>

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
      I am currently learning <a href="https://github.com/au-ts/sddf">sDDF</a>; and working through the architecture and first prototype.
    </p>
  </section>

  <section class="readings-section">
  <h2>tech talks</h2>

  <ul class="readings-list">
    <li>
      <a href="https://files.uyousafz.com/umar%20bob%20the%20builder%20pt.%202.pdf" target="_blank">
        learnings of an sre; how to bob the builder?
      </a>
    </li>

    <li>
      <a href="https://files.uyousafz.com/umar%20container%20cpu%20spike.pdf" target="_blank">
        how to find an impossible cpu spike bug (aka where are my cpu cycles)?
      </a>
    </li>

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
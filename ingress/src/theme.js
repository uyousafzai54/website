// Shared theming for every page: palette CSS variables, the pre-paint theme
// bootstrap, and the fixed top-right toggle. Colours must go through these vars.

export const THEME_BOOT_SCRIPT = `  <script>
    (function () {
      try {
        var t = localStorage.getItem("theme");
        if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
      } catch (e) {}
    })();
  </script>`;

export const THEME_PALETTE_CSS = `    :root {
      color-scheme: light;
      --bg: #ffffff;
      --fg: #111;
      --text: #555;
      --text-strong: #333;
      --text-body: #444;
      --muted: #777;
      --link: #111;
      --accent: #4f7cac;
      --bar-bg: #f3f6fb;
      --rule: #ccc;
      --rule-soft: #ddd;
      --highlight-bg: #ffe66d;
      --highlight-fg: #111;
      --term-bg: #0b0c0e;
      --term-fg: rgba(255,255,255,0.72);
      --term-border: rgba(255,255,255,0.1);
      --term-bar: rgba(255,255,255,0.025);
      --term-bar-border: rgba(255,255,255,0.07);
      --term-dot: rgba(255,255,255,0.18);
      --term-title: rgba(255,255,255,0.35);
      --term-hint: rgba(255,255,255,0.3);
      --term-shadow: 0 12px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04);
    }

    /* Dark palette. The terminal inverts to a light panel so it still contrasts the page. */
    :root[data-theme="dark"] {
      color-scheme: dark;
      --bg: #0f1115;
      --fg: #e8eaed;
      --text: #b3b8c2;
      --text-strong: #cfd3da;
      --text-body: #c2c7d0;
      --muted: #8a909b;
      --link: #f2f4f7;
      --accent: #7fa7d6;
      --bar-bg: #171c24;
      --rule: #2a2f38;
      --rule-soft: #262b33;
      --term-bg: #f4f5f7;
      --term-fg: rgba(0,0,0,0.78);
      --term-border: rgba(0,0,0,0.12);
      --term-bar: rgba(0,0,0,0.035);
      --term-bar-border: rgba(0,0,0,0.08);
      --term-dot: rgba(0,0,0,0.22);
      --term-title: rgba(0,0,0,0.45);
      --term-hint: rgba(0,0,0,0.42);
      --term-shadow: 0 12px 30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.7);
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        color-scheme: dark;
        --bg: #0f1115;
        --fg: #e8eaed;
        --text: #b3b8c2;
        --text-strong: #cfd3da;
        --text-body: #c2c7d0;
        --muted: #8a909b;
        --link: #f2f4f7;
        --accent: #7fa7d6;
        --bar-bg: #171c24;
        --rule: #2a2f38;
        --rule-soft: #262b33;
        --term-bg: #f4f5f7;
        --term-fg: rgba(0,0,0,0.78);
        --term-border: rgba(0,0,0,0.12);
        --term-bar: rgba(0,0,0,0.035);
        --term-bar-border: rgba(0,0,0,0.08);
        --term-dot: rgba(0,0,0,0.22);
        --term-title: rgba(0,0,0,0.45);
        --term-hint: rgba(0,0,0,0.42);
        --term-shadow: 0 12px 30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.7);
      }
    }`;

export const THEME_TOGGLE_CSS = `.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  padding: 0.3rem 0.65rem;
  font-family: "Berkeley Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--fg);
  background: var(--bar-bg);
  border: 1px solid var(--rule);
  border-radius: 6px;
  cursor: pointer;
}

.theme-toggle:hover {
  border-color: var(--accent);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
@media (max-width: 600px) {
  .theme-toggle {
    position: absolute;
  }
}`;

export const THEME_TOGGLE_HTML = `<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle dark mode">theme</button>`;

export const THEME_TOGGLE_JS = `    (function () {
      var KEY = "theme";
      var root = document.documentElement;
      var btn = document.getElementById("theme-toggle");
      var mq = window.matchMedia("(prefers-color-scheme: dark)");

      function stored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
      }

      function current() {
        var s = stored();
        return s === "light" || s === "dark" ? s : (mq.matches ? "dark" : "light");
      }

      function render() {
        var t = current();
        btn.textContent = "theme: " + t;
        btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
      }

      btn.addEventListener("click", function () {
        var next = current() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        render();
      });

      if (mq.addEventListener) mq.addEventListener("change", render);
      render();
    })();`;

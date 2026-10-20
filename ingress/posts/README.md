# posts

One Markdown file per blog post. Add a file here, commit, deploy — `wrangler dev` /
`wrangler deploy` render them into `src/posts.generated.js` (gitignored) via
`scripts/build-posts.mjs`, and blog.umaryousafzai.net picks them up.

Front matter (between `---` lines), then the Markdown body:

| key        | required | meaning                                                                 |
| ---------- | -------- | ----------------------------------------------------------------------- |
| `number`   | yes      | RFC number: URL is `blog.umaryousafzai.net/rfc<number>`, title "RFC n: title" |
| `title`    | yes      | all lowercase                                                           |
| `date`     | yes      | `YYYY-MM-DD` publication date                                           |
| `updated`  | no       | `YYYY-MM-DD`; set when editing a published post (feeds re-deliver it)   |
| `category` | no       | RFC category in the memo header; default `Informational`                |
| `draft`    | no       | `true` renders as an Internet-Draft "(currently writing)", kept out of the feed and sitemap |
| `aliases`  | no       | comma-separated old slugs that 301 to the post; the first one is the stable Atom id, so never reorder it |

Body conventions: numbered `##` sections ("## 1. Introduction"); fenced code blocks;
raw HTML passes through if Markdown can't express something.

`## N. Title` headings become the numbered sections: each gets an `id` from its text (`## 2. Secure Boot` → `#secure-boot`) and, when a post has two or more, they are listed in the sticky "Contents" sidebar shown beside the post on wide screens.

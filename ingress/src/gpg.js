import { SITE_ORIGIN } from './site.js';
import { page, authorBlock, htmlResponse, escapeHtml } from './blog.js';

// Public key as served by GitHub (https://github.com/uyousafzai54.gpg); the two
// copies should always match — that is the cross-check /gpg tells readers to do.
export const GPG_PATH = '/gpg';
export const GPG_FINGERPRINT = 'A702 6E4B F9DC 4C64 BA78 5875 AC37 4434 5793 BB94';

const PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEZjWMOBYJKwYBBAHaRw8BAQdAgTmqVGoAZrJDKSPwjRRJ3QKZ4fQxTbXYGFau
kfKAX8+0KlVtYXIgWW91c2FmemFpIDx1bWFyeW91c2FmemFpNTRAZ21haWwuY29t
PoiZBBMWCgBBFiEEpwJuS/ncTGS6eFh1rDdENFeTu5QFAmY1jDgCGwMFCQWjmoAF
CwkIBwICIgIGFQoJCAsCBBYCAwECHgcCF4AACgkQrDdENFeTu5RiVgEAr7q6boM3
YZkr8GHOfd8khCJfKydd0hJSS02weAppiGUBAOtRx3/PVnlKoY6212h7VsvrGH6+
r18+2RKBfHzcc+sJuDgEZjWMOBIKKwYBBAGXVQEFAQEHQOTsruvdk0xD15Ge3W2z
mSGO4HkytJEEAnDEm2WtegR3AwEIB4h+BBgWCgAmFiEEpwJuS/ncTGS6eFh1rDdE
NFeTu5QFAmY1jDgCGwwFCQWjmoAACgkQrDdENFeTu5R4xgEA7rJN0P27lP9CDspi
YFeiQgTwQ2pZpb05BSrccZzk8x0A/3wV0c3qQjol3RQytMgqYWEiyebO4MLtcayM
tBDfSX0E
=zJwy
-----END PGP PUBLIC KEY BLOCK-----
`;

const KEY_FACTS = [
	['fingerprint', GPG_FINGERPRINT],
	['key id', 'AC37 4434 5793 BB94'],
	['algorithm', 'ed25519 (sign/certify) + cv25519 subkey (encrypt)'],
	['uid', 'Umar Yousafzai <umaryousafzai54@gmail.com>'],
	['created', '2024-05-04'],
	['expires', '2027-05-04'],
];

const VERIFY = `curl -s ${SITE_ORIGIN}/gpg.asc | gpg --import
gpg --fingerprint umaryousafzai54@gmail.com

# cross-check against the copy GitHub serves
curl -s https://github.com/uyousafzai54.gpg | gpg --show-keys --with-fingerprint`;

function renderGpgPage() {
	const facts = KEY_FACTS.map(([k, v]) => `<tr><th>${k}</th><td>${escapeHtml(v)}</td></tr>`).join('\n        ');
	return page({
		title: 'gpg :: Umar Yousafzai',
		path: GPG_PATH,
		bodyClass: 'homepage',
		content: `${authorBlock()}
    <article>
      <h1 class="title">gpg</h1>
      <table class="keyfacts">
        ${facts}
      </table>

      <pre><code>${escapeHtml(VERIFY)}</code></pre>

      <p>Armored key: <a href="${GPG_PATH}.asc">gpg.asc</a></p>
    </article>`,
	});
}

export function handleGpg(request) {
	const url = new URL(request.url);
	const { pathname } = url;
	if (pathname === `${GPG_PATH}/`) return Response.redirect(`${url.origin}${GPG_PATH}${url.search}`, 301);
	if (pathname === `${GPG_PATH}.asc`) {
		return new Response(PUBLIC_KEY, {
			headers: {
				'Content-Type': 'application/pgp-keys; charset=UTF-8',
				'cache-control': 'public, max-age=86400',
			},
		});
	}
	if (pathname === GPG_PATH) return htmlResponse(renderGpgPage());
	return null;
}

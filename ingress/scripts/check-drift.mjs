// Fails when the deployed site differs from what this checkout renders.
// Usage: node scripts/check-drift.mjs [--attempts N] [--delay SECONDS]
// Expects `wrangler dev` to be serving the checkout at LOCAL (default :8787).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const LIVE = process.env.LIVE_ORIGIN || 'https://umaryousafzai.net';
const LOCAL = process.env.LOCAL_ORIGIN || 'http://127.0.0.1:8787';
const PATHS = [
	'/',
	'/ip',
	'/fonts/BerkeleyMono-Regular.woff2',
	'/blog',
	'/blog/rfc1',
	'/blog/rfc2',
	'/blog/feed.xml',
	'/gpg',
	'/gpg.asc',
	'/sitemap.xml',
	'/robots.txt',
];

const args = process.argv.slice(2);
const opt = (name, dflt) => {
	const i = args.indexOf(`--${name}`);
	return i === -1 ? dflt : Number(args[i + 1]);
};
const attempts = opt('attempts', 1);
const delay = opt('delay', 60);

// The homepage terminal and /ip print request.cf telemetry (ip, colo, rtt,
// ...), which legitimately differs per request. Blank only those values so
// edits to the terminal's markup, labels or static lines still count as drift.
const TERMINAL = /<pre class="network-output">[\s\S]*?<\/pre>/;
const TERMINAL_VALUE = /^([ \t]+(?:ip|location|timezone|network|asn|edge|protocol|tls|rtt)[ \t]+).*$/gm;

// /ip is {ip, family}: the ip is the caller's (and wrangler dev sees none), so
// blank it, but check that `family` is what the Worker should derive from it;
// a wrong derivation on either side keeps its literal value and shows as drift.
// Substitute in the raw text so formatting changes still show.
function normalizeIp(body) {
	let ip;
	try {
		({ ip } = JSON.parse(body));
	} catch {
		return body;
	}
	const expected = typeof ip !== 'string' ? undefined : ip.includes(':') ? 'ipv6' : ip ? 'ipv4' : 'unknown';
	return body
		.replace(/("ip":\s*)"[^"]*"/, '$1"[telemetry]"')
		.replace(/("family":\s*)"([^"]*)"/, (m, pre, family) => (family === expected ? `${pre}"[derived from ip]"` : m));
}

function normalize(path, body) {
	if (path === '/ip') return normalizeIp(body);
	return body.replace(TERMINAL, (block) => block.replace(TERMINAL_VALUE, '$1[telemetry]'));
}

// Binary responses (the font) are compared by digest so a diff stays readable.
function isBinary(res) {
	const type = res.headers.get('content-type') || '';
	return !/^(text\/|application\/(json|xml|atom|pgp-keys|javascript))/.test(type);
}

async function fetchText(path, origin) {
	const res = await fetch(origin + path, { headers: { 'user-agent': 'drift-check' }, redirect: 'manual' });
	if (isBinary(res)) {
		const bytes = Buffer.from(await res.arrayBuffer());
		const sha256 = createHash('sha256').update(bytes).digest('hex');
		return `HTTP ${res.status}\n${bytes.length} bytes, sha256 ${sha256}\n`;
	}
	return `HTTP ${res.status}\n${normalize(path, await res.text())}`;
}

async function compare() {
	const dir = mkdtempSync(join(tmpdir(), 'drift-'));
	const drift = [];
	for (const p of PATHS) {
		const [live, local] = await Promise.all([fetchText(p, LIVE), fetchText(p, LOCAL)]);
		if (live === local) continue;
		const name = p === '/' ? 'index' : p.slice(1).replace(/[^\w.-]/g, '_');
		const a = join(dir, `${name}.live`);
		const b = join(dir, `${name}.local`);
		writeFileSync(a, live);
		writeFileSync(b, local);
		const diff = spawnSync('diff', ['-u', a, b], { encoding: 'utf8' }).stdout;
		drift.push(`--- ${p}\n${diff}`);
	}
	return drift;
}

for (let i = 1; i <= attempts; i++) {
	const drift = await compare();
	if (drift.length === 0) {
		console.log(`${LIVE} matches this checkout on ${PATHS.length} paths.`);
		process.exit(0);
	}
	if (i < attempts) {
		console.log(`drift on ${drift.length} path(s); retrying in ${delay}s (${i}/${attempts})`);
		await new Promise((r) => setTimeout(r, delay * 1000));
		continue;
	}
	console.error(`${LIVE} differs from this checkout (live = -, checkout = +):\n`);
	console.error(drift.join('\n'));
	process.exit(1);
}

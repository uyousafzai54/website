// Fails when the deployed site differs from what this checkout renders.
// Usage: node scripts/check-drift.mjs [--attempts N] [--delay SECONDS]
// Expects `wrangler dev` to be serving the checkout at LOCAL (default :8787).
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const LIVE = process.env.LIVE_ORIGIN || 'https://umaryousafzai.net';
const LOCAL = process.env.LOCAL_ORIGIN || 'http://127.0.0.1:8787';
const PATHS = ['/', '/blog', '/blog/rfc1', '/blog/rfc2', '/blog/feed.xml', '/gpg', '/gpg.asc', '/sitemap.xml', '/robots.txt'];

const args = process.argv.slice(2);
const opt = (name, dflt) => {
	const i = args.indexOf(`--${name}`);
	return i === -1 ? dflt : Number(args[i + 1]);
};
const attempts = opt('attempts', 1);
const delay = opt('delay', 60);

// The homepage terminal prints request.cf telemetry (ip, colo, rtt, ...),
// which legitimately differs per request; compare everything else.
function normalize(body) {
	return body.replace(/<pre class="network-output">[\s\S]*?<\/pre>/, '<pre class="network-output">[telemetry]</pre>');
}

async function fetchText(url) {
	const res = await fetch(url, { headers: { 'user-agent': 'drift-check' }, redirect: 'manual' });
	return `HTTP ${res.status}\n${normalize(await res.text())}`;
}

async function compare() {
	const dir = mkdtempSync(join(tmpdir(), 'drift-'));
	const drift = [];
	for (const p of PATHS) {
		const [live, local] = await Promise.all([fetchText(LIVE + p), fetchText(LOCAL + p)]);
		if (live === local) continue;
		const name = p === '/' ? 'index' : p.slice(1).replace(/\//g, '_');
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

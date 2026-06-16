/**
 * Build-time song resolver.
 *
 * Reads src/lib/data/songs.config.js (Spotify track IDs + labels) and resolves
 * each one into a full Song — title, artist, cover art, 30s preview, link — by
 * scraping Spotify's public embed page (no API key, no auth). Writes the result
 * to src/lib/data/songs.generated.json, which the app imports.
 *
 * Runs automatically via the `predev` / `prebuild` npm hooks.
 *   node scripts/resolve-songs.mjs
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const configPath = resolve(root, 'src/lib/data/songs.config.js');
const outPath = resolve(root, 'src/lib/data/songs.generated.json');

const { songsConfig } = await import(configPath);

/** Pull the embedded JSON blob Spotify ships in its track embed page. */
async function resolveTrack(id) {
	const res = await fetch(`https://open.spotify.com/embed/track/${id}`, {
		headers: { 'user-agent': 'Mozilla/5.0 (song-resolver)' }
	});
	if (!res.ok) throw new Error(`HTTP ${res.status} for track ${id}`);
	const html = await res.text();

	const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
	if (!m) throw new Error(`no __NEXT_DATA__ in embed page for ${id}`);
	const entity = JSON.parse(m[1])?.props?.pageProps?.state?.data?.entity;
	if (!entity?.name) throw new Error(`unexpected embed shape for ${id}`);

	// largest available cover (visualIdentity.image is sorted small→large, but be defensive)
	const images = entity.visualIdentity?.image ?? [];
	const cover =
		images.reduce((a, b) => ((b.maxHeight ?? 0) > (a.maxHeight ?? 0) ? b : a), images[0])?.url ??
		'';

	return {
		title: entity.name,
		artist: (entity.artists ?? []).map((a) => a.name).join(', '),
		cover,
		preview: entity.audioPreview?.url ?? '',
		spotify: `https://open.spotify.com/track/${id}`
	};
}

const songs = [];
for (const { id, label } of songsConfig) {
	if (!id) {
		console.warn(`⚠︎  skipping "${label}" — no Spotify track ID set yet`);
		continue;
	}
	try {
		const track = await resolveTrack(id);
		if (!track.preview) console.warn(`⚠︎  "${track.title}" has no preview clip on Spotify`);
		songs.push({ ...track, label });
		console.log(`✓  ${track.title} — ${track.artist}`);
	} catch (err) {
		console.error(`✗  failed to resolve ${id} ("${label}"):`, err.message);
		process.exitCode = 1;
	}
}

await writeFile(outPath, JSON.stringify(songs, null, '\t') + '\n');
console.log(`\nwrote ${songs.length} song(s) → src/lib/data/songs.generated.json`);

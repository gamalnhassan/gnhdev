/**
 * The "stuck in my head" widgets.
 *
 * To add a song: in Spotify hit Share → Copy Song Link, and grab the ID — it's
 * the bit after `/track/` (before any `?`). Drop it in with a label. Everything
 * else (title, artist, cover art, 30s preview, the Spotify link) is resolved at
 * build time by scripts/resolve-songs.mjs into songs.generated.json.
 *
 * Order here = left-to-right order in the UI.
 *
 * @type {{ id: string; label: string }[]}
 */
export const songsConfig = [
  { id: '6eBK3edMW7bEzecF1eCezc', label: 'Currently stuck in my head' },
  // Through The Wire — Kanye West 
  { id: '4mmkhcEm1Ljy1U9nwtsxUo', label: 'Classic' },
  // PROTECTION CHARM — Miguel Angeles: paste the Spotify track ID below
  { id: '1ZZKczPTO71tpXrvP37uGP', label: "Whenever it's time to hit a new gym PR" }
];

<script lang="ts">
	import Icon from '@iconify/svelte';
	import { base } from '$app/paths';
	import Marquee from '$lib/components/Marquee.svelte';
	import SongWidget from '$lib/components/SongWidget.svelte';
	import Tesseract from '$lib/components/Tesseract.svelte';
	import Arrow from '$lib/components/Arrow.svelte';
	import { draggable } from '$lib/actions/draggable';
	import { tap } from '$lib/actions/tap';
	import type { Song } from '$lib/types';
	import songsData from '$lib/data/songs.generated.json';

	const songs = songsData as Song[];

	// All photos in src/lib/assets/me — Vite bundles + hashes them at build time.
	const mePhotos = Object.values(
		import.meta.glob('$lib/assets/me/*.{jpg,jpeg,png,webp,gif,avif}', {
			eager: true,
			query: '?url',
			import: 'default'
		})
	) as string[];

	// Start on a stable photo for SSR (avoids a hydration mismatch). We re-roll
	// the photo on mouse *leave* — while the polaroid is hidden — and decode it
	// before swapping, so the next hover shows a fresh photo instantly instead
	// of briefly flashing the previously selected one.
	let mePhoto = $state(mePhotos[0]);

	// --- Tesseract easter egg ----------------------------------------------
	// Clicking a tesseract spawns a new one at a random spot on the page; every
	// spawned tesseract is draggable (via the shared `draggable` action) and can
	// be clicked to spawn yet another. Positions are page coordinates (incl.
	// scroll), which the action consumes via its `initial` option.
	type Spawn = { id: number; x: number; y: number; tilt: number; size: number };
	let spawned = $state<Spawn[]>([]);
	let nextId = 0;

	function spawnTesseract() {
		const size = 64 + Math.round(Math.random() * 64); // 64–128px
		const m = 12;
		const maxX = Math.max(m, window.innerWidth - size - m);
		const maxY = Math.max(m, document.documentElement.scrollHeight - size - m);
		spawned.push({
			id: nextId++,
			x: m + Math.random() * (maxX - m),
			y: m + Math.random() * (maxY - m),
			tilt: -35 + Math.random() * 70,
			size
		});
	}

	async function rollPhoto() {
		if (mePhotos.length <= 1) return;
		let next = mePhoto;
		while (next === mePhoto) next = mePhotos[Math.floor(Math.random() * mePhotos.length)];
		// Decode off-screen first so the swap never paints a partial image.
		try {
			const img = new Image();
			img.src = next;
			await img.decode();
		} catch {
			// decode() can reject (e.g. unsupported) — fall back to a plain swap.
		}
		mePhoto = next;
	}
</script>

<svelte:head>
	<title>~Gamal</title>
</svelte:head>

<main
	class="relative isolate min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center px-6 py-24"
>
	<!-- hand-drawn tesseract tucked into the top-left, with a scribbled label pointing at it -->
	<div class="tesseract-note hover-accent" aria-hidden="true">
		<button type="button" class="tess-spawn" aria-label="spawn a tesseract" onclick={spawnTesseract}>
			<Tesseract />
		</button>
		<Arrow
			class="tesseract-arrow"
			viewBox="0 0 100 70"
			seed={3}
			scale={2.5}
			paths={[
				// shaft swooping left toward the centre of the tesseract
				'M92 52 C 68 64, 38 50, 8 35',
				// arrowhead at the tip
				'M8 35 L 24 30',
				'M8 35 L 21 46'
			]}
		/>
		<span class="tesseract-text">spawn tesseract :)</span>
	</div>

	<div class="max-w-2xl w-full space-y-16">
		<!-- Hero -->
		<div class="space-y-8 mb-8!">
			<div class="space-y-4">
				<p class="text-zinc-400 text-lg leading-relaxed">
					Hi, I'm <span class="name-wrap"><span
								class="name-tag text-4xl pl-0.5 font-semibold tracking-tight text-white"
								onmouseleave={rollPhoto}
							>Gamal Hassan<span class="name-card" aria-hidden="true">
								<span class="name-card-inner">
									<img src={mePhoto} alt="Gamal Hassan" draggable="false" />
								</span></span
							></span><span class="name-note hover-accent" aria-hidden="true">
							<span class="name-note-text">That's me!</span>
							<Arrow
								class="name-note-arrow"
								viewBox="0 0 80 84"
								seed={4}
								scale={1.4}
								strokeWidth={3}
								paths={[
									// gentle shaft swooping down toward the name
									'M20 4 C 10 30, 48 42, 46 82',
									// arrowhead at the tip
									'M46 82 L 31 74',
									'M46 82 L 54 68'
								]}
							/></span
						></span
					>,
					a CS Master's student at ETH Zürich and full-stack developer. Interested in computer
					systems; operating systems, distributed systems, and anything low-level :)
					<br />
					Looking to solve challenging and interesting engineering problems.
				</p>

				<Marquee items={["We're so back", "I have to lock in", "It's so over"]} />
			</div>

			<div class="flex gap-2 -mt-4">
				<a
					href="https://ethz.ch"
					target="_blank"
					rel="noopener noreferrer"
					class="social-link org-square"
					aria-label="ETH Zurich"
				>
					<img src="{base}/eth-logo.svg" alt="ETH Zurich" class="w-5 h-5 object-contain" />
					<span class="social-label">Pursuing a MSc in Computer Science at ETH Zurich</span>
				</a>
				<a
					href="https://vis.ethz.ch"
					target="_blank"
					rel="noopener noreferrer"
					class="social-link org-square"
					aria-label="VIS"
				>
					<img src="{base}/vis-signet.svg" alt="VIS" class="w-5 h-5 object-contain" />
					<span class="social-label">Doing some work in my student association</span>
				</a>
				<a
					href="https://studiofoundations.arch.ethz.ch"
					target="_blank"
					rel="noopener noreferrer"
					class="social-link org-square"
					aria-label="Studio Foundations"
				>
					<img
						src="{base}/studio_foundations.svg"
						alt="Studio Foundations"
						class="w-5 h-5 object-contain"
					/>
					<span class="social-label"
						>Building a full-stack platform for the Dept. of Architecture at ETH</span
					>
				</a>
			</div>

			<div class="w-12 h-px bg-zinc-700 -mt-4"></div>

			<nav class="flex gap-5 text-zinc-500 -mt-4">
				<a
					href="mailto:gamalnasirhassan@gmail.com"
					class="social-link hover:text-white transition-colors"
					aria-label="Email"
				>
					<Icon icon="lucide:mail" width="20" height="20" />
					<span class="social-label">Why not just DM me on X?</span>
				</a>
				<a
					href="https://github.com/gamalnhassan"
					target="_blank"
					rel="noopener noreferrer"
					class="social-link hover:text-white transition-colors"
					aria-label="GitHub"
				>
					<Icon icon="mdi:github" width="20" height="20" />
					<span class="social-label">What am I currently cooking?</span>
				</a>
				<a
					href="https://x.com/gamalnhassan"
					target="_blank"
					rel="noopener noreferrer"
					class="social-link hover:text-white transition-colors"
					aria-label="X"
				>
					<Icon icon="ri:twitter-x-fill" width="20" height="20" />
					<span class="social-label">X, or Twitter, or whatever you call it</span>
				</a>
				<a
					href="https://linkedin.com/in/gamalnh"
					target="_blank"
					rel="noopener noreferrer"
					class="social-link hover:text-white transition-colors"
					aria-label="LinkedIn"
				>
					<Icon icon="mdi:linkedin" width="20" height="20" />
					<span class="social-label"
						>I am thrilled to announce that bla bla bla bla bla bla bla bla bla bla bla bla bla bla
						bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla
						bla bla bla bla bla bla bla bla bla bla bla bla bla</span
					>
				</a>
				<a
					href="https://substack.com/@ggnh"
					target="_blank"
					rel="noopener noreferrer"
					class="social-link hover:text-white transition-colors inline-flex items-center justify-center w-5 h-5"
					aria-label="Substack"
				>
					<Icon icon="simple-icons:substack" width="17" height="17" />
					<span class="social-label">Maybe soon...</span>
				</a>
			</nav>
		</div>

		<!-- Stuck in my head — docked here, but each one is draggable -->
		<div class="relative mb-16!">
			<!-- scribbled, hand-drawn annotation in the left margin, pointing at the widgets -->
			<div class="songs-note hover-accent" aria-hidden="true">
				<span class="songs-note-text">songs i'm<br />currently<br />listening to</span>
				<Arrow
					class="songs-note-arrow"
					viewBox="0 0 100 90"
					seed={7}
					scale={3.5}
					paths={[
						// bent shaft: starts near the text, swoops right toward the widgets
						'M8 24 C 28 8, 42 24, 58 40 C 70 52, 78 54, 90 50',
						// arrowhead at the tip
						'M90 50 L 75 44',
						'M90 50 L 79 60'
					]}
				/>
			</div>

			<div class="flex flex-wrap justify-center gap-10">
				{#each songs as song (song.spotify)}
					<SongWidget {song} />
				{/each}
			</div>
		</div>

		<!-- Projects -->
		<section class="space-y-4">
			<h2 class="text-xs uppercase tracking-widest text-zinc-600 font-medium">Projects</h2>
			<div class="space-y-3">
				<p class="text-zinc-600 text-sm italic">Coming soon.</p>
			</div>
		</section>

		<!-- Blog -->
		<section class="space-y-4">
			<h2 class="text-xs uppercase tracking-widest text-zinc-600 font-medium">Blog</h2>
			<p class="text-zinc-600 text-sm italic">Coming soon.</p>
		</section>

		<!-- Future -->
		<section class="space-y-4">
			<h2 class="text-xs uppercase tracking-widest text-zinc-600 font-medium">Future</h2>
			<p class="text-zinc-600 text-sm italic">Coming soon.</p>
		</section>
	</div>

	<!-- tesseracts spawned by clicking another tesseract — draggable, tap to spawn more -->
	{#each spawned as s (s.id)}
		<button
			type="button"
			class="spawned-tess"
			aria-label="tesseract"
			use:draggable={{ initial: { x: s.x, y: s.y }, margin: 4, raise: false }}
			use:tap={{ onTap: spawnTesseract }}
		>
			<Tesseract size={s.size} tilt={s.tilt} />
		</button>
	{/each}
</main>

<style>
	/* hand-drawn tesseract sketch in the top-left, slightly tilted, with a
	   scribbled arrow + label pointing back at it */
	.tesseract-note {
		position: absolute;
		top: 3rem;
		left: 3rem;
		display: flex;
		align-items: center;
		gap: 0.1rem;
		color: #b9b6b0;
		pointer-events: none;
		z-index: 40;
	}

	.tesseract-note :global(.tesseract-arrow) {
		flex-shrink: 0;
		width: 78px;
		height: 56px;
	}

	/* the source tesseract is a bare clickable button (parent note is
	   pointer-events:none, so re-enable here) */
	.tess-spawn {
		display: inline-flex;
		padding: 0;
		border: 0;
		background: none;
		line-height: 0;
		pointer-events: auto;
		cursor: pointer;
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}

	/* tesseracts conjured onto the page: absolutely placed and draggable */
	.spawned-tess {
		position: absolute;
		display: inline-flex;
		padding: 0;
		border: 0;
		background: none;
		line-height: 0;
		touch-action: none;
		cursor: grab;
		z-index: 40;
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}

	.spawned-tess:active {
		cursor: grabbing;
	}

	.tesseract-text {
		font-family: 'Shadows Into Light', ui-sans-serif, cursive;
		font-size: 1.25rem;
		line-height: 1;
		white-space: nowrap;
		transform: rotate(-3deg);
		text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
		pointer-events: auto;
		cursor: default;
	}

	/* not enough room in the corner on small screens — hide it */
	@media (max-width: 900px) {
		.tesseract-note {
			display: none;
		}
	}

	/* hand-scribbled note + bent arrow, sitting in the left margin and
	   pointing right toward the song widgets */
	.songs-note {
		position: absolute;
		top: 50%;
		left: -1rem;
		transform: translate(-100%, -50%) rotate(-4deg);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: #b9b6b0;
		pointer-events: none;
		z-index: 0;
	}

	.songs-note-text {
		display: block;
		font-family: 'Shadows Into Light', ui-sans-serif, cursive;
		font-size: 1.25rem;
		line-height: 1.05;
		text-align: right;
		white-space: nowrap;
		text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
		pointer-events: auto;
		cursor: default;
	}

	.songs-note :global(.songs-note-arrow) {
		flex-shrink: 0;
		width: 92px;
		height: 82px;
	}

	/* not enough room beside the widgets on small screens — hide it */
	@media (max-width: 900px) {
		.songs-note {
			display: none;
		}
	}

	/* wraps the name + its note so the note can be hovered independently of the
	   name (the note is no longer a child of .name-tag, so it doesn't trigger the
	   name's hover/polaroid) */
	.name-wrap {
		position: relative;
	}

	/* "That's me!" scribble above the name, pointing down at it */
	.name-note {
		position: absolute;
		bottom: calc(100% + 1.1rem);
		left: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		color: #b9b6b0;
		pointer-events: none;
		transform: rotate(3deg);
		z-index: 50;
	}

	.name-note-text {
		font-family: 'Shadows Into Light', ui-sans-serif, cursive;
		font-size: 1.25rem;
		line-height: 1;
		white-space: nowrap;
		text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
		pointer-events: auto;
		cursor: default;
	}

	.name-note :global(.name-note-arrow) {
		width: 56px;
		height: 56px;
		margin-top: -0.15rem;
	}

	/* one shared accent: any element with .hover-accent goes tesseract-cyan
	   while hovered (text inherits the colour; arrows use stroke=currentColor) */
	.hover-accent {
		transition: color 0.2s ease;
	}

	.hover-accent:hover {
		color: var(--accent);
	}
</style>

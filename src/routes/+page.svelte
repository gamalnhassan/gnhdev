<script lang="ts">
	import Icon from '@iconify/svelte';
	import { base } from '$app/paths';
	import Marquee from '$lib/components/Marquee.svelte';
	import SongWidget from '$lib/components/SongWidget.svelte';
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

<main class="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center px-6 py-24">
	<div class="max-w-2xl w-full space-y-16">
		<!-- Hero -->
		<div class="space-y-8 mb-8!">
			<div class="space-y-4">
				<p class="text-zinc-400 text-lg leading-relaxed">
					Hi, I'm <span
							class="name-tag text-4xl pl-0.5 font-semibold tracking-tight text-white"
							onmouseleave={rollPhoto}
						>Gamal Hassan<span class="name-card" aria-hidden="true">
							<span class="name-card-inner">
								<img src={mePhoto} alt="Gamal Hassan" draggable="false" />
							</span></span
						><span class="name-note" aria-hidden="true">
							<span class="name-note-text">That's me!</span>
							<svg
								class="name-note-arrow"
								viewBox="0 0 80 84"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<defs>
									<filter id="scribble-name" x="-20%" y="-20%" width="140%" height="140%">
										<feTurbulence
											type="turbulence"
											baseFrequency="0.018"
											numOctaves="2"
											seed="4"
											result="t"
										/>
										<feDisplacementMap in="SourceGraphic" in2="t" scale="1.4" />
									</filter>
								</defs>
								<g
									filter="url(#scribble-name)"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<!-- gentle shaft swooping down toward the name -->
									<path d="M20 4 C 10 30, 48 42, 46 82" />
									<!-- arrowhead at the tip -->
									<path d="M46 82 L 31 74" />
									<path d="M46 82 L 54 68" />
								</g>
							</svg></span
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
				<span
					class="social-link text-zinc-700 cursor-default inline-flex items-center justify-center w-5 h-5"
					aria-label="Substack"
				>
					<Icon icon="simple-icons:substack" width="17" height="17" />
					<span class="social-label">Maybe soon...</span>
				</span>
			</nav>
		</div>

		<!-- Stuck in my head — docked here, but each one is draggable -->
		<div class="relative mb-16!">
			<!-- scribbled, hand-drawn annotation in the left margin, pointing at the widgets -->
			<div class="songs-note" aria-hidden="true">
				<span class="songs-note-text">songs i'm<br />currently<br />listening to</span>
				<svg
					class="songs-note-arrow"
					viewBox="0 0 100 90"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<filter id="scribble" x="-20%" y="-20%" width="140%" height="140%">
							<feTurbulence type="turbulence" baseFrequency="0.018" numOctaves="2" seed="7" result="t" />
							<feDisplacementMap in="SourceGraphic" in2="t" scale="3.5" />
						</filter>
					</defs>
					<g
						filter="url(#scribble)"
						stroke="currentColor"
						stroke-width="2.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<!-- bent shaft: starts near the text, swoops right toward the widgets -->
						<path d="M8 24 C 28 8, 42 24, 58 40 C 70 52, 78 54, 90 50" />
						<!-- arrowhead at the tip -->
						<path d="M90 50 L 75 44" />
						<path d="M90 50 L 79 60" />
					</g>
				</svg>
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
</main>

<style>
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
	}

	.songs-note-arrow {
		display: block;
		flex-shrink: 0;
		width: 92px;
		height: 82px;
		overflow: visible;
	}

	/* not enough room beside the widgets on small screens — hide it */
	@media (max-width: 900px) {
		.songs-note {
			display: none;
		}
	}

	/* "That's me!" scribble above the name, pointing down at it */
	.name-note {
		position: absolute;
		bottom: calc(100% + 0.3rem);
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
	}

	.name-note-arrow {
		display: block;
		width: 56px;
		height: 56px;
		margin-top: -0.15rem;
		overflow: visible;
	}
</style>

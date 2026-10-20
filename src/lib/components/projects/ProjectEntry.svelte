<script lang="ts">
	import Arrow from '$lib/components/Arrow.svelte';
	import type { Project } from '$lib/types';

	// One project as plain text in the column, with its toy floating loose in the
	// page margin beside it (left or right) and a scribbled arrow pointing from
	// there to the title. The toy can be picked up and dragged anywhere on the
	// page; double-click it to send it home. When the margins get too narrow the
	// toy rests under the text instead (and the arrow is hidden).
	let {
		project,
		side,
		seed = 5,
		stackLabel = 'built with:'
	}: {
		project: Project;
		side: 'left' | 'right';
		seed?: number;
		/** the prefix in front of the stack */
		stackLabel?: string;
	} = $props();

	const tilt = $derived([-2, 1.5, -1, 2][seed % 4]);

	// a few hand-drawn arrow shapes, drawn left to right (and mirrored for toys
	// on the right). Each shaft leaves the toy and arrives at the title level,
	// so it reads as pointing straight across, and they all share one arrowhead.
	const HEAD = ['M76 18 L 66 11', 'M76 18 L 66 25'];
	const SHAFTS = [
		// leaves the toy level, rises a little, and comes back level
		'M2 24 C 22 24, 32 11, 50 13 C 62 14, 68 18, 76 18',
		// a loop-de-loop on the way over
		'M2 22 C 14 22, 30 10, 36 20 C 40 32, 22 32, 26 20 C 30 10, 56 18, 76 18',
		// leaves level, dips a little, and comes back level
		'M2 12 C 22 12, 38 25, 56 23 C 66 22, 70 18, 76 18'
	];
	// rises from lower down to the title, for toys whose body sits low
	const LOW_SHAFT = 'M2 38 C 22 38, 30 22, 48 19 C 60 17, 68 18, 76 18';
	// the seed picks the shape
	const arrow = $derived([project.arrowLow ? LOW_SHAFT : SHAFTS[seed % SHAFTS.length], ...HEAD]);

	let toy = $state<HTMLElement>();

	// --- dragging -------------------------------------------------------------
	// Grab the toy anywhere except its own controls, so it stays playable.
	const INTERACTIVE = 'button, input, a, [data-nodrag], [role="button"]';

	let offset = $state({ x: 0, y: 0 });
	let grab: { x: number; y: number; from: { x: number; y: number } } | null = null;
	let dragging = $state(false);
	let returning = $state(false);
	const moved = $derived(offset.x !== 0 || offset.y !== 0);

	function onDown(e: PointerEvent) {
		if (project.fixed || e.button !== 0 || (e.target as Element).closest(INTERACTIVE)) return;
		grab = { x: e.clientX, y: e.clientY, from: offset };
		dragging = true;
		toy?.setPointerCapture(e.pointerId);
		e.preventDefault();
	}

	function onMove(e: PointerEvent) {
		if (!grab) return;
		offset = { x: grab.from.x + e.clientX - grab.x, y: grab.from.y + e.clientY - grab.y };
	}

	function onUp() {
		grab = null;
		dragging = false;
	}

	function goHome(e: MouseEvent) {
		if ((e.target as Element).closest(INTERACTIVE) || !moved) return;
		returning = true;
		offset = { x: 0, y: 0 };
		setTimeout(() => (returning = false), 450);
	}
</script>

<article class="entry" data-side={side}>
	<div class="space-y-2">
		<header>
			<!-- title on the left, stack right-aligned on the same line (it wraps
			     underneath when there's no room) -->
			<div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5">
				<h3 class="title text-lg leading-snug font-semibold tracking-tight text-white">
					{project.title}
				</h3>
				<p class="font-mono text-xs text-[color-mix(in_srgb,var(--accent)_55%,#71717a)]">
					<span class="text-zinc-500">{stackLabel}</span>
					{project.stack.join(', ')}
				</p>
			</div>
			{#if project.subtitle}
				<p class="text-sm text-zinc-500">{project.subtitle}</p>
			{/if}
		</header>
		<div class="space-y-2 text-[0.95rem] leading-relaxed text-zinc-400">
			{#each project.description as para, i (i)}
				<p>{para}</p>
			{/each}
		</div>
	</div>

	<Arrow class="toy-arrow" viewBox="0 0 80 44" {seed} scale={1.6} paths={arrow} />

	<div
		class="toy"
		class:dragging
		class:returning
		class:moved
		class:fixed={project.fixed}
		style="translate: {offset.x}px {offset.y}px; rotate: {tilt}deg; --toy-w: {project.toyWidth ??
			'18.25rem'}; --toy-gap: {project.toyGap ?? '0rem'}; --toy-drop: {project.toyDrop ?? '0rem'}"
		bind:this={toy}
		role="presentation"
		onpointerdown={onDown}
		onpointermove={onMove}
		onpointerup={onUp}
		onpointercancel={onUp}
		ondblclick={goHome}
	>
		<project.toy />
	</div>
</article>

<style>
	/* narrow screens: the toy follows the text. Wide screens: the toy floats out
	   in the margin, so only the text sets the entry's height and the gaps
	   between entries stay even */
	.entry {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		row-gap: 1.25rem;
	}

	.toy {
		position: relative;
		/* above the text, so a dragged toy (or the flying drone) passes over it */
		z-index: 30;
		width: var(--toy-w);
		max-width: 100%;
		/* the toys draw in this colour */
		color: #e4e4e7;
		cursor: grab;
		user-select: none;
		/* page-coloured, so it's invisible at rest but hides the text under it
		   once it's been dragged on top */
		padding: 0.25rem;
		margin: -0.25rem;
		border-radius: 0.75rem;
		background: #0a0a0a;
		transition: box-shadow 0.2s ease;
	}

	/* picked up off the page */
	.toy.moved {
		box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6);
	}

	.toy.dragging {
		z-index: 40;
		cursor: grabbing;
	}

	.toy.fixed {
		cursor: default;
	}

	.toy.returning {
		transition:
			translate 0.4s cubic-bezier(0.34, 1.3, 0.64, 1),
			box-shadow 0.2s ease;
	}

	.entry[data-side='right'] .toy {
		justify-self: end;
	}

	/* inline: no arrow, the toy just follows the text */
	.entry :global(.toy-arrow) {
		display: none;
		color: #b9b6b0;
		transition: color 0.2s ease;
	}

	/* lights up like the page's other scribbles, when hovered itself or when
	   its toy is */
	.entry :global(.toy-arrow:hover),
	.entry:has(.toy:hover) :global(.toy-arrow),
	.entry:has(.title:hover) :global(.toy-arrow) {
		color: var(--accent);
	}

	/* the title lights up too, like the other hoverable scribbles and labels */
	.title {
		cursor: default;
		transition: color 0.2s ease;
	}

	.title:hover {
		color: var(--accent);
	}

	/* wide enough for the margins to hold the toys */
	@media (min-width: 1400px) {
		.toy {
			position: absolute;
			top: var(--toy-drop);
			max-width: none;
		}

		.entry[data-side='left'] .toy {
			right: calc(100% + 4.75rem + var(--toy-gap));
		}

		.entry[data-side='right'] .toy {
			left: calc(100% + 4.75rem + var(--toy-gap));
		}

		/* in the gap between the toy's home spot and the title */
		.entry :global(.toy-arrow) {
			display: block;
			position: absolute;
			/* over a resting toy's (invisible) backing, under a dragged one */
			z-index: 35;
			top: -0.3rem;
			width: 3.75rem;
			height: 2.35rem;
		}

		.entry[data-side='left'] :global(.toy-arrow) {
			right: calc(100% + 0.35rem);
		}

		/* mirrored, pointing back left at the text */
		.entry[data-side='right'] :global(.toy-arrow) {
			left: calc(100% + 0.35rem);
			transform: scaleX(-1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.toy,
		.toy.returning,
		.title,
		.entry :global(.toy-arrow) {
			transition: none;
		}
	}
</style>

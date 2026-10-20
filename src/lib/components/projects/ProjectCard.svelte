<script lang="ts">
	import { draggable } from '$lib/actions/draggable';
	import type { Project } from '$lib/types';

	let { project }: { project: Project } = $props();

	// Grab the card anywhere except its controls, so the toy stays playable.
	const INTERACTIVE = 'button, input, a, [data-nodrag]';

	let dragging = $state(false);
</script>

<article
	class="project-card social-link w-[19.5rem] shrink-0 cursor-grab select-none active:cursor-grabbing"
	class:is-dragging={dragging}
	style="--rest-tilt: {project.tilt}deg; --col: {project.place.column}; --mt: {project.place
		.top}px; --ml: {project.place.left}px; --justify: {project.place.justify}"
	use:draggable={{
		onStart: () => (dragging = true),
		onEnd: () => (dragging = false),
		ignore: INTERACTIVE
	}}
>
	<span class="social-label">{project.label}</span>

	<div class="card-body space-y-3 rounded-2xl border border-white/10 bg-[#111] p-4">
		<header class="space-y-2">
			<div>
				<h3 class="text-base leading-snug font-semibold tracking-tight text-white">
					{project.title}
				</h3>
				{#if project.subtitle}
					<p class="text-xs text-zinc-500">{project.subtitle}</p>
				{/if}
			</div>
			<p class="font-mono text-xs text-[color-mix(in_srgb,var(--accent)_55%,#71717a)]">
				{project.stack.join(', ')}
			</p>
		</header>

		<project.toy />

		<div class="space-y-2 pt-1 text-[0.8rem] leading-relaxed text-zinc-400">
			{#each project.description as para, i (i)}
				<p>{para}</p>
			{/each}
		</div>
	</div>
</article>

<style>
	.project-card {
		position: relative;
		transform: rotate(var(--rest-tilt, 0deg));
		transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
		z-index: 10;
		grid-row: 1;
		grid-column: var(--col);
		justify-self: var(--justify);
		margin-top: var(--mt);
		margin-left: var(--ml);
	}

	/* no room for the pile on narrow screens: stack the cards instead */
	@media (max-width: 720px) {
		.project-card {
			grid-row: auto;
			grid-column: 1;
			justify-self: center;
			margin: 0;
		}
	}

	/* "picked up": straighten out a little and lift */
	.project-card:hover {
		transform: rotate(calc(var(--rest-tilt, 0deg) * 0.3)) translateY(-2px);
	}

	.card-body {
		box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45);
		transition: box-shadow 0.25s ease;
	}

	.project-card:hover .card-body,
	.is-dragging .card-body {
		box-shadow: 0 22px 44px rgba(0, 0, 0, 0.6);
	}

	/* hide the pop-up label while dragging */
	.is-dragging :global(.social-label) {
		animation: none;
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.project-card,
		.card-body {
			transition: none;
		}
	}
</style>

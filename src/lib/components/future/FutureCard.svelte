<script lang="ts">
	import type { FutureProject } from '$lib/types';

	let { item }: { item: FutureProject } = $props();
</script>

<article class="future-card social-link" style="--rest-tilt: {item.tilt}deg">
	<span class="social-label">{item.label}</span>

	<!-- text across the card, with the toy parked in the bottom-right corner -->
	<div class="card-body relative rounded-2xl border border-white/10 bg-[#111] p-5">
		{#if item.backdrop}
			<!-- scenery painted into the card itself, behind the text and toy -->
			<item.backdrop />
		{/if}

		<div class="relative space-y-3 sm:pr-40">
			<header class="space-y-2">
				<div>
					<h3 class="text-base leading-snug font-semibold tracking-tight text-white">
						{item.title}
					</h3>
					{#if item.subtitle}
						<p class="text-xs text-zinc-500">{item.subtitle}</p>
					{/if}
				</div>
				<p class="font-mono text-xs text-[color-mix(in_srgb,var(--accent)_55%,#71717a)]">
					{item.tags.join(', ')}
				</p>
			</header>

			<div class="space-y-2 text-[0.8rem] leading-relaxed text-zinc-400">
				{#each item.description as para, i (i)}
					<p>{para}</p>
				{/each}
			</div>
		</div>

		<div
			class="toy mt-3 mb-2.5 ml-auto w-36 sm:absolute sm:right-5 sm:bottom-[1.85rem] sm:mt-0 sm:mb-0"
		>
			<item.toy />
		</div>
	</div>
</article>

<style>
	.future-card {
		position: relative;
		display: block;
		/* above the project cards, so a drone flying off doesn't slip behind them */
		z-index: 30;
		transform: rotate(var(--rest-tilt, 0deg));
		transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.future-card:hover {
		transform: rotate(0deg) translateY(-2px);
	}

	.card-body {
		box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45);
		transition: box-shadow 0.25s ease;
	}

	.future-card:hover .card-body {
		box-shadow: 0 22px 44px rgba(0, 0, 0, 0.6);
	}

	@media (prefers-reduced-motion: reduce) {
		.future-card,
		.card-body {
			transition: none;
		}
	}
</style>

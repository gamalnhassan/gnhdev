<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		items,
		repeat = 5,
		duration = 60
	}: { items: string[]; repeat?: number; duration?: number } = $props();
</script>

<div class="overflow-hidden">
	<div
		class="marquee-track text-zinc-500 text-sm"
		style="--dur: {duration}s; font-family: 'Comic Sans MS', 'Comic Sans', cursive;"
	>
		{#snippet row()}
			{#each Array(repeat) as _, i}
				{#each items as item}
					<span>{item}</span>
					<Icon icon="lucide:arrow-left" width="13" height="13" class="shrink-0" />
				{/each}
			{/each}
		{/snippet}
		<div class="marquee-half">{@render row()}</div>
		<div class="marquee-half" aria-hidden="true">{@render row()}</div>
	</div>
</div>

<style>
	@keyframes marquee {
		from {
			transform: translateX(-50%);
		}
		to {
			transform: translateX(0);
		}
	}

	.marquee-track {
		display: flex;
		align-items: center;
		width: max-content;
		white-space: nowrap;
		animation: marquee var(--dur, 60s) linear infinite;
		will-change: transform;
	}

	.marquee-half {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-right: 1rem;
	}
</style>

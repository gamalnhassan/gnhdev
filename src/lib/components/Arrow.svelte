<script lang="ts">
	// A hand-drawn, scribbled arrow. The wobble comes from an SVG turbulence +
	// displacement filter applied to a set of plain stroke paths (one shaft plus
	// a couple of short strokes for the arrowhead). Pass the path `d` strings via
	// `paths`; tweak `seed`/`scale` to vary the hand-drawn jitter per arrow.
	let {
		class: klass = '',
		viewBox,
		paths,
		seed = 3,
		scale = 2.5,
		strokeWidth = 2.6
	}: {
		class?: string;
		viewBox: string;
		paths: string[];
		seed?: number;
		scale?: number;
		strokeWidth?: number;
	} = $props();

	// unique per instance so multiple arrows on one page don't share a filter
	const uid = $props.id();
	const filterId = `arrow-scribble-${uid}`;
</script>

<svg class={klass} {viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence type="turbulence" baseFrequency="0.018" numOctaves="2" {seed} result="t" />
			<feDisplacementMap in="SourceGraphic" in2="t" {scale} />
		</filter>
	</defs>
	<g
		filter="url(#{filterId})"
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		{#each paths as d}
			<path {d} />
		{/each}
	</g>
</svg>

<style>
	svg {
		display: block;
		overflow: visible; /* let the displaced/scribbled strokes spill past the viewBox */
		pointer-events: auto; /* notes are pointer-events:none; re-enable on the arrow */
	}
</style>

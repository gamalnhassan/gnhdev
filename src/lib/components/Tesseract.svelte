<script lang="ts">
	let {
		class: klass = '',
		size = 96,
		tilt = -8
	}: { class?: string; size?: number; tilt?: number } = $props();

	// Hand-drawn tesseract "flipbook": a sequence of similar sketches where the
	// inner cube (core) swells out toward the outer cube and then contracts back.
	// Each frame is re-displaced with its own turbulence seed so it looks redrawn
	// by hand rather than tweened — a deliberately wobbly, sketchy loop.

	const CX = 50;
	const CY = 50;
	const OUTER_S = 22; // outer-cube half-size (front face)
	const OUTER_D = 16; // outer-cube depth offset (front → back face)

	type Pt = [number, number];

	// A cube drawn in 3D: a front square + a back square offset up-right by `d`,
	// centred on its own centroid so nested cubes stay concentric.
	function cubeVerts(cx: number, cy: number, s: number, d: number): Pt[] {
		const fx = cx - d / 2; // shift front face so the cube's centroid sits at (cx,cy)
		const fy = cy + d / 2;
		const front: Pt[] = [
			[fx - s, fy - s],
			[fx + s, fy - s],
			[fx + s, fy + s],
			[fx - s, fy + s]
		];
		const back: Pt[] = front.map(([x, y]) => [x + d, y - d]);
		return [...front, ...back]; // 0–3 front, 4–7 back
	}

	function seg(a: Pt, b: Pt): string {
		return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
	}

	function cubeEdges(v: Pt[]): string[] {
		return [
			seg(v[0], v[1]), seg(v[1], v[2]), seg(v[2], v[3]), seg(v[3], v[0]), // front
			seg(v[4], v[5]), seg(v[5], v[6]), seg(v[6], v[7]), seg(v[7], v[4]), // back
			seg(v[0], v[4]), seg(v[1], v[5]), seg(v[2], v[6]), seg(v[3], v[7]) // depth
		];
	}

	const OUTER_V = cubeVerts(CX, CY, OUTER_S, OUTER_D);
	const OUTER_EDGES = cubeEdges(OUTER_V);

	// inner-cube half-sizes: swell outward, then contract back (one loop)
	const SIZES = [3, 6, 9, 12, 15, 18, 15, 12, 9, 6];

	type Frame = { inner: string[]; links: string[]; seed: number };

	const FRAMES: Frame[] = SIZES.map((h, i) => {
		const iv = cubeVerts(CX, CY, h, h * (OUTER_D / OUTER_S));
		return {
			inner: cubeEdges(iv),
			// link each outer vertex to its matching inner vertex (the 4th-dim edges)
			links: OUTER_V.map((o, k) => seg(o, iv[k])),
			seed: i + 1
		};
	});

	// Start on a stable frame for SSR; advance only while hovered.
	let i = $state(0);
	let hovered = $state(false);
	const frame = $derived(FRAMES[i]);

	$effect(() => {
		const reduce =
			typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!hovered || reduce) {
			i = 0; // rest on the static base frame
			return;
		}
		const id = setInterval(() => {
			i = (i + 1) % FRAMES.length;
		}, 120);
		return () => clearInterval(id);
	});
</script>

<svg
	class="tesseract {klass}"
	style="width:{size}px;height:{size}px;transform:rotate({tilt}deg)"
	viewBox="0 0 100 100"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
	role="presentation"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	<defs>
		<filter id="tess-scribble" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence
				type="turbulence"
				baseFrequency="0.028"
				numOctaves="2"
				seed={frame.seed}
				result="t"
			/>
			<feDisplacementMap in="SourceGraphic" in2="t" scale="2.4" />
		</filter>
	</defs>
	<g
		filter="url(#tess-scribble)"
		stroke="#19c4e8"
		stroke-width="2.6"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		{#each OUTER_EDGES as e}
			<path d={e} />
		{/each}
		{#each frame.links as l}
			<path d={l} />
		{/each}
		{#each frame.inner as e}
			<path d={e} />
		{/each}
	</g>
</svg>

<style>
	.tesseract {
		display: block;
		opacity: 0.9;
		pointer-events: auto; /* parent note is pointer-events:none; re-enable to catch hover */
	}
</style>

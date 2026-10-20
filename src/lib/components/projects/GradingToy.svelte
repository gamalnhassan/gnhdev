<script lang="ts">
	// A pocket version of the platform's grading view: a few criteria on a radar,
	// each graded 1–4. Grade by clicking a dot in the list, or by clicking /
	// dragging on the radar itself — the nearest axis snaps to the nearest ring.

	const CRITERIA = [
		{ sym: '○', name: 'Locked In' },
		{ sym: '✕', name: 'Geeking' },
		{ sym: '□', name: 'Tweaking' },
		{ sym: '△', name: 'Brainrot' }
	];
	const N = CRITERIA.length;
	const SPAN = 360 / N; // degrees between axes
	const LEVELS = [1, 2, 3, 4];
	const R = 44; // outer ring radius in svg units
	const STEP = R / LEVELS.length;

	// pre-graded so there's a shape to look at before the first click
	let grades = $state([4, 3, 2, 1]);
	const avg = $derived(grades.reduce((s, g) => s + g, 0) / grades.length);

	// axis i points clockwise from 12 o'clock, evenly spaced
	const angle = (i: number) => ((-90 + i * SPAN) * Math.PI) / 180;
	const at = (i: number, r: number) => [Math.cos(angle(i)) * r, Math.sin(angle(i)) * r];

	const shape = $derived(
		grades
			.map((g, i) =>
				at(i, g * STEP)
					.map((n) => n.toFixed(1))
					.join(',')
			)
			.join(' ')
	);

	let svg = $state<SVGSVGElement>();
	let grading = false;

	function gradeFromPointer(e: PointerEvent) {
		const ctm = svg?.getScreenCTM();
		if (!svg || !ctm) return;
		// getScreenCTM includes the card's CSS rotation, so this stays accurate
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
		const i = (Math.round(((Math.atan2(p.y, p.x) * 180) / Math.PI + 90) / SPAN) + N) % N;
		const g = Math.min(LEVELS.length, Math.max(1, Math.round(Math.hypot(p.x, p.y) / STEP)));
		grades[i] = g;
	}

	function onDown(e: PointerEvent) {
		grading = true;
		svg?.setPointerCapture(e.pointerId);
		gradeFromPointer(e);
	}
</script>

<div class="paper">
	<div class="flex items-baseline justify-between border-b border-white pb-1">
		<span class="font-semibold">Evaluation</span>
		<span class="tabular-nums">Ø {avg.toFixed(2)}</span>
	</div>

	<div class="flex items-center gap-3 pt-1.5">
		<!-- the radar -->
		<svg
			bind:this={svg}
			class="radar"
			viewBox="-60 -60 120 120"
			role="img"
			aria-label="radar chart of the grades"
			data-nodrag
			onpointerdown={onDown}
			onpointermove={(e) => grading && gradeFromPointer(e)}
			onpointerup={() => (grading = false)}
			onpointercancel={() => (grading = false)}
		>
			{#each LEVELS as l (l)}
				<circle r={l * STEP} class="grid-line" />
			{/each}
			{#each CRITERIA as c, i (c.name)}
				{@const [x, y] = at(i, R)}
				{@const [sx, sy] = at(i, R + 12)}
				<line x1="0" y1="0" x2={x} y2={y} class="grid-line" />
				<text x={sx} y={sy} class="sym">{c.sym}</text>
			{/each}
			<polygon points={shape} class="shape" />
			{#each grades as g, i (i)}
				{@const [x, y] = at(i, g * STEP)}
				<circle cx={x} cy={y} r="2" class="vertex" />
			{/each}
		</svg>

		<!-- the criteria list -->
		<div class="min-w-0 flex-1">
			<div class="row font-semibold">
				<span></span>
				<span>Criteria</span>
				{#each LEVELS as l (l)}<span class="text-center">{l}</span>{/each}
			</div>
			{#each CRITERIA as c, i (c.name)}
				<div class="row">
					<span class="text-center">{c.sym}</span>
					<span class="truncate">{c.name}</span>
					{#each LEVELS as l (l)}
						<button
							type="button"
							class="dot"
							class:on={grades[i] === l}
							aria-label="{c.name}: {l}"
							aria-pressed={grades[i] === l}
							onclick={() => (grades[i] = l)}
						></button>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* drawn straight onto the card, all in white */
	.paper {
		padding: 0.6rem 0.65rem 0.55rem;
		border-radius: 0.5rem;
		color: white;
		font-size: 0.75rem;
		line-height: 1.2;
		cursor: default;
	}

	.radar {
		width: 6.5rem;
		flex-shrink: 0;
		cursor: crosshair;
		touch-action: none;
		overflow: visible;
	}

	.grid-line {
		fill: none;
		stroke: rgba(255, 255, 255, 0.35);
		stroke-width: 0.5;
		stroke-dasharray: 1.5 1.5;
	}

	.sym {
		font-size: 13px;
		text-anchor: middle;
		dominant-baseline: central;
		fill: white;
		user-select: none;
	}

	.shape {
		fill: rgba(255, 255, 255, 0.15);
		stroke: white;
		stroke-width: 1;
		stroke-linejoin: round;
		transition: all 0.2s ease;
	}

	.vertex {
		fill: white;
	}

	.row {
		display: grid;
		grid-template-columns: 1rem minmax(0, 1fr) repeat(4, 0.85rem);
		align-items: center;
		column-gap: 0.15rem;
		height: 1.45rem;
	}

	.dot {
		justify-self: center;
		width: 0.65rem;
		height: 0.65rem;
		border-radius: 9999px;
		border: 1px solid white;
		transition: background-color 0.15s;
	}

	.dot:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	.dot.on {
		background: white;
	}

	@media (prefers-reduced-motion: reduce) {
		.shape {
			transition: none;
		}
	}
</style>

<script lang="ts">
	// The drone's little world, painted straight into the card: a solid patch of
	// sky with a wavy edge in the top-right corner, with a pale sun and drifting
	// clouds, and a grassy hill in the bottom-right corner for the drone to sit
	// on. Same flat style as the drone.

	// the sky's outline (viewBox 200 × 110): flush with the card's top and right
	// edges, with a wavy edge sweeping from the top down to the right
	const SKY =
		'M14 0 H200 V100 C 186 104, 168 100, 150 96 C 128 92, 112 84, 92 78 C 70 72, 56 70, 44 58 C 34 48, 30 36, 22 28 C 14 20, 10 10, 14 0 Z';

	// each cloud is a few overlapping circles on a flat base. They drift
	// across the sky and are clipped to its outline, so they slide in and out
	// at its edge; a negative delay sets where each one starts.
	const CLOUDS = [
		{ y: 44, s: 1, dur: 30, delay: -12 },
		{ y: 18, s: 0.7, dur: 38, delay: -26 },
		{ y: 66, s: 0.8, dur: 34, delay: -30 }
	];

	// the hill (viewBox 300 × 60): rises over the left ~40% and then stays
	// nearly flat, so the drone always lands on level ground even when the
	// hill is stretched across a narrow card
	const HILL = 'M0 60 C 50 58, 80 26, 130 18 C 170 13, 240 13, 300 12 L300 60 Z';
	// roughly follows HILL's top edge, for placing the grass tufts on it
	const hillY = (x: number) => {
		if (x >= 130) return 18 - ((x - 130) / 170) * 6;
		const t = x / 130;
		return 60 - 42 * t * t * (3 - 2 * t);
	};
	const TUFTS = [78, 108, 146, 186, 226, 266];

	// unique per instance so two of these on one page don't share gradients
	const uid = $props.id();
</script>

<div class="scene" aria-hidden="true">
	<svg class="sky" viewBox="0 0 200 110">
		<defs>
			<linearGradient id="sky-{uid}" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#5aa9df" />
				<stop offset="1" stop-color="#9fd1ef" />
			</linearGradient>
			<clipPath id="sky-clip-{uid}">
				<path d={SKY} />
			</clipPath>
		</defs>
		<path d={SKY} fill="url(#sky-{uid})" />
		<g clip-path="url(#sky-clip-{uid})">
			<circle cx="172" cy="22" r="11" fill="#fff6d6" />
			{#each CLOUDS as c (c.y)}
				<g class="drift" style="--dur: {c.dur}s; --delay: {c.delay}s">
					<g transform="translate(0 {c.y}) scale({c.s})">
						<rect x="0" y="6" width="40" height="10" rx="5" fill="#e6f0f7" />
						<circle cx="12" cy="7" r="7" fill="#ffffff" />
						<circle cx="23" cy="3" r="9" fill="#ffffff" />
						<circle cx="32" cy="8" r="6" fill="#ffffff" />
						<rect x="2" y="8" width="36" height="6" rx="3" fill="#ffffff" />
					</g>
				</g>
			{/each}
		</g>
	</svg>

	<svg class="grass" viewBox="0 0 300 60" preserveAspectRatio="none">
		<defs>
			<linearGradient id="grass-{uid}" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#63b257" />
				<stop offset="1" stop-color="#3e8a3a" />
			</linearGradient>
		</defs>
		<!-- a hill rising from the left and running flat off the right edge -->
		<path d={HILL} fill="url(#grass-{uid})" />
		{#each TUFTS as x (x)}
			{@const y = hillY(x)}
			<path
				d="M{x - 3} {y + 2} L{x - 1} {y - 4} M{x} {y + 2} L{x + 1} {y - 6} M{x + 3} {y + 2} L{x +
					4} {y - 3}"
				class="tuft"
			/>
		{/each}
	</svg>
</div>

<style>
	/* fills the card and is clipped to its rounded corners by the card */
	.scene {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: inherit;
		pointer-events: none;
	}

	/* fixed width so its wavy edge stays in the gap the text leaves on the right */
	.sky {
		position: absolute;
		top: 0;
		right: 0;
		width: 12rem;
		height: auto;
	}

	/* on phones the text runs the full width, so keep the sky to the corner */
	@media (max-width: 639px) {
		.sky {
			width: 6.75rem;
		}

		/* …and make the hill bigger than the card (the overflow is clipped) so
		   its flat top reaches all the way under the drone */
		.grass {
			width: 150%;
			height: 3.75rem;
		}
	}

	.grass {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 55%;
		height: 3.25rem;
	}

	.tuft {
		fill: none;
		stroke: #4f9c45;
		stroke-width: 1.4;
		stroke-linecap: round;
	}

	.drift {
		animation: drift var(--dur) linear var(--delay) infinite;
	}

	@keyframes drift {
		from {
			transform: translateX(-50px);
		}
		to {
			transform: translateX(210px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.drift {
			animation: none;
		}
	}
</style>

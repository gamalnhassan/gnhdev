<script lang="ts">
	// The side-on drawing of my Matura-thesis quadcopter: white rear arm on the
	// left, red front arm on the right, gold motors with long props, and the
	// Arduino Uno riding on the black plate stack, battery slung underneath.
	let { spinning = false }: { spinning?: boolean } = $props();

	// motor centres along the arm line (viewBox is 200 × 70; feet at y = 66)
	const MOTORS = [22, 178];
</script>

<svg viewBox="0 0 200 70" class:spinning aria-hidden="true">
	<!-- landing legs -->
	<path d="M80 44 L62 66 M54 66 L70 66" class="leg" />
	<path d="M120 44 L138 66 M130 66 L146 66" class="leg" />

	<!-- arms: rear (white) to the left, front (red) to the right -->
	<rect x="26" y="33" width="56" height="6" rx="2" fill="#e7e7e4" />
	<rect x="118" y="33" width="56" height="6" rx="2" fill="#b8322a" />
	<path d="M34 36 H76 M126 36 H168" class="truss" />

	<!-- plate stack, battery underneath, Arduino on top, a few wires -->
	<rect x="80" y="44" width="40" height="8" rx="2" fill="#2b2b2e" />
	<rect x="72" y="30" width="56" height="5" rx="1.5" class="plate" />
	<rect x="72" y="38" width="56" height="5" rx="1.5" class="plate" />
	<rect x="78" y="24" width="44" height="6" rx="1" fill="#2f7fc1" />
	<rect x="84" y="21" width="8" height="3" fill="#1d1d1f" />
	<rect x="106" y="22" width="9" height="2" fill="#cfd6dd" />
	<path d="M92 24 C 96 16, 104 16, 108 22" class="wire" stroke="#e0473d" />
	<path d="M86 30 C 80 36, 70 36, 62 34" class="wire" stroke="#f0a43a" />

	<!-- motors + props -->
	{#each MOTORS as x (x)}
		<rect x={x - 6} y="22" width="12" height="13" rx="1.5" fill="#c9962a" />
		<rect x={x - 6} y="27" width="12" height="2" fill="#8c6a1f" />
		<path d="M{x - 3} 22 L{x} 15 L{x + 3} 22 Z" fill="#d9d9dc" />
		<g class="prop" style="transform-origin: {x}px 17px">
			<rect x={x - 30} y="15" width="60" height="3.5" rx="1.75" class="blade" />
		</g>
	{/each}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		overflow: visible;
	}

	/* lighter than the real (black) legs, so they show up on the dark page */
	.leg {
		fill: none;
		stroke: #7a7a80;
		stroke-width: 3;
		stroke-linecap: round;
	}

	/* the lattice cut-outs along each arm */
	.truss {
		stroke: rgba(0, 0, 0, 0.3);
		stroke-width: 2;
		stroke-dasharray: 3 4;
	}

	.plate {
		fill: #1d1d1f;
		stroke: #3a3a3d;
		stroke-width: 1;
	}

	.wire {
		fill: none;
		stroke-width: 1.2;
		stroke-linecap: round;
	}

	.prop {
		transform-box: view-box;
	}

	/* black in real life, but that vanishes on the dark page */
	.blade {
		fill: #5a5a60;
	}

	/* side-on, a spinning prop just flickers between full length and edge-on */
	.spinning .prop {
		animation: spin 0.08s linear infinite;
	}

	@keyframes spin {
		50% {
			transform: scaleX(0.15);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinning .prop {
			animation: none;
		}
	}
</style>

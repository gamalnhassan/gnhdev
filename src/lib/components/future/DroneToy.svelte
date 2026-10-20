<script lang="ts">
	// A mini side-on model of my Matura-thesis quadcopter: white rear arm on the
	// left, red front arm on the right, gold motors with long black props, and
	// the Arduino Uno riding on the black plate stack, battery slung underneath.
	// Hovering (or tapping) the drone spins the props up, flies it up and away,
	// and drops a fresh one in.

	const FLIGHT_MS = 4500;

	// motor centres along the arm line (viewBox is 200 × 70; feet at y = 66)
	const MOTORS = [22, 178];

	type Drone = { id: number; flying: boolean };
	let nextId = 1;
	let drones = $state<Drone[]>([{ id: 0, flying: false }]);

	function launch() {
		const current = drones.find((d) => !d.flying);
		if (!current) return; // the next one hasn't landed yet
		current.flying = true;
		setTimeout(() => {
			drones = drones.filter((d) => d.id !== current.id);
			drones.push({ id: nextId++, flying: false });
		}, FLIGHT_MS);
	}
</script>

<div class="pad" role="presentation">
	{#each drones as d (d.id)}
		<div
			class="drone"
			class:flying={d.flying}
			role="button"
			tabindex={d.flying ? -1 : 0}
			aria-label="send the drone flying"
			onmouseenter={launch}
			onclick={launch}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), launch())}
		>
			<!-- separate layers for climb, dash and tilt, so they blend into one smooth arc -->
			<div class="rise">
				<div class="dash">
					<div class="tilt">
						<svg viewBox="0 0 200 70" aria-hidden="true">
							<!-- shadow right under the feet, so it sits on the ground -->
							<ellipse cx="100" cy="67" rx="44" ry="2.5" class="shadow" />

							<!-- landing legs -->
							<path d="M80 44 L72 66 M66 66 L80 66" class="leg" />
							<path d="M120 44 L128 66 M120 66 L134 66" class="leg" />

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
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.pad {
		position: relative;
		width: 100%;
		height: 100%;
		display: grid;
		place-items: end center;
		/* gives the take-off its depth: banking and turning away read as 3D */
		perspective: 600px;
	}

	.drone {
		grid-area: 1 / 1;
		cursor: pointer;
		outline: none;
		width: 100%;
		animation: spawn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}

	svg {
		display: block;
		width: 100%;
		overflow: visible;
	}

	.shadow {
		fill: rgba(0, 0, 0, 0.55);
		transform-box: fill-box;
		transform-origin: center;
	}

	.leg {
		fill: none;
		stroke: #3a3a3d;
		stroke-width: 2.5;
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

	/* black in real life, but that vanishes on the dark card */
	.blade {
		fill: #5a5a60;
	}

	/* --- take-off ------------------------------------------------------------
	   Three nested layers, each with its own easing: `rise` climbs the whole
	   time, `dash` eases in sideways (and back into the distance) a beat later,
	   and `tilt` dips the nose (the front is on the right), banks and turns
	   away. Because the climb never pauses, the combined path is one smooth arc
	   up and off the page. Depth (translateZ) shrinks it as it goes, which also
	   shrinks on-screen travel, so the targets are oversized. */
	.rise,
	.dash,
	.tilt {
		transform-style: preserve-3d;
	}

	/* fade over the last stretch too, in case a very wide screen hasn't lost it yet */
	.flying {
		pointer-events: none;
		animation: fade-out 4.5s linear forwards;
	}

	.flying .rise {
		animation: rise 4.5s cubic-bezier(0.3, 0.15, 0.55, 1) forwards;
	}

	.flying .dash {
		animation: dash 4.5s linear forwards;
	}

	.flying .tilt {
		animation: tilt 4.5s linear forwards;
	}

	/* side-on, a spinning prop just flickers between full length and edge-on */
	.flying .prop {
		animation: spin 0.08s linear infinite;
	}

	.flying .shadow {
		animation: shadow-off 0.5s ease-out forwards;
	}

	@keyframes spin {
		50% {
			transform: scaleX(0.15);
		}
	}

	@keyframes rise {
		to {
			transform: translateY(-1100px);
		}
	}

	@keyframes dash {
		0%,
		20% {
			transform: translate3d(0, 0, 0);
			animation-timing-function: cubic-bezier(0.4, 0, 0.7, 0.6);
		}
		100% {
			transform: translate3d(300vw, 0, -700px);
		}
	}

	/* a real quad pitches nose-down (front = right) as it starts to accelerate,
	   so the tilt builds right as the dash begins, while it's still on screen.
	   It eases into the pitch, sways back a touch and settles into the lean
	   (rather than snapping to a pose), then banks and turns away. It keeps its
	   full size until it's on its way, then shrinks toward the end. */
	@keyframes tilt {
		0% {
			transform: rotateY(0) rotateX(0) rotateZ(0) scale(1);
			animation-timing-function: ease-in-out;
		}
		14% {
			transform: rotateY(0) rotateX(0) rotateZ(-1.5deg) scale(1);
			animation-timing-function: ease-in-out;
		}
		24% {
			transform: rotateY(-4deg) rotateX(2deg) rotateZ(6deg) scale(1);
			animation-timing-function: ease-in-out;
		}
		34% {
			transform: rotateY(-10deg) rotateX(4deg) rotateZ(14deg) scale(1);
			animation-timing-function: ease-in-out;
		}
		42% {
			transform: rotateY(-16deg) rotateX(6deg) rotateZ(11deg) scale(0.85);
			animation-timing-function: ease-in-out;
		}
		52% {
			transform: rotateY(-26deg) rotateX(9deg) rotateZ(16deg) scale(0.6);
			animation-timing-function: ease-in-out;
		}
		66% {
			transform: rotateY(-38deg) rotateX(13deg) rotateZ(20deg) scale(0.4);
			animation-timing-function: ease-in-out;
		}
		100% {
			transform: rotateY(-55deg) rotateX(18deg) rotateZ(24deg) scale(0.25);
		}
	}

	@keyframes fade-out {
		0%,
		75% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes shadow-off {
		to {
			transform: scale(0.3);
			opacity: 0;
		}
	}

	@keyframes spawn {
		from {
			transform: translateY(-28px) scale(0.85);
			opacity: 0;
		}
		to {
			transform: none;
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.drone,
		.flying,
		.flying .rise,
		.flying .dash,
		.flying .tilt,
		.flying .prop,
		.flying .shadow {
			animation: none;
		}
		.flying {
			opacity: 0;
		}
	}
</style>

<script lang="ts">
	import DroneArt from './DroneArt.svelte';

	// A mini model of my Matura-thesis quadcopter, hovering with a small swarm
	// in the background behind it. Hovering (or tapping) the drone flies it up
	// and away, the swarm follows in a ragged wave,
	// and then a fresh drone and swarm drop back in.

	const FLIGHT_MS = 4500;

	// the background swarm, placed around the main drone (which spans
	// 0 → 11rem across). Wide screens: up and to the left, out in the margin.
	// Narrow screens (`n`): off to its right, since the text sits above it.
	// Smaller and fainter reads as further away; each bobs on its own beat and
	// leaves a moment apart (`d`, in s).
	const SWARM = [
		{ x: -2.4, y: -2.9, nx: 11.6, ny: -0.6, w: 3.8, op: 0.7, bob: 3.1, d: 0.15 },
		{ x: 2.2, y: -2.1, nx: 14.2, ny: 1.4, w: 2.9, op: 0.55, bob: 3.7, d: 0.35 },
		{ x: 6.9, y: -2.6, nx: 16.2, ny: -0.3, w: 3.3, op: 0.65, bob: 2.8, d: 0.05 },
		{ x: -4.2, y: 0, nx: 12.2, ny: 2.6, w: 2.6, op: 0.5, bob: 4.2, d: 0.5 },
		{ x: 9.8, y: -1.4, nx: 15.4, ny: 2.4, w: 2.4, op: 0.5, bob: 3.4, d: 0.25 }
	];

	type Drone = { id: number; flying: boolean };
	let nextId = 1;
	let drones = $state<Drone[]>([{ id: 0, flying: false }]);
	let swarmFlying = $state(false);
	let swarmGen = $state(0); // bumped to drop a fresh swarm in

	function launch() {
		const current = drones.find((d) => !d.flying);
		if (!current) return; // the next one hasn't landed yet
		current.flying = true;
		swarmFlying = true;
		setTimeout(() => {
			drones = drones.filter((d) => d.id !== current.id);
			drones.push({ id: nextId++, flying: false });
			swarmFlying = false;
			swarmGen++;
		}, FLIGHT_MS);
	}
</script>

<div class="pad" role="presentation">
	{#key swarmGen}
		<div class="swarm" aria-hidden="true">
			{#each SWARM as m (m.d)}
				<div
					class="mini"
					class:flying={swarmFlying}
					style="--x: {m.x}rem; --y: {m.y}rem; --nx: {m.nx}rem; --ny: {m.ny}rem; --w: {m.w}rem; --op: {m.op}; --bob: {m.bob}s; --d: {m.d}s"
				>
					<div class="bob">
						<div class="rise">
							<div class="dash">
								<div class="tilt"><DroneArt spinning /></div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/key}

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
			<!-- hovering in place, props spinning, like the rest of the swarm -->
			<div class="bob" style="--bob: 3.3s; --amp: 7px">
				<div class="rise">
					<div class="dash">
						<div class="tilt"><DroneArt spinning /></div>
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

	/* --- the background swarm ----------------------------------------------- */
	.swarm {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.mini {
		position: absolute;
		left: var(--nx);
		top: var(--ny);
		width: var(--w);
		opacity: var(--op);
		animation: spawn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--d) both;
	}

	@media (min-width: 1400px) {
		.mini {
			left: var(--x);
			top: var(--y);
		}
	}

	.bob {
		transform-style: preserve-3d;
		animation: bob var(--bob) ease-in-out infinite alternate;
	}

	@keyframes bob {
		from {
			transform: translateY(calc(-1 * var(--amp, 3px)));
		}
		to {
			transform: translateY(var(--amp, 3px));
		}
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

	/* the swarm takes off a moment apart and a little quicker, so it's all gone
	   by the time the fresh one drops in */
	.mini.flying,
	.mini.flying .rise,
	.mini.flying .dash,
	.mini.flying .tilt {
		animation-duration: 3.6s;
		animation-delay: var(--d);
	}

	/* keep its own (faint) opacity while it fades */
	.mini.flying {
		animation-name: fade-out-mini;
	}

	@keyframes fade-out-mini {
		0%,
		75% {
			opacity: var(--op);
		}
		100% {
			opacity: 0;
		}
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

	/* fills `both`, so it ends on the element's own opacity (1, or a mini's --op) */
	@keyframes spawn {
		from {
			transform: translateY(-28px) scale(0.85);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.drone,
		.mini,
		.bob,
		.flying,
		.flying .rise,
		.flying .dash,
		.flying .tilt {
			animation: none;
		}
		.flying {
			opacity: 0;
		}
	}
</style>

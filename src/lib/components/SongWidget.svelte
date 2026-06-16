<script lang="ts">
	import Icon from '@iconify/svelte';
	import { draggable } from '$lib/actions/draggable';
	import type { Song } from '$lib/types';

	let { song, class: klass = '' }: { song: Song; class?: string } = $props();

	// Slight resting tilt, seeded from the song so it's stable across renders
	// (and identical on server-prerender + client-hydrate — no mismatch). ~±3.5°.
	const restTilt = $derived.by(() => {
		const s = song.spotify || song.title;
		let h = 2166136261;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return (((h >>> 0) % 1000) / 1000 - 0.5) * 7; // -3.5°..3.5°
	});

	// --- audio preview -------------------------------------------------------
	const MAX_VOLUME = 0.35;
	let audio = $state<HTMLAudioElement>();
	let playing = $state(false);
	let hoverTimer: ReturnType<typeof setTimeout>;
	let fadeTimer: ReturnType<typeof setInterval>;

	function fade(to: number, ms: number, done?: () => void) {
		if (!audio) return;
		clearInterval(fadeTimer);
		const from = audio.volume;
		const steps = Math.max(20, Math.round(ms / 25));
		let i = 0;
		fadeTimer = setInterval(() => {
			i++;
			if (!audio) return clearInterval(fadeTimer);
			audio.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
			if (i >= steps) {
				clearInterval(fadeTimer);
				done?.();
			}
		}, ms / steps);
	}

	function playPreview() {
		clearTimeout(hoverTimer);
		hoverTimer = setTimeout(async () => {
			if (!audio) return;
			audio.currentTime = 0;
			audio.volume = 0;
			try {
				await audio.play(); // may be blocked until the user has interacted with the page
				fade(MAX_VOLUME, 1000);
			} catch {
				/* autoplay blocked — ignore */
			}
		}, 180);
	}

	function stopPreview() {
		clearTimeout(hoverTimer);
		fade(0, 300, () => audio?.pause());
	}

	// --- hover menu + tilt ---------------------------------------------------
	let dragging = $state(false);
	let tiltLocked = $state(false); // keep the hover tilt off after a drag, until the pointer leaves
	let menuOpen = $state(false);
	let closeTimer: ReturnType<typeof setTimeout>;

	function onEnter() {
		clearTimeout(closeTimer);
		menuOpen = true;
		playPreview();
	}

	function onLeave() {
		tiltLocked = false; // pointer left — allow the tilt again on next hover
		clearTimeout(closeTimer);
		// short close delay so moving diagonally to the menu doesn't close it
		closeTimer = setTimeout(() => {
			menuOpen = false;
			stopPreview();
		}, 180);
	}

	function onDragStart() {
		dragging = true;
		tiltLocked = false; // keep it tilted while dragging (even on a re-grab without un-hovering)
	}

	function onDragEnd() {
		dragging = false;
		tiltLocked = true; // reset the tilt now that the drag ended
	}

	// --- idle shake ----------------------------------------------------------
	// Each widget shakes on its own random schedule, so they never sync up.
	let shaking = $state(false);
	let shakeTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		setTimeout(() => (shaking = true), 500);
		setTimeout(() => (shaking = false), 1100);
		const schedule = () => {
			// random gap between shakes (4s–10s), unique per widget over time
			shakeTimer = setTimeout(
				() => {
					// don't shake while the user is interacting with it
					if (!dragging && !menuOpen) {
						shaking = true;
						setTimeout(() => (shaking = false), 600);
					}
					schedule();
				},
				5000 + Math.random() * 25000
			);
		};
		schedule();
		return () => clearTimeout(shakeTimer);
	});

	// --- title marquee (only when it overflows its box) ----------------------
	let titleBox = $state<HTMLElement>();
	let titleShift = $state(0);

	$effect(() => {
		const node = titleBox;
		if (!node) return;
		const measure = () => {
			const overflow = node.scrollWidth - node.clientWidth;
			titleShift = overflow > 1 ? overflow : 0;
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(node);
		return () => ro.disconnect();
	});
</script>

<div
	class="song-widget social-link w-44 z-50 cursor-grab active:cursor-grabbing select-none {klass}"
	class:is-dragging={dragging}
	class:is-playing={playing}
	class:no-tilt={tiltLocked}
	class:shake={shaking}
	style="--rest-tilt: {restTilt}deg"
	use:draggable={{ onStart: onDragStart, onEnd: onDragEnd, ignore: 'a' }}
	onmouseenter={onEnter}
	onmouseleave={onLeave}
	role="button"
	tabindex="-1"
>
	<audio
		bind:this={audio}
		src={song.preview}
		preload="none"
		onplay={() => (playing = true)}
		onpause={() => (playing = false)}
	></audio>

	<span class="social-label">{song.label}</span>

	<div class="relative overflow-hidden rounded-2xl border border-white/10 p-3">
		<!-- blurred, zoomed cover as background -->
		<img
			src={song.cover}
			alt=""
			aria-hidden="true"
			draggable="false"
			class="absolute inset-0 w-full h-full object-cover scale-150 blur-2xl opacity-70"
		/>
		<div class="absolute inset-0 bg-black/40"></div>

		<div class="relative space-y-3">
			<!-- focused cover -->
			<div
				class="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg shadow-black/40"
			>
				<img
					src={song.cover}
					alt="{song.title} cover"
					draggable="false"
					class="w-full h-full object-cover"
				/>
				<!-- subtle playing cue (equalizer bars) -->
				<div
					class="absolute bottom-2 left-2 flex items-end gap-[2px] h-3 rounded bg-black/40 px-1.5 py-1 backdrop-blur-sm"
					aria-hidden="true"
				>
					<span class="eq-bar w-[2px] h-full rounded-full bg-white/90" style="animation-delay: 0ms"
					></span>
					<span
						class="eq-bar w-[2px] h-full rounded-full bg-white/90"
						style="animation-delay: 180ms"
					></span>
					<span
						class="eq-bar w-[2px] h-full rounded-full bg-white/90"
						style="animation-delay: 360ms"
					></span>
					<span
						class="eq-bar w-[2px] h-full rounded-full bg-white/90"
						style="animation-delay: 120ms"
					></span>
				</div>
			</div>

			<!-- title + artist -->
			<div>
				<div class="overflow-hidden" bind:this={titleBox}>
					<p
						class="font-semibold text-white text-sm whitespace-nowrap"
						class:title-marquee={titleShift > 0}
						style="--title-shift: -{titleShift}px"
					>
						{song.title}
					</p>
				</div>
				<p class="text-zinc-400 text-sm truncate">{song.artist}</p>
			</div>
		</div>
	</div>

	<!-- streaming providers: just below the widget, bottom-left, fade in on hover -->
	<div
		class="absolute top-full left-0 pt-1 flex gap-1.5 transition-all duration-200 {menuOpen &&
		!dragging
			? 'opacity-100 translate-y-0 pointer-events-auto'
			: 'opacity-0 -translate-y-1 pointer-events-none'}"
	>
		{#snippet coverBg()}
			<img
				src={song.cover}
				alt=""
				aria-hidden="true"
				draggable="false"
				class="absolute inset-0 w-full h-full object-cover scale-125 blur-[6px] opacity-90"
			/>
			<div class="absolute inset-0 bg-black/25"></div>
		{/snippet}
		<a
			href={song.spotify}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Open in Spotify"
			class="relative overflow-hidden inline-flex items-center justify-center w-7 h-7 rounded-md text-white/60 hover:text-white transition-colors"
		>
			{@render coverBg()}
			<Icon icon="mdi:spotify" width="16" height="16" class="relative" />
		</a>
	</div>
</div>

<style>
	@keyframes eq {
		0%,
		100% {
			transform: scaleY(0.25);
		}
		50% {
			transform: scaleY(1);
		}
	}

	.eq-bar {
		transform-origin: bottom;
		transform: scaleY(0.3); /* resting state when paused */
	}

	.is-playing .eq-bar {
		animation: eq 0.9s ease-in-out infinite;
	}

	@keyframes title-marquee {
		0%,
		12% {
			transform: translateX(0);
		}
		48%,
		60% {
			transform: translateX(var(--title-shift));
		}
		96%,
		100% {
			transform: translateX(0);
		}
	}

	.title-marquee {
		display: inline-block;
		white-space: nowrap;
		animation: title-marquee 7s ease-in-out infinite;
	}

	.song-widget {
		transform: rotate(var(--rest-tilt, 0deg));
		transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.song-widget:hover {
		transform: rotate(-2deg);
	}

	@keyframes shake {
		0%,
		100% {
			transform: rotate(var(--rest-tilt, 0deg));
		}
		15% {
			transform: rotate(calc(var(--rest-tilt, 0deg) - 1.5deg));
		}
		30% {
			transform: rotate(calc(var(--rest-tilt, 0deg) + 1.5deg));
		}
		45% {
			transform: rotate(calc(var(--rest-tilt, 0deg) - 1deg));
		}
		60% {
			transform: rotate(calc(var(--rest-tilt, 0deg) + 0.75deg));
		}
		75% {
			transform: rotate(calc(var(--rest-tilt, 0deg) - 0.4deg));
		}
	}

	/* idle wiggle — suppressed while hovering so it doesn't fight the hover tilt */
	.song-widget.shake:not(:hover) {
		animation: shake 0.6s ease-in-out;
	}

	.song-widget.no-tilt:hover {
		transform: rotate(var(--rest-tilt, 0deg));
	}

	/* hide the pop-up label while dragging */
	.song-widget.is-dragging :global(.social-label) {
		animation: none;
		opacity: 0;
	}
</style>

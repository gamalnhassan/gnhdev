<script lang="ts">
	import { base } from '$app/paths';

	// Drag my student card onto the reader (or just tap/press it) to "scan" it.
	// Most scans get you in; now and then the reader catches a double scan.

	type Result = 'idle' | 'ok' | 'denied';

	let scans = 0;
	let result = $state<Result>('idle');
	let resultTimer: ReturnType<typeof setTimeout>;

	let reader = $state<HTMLElement>();
	let card = $state<HTMLElement>();
	let drag = $state({ x: 0, y: 0 });
	let held = $state(false); // pointer is down on the card
	let flying = $state(false); // card is animating to the reader on a tap

	let down: { x: number; y: number } | null = null;
	let moved = false;

	// --- beeps -----------------------------------------------------------------
	let ctx: AudioContext | undefined;
	function beep(freq: number, at = 0, ms = 90) {
		ctx ??= new AudioContext();
		const t = ctx.currentTime + at;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'square';
		osc.frequency.value = freq;
		gain.gain.setValueAtTime(0.04, t);
		gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
		osc.connect(gain).connect(ctx.destination);
		osc.start(t);
		osc.stop(t + ms / 1000);
	}

	function scan() {
		clearTimeout(resultTimer);
		// the very first scan always works; after that, 1 in 5 is a double scan
		if (scans++ > 0 && Math.random() < 0.2) {
			result = 'denied';
			beep(220);
			beep(220, 0.14);
		} else {
			result = 'ok';
			beep(1760, 0, 110);
		}
		resultTimer = setTimeout(() => (result = 'idle'), 900);
	}

	function overlapsReader() {
		if (!reader || !card) return false;
		const a = card.getBoundingClientRect();
		const b = reader.getBoundingClientRect();
		const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
		const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
		return ox > a.width * 0.35 && oy > a.height * 0.35;
	}

	function onDown(e: PointerEvent) {
		if (flying) return;
		down = { x: e.clientX, y: e.clientY };
		moved = false;
		held = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onMove(e: PointerEvent) {
		if (!down) return;
		const dx = e.clientX - down.x;
		const dy = e.clientY - down.y;
		if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
		drag = { x: dx, y: dy };
	}

	function onUp() {
		if (!down) return;
		down = null;
		held = false;
		if (!moved) tapScan();
		else if (overlapsReader()) scan();
		drag = { x: 0, y: 0 };
	}

	// No drag: glide the card over to the reader, scan, glide back.
	function tapScan() {
		if (!reader || !card || flying) return;
		const a = card.getBoundingClientRect();
		const b = reader.getBoundingClientRect();
		flying = true;
		drag = { x: b.left + b.width / 2 - (a.left + a.width / 2), y: 0 };
		setTimeout(() => {
			scan();
			drag = { x: 0, y: 0 };
			setTimeout(() => (flying = false), 300);
		}, 280);
	}

	// keyboard "click" (Enter/Space) arrives with detail === 0
	function onClick(e: MouseEvent) {
		if (e.detail === 0) tapScan();
	}
</script>

<div class="space-y-2">
	<div class="relative flex h-32 items-center justify-around rounded-lg bg-[#0a0a0a] px-3">
		<!-- the student card -->
		<button
			type="button"
			bind:this={card}
			class="card"
			class:held
			class:settling={!held}
			style="transform: translate({drag.x}px, {drag.y}px) rotate({held ? -3 : -6}deg)"
			data-nodrag
			aria-label="scan Gamal's student card"
			onpointerdown={onDown}
			onpointermove={onMove}
			onpointerup={onUp}
			onpointercancel={onUp}
			onclick={onClick}
		>
			<!-- ETH student card ("legi"). Everything is sized in cqw (1% of the card's
			     width), measured off the real card, so it scales as one piece. -->
			<img class="logo" src="{base}/eth-zurich-logo.svg" alt="" draggable="false" />
			<span class="band">
				<span class="who">
					<span>Hassan</span>
					<span>Gamal</span>
				</span>
				<span class="valid">Gültig bis / valid through</span>
			</span>
			<span class="photo">
				<svg viewBox="0 0 40 52" aria-hidden="true">
					<circle cx="20" cy="19" r="9" />
					<path d="M3 52c0-11 7.5-18 17-18s17 7 17 18z" />
				</svg>
			</span>
			<span class="studies">
				<span>Studies</span>
				<span>Comp Sc MSc</span>
				<span>22-777-777 VSETH</span>
			</span>
			<span class="big-s">S</span>
			<span class="until">07.03.2027</span>
		</button>

		<!-- the reader -->
		<div
			bind:this={reader}
			class="reader"
			class:ok={result === 'ok'}
			class:denied={result === 'denied'}
		>
			<span class="led"></span>
			<svg viewBox="0 0 24 24" class="waves" fill="none" stroke="currentColor" stroke-width="1.6">
				<path d="M8.5 9a4.5 4.5 0 0 1 0 6" stroke-linecap="round" />
				<path d="M11.5 6.5a8 8 0 0 1 0 11" stroke-linecap="round" />
				<path d="M14.5 4a11.5 11.5 0 0 1 0 16" stroke-linecap="round" />
			</svg>
			<span class="screen font-mono">
				{result === 'ok' ? 'WELCOME' : result === 'denied' ? 'ALREADY IN' : 'TAP CARD'}
			</span>
		</div>
	</div>
</div>

<style>
	.card {
		position: relative;
		z-index: 2;
		flex-shrink: 0;
		width: 8.25rem;
		aspect-ratio: 748 / 458;
		container-type: inline-size;
		border-radius: 0.45rem;
		border: 1px solid #a1a1aa;
		background: #fff;
		color: #111;
		font-family: 'Barlow', 'Helvetica Neue', Arial, sans-serif;
		font-weight: 500;
		line-height: 1;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.3),
			0 8px 18px rgba(0, 0, 0, 0.45);
		overflow: hidden;
		touch-action: none;
		cursor: grab;
		text-align: left;
	}

	.card.held {
		cursor: grabbing;
	}

	.card.settling {
		transition: transform 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
	}

	.card > * {
		position: absolute;
	}

	.logo {
		left: 8.8cqw;
		top: 7.4cqw;
		width: 32.2cqw;
		height: auto;
	}

	.band {
		left: 0;
		right: 0;
		top: 19.8cqw;
		height: 22.3cqw;
		background: #b9c4e3;
		border-block: 1px solid #7d8bb5;
	}

	.who {
		position: absolute;
		left: 8.8cqw;
		top: 5.4cqw;
		display: flex;
		flex-direction: column;
		gap: 1.2cqw;
		font-size: 4.4cqw;
	}

	.valid {
		position: absolute;
		right: 10.8cqw;
		bottom: 0.7cqw;
		font-size: 2.7cqw;
		white-space: nowrap;
	}

	/* the photo sits on top of the band, framed in white on three sides */
	.photo {
		left: 69.1cqw;
		top: 9.4cqw;
		width: 20cqw;
		height: 25.8cqw;
		border: 1.3cqw solid #fff;
		border-top: 0;
		background: #e7e7e9;
		overflow: hidden;
	}

	.photo svg {
		width: 100%;
		height: 100%;
		fill: #a1a1aa;
	}

	.studies {
		left: 8.8cqw;
		top: 45.5cqw;
		display: flex;
		flex-direction: column;
		gap: 0.9cqw;
		font-size: 3.9cqw;
	}

	.big-s {
		left: 51.9cqw;
		top: 42.5cqw;
		font-size: 20cqw;
		font-weight: 400;
		line-height: 1;
	}

	.until {
		left: 66.2cqw;
		top: 45.3cqw;
		font-size: 4.6cqw;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.reader {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		width: 4.25rem;
		height: 6.25rem;
		border-radius: 0.6rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: #18181b;
		color: #52525b;
		transition:
			border-color 0.15s,
			color 0.15s;
	}

	.waves {
		width: 1.75rem;
		height: 1.75rem;
	}

	.led {
		position: absolute;
		top: 0.45rem;
		right: 0.45rem;
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 9999px;
		background: #3f3f46;
		transition:
			background-color 0.1s,
			box-shadow 0.1s;
	}

	.screen {
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		background: #0a0a0a;
		font-size: 0.5rem;
		letter-spacing: 0.05em;
		white-space: nowrap;
		color: #71717a;
	}

	.reader.ok {
		border-color: #4ade80;
		color: #4ade80;
	}

	.reader.ok .led {
		background: #4ade80;
		box-shadow: 0 0 8px #4ade80;
	}

	.reader.ok .screen {
		color: #4ade80;
	}

	.reader.denied {
		border-color: #fb7185;
		color: #fb7185;
		animation: nope 0.3s ease-in-out;
	}

	.reader.denied .led {
		background: #fb7185;
		box-shadow: 0 0 8px #fb7185;
	}

	.reader.denied .screen {
		color: #fb7185;
	}

	@keyframes nope {
		25% {
			transform: translateX(-3px);
		}
		75% {
			transform: translateX(3px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card.settling {
			transition: none;
		}
		.reader.denied {
			animation: none;
		}
	}
</style>

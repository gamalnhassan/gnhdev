<script lang="ts">
	// A toy first-fit heap: 512 bytes split into 8-byte words. Allocations are
	// word-aligned and free() eagerly coalesces with free neighbours — the same
	// bookkeeping a real allocator does, just small enough to see. (Headers are
	// left out so the sizes on screen add up: 8 × malloc(64) fills it exactly.)

	const WORD = 8;
	const WORDS = 64;

	type Block = { id: number; start: number; size: number; free: boolean; req: number };

	let nextId = 0;
	let blocks = $state<Block[]>([]);
	let merged = $state<number | null>(null);

	// --- the malloc() button doubles as a scrubber ----------------------------
	// Pull it left/right to pick a size (one word per few px); the call button
	// next to it allocates. Arrow keys nudge it too.
	const MAX = WORDS * WORD;
	const PX_PER_WORD = 6;
	let bytes = $state(64);
	let scrub: { x: number; from: number } | null = null;
	let scrubbing = $state(false);

	const clampBytes = (n: number) => Math.min(MAX, Math.max(WORD, n));

	function onScrubDown(e: PointerEvent) {
		scrub = { x: e.clientX, from: bytes };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onScrubMove(e: PointerEvent) {
		if (!scrub) return;
		const dx = e.clientX - scrub.x;
		if (Math.abs(dx) > 3) scrubbing = true;
		bytes = clampBytes(scrub.from + Math.round(dx / PX_PER_WORD) * WORD);
	}

	function onScrubUp() {
		scrub = null;
		scrubbing = false;
	}

	function onScrubKey(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') bytes = clampBytes(bytes - WORD);
		else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') bytes = clampBytes(bytes + WORD);
		else if (e.key === 'Enter' || e.key === ' ') call();
		else return;
		e.preventDefault();
	}

	const hex = (n: number) => '0x' + n.toString(16).padStart(3, '0');

	/** First-fit allocate; returns the block's byte address, or null when nothing fits. */
	function malloc(bytes: number): number | null {
		const need = Math.ceil(bytes / WORD);
		const pick = blocks.find((b) => b.free && b.size >= need);
		if (!pick) return null;
		const i = blocks.indexOf(pick);
		const used: Block = { id: nextId++, start: pick.start, size: need, free: false, req: bytes };
		const rest = pick.size - need;
		if (rest > 0) blocks.splice(i, 1, used, { ...pick, start: pick.start + need, size: rest });
		else blocks.splice(i, 1, used);
		return used.start * WORD;
	}

	// Calling malloc() briefly shows its result in place of the button's label —
	// the address on a green ring, or NULL on a red one — then switches back.
	let result = $state<{ ok: boolean; text: string } | null>(null);
	let resultTimer: ReturnType<typeof setTimeout>;

	function call() {
		const addr = malloc(bytes);
		clearTimeout(resultTimer);
		result = addr === null ? { ok: false, text: 'NULL no fit' } : { ok: true, text: hex(addr) };
		resultTimer = setTimeout(() => (result = null), 1100);
	}

	function free(id: number) {
		let i = blocks.findIndex((b) => b.id === id);
		if (i < 0 || blocks[i].free) return;
		const b = blocks[i];
		b.free = true;
		b.req = 0;
		let coalesced = false;
		const next = blocks[i + 1];
		if (next?.free) {
			b.size += next.size;
			blocks.splice(i + 1, 1);
			coalesced = true;
		}
		const prev = blocks[i - 1];
		if (prev?.free) {
			prev.size += b.size;
			blocks.splice(i, 1);
			i--;
			coalesced = true;
		}
		if (coalesced) {
			merged = blocks[i].id;
			setTimeout(() => (merged = null), 450);
		}
	}

	// A deterministic, already-fragmented heap so there's something to look at
	// before the first click (and so SSR and hydration agree).
	function seed() {
		nextId = 0;
		blocks = [{ id: nextId++, start: 0, size: WORDS, free: true, req: 0 }];
		const ids: number[] = [];
		for (const n of [40, 16, 56, 24, 32, 48, 8]) {
			malloc(n);
			ids.push(nextId - 1);
		}
		free(ids[1]);
		free(ids[4]);
		merged = null;
	}
	seed();

	const used = $derived(blocks.reduce((s, b) => s + b.req, 0));
</script>

<div class="space-y-2 font-mono text-[0.65rem]">
	<div class="heap" data-nodrag>
		{#each blocks as b (b.id)}
			{#if b.free}
				<div
					class="block free"
					class:merged={merged === b.id}
					style="flex-basis: {(b.size / WORDS) * 100}%"
				></div>
			{:else}
				<button
					type="button"
					class="block used"
					class:alt={b.id % 2 === 1}
					style="flex-basis: {(b.size / WORDS) * 100}%"
					title="free({hex(b.start * WORD)})"
					aria-label="free the {b.req}-byte block at {hex(b.start * WORD)}"
					onclick={() => free(b.id)}
				>
					{#if b.size >= 5}<span>{b.req}</span>{/if}
				</button>
			{/if}
		{/each}
	</div>

	<div class="flex items-center gap-2">
		<button
			type="button"
			class="chip scrub"
			class:scrubbing
			class:ok={result?.ok === true}
			class:bad={result?.ok === false}
			aria-label="malloc {bytes} bytes. Drag sideways or use the arrow keys to change the size"
			onpointerdown={onScrubDown}
			onpointermove={onScrubMove}
			onpointerup={onScrubUp}
			onpointercancel={() => ((scrub = null), (scrubbing = false))}
			onkeydown={onScrubKey}
		>
			<span class="swap">
				<span class:hidden-face={result}>malloc(<span class="size">{bytes}</span>)</span>
				<span class="result" class:hidden-face={!result} aria-live="polite"
					>{result?.text ?? 'NULL no fit'}</span
				>
			</span>
		</button>
		<button type="button" class="chip" onclick={call}>call</button>
		<span class="ml-auto opacity-60">{used}/{MAX}B used</span>
	</div>
</div>

<style>
	.heap {
		display: flex;
		height: 2.25rem;
		gap: 2px;
		padding: 2px;
		border-radius: 0.5rem;
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		cursor: default;
	}

	.block {
		position: relative;
		min-width: 0;
		border-radius: 3px;
		transition: flex-basis 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.free {
		background: repeating-linear-gradient(
			-45deg,
			transparent 0 3px,
			color-mix(in srgb, currentColor 14%, transparent) 3px 4px
		);
	}

	.free.merged {
		animation: snap 0.45s ease-out;
	}

	@keyframes snap {
		0% {
			box-shadow: inset 0 0 0 1px var(--accent);
		}
		100% {
			box-shadow: inset 0 0 0 1px transparent;
		}
	}

	/* allocated: accent fill, with the header word drawn as a darker sliver */
	.used {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #0a0a0a;
		font-weight: 600;
		background: var(--accent);
		cursor: pointer;
		animation: drop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.used.alt {
		background: color-mix(in srgb, var(--accent) 70%, #fff);
	}

	.used:hover {
		filter: brightness(0.75);
	}

	@keyframes drop {
		from {
			transform: translateY(-6px) scaleY(0.6);
			opacity: 0;
		}
	}

	.chip {
		padding: 0.25rem 0.4rem;
		border-radius: 0.375rem;
		border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
		transition:
			border-color 0.15s,
			color 0.15s;
	}

	.chip:hover,
	.chip:focus-visible {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* the result flash switches instantly, so no colour easing on this chip */
	.scrub {
		transition: none;
		cursor: ew-resize;
		touch-action: none;
		user-select: none;
	}

	.scrub.scrubbing {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* label and result share one grid cell, so the chip keeps its width while
	   they swap */
	.swap {
		display: inline-grid;
	}

	.swap > * {
		grid-area: 1 / 1;
		text-align: center;
	}

	.swap > .hidden-face {
		visibility: hidden;
	}

	.scrub.ok {
		border-color: #4ade80;
		box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.45);
	}

	.scrub.ok .result {
		color: #4ade80;
	}

	.scrub.bad {
		border-color: #fb7185;
		box-shadow: 0 0 0 2px rgba(251, 113, 133, 0.45);
	}

	.scrub.bad .result {
		color: #fb7185;
	}

	/* fixed width so the chip doesn't wobble as the number changes */
	.size {
		display: inline-block;
		min-width: 3ch;
		text-align: center;
		font-weight: 600;
		border-bottom: 1px dashed currentColor;
	}

	@media (prefers-reduced-motion: reduce) {
		.block,
		.used,
		.free.merged {
			transition: none;
			animation: none;
		}
	}
</style>

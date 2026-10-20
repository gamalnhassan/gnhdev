<script lang="ts">
	import { fly } from 'svelte/transition';

	// One tiny Oat function, shown at each stage of the pipeline. Every line is
	// tagged with the source construct it came from, so hovering a line lights
	// up its counterparts — and the highlight survives switching stages.
	//   0 = function frame, 1 = `var y = x * x`, 2 = `return y`
	type Line = [group: number, code: string];

	const STAGES: { name: string; lines: Line[] }[] = [
		{
			name: 'oat',
			lines: [
				[0, 'int sq(int x) {'],
				[1, '  var y = x * x;'],
				[2, '  return y;'],
				[0, '}']
			]
		},
		{
			name: 'll',
			lines: [
				[0, 'define i64 @sq(i64 %x) {'],
				[0, '  %_x1 = alloca i64'],
				[0, '  store i64 %x, i64* %_x1'],
				[1, '  %_y2 = alloca i64'],
				[1, '  %_3 = load i64, i64* %_x1'],
				[1, '  %_4 = load i64, i64* %_x1'],
				[1, '  %_5 = mul i64 %_3, %_4'],
				[1, '  store i64 %_5, i64* %_y2'],
				[2, '  %_6 = load i64, i64* %_y2'],
				[2, '  ret i64 %_6'],
				[0, '}']
			]
		},
		{
			name: 'x86',
			lines: [
				[0, '_sq:'],
				[0, '  pushq %rbp'],
				[0, '  movq  %rsp, %rbp'],
				[0, '  subq  $16, %rsp'],
				[0, '  movq  %rdi, -8(%rbp)'],
				[1, '  movq  -8(%rbp), %rax'],
				[1, '  imulq -8(%rbp), %rax'],
				[1, '  movq  %rax, -16(%rbp)'],
				[2, '  movq  -16(%rbp), %rax'],
				[2, '  movq  %rbp, %rsp'],
				[2, '  popq  %rbp'],
				[2, '  retq']
			]
		}
	];
	const MAX_LINES = Math.max(...STAGES.map((s) => s.lines.length));

	let stage = $state(0);
	let hovered = $state<number | null>(null); // transient, from the pointer
	let pinned = $state<number | null>(null); // sticky, from a click/tap
	const active = $derived(hovered ?? pinned);
</script>

<div class="space-y-2 font-mono text-[0.62rem]">
	<div class="flex items-center gap-1 text-zinc-500">
		{#each STAGES as s, i (s.name)}
			{#if i > 0}<span aria-hidden="true">→</span>{/if}
			<button
				type="button"
				class="rounded px-1.5 py-0.5 transition-colors {stage === i
					? 'bg-white/10 text-white'
					: 'hover:text-zinc-300'}"
				aria-pressed={stage === i}
				onclick={() => (stage = i)}>{s.name}</button
			>
		{/each}
	</div>

	<div
		class="code relative overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] py-1.5"
		style="height: calc({MAX_LINES} * 1.5em + 0.75rem)"
		data-nodrag
		role="presentation"
		onmouseleave={() => (hovered = null)}
	>
		{#key stage}
			<ol class="absolute inset-x-0 top-1.5" in:fly={{ y: 8, duration: 200 }}>
				{#each STAGES[stage].lines as [group, code], n (n)}
					<li>
						<button
							type="button"
							class="line"
							class:lit={active === group}
							class:dim={active !== null && active !== group}
							onmouseenter={() => (hovered = group)}
							onclick={() => (pinned = pinned === group ? null : group)}
						>
							<span class="gutter">{n + 1}</span>{code}
						</button>
					</li>
				{/each}
			</ol>
		{/key}
	</div>
</div>

<style>
	.code {
		cursor: default;
	}

	.line {
		display: block;
		width: 100%;
		padding: 0 0.6rem 0 0;
		line-height: 1.5em;
		text-align: left;
		white-space: pre;
		color: #d4d4d8;
		transition:
			color 0.15s,
			background-color 0.15s,
			opacity 0.15s;
	}

	.gutter {
		display: inline-block;
		width: 1.9rem;
		padding-right: 0.6rem;
		text-align: right;
		color: #52525b;
		user-select: none;
	}

	.line.lit {
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
	}

	.line.dim {
		opacity: 0.35;
	}
</style>

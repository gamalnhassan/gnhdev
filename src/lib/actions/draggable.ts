export interface DraggableOptions {
	/** called when a drag begins */
	onStart?: () => void;
	/** called when a drag ends */
	onEnd?: () => void;
	/** pointerdown on an element matching this selector won't start a drag (e.g. links/buttons) */
	ignore?: string;
	/** viewport clamp margin in px */
	margin?: number;
	/** bring the element to the front when grabbed (default true) */
	raise?: boolean;
	/**
	 * Start already floating at this page position (page coordinates, incl.
	 * scroll) instead of in normal flow. Use for elements that are spawned at an
	 * arbitrary spot rather than docked in the layout — no flow spacer is made.
	 */
	initial?: { x: number; y: number };
}

/**
 * Makes an element float and be draggable across the page.
 *
 * It stays in normal document flow until the first drag, then pops out to
 * `position: absolute` (page coordinates, so it scrolls with the page) and
 * leaves a same-sized spacer behind so the layout doesn't jump.
 */
// Shared across all draggables so the most recently grabbed one always wins.
let topZ = 100;

export function draggable(node: HTMLElement, options: DraggableOptions = {}) {
	let opts = options;
	let pos: { x: number; y: number } | null = null;
	let dragging = false;
	let offset = { x: 0, y: 0 };
	let spacer: HTMLDivElement | null = null;

	function clamp(x: number, y: number) {
		const m = opts.margin ?? 8;
		const w = node.offsetWidth;
		const h = node.offsetHeight;
		const docH = document.documentElement.scrollHeight;
		return {
			x: Math.min(Math.max(m, x), window.innerWidth - w - m),
			y: Math.min(Math.max(m, y), docH - h - m)
		};
	}

	function apply() {
		if (!pos) return;
		node.style.position = 'absolute';
		// `pos` is in page coordinates, but `absolute` is resolved against the
		// padding box of the nearest positioned ancestor (the offset parent).
		// Subtract that ancestor's page position so a positioned wrapper around
		// the widget doesn't throw the coordinates off.
		const op = node.offsetParent as HTMLElement | null;
		let ox = 0;
		let oy = 0;
		if (op && op !== document.body && op !== document.documentElement) {
			const r = op.getBoundingClientRect();
			ox = r.left + window.scrollX + op.clientLeft;
			oy = r.top + window.scrollY + op.clientTop;
		}
		node.style.left = `${pos.x - ox}px`;
		node.style.top = `${pos.y - oy}px`;
	}

	function onPointerDown(e: PointerEvent) {
		if (opts.ignore && (e.target as HTMLElement).closest(opts.ignore)) return;
		dragging = true;
		// bring the just-grabbed widget above all the others
		if (opts.raise !== false) node.style.zIndex = `${++topZ}`;
		// first drag: pop out of flow, reserving the gap it leaves behind
		if (pos === null) {
			const rect = node.getBoundingClientRect();
			const cs = getComputedStyle(node);
			spacer = document.createElement('div');
			// Reserve the full box — width included — so that in a flex/grid row the
			// vacated slot keeps its place and the siblings don't re-flow to fill it.
			spacer.style.flex = '0 0 auto';
			spacer.style.width = `${node.offsetWidth}px`;
			spacer.style.height = `${node.offsetHeight}px`;
			spacer.style.marginTop = cs.marginTop;
			spacer.style.marginBottom = cs.marginBottom;
			spacer.style.marginLeft = cs.marginLeft;
			spacer.style.marginRight = cs.marginRight;
			// in a grid, hold the same cell so the other items don't get re-placed
			spacer.style.gridColumn = `${cs.gridColumnStart} / ${cs.gridColumnEnd}`;
			spacer.style.gridRow = `${cs.gridRowStart} / ${cs.gridRowEnd}`;
			spacer.style.justifySelf = cs.justifySelf;
			node.parentElement?.insertBefore(spacer, node);
			// the spacer now owns the margins; left on the node they'd shift it off `pos`
			node.style.margin = '0';
			pos = { x: rect.left + window.scrollX, y: rect.top + window.scrollY };
			apply();
		}
		offset = { x: e.clientX + window.scrollX - pos.x, y: e.clientY + window.scrollY - pos.y };
		node.setPointerCapture(e.pointerId);
		opts.onStart?.();
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging || !pos) return;
		pos = clamp(e.clientX + window.scrollX - offset.x, e.clientY + window.scrollY - offset.y);
		apply();
	}

	function onPointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		node.releasePointerCapture?.(e.pointerId);
		opts.onEnd?.();
	}

	node.style.touchAction = 'none';
	// Spawned-at-a-point elements start floating immediately (no flow spacer).
	if (opts.initial) {
		pos = { ...opts.initial };
		apply();
	}
	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', onPointerUp);

	return {
		update(newOptions: DraggableOptions) {
			opts = newOptions;
		},
		destroy() {
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerUp);
			spacer?.remove();
		}
	};
}

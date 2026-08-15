export interface TapOptions {
	/** called on pointer release when the gesture was a tap (no real movement) */
	onTap?: () => void;
	/** how far the pointer may travel and still count as a tap, in px */
	slop?: number;
}

/**
 * Fires `onTap` when the element is tapped/clicked without dragging — i.e. the
 * pointer barely moved between press and release. Composes with `draggable` on
 * the same element so a drag doesn't also register as a tap.
 */
export function tap(node: HTMLElement, options: TapOptions = {}) {
	let opts = options;
	let down: { x: number; y: number } | null = null;
	let moved = false;

	function onPointerDown(e: PointerEvent) {
		down = { x: e.clientX, y: e.clientY };
		moved = false;
	}

	function onPointerMove(e: PointerEvent) {
		if (!down) return;
		const slop = opts.slop ?? 4;
		if (Math.abs(e.clientX - down.x) > slop || Math.abs(e.clientY - down.y) > slop) moved = true;
	}

	function onPointerUp() {
		if (down && !moved) opts.onTap?.();
		down = null;
	}

	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', onPointerUp);

	return {
		update(newOptions: TapOptions) {
			opts = newOptions;
		},
		destroy() {
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerUp);
		}
	};
}

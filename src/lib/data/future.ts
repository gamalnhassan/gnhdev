import type { FutureProject } from '$lib/types';
import DroneToy from '$lib/components/future/DroneToy.svelte';
import SkyBackdrop from '$lib/components/future/SkyBackdrop.svelte';

export const future: FutureProject[] = [
	{
		title: 'TSRCT: Drone, Round Two',
		tags: ['Drones', 'Computer Vision', 'Distributed Swarms'],
		description: [
			'For my Matura thesis I built a quadcopter from scratch, with an Arduino Uno as its flight controller.',
			'I’d like to pick it back up: first make it fly stable, then play around with computer vision on board, and eventually get a small swarm of drones coordinating as a distributed system.'
		],
		label: 'hover the drone to send it flying',
		toy: DroneToy,
		backdrop: SkyBackdrop,
		tilt: -0.6
	}
];

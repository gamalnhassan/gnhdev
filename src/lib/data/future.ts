import type { Project } from '$lib/types';
import DroneToy from '$lib/components/future/DroneToy.svelte';

export const future: Project[] = [
	{
		title: 'TSRCT: Drone, Round Two',
		stack: ['Drones', 'Computer Vision', 'Distributed Systems'],
		description: [
			'For my Matura thesis I built a quadcopter from scratch, with an Arduino Uno as its flight controller.',
			'I’d like to pick it back up: first make it fly stable, then play around with computer vision on board, and eventually get a small swarm of drones coordinating as a distributed system.'
		],
		toy: DroneToy,
		toyWidth: '11rem',
		toyGap: '1rem',
		toyDrop: '1rem',
		arrowLow: true,
		fixed: true
	}
];

import type { Component } from 'svelte';

export interface Project {
	title: string;
	/** optional small line under the title */
	subtitle?: string;
	/** languages / hardware, shown as chips under the title */
	stack: string[];
	/** plain-text paragraphs shown under the toy (and readable without JS) */
	description: string[];
	/** the pop-up hint shown above the card on hover */
	label: string;
	/** the interactive toy rendered inside the card */
	toy: Component;
	/** resting tilt in degrees */
	tilt: number;
	/**
	 * Where the card starts on the desk (a 2-column grid, all cards in one row so
	 * they can overlap). On narrow screens cards just stack instead.
	 */
	place: { column: string; top: number; left: number; justify: 'start' | 'end' };
}

export interface FutureProject {
	title: string;
	/** optional small line under the title */
	subtitle?: string;
	/** topics, shown under the title like a project's stack */
	tags: string[];
	/** plain-text paragraphs */
	description: string[];
	/** the pop-up hint shown above the card on hover */
	label: string;
	/** the interactive toy parked in the card's bottom-right corner */
	toy: Component;
	/** optional scenery painted into the card behind the text (fills the card) */
	backdrop?: Component;
	/** resting tilt in degrees (kept small — these cards span the full width) */
	tilt: number;
}

export interface Song {
	title: string;
	artist: string;
	cover: string;
	/** 30s preview clip (Spotify CDN, resolved at build time) */
	preview: string;
	spotify: string;
	/** the pop-up caption shown above the widget, e.g. "Currently stuck in my head" */
	label: string;
}

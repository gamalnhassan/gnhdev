import type { Component } from 'svelte';

export interface Project {
	title: string;
	/** optional small line under the title */
	subtitle?: string;
	/** languages / hardware (or topics, for future ones), shown under the title */
	stack: string[];
	/** plain-text paragraphs (readable without JS) */
	description: string[];
	/** the interactive toy shown beside the text */
	toy: Component;
	/** how wide the toy is (default 18.25rem) */
	toyWidth?: string;
	/** how far below the title line the toy sits, in the margin */
	toyDrop?: string;
	/** extra space between the toy and its arrow */
	toyGap?: string;
	/** keep the toy in place (it can't be picked up and dragged) */
	fixed?: boolean;
	/** start the arrow lower down, for a toy whose body sits below the title line */
	arrowLow?: boolean;
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

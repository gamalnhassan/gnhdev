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

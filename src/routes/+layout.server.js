import { loadFlash } from "sveltekit-flash-message/server";

export const trailingSlash = "never";
export const ssr = false;

/** @type {import('./$types').LayoutServerLoad} */
export const load = loadFlash(async (event) => {

	event.setHeaders({
		"Cross-Origin-Opener-Policy": "same-origin",
		"Cross-Origin-Embedder-Policy": "require-corp",
	});

	return {
		uid: event.locals.uid,
		user: event.locals.user,
	}
});
import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {

	if(!event.locals.user) {
		redirect(302, "/login");
	}

	return {

	};
}
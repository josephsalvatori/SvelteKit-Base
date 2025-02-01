import { redirect } from "sveltekit-flash-message/server";
import { messages } from "$ext/config/messages";

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {

	if(!event.locals.user) {
		redirect(302, "/login");
	}

	return {};
};

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {

		if(!event.locals.user || !event.locals.session) redirect(302, "/login");

		/** Logout action here */

		const message = { type: "success", message: messageSchema.logoutSuccessful };

		redirect("/login", message, event.cookies);
	}
};
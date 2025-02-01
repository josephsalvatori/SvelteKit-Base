import { fail } from "@sveltejs/kit";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { messages } from "$ext/config/messages";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {

	const { token } = params;

	if(!token) {
		return fail(500, { error: "No token provided" });
	}

	let heading = "Email Verification Problem";
	let message = "Your email could not be verified. Please contact support if you feel this is an error.";

	try {

		/** Verify email action */

	} catch(err) {

		return fail(500, { error: err.message });
	}

	return {
		heading,
		message
	}
};
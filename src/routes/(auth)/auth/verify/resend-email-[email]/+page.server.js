import { fail } from "@sveltejs/kit";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { messages } from "$ext/config/messages";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {

	const { email } = params;

	if(!email) {
		return fail(500, { error: "No email provided" });
	}

	let heading = "Email Verification Problem";
	let message = "Your email could not be verified. Please contact support if you feel this is an error.";

	try {

		let decodedEmail = decodeURIComponent(email);

		/** Verify email action */

	} catch(err) {

		return fail(500, { error: err.message });
	}

	return {
		heading,
		message
	}
};
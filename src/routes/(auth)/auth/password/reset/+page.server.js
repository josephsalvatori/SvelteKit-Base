import { fail } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { zod } from "sveltekit-superforms/adapters";
import { userSchema } from "$ext/zod/schemas/user";
import { messages } from "$ext/config/messages";

const resetPasswordSchema = userSchema.pick({ email: true });

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {

	if(event.locals.user) {
		redirect(302, "/dashboard");
	}

	const form = await superValidate(event, zod(resetPasswordSchema));

	return {
		form
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {

		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(resetPasswordSchema));

		if(!form.valid) {

			return fail(400, {
				form
			});
		}

		try {

			/** Reset password action */

		} catch(err) {

			setFlash({ type: "error", message: messages.resetPasswordInvalid }, event);

			return setError(form);
		}

		const message = { type: "success", message: messages.resetPasswordSuccessful };

		redirect("/auth/password/reset/success", message, event.cookies);
	}
};
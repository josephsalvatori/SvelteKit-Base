import { fail } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { zod } from "sveltekit-superforms/adapters";
import { userSchema } from "$ext/zod/schemas/user";
import { messages } from "$ext/config/messages";

const loginSchema = userSchema.pick({ email: true, password: true });

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {

	if(event.locals.user) {
		redirect(302, "/dashboard");
	}

	const form = await superValidate(event, zod(loginSchema));

	return {
		form
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {

		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(loginSchema));

		if(!form.valid) {

			return fail(400, {
				form
			});
		}

		try {

			/** Login action */

			setFlash({ type: "success", message: messages.loginSuccessful }, event);

		} catch(err) {

			setFlash({ type: "error", message: messages.loginInvalid }, event);

			return setError(form);
		}

		return {
			form
		};
	}
};
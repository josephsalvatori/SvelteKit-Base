import { fail } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { zod } from "sveltekit-superforms/adapters";
import { userSchema } from "$ext/zod/schemas/user";
import { messages } from "$ext/config/messages";

const registerSchema = userSchema.pick({
	firstName: true,
	lastName: true,
	email: true,
	password: true,
	confirmPassword: true
});

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {

	if(event.locals.user) {
		redirect(302, "/dashboard");
	}

	const form = await superValidate(event, zod(registerSchema));

	return {
		form
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {

		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(registerSchema));

		if(!form.valid) {

			return fail(400, {
				form
			});
		}

		try {

			/** Register action */

			setFlash({ type: "success", message: messages.registerSuccessful }, event);

		} catch(err) {

			setFlash({ type: "error", message: messages.registerInvalid }, event);

			return setError(form);
		}

		return {
			form
		};
	}
};
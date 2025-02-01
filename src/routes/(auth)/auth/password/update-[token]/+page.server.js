import { fail } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { zod } from "sveltekit-superforms/adapters";
import { userSchema } from "$ext/zod/schemas/user";
import { messages } from "$ext/config/messages";

const updatePasswordSchema = userSchema.pick({ password: true, confirmPassword: true });

updatePasswordSchema.superRefine(({ confirmPassword, password }, ctx) => {

	if(password !== confirmPassword) {
		ctx.addIssue({ path: ["confirmPassword"], message: "Passwords do not match" });
	}
});

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {

	if(event.locals.user) {
		redirect(302, "/dashboard");
	}

	const form = await superValidate(event, zod(updatePasswordSchema));

	return {
		form
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {

		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(updatePasswordSchema));

		if(!form.valid) {

			return fail(400, {
				form
			});
		}

		const token = event.params.token;

		try {

			/** Update password action */

		} catch(err) {

			setFlash({ type: "error", message: messages.resetUpdateInvalid }, event);

			return setError(form, messages.resetUpdateInvalid);
		}

		const message = { type: "success", message: messages.resetUpdateSuccessful };

		redirect(`/auth/password/update-${token}/success`, message, event.cookies);
	}
};
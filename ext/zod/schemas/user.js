import { z } from "zod";

const userSchema = z.object({
	firstName: z
		.string({ required_error: "" })
		.min(1, { message: ""})
		.trim(),
	lastName: z
		.string({ required_error: "" })
		.min(1, { message: ""})
		.trim(),
	email: z
		.string({ required_error: "" })
		.email({ message: "" }),
	password: z
		.string({ required_error: "" })
		.min(8, { message: "" })
		.trim(),
	confirmPassword: z
		.string({ required_error: "" })
		.min(8, { message: "" })
		.trim(),
});

// .superRefine(({ confirmPassword, password }, ctx) => {

// 	if (confirmPassword !== password) {

// 		ctx.addIssue({
// 			code: "custom",
// 			message: "Passwords do not match",
// 			path: ["confirmPassword"]
// 		});
// 	}
// })

export {
	userSchema,
	userSchema as UserSchema,
};
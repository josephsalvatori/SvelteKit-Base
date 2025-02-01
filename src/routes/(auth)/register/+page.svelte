<script>
import { dev } from "$app/environment";
import SuperDebug from "sveltekit-superforms";
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import { Loader2 } from "lucide-svelte";
import * as Card from "$lib/components/ui/card/index";
import * as Form from "$lib/components/ui/form/index";
import { Input } from "$lib/components/ui/input";
import { userSchema } from "$ext/zod/schemas/user";

/** @type {import('./$types').PageProps} */
let { data } = $props();

const registerSchema = userSchema.pick({
	firstName: true,
	lastName: true,
	email: true,
	password: true,
	confirmPassword: true,
});

const form = superForm(data?.form, {
	dataType: "json",
	validators: zodClient(registerSchema),
});

const { form: formData, enhance, errors, submitting } = form;

</script>

<form method="POST" use:enhance>
	<Card.Root class="">
		<Card.Header>
			<Card.Title level="1">
				<h1>Register</h1>
			</Card.Title>
			<Card.Description>
				Already have an account? <a href="/login" class="underline">Log in here.</a>
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid tb:grid-cols-2 gap-4">
				<Form.Field {form} name="firstName">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>First Name</Form.Label>
							<Input {...props} type="firstName" bind:value={$formData.firstName} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="lastName">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Last Name</Form.Label>
							<Input {...props} type="lastName" bind:value={$formData.lastName} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Email</Form.Label>
						<Input {...props} type="email" bind:value={$formData.email} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Password</Form.Label>
						<Input {...props} type="password" bind:value={$formData.password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
		<Card.Footer class="flex-col space-y-4 md:space-y-6">
			<Form.Button class="w-full" type="submit" disabled={$submitting}>
				{#if $submitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Please wait
				{:else}
					Log in
				{/if}
			</Form.Button>
			<div class="text-sm">
				<a href="/auth/password/reset" class="underline">Forgot your password?</a>
			</div>
			{#if dev}
				<div class="w-full">
					<SuperDebug data={$formData} />
				</div>
			{/if}
		</Card.Footer>
	</Card.Root>
</form>
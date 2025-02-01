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

const loginSchema = userSchema.pick({ email: true, password: true });

const form = superForm(data?.form, {
	dataType: "json",
	validators: zodClient(loginSchema),
});

const { form: formData, enhance, errors, submitting } = form;

</script>

<form method="POST" use:enhance>
	<Card.Root class="">
		<Card.Header>
			<Card.Title level="1">
				<h1>Login</h1>
			</Card.Title>
			<Card.Description>
				Don't have an account yet? <a href="/register" class="underline">Register here.</a>
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
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
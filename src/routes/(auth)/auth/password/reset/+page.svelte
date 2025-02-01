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

const resetPasswordSchema = userSchema.pick({ email: true });

const form = superForm(data?.form, {
	dataType: "json",
	validators: zodClient(resetPasswordSchema),
});

const { form: formData, enhance, errors, submitting } = form;

</script>

<form method="POST" use:enhance>
	<Card.Root class="">
		<Card.Header>
			<Card.Title level="1">
				<h1>Reset Your Password</h1>
			</Card.Title>
			<Card.Description>
				Enter your email to receive instructions to reset your password.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Email</Form.Label>
						<Input {...props} type="email" bind:value={$formData.email} />
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
					Reset Password
				{/if}
			</Form.Button>
			{#if dev}
				<div class="w-full">
					<SuperDebug data={$formData} />
				</div>
			{/if}
		</Card.Footer>
	</Card.Root>
</form>
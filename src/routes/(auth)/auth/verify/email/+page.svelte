<script>
/** @type {import('./$types').PageProps} */
let { data } = $props();
</script>

<section class="container grid items-center gap-6">
	<div class="flex max-w-[980px] flex-col items-start gap-2">
		<h1 class="text-3xl font-extrabold leading-tight md:text-4xl">Confirm Your Email Address</h1>
		<p class="max-w-[700px] text-lg text-muted-foreground">
			Please check your email account for a message to confirm your email address. If you did not receive the email,
			<a data-sveltekit-preload-data="false" href="/verify/resend-email-{encodeURIComponent(data.user?.email)}" class="underline">click here</a> to resend it.
		</p>
	</div>
</section>
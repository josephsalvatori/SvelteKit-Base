<script>
/** @type {import('./$types').PageProps} */
let { data } = $props();
</script>

<section class="container grid items-center gap-6">
	<div class="flex max-w-[980px] flex-col items-start gap-2">
		<h1 class="text-3xl font-extrabold leading-tight md:text-4xl">{data.heading}</h1>
		<p class="max-w-[700px] text-lg text-muted-foreground">
			{data.message}
		</p>
	</div>
</section>
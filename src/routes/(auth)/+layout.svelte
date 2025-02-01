<script>

/** @type {import('./$types').PageProps} */
let { data, children } = $props();

$inspect(data);
</script>

<main id="main" data-uid={data.uid} class="flex flex-grow items-center justify-center py-4 md:py-8">
	{@render children?.()}
</main>
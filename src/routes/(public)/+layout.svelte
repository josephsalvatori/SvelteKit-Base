<script>
/** @type {import('./$types').LayoutProps} */
let { data, children } = $props();
</script>

<main id="main" data-uid={data.uid} class="">
	{@render children?.()}
</main>
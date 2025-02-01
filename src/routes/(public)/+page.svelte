<script>
import { getContext, onMount } from "svelte";

/** @type {import('./$types').PageProps} */
let { data } = $props();

let homeTerminalCopy = `Home Page.`;

let terminalCtx = getContext("terminalCtx");

onMount(() => {

	if(terminalCtx.cmd) {
		terminalCtx.cmd.write(homeTerminalCopy);
		terminalCtx.fn.reset();
		terminalCtx.cmd?.focus();
	}
});
</script>
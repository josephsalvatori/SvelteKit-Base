<script>
import { getContext, onMount } from "svelte";

/** @type {import('./$types').PageProps} */
let { data } = $props();

let aboutTerminalCopy = `Here is a longer description about me for the terminal.`;

let terminalCtx = getContext("terminalCtx");

onMount(() => {

	if(terminalCtx.cmd) {
		terminalCtx.cmd.write(aboutTerminalCopy);
		terminalCtx.fn.reset();
	}
});
</script>
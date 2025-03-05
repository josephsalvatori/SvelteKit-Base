<script>
import { getContext, onMount } from "svelte";

/** @type {import('./$types').PageProps} */
let { data } = $props();

let contactTerminalCopy = `Contact me.`;

let terminalCtx = getContext("terminalCtx");

terminalCtx.currentPage = "contact";
terminalCtx.currentPageCopy = contactTerminalCopy;
</script>
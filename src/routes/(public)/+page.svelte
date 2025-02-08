<script>
import { getContext, onMount } from "svelte";

/** @type {import('./$types').PageProps} */
let { data } = $props();

let homeTerminalCopy = `Here is some home page copy.`;

let terminalCtx = getContext("terminalCtx");

terminalCtx.currentPage = "home";
terminalCtx.currentPageCopy = homeTerminalCopy;
</script>
<script>
import { getContext, onMount } from "svelte";

/** @type {import('./$types').PageProps} */
let { data } = $props();

let homeTerminalCopy = `.`;

let terminalCtx = getContext("terminalCtx");

terminalCtx.currentPage = "home";
terminalCtx.currentPageCopy = homeTerminalCopy;
</script>
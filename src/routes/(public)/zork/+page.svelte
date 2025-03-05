<script>
import { getContext, onMount } from "svelte";
import { terminal } from "$lib/helpers/terminal";

/** @type {import('./$types').PageProps} */
let { data } = $props();

let terminalCtx = getContext("terminalCtx");

let playCmd = `play zork`;
let commands = terminal.getOutput(playCmd);

terminalCtx.currentPage = "zork";
terminalCtx.currentPageCmd = playCmd;
// terminalCtx.currentPageCommands = commands;
</script>
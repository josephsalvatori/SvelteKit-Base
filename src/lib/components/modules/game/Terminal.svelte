<script>
import { page } from "$app/state";
import { goto } from "$app/navigation";
import { getContext, onMount } from "svelte";
import { Xterm, XtermAddon } from "@battlefieldduck/xterm-svelte";
import { terminal } from "$lib/helpers/terminal.js";
// import { Zork } from "./zork/game.js";

let gameState = getContext("gameState");
let siteState = getContext("siteState");
let terminalCtx = getContext("terminalCtx");

/** @type {import('@battlefieldduck/xterm-svelte').Terminal} */
let cmd = $state(undefined);
let cmdOpts = {
	fontFamily: "monospace",
	cursorBlink: true,
	rendererType: "dom",
	minimumContrastRatio: 7,
};
let cmdCfg = {
	lineStart: "> ",
	cursorDel: "\b \b",
	cursorLeft: "\u001B[1D",
};

/** Stash our terminal */
// game.zork = new Zork();

let command = $state("");
let previousCmds = $state([]);
let lock = $state(false);

const MAX_INPUT_LENGTH = 50;

/** Terminal Loader */
async function onLoad() {

	// FitAddon Usage
	const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();

	cmd.loadAddon(fitAddon);

	fitAddon.fit();

	// pass into context
	terminalCtx.cmd = cmd;
	terminalCtx.cmdCfg = cmdCfg;
	terminalCtx.fn = {
		reset: resetCmd
	}

	// set up the initial screen
	cmd.write("\r\n");
	cmd.write(terminal.output.init);
	cmd.write("\r\n\r\n");
	cmd.write(cmdCfg.lineStart);

	// initialize the terminal
	// if(!game.zork.terminal) game.zork.terminal = cmd;
	// if(!game.zork.terminalConfig) game.zork.terminalConfig = cmdCfg;

	// game.zork.init();
}

function onData(data) {

	console.log("onData()", data);
}

function onKey({ key, domEvent }) {

	if(lock) return;

	// console.log("onKey()", domEvent.key);

	// Blocked keys
	if(terminal.disabledKeys.includes(domEvent.key)) return;

	if(domEvent.key === "Backspace") {

		backspace();

		return;
	}

	if(domEvent.key === "Enter") {

		prompt();

		return;
	}

	// max length string
	if(command.length >= MAX_INPUT_LENGTH) return;

	command += key;

	cmd.write(key);
}

function backspace() {

	const cursor = cmd._core.buffer.x;

	if(cursor <= cmdCfg.lineStart.length) return;

	cmd.write("\b \b");

	command = command.slice(0, -1);
}

function resetCmd() {

	cmd.write("\r\n\r\n");
	cmd.write(cmdCfg.lineStart);

	command = "";
}

function prompt() {

	if(command === "") return;
	// lock = true;

	// always add spacing for command output
	cmd.write("\r\n\r\n");

	let cmdOutput = terminal.getOutput(command);

	// bad command
	if(!cmdOutput) {

		cmd.write(terminal.output.unknown);

		// reset
		resetCmd();

		return;
	}

	// add some function calls
	if(cmdOutput?.type === "cmdFn") {

		switch(cmdOutput.cmd) {
			case "clear":
				cmd.clear();
				cmd.write(cmdCfg.lineStart);
				return;
			case "init":
				cmd.reset();
				return;
			// Navigation items
			case "home":
				goto(`/`);
				break;
			case "about":
				goto(`/${cmdOutput.cmd}`);
				break;
			default:
				break;
		}

		return;
	}

	cmd.write(cmdOutput);

	// now reset
	resetCmd();

	// game.zork.terminal.write("\r\n\r\n");

	// game.zork.submitCommand(command, () => {

	// 	lock = false;

	// 	command = "";
	// });
}

onMount(() => {
	// Maybe move onLoad here?
});
</script>

<div class="h-full">
	<Xterm class="h-full" bind:terminal={cmd} options={cmdOpts} {onLoad} {onData} {onKey} />
</div>

<style>
:global(.xterm-screen) {
	padding: 0 10px 0 10px;
}
</style>
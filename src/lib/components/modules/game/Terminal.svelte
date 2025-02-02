<script>
import { page } from "$app/state";
import { afterNavigate, goto } from "$app/navigation";
import { getContext, onMount } from "svelte";
import { innerWidth } from "svelte/reactivity/window";
import { Xterm, XtermAddon } from "@battlefieldduck/xterm-svelte";
import { terminal, cfg } from "$lib/helpers/terminal.js";
// games
import { Zork } from "./zork/game.js";

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
	acceptedCharacters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':,.<>/?`~ ",
	lineStart: "> ",
	cursorDel: "\b \b",
	cursorLeft: "\u001B[1D",
};

/** Stash our terminal */
// game.zork = new Zork();

let command = $state("");
let previousCmds = $state([]);
let lock = $state(true);
let lineSize = $derived.by(() => {
	if(innerWidth.current > 768) return "dk";
	return "mb";
});

const MAX_INPUT_LENGTH = 38;

$inspect(lineSize);

/** Terminal Loader */
async function onLoad() {

	// FitAddon Usage
	const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();

	cmd.loadAddon(fitAddon);

	fitAddon.fit();

	/** @type {import('@battlefieldduck/xterm-svelte').Terminal} */
	terminalCtx.cmd = cmd;
	terminalCtx.size = lineSize;
	terminalCtx.cmdCfg = cmdCfg;
	terminalCtx.fn = {
		reset: resetCmd
	};
	terminalCtx.loaded = true;

	// set up the initial screen
	cmd.write(cfg.newLine);
	cmd.write(terminal.output[lineSize].init);

	// initialize the terminal
	// if(!game.zork.terminal) game.zork.terminal = cmd;
	// if(!game.zork.terminalConfig) game.zork.terminalConfig = cmdCfg;

	// game.zork.init();
}

// handle character input
function onData(o) {

	if(cmdCfg.acceptedCharacters.indexOf(o) <= -1) return;
	if(command.length >= MAX_INPUT_LENGTH) return;

	command += o;

	cmd.write(o);

	console.log("onData()", o);

	return;
}

// handle functions
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

		if(siteState.mode === "game") {

			gameState[siteState.game].submitCommand(command, () => {
				command = "";
			});

			return;
		}

		prompt();

		return;
	}


}

/** Delete current buffer, up to the prepend */
const backspace = () => {

	const cursor = cmd._core.buffer.x;
	const length = (terminalCtx.prepend.length > 10) ? ((terminalCtx.prepend.length - 12) + cmdCfg.lineStart.length) : (terminalCtx.prepend.length + cmdCfg.lineStart.length);

	if(cursor <= length) return;

	cmd.write("\b \b");

	command = command.slice(0, -1);
};

const resetCmd = (full = true) => {

	cmd.write((full) ? cfg.newLineFull : cfg.newLine);
	cmd.write(terminalCtx.prepend + cmdCfg.lineStart);

	command = "";

	lock = false;
};

function prompt() {

	if(command === "" || lock === true) return;

	lock = true;

	let cmdOutput = terminal.getOutput(command, lineSize);

	// bad command
	if(!cmdOutput) {

		cmd.write(cfg.newLineFull);
		cmd.write(terminal.output[lineSize].unknown);

		// reset
		resetCmd();

		return;
	}

	// sometimes these are arrays, for multiple commands
	let cmdRun = cmdOutput[0] || cmdOutput;

	// add some function calls
	if(cmdRun.type === "cmdFn" || cmdRun.type === "hiddenFn" || cmdRun.type === "secondaryFn") {

		switch(cmdRun.cmd) {
			case "clear":
				cmd.reset();
				resetCmd(false);
				break;
			case "init":
				cmd.reset();
				setTimeout(() => {
					cmd.write(cfg.newLine);
					cmd.write(terminal.output[lineSize].init);
					resetCmd();
				}, 500);
				break;
			// Load a game and move into the game state.
			case "play":

				if(!cmdOutput[1]?.cmd) {
					cmd.write(cfg.newLineFull);
					cmd.write(`${cmdRun?.name || cmdRun.cmd} what?`);
					resetCmd();
					break;
				}

				let game = cmdOutput[1].cmd;

				if(!gameState[game]) {

					switch(game) {
						case "zork":
							gameState[game] = new Zork(cmd);
							break;
						default:
							return false;
					}

					cmd.write(cfg.newLineFull);
					cmd.write(`Loading ${cmdOutput[1]?.name || game}...`);

					console.log(gameState[game]);

					// run the preload function from the game
					gameState[game].cmd = cmd;
					gameState[game].preload(() => {
						lock = false;
					});

				}

				siteState.mode = "game";
				siteState.game = game;

				gameState[game].init();

				// TODO: run a callback from the game initilizer to clear() then write the game script
				break;
			// Navigation items
			case "home":
				if(page.url.pathname !== `/`) goto(`/`, { keepfocus: true });
				break;
			case "about":
				if(page.url.pathname !== `/${cmdRun.cmd}`) goto(`/${cmdRun.cmd}`, { keepfocus: true });
				break;
			default:
				break;
		}

		return;
	}

	// always add spacing for command output
	cmd.write(cfg.newLineFull);
	cmd.write(cmdOutput);

	// now reset
	resetCmd();

	// game.zork.terminal.write("\r\n\r\n");

	// game.zork.submitCommand(command, () => {

	// 	lock = false;

	// 	command = "";
	// });
}

let displayPage = $state(null);

$effect(() => {

	/** Watching for changes on the current page */
	if(terminalCtx.loaded && terminalCtx.currentPage !== siteState.currentPage) {

		siteState.currentPage = terminalCtx.currentPage;
		terminalCtx.prepend = terminalCtx.currentPage === "home" ? "" : `${cfg.colors.black}[S:${page.url.pathname.replace("/", "\\")}]${cfg.colors.reset}`;

		if(terminalCtx.currentPageCopy) {
			terminalCtx.cmd.write(cfg.newLineFull);
			terminalCtx.cmd.write(terminalCtx.currentPageCopy);
		}

		terminalCtx.fn.reset();
		terminalCtx.cmd.focus();
	}
});

// SvelteKit Navigation focus fix
afterNavigate(() => {
	if(terminalCtx.loaded) terminalCtx.cmd.focus();
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
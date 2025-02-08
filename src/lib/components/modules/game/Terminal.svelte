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

let command = $state("");
let previousCmds = $state([]);
let lock = $state(true);
let lineSize = $derived.by(() => {
	if(innerWidth.current > 768) return "dk";
	return "mb";
});

const MAX_INPUT_LENGTH = 38;

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
		reset: resetCmd,
		updatePrepend: () => {
			terminalCtx.prepend = (gameState.config.mode !== null) ? "" : `${cfg.colors.black}[S:${page.url.pathname.replace("/", "\\")}]${cfg.colors.reset}`;
		}
	};
	terminalCtx.loaded = true;

	// set up the initial screen
	cmd.write(cfg.newLine);
	cmd.write(terminal.output[lineSize].init);
}

// handle character input
function onData(o) {

	if(cmdCfg.acceptedCharacters.indexOf(o) <= -1) return;
	if(command.length >= MAX_INPUT_LENGTH) return;

	command += o;

	cmd.write(o);

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

		if(gameState.config.mode === "game") {

			let game = gameState.config.game;

			gameState[game].submitCommand(command, (result) => {

				let slot = result?.slot || 0;

				if(result.valid === true) {

					let saveObj = siteState.current;

					if(result.cmds) {
						saveObj.saves[game][slot].cmds = result.cmds;
					}

					if(result.rnds) {
						saveObj.saves[game][slot].rnds = result.rnds;
					}
				}

				resetCmd();
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

const resetCmd = (full = true, reset = false) => {

	if(reset) {
		cmd.reset();
	}

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

				gameState.config.mode = "game";
				gameState.config.game = game;

				terminalCtx.fn.updatePrepend();

				if(!gameState[game]) {

					let saveKey = game;

					switch(game) {
						case "zork":
							gameState[game] = new Zork(cmd);
							if(!siteState.current.saves[saveKey]) siteState.current.saves[saveKey] = [{ cmds: [], rnds: [] }];
							break;
						default:
							if(!siteState.current.saves[saveKey]) {
								siteState.current.saves[saveKey] = [{ cmds: [], rnds: [] }]
							}
							return false;
					}

					cmd.reset();

					cmd.write(cfg.newLine);
					cmd.write(`Loading ${cmdOutput[1]?.name || game}...`);

					// run the preload function from the game
					gameState[game].cmd = cmd;
					gameState[game].preload(() => {

						// this is ultimately a fake load time
						setTimeout(() => {

							lock = false;

							gameState[game].init(siteState.current.saves[saveKey][0]);

							resetCmd();

						}, 500);
					});
				}

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
}

$effect(() => {

	/** Watching for changes on the current page */
	if(terminalCtx.loaded && terminalCtx.currentPage !== page.url.pathname) {

		terminalCtx.currentPage = page.url.pathname;
		terminalCtx.fn.updatePrepend();

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
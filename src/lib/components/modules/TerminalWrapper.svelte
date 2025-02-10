<script>
import { browser } from "$app/environment";
import { page } from "$app/state";
import { afterNavigate, goto } from "$app/navigation";
import { getContext, onMount } from "svelte";
import { innerWidth } from "svelte/reactivity/window";
// import { Xterm, XtermAddon } from "@battlefieldduck/xterm-svelte";
import Terminal from "$lib/components/modules/Terminal.svelte";
import { terminal, cfg } from "$lib/helpers/terminal.js";

let gameState = getContext("gameState");
let siteState = getContext("siteState");
let saveState = getContext("saveState");
let terminalCtx = getContext("terminalCtx");
let achievementCtx = getContext("achievementCtx");

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
let loadedGames = $state({
	zork: false,
	planetfall: false,
});
let lock = $state(true);
let lineSize = $derived.by(() => {
	if(innerWidth.current > 768) return "dk";
	return "mb";
});

const MAX_INPUT_LENGTH = 38;
const LOAD_DELAY = 600;

/** Terminal Loader */
async function onLoad(t) {

	/** @type {import('@xterm/xterm').Terminal} */
	terminalCtx.cmd = t;

	// set up the terminal
	terminalCtx.cmd.refs?.fitAddon?.fit();

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
	terminalCtx.cmd.write(cfg.newLine);
	terminalCtx.cmd.write(terminal.output[lineSize].init);
}

// handle character input
function onData(o) {

	if(cmdCfg.acceptedCharacters.indexOf(o) <= -1) return;
	if(command.length >= MAX_INPUT_LENGTH) return;

	command += o;

	terminalCtx.cmd.write(o);

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

		/**
		 * If we're in a game, commands will be directed to that handler instead.
		 * "quit" will exit the game and return to the terminal.
		 */
		if(gameState.config.mode === "game" && (command !== "quit" && command !== "q")) {

			let game = gameState.config.game;

			gameState[game].submitCommand(command, (result) => {

				let slot = result?.slot || 0;

				if(result.valid === true) {

					let saveObj = saveState.current;

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

	const cursor = terminalCtx.cmd._core.buffer.x;
	const length = (terminalCtx.prepend.length > 10) ? ((terminalCtx.prepend.length - 9) + cmdCfg.lineStart.length) : (terminalCtx.prepend.length + cmdCfg.lineStart.length);

	if(cursor <= length) return;

	terminalCtx.cmd.write("\b \b");

	command = command.slice(0, -1);
};

const resetCmd = (full = true, reset = false) => {

	if(reset) {
		terminalCtx.cmd.reset();
	}

	terminalCtx.cmd.write((full) ? cfg.newLineFull : cfg.newLine);
	terminalCtx.cmd.write(terminalCtx.prepend + cmdCfg.lineStart);

	command = "";

	lock = false;
};

async function prompt() {



	console.log("prompt()", command);

	if(command === "" || !terminalCtx.cmd || lock === true) return;

	lock = true;

	let cmdOutput = terminal.getOutput(command, lineSize);

	// bad command
	if(!cmdOutput) {

		terminalCtx.cmd.write(cfg.newLineFull);
		terminalCtx.cmd.write(terminal.output[lineSize].unknown);

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
				terminalCtx.cmd.reset();
				resetCmd(false);
				break;
			case "init":
				terminalCtx.cmd.reset();
				setTimeout(() => {
					terminalCtx.cmd.write(cfg.newLine);
					terminalCtx.cmd.write(terminal.output[lineSize].init);
					resetCmd();
				}, 500);
				break;
			// Load a game and move into the game state.
			case "quit":

				if(gameState.config.mode === "game") {

					terminalCtx.cmd.reset();
					terminalCtx.cmd.write(cfg.newLine);
					terminalCtx.cmd.write(`Exiting ${gameState.config.gameInfo?.name || gameState.config.gameInfo?.cmd}...`);

					gameState.config.mode = null;
					gameState.config.game = null;
					gameState.config.gameInfo = null;

					terminalCtx.fn.updatePrepend();

					setTimeout(() => {
						terminalCtx.cmd.reset();
						terminalCtx.cmd.write(cfg.newLine);
						terminalCtx.cmd.write(terminal.output[lineSize].init);
						resetCmd();
					}, LOAD_DELAY);

				} else {

					terminalCtx.cmd.write(cfg.newLineFull);
					terminalCtx.cmd.write("There's no game running to quit.");
					resetCmd();
				}

				break;
			case "play":

				if(!cmdOutput[1]?.cmd) {
					terminalCtx.cmd.write(cfg.newLineFull);
					terminalCtx.cmd.write(`${cmdRun?.name || cmdRun.cmd} what?`);
					resetCmd();
					break;
				}

				let gameInfo = cmdOutput[1];
				let game = gameInfo.cmd;

				gameState.config.mode = "game";
				gameState.config.game = game;
				gameState.config.gameInfo = gameInfo;

				terminalCtx.fn.updatePrepend();

				let saveKey = game;
				let saveObj = saveState.current;

				// load game into state
				if(!gameState[game]) {

					switch(game) {
						case "zork":

							if(!loadedGames.zork) {
								loadedGames.zork = await (import("./game/zork/game.js"));
							}

							gameState[game] = new loadedGames.zork.default(cmd);

							if(!saveObj.saves[saveKey]) saveObj.saves[saveKey] = [{ cmds: [], rnds: [] }];

							break;
						default:
							if(!saveObj.saves[saveKey]) {
								saveObj.saves[saveKey] = [{ cmds: [], rnds: [] }]
							}
							return false;
					}

					terminalCtx.cmd.reset();
					terminalCtx.cmd.write(cfg.newLine);
					terminalCtx.cmd.write(`Loading ${gameInfo?.name || game}...`);

					// run the preload function from the game
					gameState[game].cmd = terminalCtx.cmd;
					gameState[game].award = achievementCtx.fn.award;
					gameState[game].preload(() => {

						// this is ultimately a fake load time
						setTimeout(() => {

							gameState[game].init(saveObj.saves[saveKey][0]);

							resetCmd();

						}, LOAD_DELAY);
					});

				} else {

					// game is loaded into state already

					terminalCtx.cmd.reset();
					terminalCtx.cmd.write(cfg.newLine);
					terminalCtx.cmd.write(`Loading ${gameInfo?.name || game}...`);

					// this is ultimately a fake load time
					setTimeout(() => {

						gameState[game].init(saveObj.saves[saveKey][0]);

						resetCmd();

					}, LOAD_DELAY);
				}

				break;
			// Navigation items
			case "home":
			case "about":
				let pg = cmdRun.cmd === "home" ? "" : cmdRun.cmd;
				if(page.url.pathname !== `/${pg}`) {
					goto(`/${pg}`, { keepfocus: true });
				} else {
					terminalCtx.cmd.write(cfg.newLineFull);
					terminalCtx.cmd.write(`You're already on the ${cmdRun.cmd} page.`);
					resetCmd();
				}
				break;
			// show/hide navigation
			case "nav":
				siteState.current.showNavigation = !siteState.current.showNavigation;
				terminalCtx.cmd.write(cfg.newLineFull);
				terminalCtx.cmd.write((siteState.current.showNavigation === true) ? `Navigation shown.` : `Navigation hidden.`);
				resetCmd();
				break;
			default:
				break;
		}

		return;
	}

	// always add spacing for command output
	terminalCtx.cmd.write(cfg.newLineFull);
	terminalCtx.cmd.write(cmdOutput);

	// now reset
	resetCmd();

	return;
}

$effect(() => {

	/** Watching for changes on the current page */
	if(terminalCtx.loaded === true && terminalCtx.currentPage !== page.url.pathname) {

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
	if(terminalCtx.loaded === true) terminalCtx.cmd.focus();
});
</script>

<div class="h-full">
	{#if browser}
		<Terminal class="h-full" bind:cmd={cmd} options={cmdOpts} {onLoad} {onData} {onKey} />
		<!-- <Xterm class="h-full" bind:terminal={cmd} options={cmdOpts} {onLoad} {onData} {onKey} /> -->
	{/if}
</div>

<style>
:global(.xterm-screen) {
	padding: 0 18px 0 18px;
}
</style>
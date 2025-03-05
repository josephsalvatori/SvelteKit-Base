<script>
import { dev } from "$app/environment";
import { page } from "$app/state";
import { setContext } from "svelte";
import { ModeWatcher } from "mode-watcher";
import { getFlash } from "sveltekit-flash-message";
import { toast } from "svelte-sonner";
import { Toaster } from "$lib/components/ui/sonner";
import SuperDebug from "sveltekit-superforms";
import Navigation from "$lib/components/sections/Navigation.svelte";
import TerminalWrapper from "$lib/components/modules/TerminalWrapper.svelte";
import Achievement from "$lib/components/molecules/Achievement.svelte";
import Achievements from "$lib/components/modules/Achievements.svelte";
import { LocalStore } from "$lib/helpers/localStore.svelte.ts";
import "../app.css";

/** @type {import('./$types').LayoutProps} */
let { children } = $props();

const flash = getFlash(page);
const ACHIEVEMENT_DELAY = 30000;

$effect(() => {

	if(!$flash) return;

	switch($flash.type) {
		case "achievement":
			toast.custom(Achievement, {
				unstyled: true,
				duration: ACHIEVEMENT_DELAY,
				offset: 80
			});
			break;
		case "success":
			toast.success($flash.message);
			break;
		case "error":
			toast.error($flash.message);
			break;
		case "info":
		default:
			toast.info($flash.message);
			break;
	}

	$flash = undefined;
});

let siteState = new LocalStore("siteState",{
	showAchievements: false,
	showNavigation: false,
});

let saveState = new LocalStore("saveState", {
	saves: {}
});

let gameState = $state({
	config: {
		mode: null,
		game: null
	}
});

let achievementState = new LocalStore("achievementState", {
	complete: new Set(),
	last: null
});

let achievementCtx = {
	duration: ACHIEVEMENT_DELAY,
	fn: {
		award: () => {}
	}
};

let terminalCtx = $state({
	cmd: undefined,
	prepend: "",
	loaded: false,
	locked: false,
});

$effect(() => {

	if(Object.keys(achievementState.current.complete).length > 0) {

		if(siteState.current.showAchievements === false) siteState.current.showAchievements = true;
	}
});

$effect(() => {

	siteState.current.showNavigation;

	// if(terminalCtx?.cmd) {
	// 	console.log("HAS FIT", typeof terminalCtx.cmd.refs.fitAddon.fit);
	// 	console.log("CTX", terminalCtx.cmd, (document));
	// 	if(document?.getElementsByClassName("xterm-screen")) {
	// 		document?.getElementsByClassName("xterm-screen")[0].removeAttribute("style");
	// 	}
	// 	terminalCtx.cmd.refs.fitAddon.fit();
	// }
});

setContext("siteState", siteState);
setContext("gameState", gameState);
setContext("saveState", saveState);
setContext("achievementState", achievementState);
setContext("achievementCtx", achievementCtx);
setContext("terminalCtx", terminalCtx);
</script>

<ModeWatcher />
<Toaster richColors position="bottom-center" />

<div class="relative flex flex-col w-full min-h-screen h-full">
	<Achievements />
	<div class="flex flex-col tb:flex-row w-full h-full min-h-screen">
		{#if siteState.current.showNavigation}
			<Navigation />
		{/if}
		<div class="flex-grow">
			<TerminalWrapper />
		</div>
	</div>
	<!-- {#if dev}
		<SuperDebug data={siteState.current} />
	{/if} -->
</div>

{@render children?.()}
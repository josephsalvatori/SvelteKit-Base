<script>
import { dev } from "$app/environment";
import { page } from "$app/state";
import { setContext } from "svelte";
import { ModeWatcher } from "mode-watcher";
import { getFlash } from "sveltekit-flash-message";
import { toast } from "svelte-sonner";
import { Toaster } from "$lib/components/ui/sonner";
import SuperDebug from "sveltekit-superforms";
import Header from "$lib/components/sections/Header.svelte";
import Terminal from "$lib/components/modules/game/Terminal.svelte";
import { LocalStore } from "$lib/helpers/localStore.svelte.ts";
import "../app.css";

/** @type {import('./$types').LayoutProps} */
let { children } = $props();

const flash = getFlash(page);

$effect(() => {

	if(!$flash) return;

	switch($flash.type) {
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

let siteState = new LocalStore("siteState", {
	currentPage: null,
	showNavigation: false
});

let gameState = $state({

});

let achievementState = $state({

});

let terminalCtx = $state({
	prepend: "",
	loaded: false
});

setContext("siteState", siteState);
setContext("gameState", gameState);
setContext("achievementState", achievementState);
setContext("terminalCtx", terminalCtx);
</script>

<ModeWatcher />
<Toaster richColors position="bottom-center" />

<div class="relative flex w-screen h-screen">
	<div class="flex flex-col w-full h-full">
		<div class="flex-grow">
			<Terminal />
		</div>
		{#if dev}
			<SuperDebug data={siteState} />
		{/if}
	</div>
</div>

{@render children?.()}
<script>
import { page } from "$app/state";
import { getContext } from "svelte";
import { getFlash } from "sveltekit-flash-message";
import { achRef } from "$lib/helpers/achievements";

let achievementState = getContext("achievementState");
let achievementCtx = getContext("achievementCtx");

const flash = getFlash(page);

let audioEl = $state(null);

const award = (name) => {

	if(!achRef[name]) return;

	console.log("STATE", achievementState.current.complete);
	let setKeys = Object.keys(achievementState.current.complete);
	console.log("HAS ACHIEVEMENT?", setKeys);
	if(setKeys.includes(achRef[name].id)) return;

	let object = {
		...achRef[name],
		date: new Date()
	};

	// see if we've receieved this achievement already
	achievementState.current.last = object;

	if(name !== "test") achievementState.current.complete[object.id] = object.date;

	setTimeout(() => audioEl.play(), 100);

	$flash = {
		type: "achievement"
	};
};

const clear = () => {
	achievementState.current.last = null;
};

// achievementState.complete = [];
achievementCtx.fn = {
	award,
	clear
};

</script>

<div class="hidden" tabindex="-1">
	<audio bind:this={audioEl} src="/audio/notication-beep.mp3" preload="auto"></audio>
</div>
<script>
import { page } from "$app/state";
import { getContext } from "svelte";
import { getFlash } from "sveltekit-flash-message";
import { achRef } from "$lib/helpers/achievements";

let achievementState = getContext("achievementState");
let achievementCtx = getContext("achievementCtx");

const flash = getFlash(page);

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
	achievementState.current.complete[object.id] = object.date;

	$flash = {
		type: "achievement"
	};
};

// achievementState.complete = [];
achievementCtx.fn = {
	award
};

</script>
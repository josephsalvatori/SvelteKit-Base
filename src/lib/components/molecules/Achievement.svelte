<script>
import { getContext, onDestroy, onMount } from "svelte";
import { fade, scale, slide } from "svelte/transition";

let achievementCtx = getContext("achievementCtx");
let achievementState = getContext("achievementState");
let siteState = getContext("siteState");

onMount(() => {
	console.log("MOUNT ACHI");
	// this will clear our achievements
	setTimeout(() => {
		achievementCtx.fn.clear();
		if(siteState.current.shownNavigation === false) siteState.current.shownNavigation = true;
		if(siteState.current.showAchievements === false) siteState.current.showAchievements = true;
	}, achievementCtx.duration + 1000);
});

onDestroy(() => {
	console.log("DESTROY ACHI");
});
</script>

{#if achievementState.current.last}
	<div class="flex items-center relative">
		<div class="w-[80px] h-[82px] min-w-[82px] translate-x-[22px] max-w-[82px] rounded-full z-[1] relative">
			<div class="rounded-full w-full h-full transition-transform !opacity-100 absolute left-0 top-0 overflow-hidden" in:scale|global={{ delay: 100, opacity: 1, duration: 400 }}>
				<img src={achievementState.current.last.image} alt={achievementState.current.last.title} class="w-full h-full object-cover"/>
			</div>
		</div>
		<div class="border-y border-r rounded-r-full w-[270px] max-w-[270px] overflow-hidden relative z-0" in:slide|global={{ axis: "x", delay: 400, duration: 400 }}>
			<div class="flex flex-col space-y-1 h-[68px] pl-[32px] pr-[8px] justify-center w-[270px] max-w-[270px]">
				<h2 class="text-[16px] leading-none" in:fade|global={{ duration: 300, delay: 300 }}>{achievementState.current.last.title}</h2>
				<p class="text-xs text-primary/75">{achievementState.current.last.description}</p>
			</div>
		</div>
	</div>
{/if}
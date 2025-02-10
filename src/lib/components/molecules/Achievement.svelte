<script>
import { getContext, onMount } from "svelte";
import { scale } from "svelte/transition";

let achievementCtx = getContext("achievementCtx");
let achievementState = getContext("achievementState");
let siteState = getContext("siteState");

onMount(() => {
	// this will clear our avhievments
	setTimeout(() => {
		achievementState.current.last = null;
		if(siteState.current.shownNavigation === false) siteState.current.shownNavigation = true;
		if(siteState.current.showAchievements === false) siteState.current.showAchievements = true;
	}, achievementCtx.duration + 1000);
});
</script>

{#if achievementState.current?.last}
	<div class="flex items-center gap-2">
		<div class="w-[60px] h-[60px] min-w-[60px] max-w-[60px] bg-primary/25 rounded-full">
			<div class="rounded-full w-full h-full overflow-hidden">
				<img src={achievementState.current.last.image} alt={achievementState.current.last.title} class="w-full h-full object-cover" />
			</div>
		</div>
		<div class="space-y-1">
			<h2 class="text-[16px] leading-none">{achievementState.current.last.title}</h2>
			<p class="text-xs text-primary/75">{achievementState.current.last.description}</p>
		</div>
	</div>
{/if}
<script>
import { getContext } from "svelte";
import Button from "$lib/components/ui/button/button.svelte";
import * as Sheet from "$lib/components/ui/sheet/index.js";
import { House, Info, Trophy } from "lucide-svelte";
import { achRef } from "$lib/helpers/achievements";

let achDrawer = $state(false);

let achievementState = getContext("achievementState");
let siteState = getContext("siteState");
</script>

<div class="w-full h-full max-h-[80px] min-w-[80px] tb:max-h-full tb:min-h-screen tb:max-w-[80px] justify-center sidebar bg-sidebar border-sidebar-border text-sidebar-foreground">
	<div class="flex flex-col h-full w-full justify-between p-[16px]">
		<ul class="flex tb:flex-col gap-[10px]">
			<li>
				<Button variant="outline" title="Home Page" href="/" class="h-[48px] w-[48px] [&_svg]:size-full p-[10px]">
					<House strokeWidth="1.25" />
				</Button>
			</li>
			<li>
				<Button variant="outline" title="About Page" href="/about" class="h-[48px] w-[48px] [&_svg]:size-full p-[10px]">
					<Info strokeWidth="1.25" />
				</Button>
			</li>
			{#if siteState.current.showAchievements}
				<li>
					<Button variant="outline" title="View Achievements" onclick={() => achDrawer = !achDrawer} class="h-[48px] w-[48px] [&_svg]:size-full p-[10px] cursor-pointer">
						<Trophy strokeWidth="1.25" />
					</Button>
				</li>
			{/if}
		</ul>
		<div class="">
			<!-- MODE SWITCH? -->
		</div>
	</div>
</div>

<Sheet.Root bind:open={achDrawer}>
	<Sheet.Content side="right" class="">
		<Sheet.Header>

		</Sheet.Header>
		<div class="grid">
			{#each Object.values(achRef) as ach, i}
				{@const hasAchievement = Object.keys(achievementState.current.complete).includes(ach.id)}
				<div class="flex items-center gap-2">
					<div class="w-[60px] h-[60px] min-w-[60px] max-w-[60px] bg-primary/25 rounded-full">
						<div class="rounded-full w-full h-full overflow-hidden">
							{#if hasAchievement}
								<img src={ach.image} alt={ach.title} class="w-full h-full object-cover" />
							{:else}
								?
							{/if}
						</div>
					</div>
					<div class="space-y-1">
						<h2 class="text-[16px] leading-none">{ach.title}</h2>
						<p class="text-xs text-primary/75">{ach.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</Sheet.Content>
</Sheet.Root>
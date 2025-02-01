<script>
import { Toggle } from "$lib/components/ui/toggle";
import { mode, toggleMode } from "mode-watcher";
import { Sun, Moon } from "lucide-svelte";
</script>

<Toggle variant="outline" onPressedChange={toggleMode}>
	{#if $mode === "light"}
		<Sun />
	{:else}
		<Moon />
	{/if}
</Toggle>
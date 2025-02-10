<script>
import "@xterm/xterm/css/xterm.css";
import { onMount } from "svelte";

/** @typedef {import('@xterm/xterm').Terminal} Terminal */
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";

let parent = $state();
let {
	terminal = $bindable(),
	options,
	onBell,
	onBinary,
	onCursorMove,
	onData,
	onKey,
	onLineFeed,
	onRender,
	onWriteParsed,
	onResize,
	onScroll,
	onSelectionChange,
	onTitleChange,
	onLoad,
	...restProps
} = $props();

onMount(async() => {

	if(typeof Terminal !== "function") {
		const { Terminal } = await import("@xterm/xterm");
	}

	/** @type {Terminal} */
	terminal = new Terminal(options);
	terminal.onBell(() => onBell?.());
	terminal.onBinary((data) => onBinary?.(data));
	terminal.onCursorMove(() => onCursorMove?.());
	terminal.onData((data) => onData?.(data));
	terminal.onKey((data) => onKey?.(data));
	terminal.onLineFeed(() => onLineFeed?.());
	terminal.onRender((data) => onRender?.(data));
	terminal.onWriteParsed(() => onWriteParsed?.());
	terminal.onResize((data) => onResize?.(data));
	terminal.onScroll((data) => onScroll?.(data));
	terminal.onSelectionChange(() => onSelectionChange?.());
	terminal.onTitleChange((data) => onTitleChange?.(data));

	if(parent) {

		terminal.open(parent);

		// load addons
		const fitAddon = new FitAddon();
		const webLinksAddon = new WebLinksAddon();

		terminal.loadAddon(fitAddon);
		terminal.loadAddon(webLinksAddon);

		// store references to the addons
		terminal.refs = {
			fitAddon,
			webLinksAddon
		};

		onLoad?.(terminal);

	} else {

		console.error("[xterm] Parent element not found");
	}
});
</script>

<div bind:this={parent} {...restProps}></div>
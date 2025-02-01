import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			"$lib": "./src/lib/*",
			"$ext": "./ext/*",
		},
		paths: {
			relative: false,
		},
		prerender: {
			crawl: false,
			entries: [
				"/login",
				"/register",
			]
		}
	},
	preprocess: [
		vitePreprocess({
			postcss: join(__dirname, "postcss.config.js"),
			preserve: ["ld+json"]
		})
	]
};

export default config;

import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
		tailwindcss(),
		sveltekit()
	],
	server: {
		fs: {
			allow: [".."]
		}
	},
	define: {
		global: {}
	},
    test: {
        include: ["src/**/*.{test,spec}.{js,ts}"]
    }
});

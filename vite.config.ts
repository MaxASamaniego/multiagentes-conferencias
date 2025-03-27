import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST || '127.0.0.1';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: host,
		port: 5173
	}
});

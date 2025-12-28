import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // eslint-disable-line import/no-unresolved

export default defineConfig(() => ({
	build: {
		outDir: 'build',
	},
	plugins: [react()],
	server: {
		open: true,
		port: 3000,
	},
}));

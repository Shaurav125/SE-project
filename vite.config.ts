import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Set the base path to './' for relative asset paths. This makes the build
    // portable and deployable to any environment (root or subdirectory) without
    // needing to know the final URL beforehand.
    base: './',
    define: {
        // This makes the API_KEY from the environment available as process.env.API_KEY in the client code.
        // The execution environment (e.g., a server or deployment platform) is expected to provide this variable.
        'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    },
});

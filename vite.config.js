import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
    server: {
        // Start with HTTP for development, switch to HTTPS when needed for WebXR testing
        https: false,
        host: true,  // Allow external connections
        port: 3000,
        // Uncomment below for HTTPS with self-signed certificates when needed
        // https: {
        //   key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
        //   cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem'))
        // }
    },
    optimizeDeps: {
        include: [
            '@babylonjs/core',
            '@babylonjs/loaders',
            'iwer',
            '@iwer/devui'
        ]
    },
    build: {
        target: 'esnext',
        rollupOptions: {
            output: {
                manualChunks: {
                    'babylon': ['@babylonjs/core', '@babylonjs/loaders'],
                    'iwer': ['iwer', '@iwer/devui']
                }
            }
        }
    }
});
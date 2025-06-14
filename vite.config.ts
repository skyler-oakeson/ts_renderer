import { defineConfig, } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    assetsInclude: ['**/*.vert', '**/*.frag'],
    resolve: {
        alias: {
            "@": resolve(__dirname, './src'),
            "@utils": resolve(__dirname, './src/utils'),
            "@api": resolve(__dirname, './src/api'),
            "@shaders": resolve(__dirname, './src/shaders'),
            "@types": resolve(__dirname, './src/types'),
        }
    },
    server: {
        port: 3000,
    },
}) 

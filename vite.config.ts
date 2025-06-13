import { defineConfig, } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    assetsInclude: ["**/*.ply", "**/*.vert", "**/*.frag"],
    resolve: {
        // TODO THIS IS NOT WORKING
        // alias: {
        //     "@": resolve(__dirname, './src'),
        //     "@utils": resolve(__dirname, './utils'),
        //     "@shaders": resolve(__dirname, './shaders'),
        //     "@assets": resolve(__dirname, './assets'),
        //     "@types": resolve(__dirname, './types'),
        // }
    },
    server: {
        port: 3000,
    }
}) 

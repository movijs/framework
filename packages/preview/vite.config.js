import { defineConfig } from 'vite';
import moviJsx from "movijsx";
import mkcert from 'vite-plugin-mkcert'; 
const fileRegex = /\.(jsx)|\.(tsx)|\.(aio)$/;
export function newPlugin() {
    return {
        name: 'transform-file-movi-jsx',
        transform(src, id) {
            // if (fileRegex.test(id)) {
               
            //     return {
            //         code: src,
            //         map: null
            //     }
            // }
        }
    }
};


export default defineConfig({
    plugins: [
        mkcert(),
        newPlugin(),
        moviJsx.vitePlugin(),

    ],
    resolve: {
        extensions: ['.jsx', '.tsx', '.ts'],
    }, 
    esbuild: {
        jsx: 'preserve',
        // jsxFactory: '__mc',
        // jsxFragment: '__mc',
        // jsxImportSource: 'movijs',
        //jsxInject: 'import React from "react"',
        jsxDev: false,
        jsxSideEffects: false,
        //loader: 'tsx'
    }
}) 
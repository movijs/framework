import { defineConfig } from 'vite';
import moviJsx from "movijsx";
import mkcert from 'vite-plugin-mkcert';



const fileRegex = /\.(css)|\.(scss)$/;
export function newPlugin() {
    return {
        name: 'transform-file-movi-jsx',
        transform(src, id) {
            // if (fileRegex.test(id)) {

            //     return {
            //         code: `export default var styles =  ${src} `,
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
        extensions: ['.jsx', '.tsx', '.ts','.js'],
    },
    esbuild: {
        jsx: 'preserve',
        sourcemap:'inline'
        // jsxFactory: '__mc',
        // jsxFragment: '__mc',
        // jsxImportSource: 'movijs',
        //jsxInject: 'import React from "react"',
        //jsxDev: true,
        //jsxSideEffects: false,
        // loader: { 'js': 'jsx','ts':'tsx' }
    }
}) 
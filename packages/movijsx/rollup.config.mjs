 import commonJS from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2"; 
var name = 'movi';
var dist = function (p) { return './dist/index.' + p; }
 
export default [
    {
        input: "src/index.ts",
        output: [
            {
                name: name,
                file: dist("cjs"),
                format: "cjs",
                sourceMap: 'inline',
            }, {
                name: name,
                file: dist("umd.js"),
                format: "umd",
            }, {
                name: name, 
                file: dist("iife.js"),
                format: "iife", 
            } 
        ], 
        experimentalCodeSplitting: true,
        plugins: [
            commonJS(),
            typescript({
                declaration: true,
                esModuleInterop: true,
                moduleResolution: "Node",
                target: "ES6",
                module: "ESNext",
                type: "module",
                lib: ["DOM", "ES2021"],
                noEmitHelpers: true,
                importHelpers: false
            },
            ) 
        ],
        onwarn: function (warning) {
            if (warning.code === 'THIS_IS_UNDEFINED') {
                return;
            }
        },
    }
];

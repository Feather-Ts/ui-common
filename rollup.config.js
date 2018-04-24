import resolve from 'rollup-plugin-node-resolve'
import tsc from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import commonjs from 'rollup-plugin-commonjs'

import pkg from './package.json'

export default {
    input: 'src/typescript/ui-common.ts',
    treeshake: false,
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            banner: `/* feather-ts/ui-common v${pkg.version} */`,
            exports: 'named'
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
            banner: `/* feather-ts/ui-common v${pkg.version} */`,
            exports: 'named'
        }
    ],
    plugins: [
        commonjs(),
        resolve({
            browser: true
        }),
        postcss(),
        tsc({
            tsconfigOverride: {
                compilerOptions: {
                    "module": "ES2015",
                    "target": "es5",
                    "declaration": false
                },
                clean: true
            }
        }),
    ]
}

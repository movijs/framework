import type { CSSRulesByBucket, GriffelInsertionFactory, GriffelRenderer } from '@griffel/core';

export const insertionFactory: GriffelInsertionFactory = () => {
    const insertionCache: Record<string, boolean> = {};

    return function insert(renderer: GriffelRenderer, cssRules: CSSRulesByBucket) {
        // Even if `useInsertionEffect` is available, we can use it on a client only as it will not be executed in SSR

        renderer.insertCSSRules(cssRules!);
        return;
        /*  */

        if (insertionCache[renderer.id] === undefined) {
            renderer.insertCSSRules(cssRules!);
            insertionCache[renderer.id] = true;
        }
    };
};
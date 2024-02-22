import { GriffelRenderer, CSSRulesByBucket, makeStyles as vanillaMakeStyles, GriffelStyle, createDOMRenderer } from "@griffel/core";
import { StylesBySlots } from "@griffel/core/src/types";
import { insertionFactory } from "./insertionFactory";

export class MoviRenderer implements GriffelRenderer {
    el = document.createElement("style");
    constructor() {
        document.head.appendChild(this.el);
    }
    compareMediaQueries(a: string, b: string): number {
        if (a == b) {
            return 1
        } else {
            return -1
        }
    }
    id: string = 'SystemMainCompile';
    insertCSSRules(cssRules: CSSRulesByBucket): void {


        console.error(cssRules, this.insertionCache, this.stylesheets);
    }
    insertionCache: Record<string, keyof CSSRulesByBucket> = {};
    stylesheets = {};
}


export function makeStyles<Slots extends string | number>(stylesBySlots: Record<Slots, GriffelStyle>) {
    const getStyles = vanillaMakeStyles(stylesBySlots, insertionFactory); 
    return function useClasses(): Record<Slots, string> {
        const dir = 'ltr';
        const renderer = createDOMRenderer();

        return getStyles({ dir, renderer });
    };
}


// export function makeStyle<Slots extends string | number>(stylesBySlots: StylesBySlots<Slots>, dir: 'ltr' | 'rtl'): Record<Slots, string> {
//     return makeStyles(stylesBySlots)({
//         dir: dir,
//         renderer: new MoviRenderer()
//     })
// }


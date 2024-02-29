function getCurrentDom() {
    if (globalThis && globalThis.movidom) {
        return globalThis.movidom.window.document;
    }
    return globalThis.document;
}

export function setDom(dom) {
    if (globalThis) {
        globalThis.movidom = dom;
    }
}

export const dom = {
    get window() {
        if (globalThis && globalThis.window) {
            return globalThis.window;
        } else if (globalThis && globalThis.movidom) {
            return globalThis.movidom.window;
        } else {
            return globalThis;
        }
    },
    _created: new Map<any, any>(),
    // createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
    // /** @deprecated */
    // createElement<K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K];
    createElement(tagName: string, options?: any): any {
        try {
            if (this._created.has(tagName)) {
                return this._created.get(tagName).cloneNode(true).cloneNode(true);
            }
            const el = getCurrentDom().createElement(tagName, options);
            this._created.set(tagName, el)
            return el
        } catch (error) {

        }

    },

    createDocumentFragment(): any {
        try {
            var cd = getCurrentDom();
            if (cd) {
                return cd.createDocumentFragment();
            } 
        } catch (error) {

        }

    },
    createComment(content: any) {
        try {
            return getCurrentDom()?.createComment(content)
        } catch (error) {

        }

    },
    createTextNode(content: any) {
        try {
            return getCurrentDom()?.createTextNode(content)
        } catch (error) {

        }

    },
    querySelectorAll(selectors: string) {
        try {
            return getCurrentDom()?.querySelectorAll(selectors)
        } catch (error) {

        }

    },
    createElementNS(namepsaceUri: string, tagName: string, options?: any): any {
        try {
            return getCurrentDom()?.createElementNS(namepsaceUri, tagName, options)
        } catch (error) {

        }

    },
    body: getCurrentDom()?.body
}
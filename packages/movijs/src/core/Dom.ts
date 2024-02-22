function getCurrentDom() {
    if (globalThis && globalThis.movidom) {
        return globalThis.movidom;
    }
    return globalThis.document;
}


export const dom = {
    get window() {
        try {
            if (globalThis) {
                return globalThis;
            }
            return window;
        } catch (error) {
            return {}
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
            return getCurrentDom()?.createDocumentFragment()
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
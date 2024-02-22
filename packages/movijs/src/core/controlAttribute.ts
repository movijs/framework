import { KeyValueItem, toKebab } from ".";
import { IAttribute, IControl } from "../abstractions";
export type ElementTypes = Node | Element | HTMLElement | Text | DocumentFragment | Comment | HTMLDivElement;
export class controlAttribute<ElementType extends ElementTypes> implements IAttribute<IControl<ElementType, any, any>> {
    private _parent: IControl<ElementType, any, any>;
    constructor(parent: IControl<ElementType, any, any>) {
        this._parent = parent;
    } 
    attributes: { name: string, value: any }[] = [];
    add(attribute: object | string): IControl<ElementType, any, any> {
        this.parse(attribute, '');
        return this._parent; 
    };
    remove(key: string): IControl<ElementType, any, any> {
        if (this._parent.element instanceof HTMLElement ||
            this._parent.element instanceof Element) {
            this._parent.element.removeAttribute(key);
            if (!this.attributes.find(t => t.name === key)) {
                var el = this.attributes.find(t => t.name === key);
                if (el) {
                    var iof = this.attributes.indexOf(el);
                    this.attributes.splice(iof);
                }
            }
        }
        return this._parent;
    };
    has(key: string): boolean {

        if (this._parent.element instanceof HTMLElement ||
            this._parent.element instanceof Element) {
            return this._parent.element.hasAttribute(key)
        }
        return false;
    };
    get(key: string): string | null {

        if (this._parent.element instanceof HTMLElement ||
            this._parent.element instanceof Element) {
            return this._parent.element.getAttribute(key)
        }
        return null;
    };

    parse(values, key) {

        if (typeof values === 'function') {
            this._parent.bind.effect(() => {
                this.parse(values(), key)
            })
        } else if (Array.isArray(values)) {
            values.forEach((cn, index) => {
                this.parse(cn, key)
            })
        } else if (typeof values === 'object') {
            Reflect.ownKeys(values).forEach(keyX => {
                this.parse(values[keyX], keyX)
            })
        } else if (typeof values == 'boolean') {
            if ((this._parent.element instanceof HTMLElement || this._parent.element instanceof Element)) {
                if (values == true) {
                    (this._parent.element as Element).setAttribute(key, '')
                } else {
                    (this._parent.element as Element).removeAttribute(key)
                }
            }
            this.attributes.push({ name: key, value: values });
        } else {

            if (key == 'value') {
                (this._parent.element as HTMLInputElement).value = values;
            } else {
                (this._parent.element as Element).setAttribute(key, values)
            }

            this.attributes.push({ name: key, value: values });
        }
    }
}
import { KeyValueItem, toKebab } from ".";
import { IAttribute, IControl } from "../abstractions";
export type ElementTypes = Node | Element | HTMLElement | Text | DocumentFragment | Comment | HTMLDivElement;
export class controlAttribute<ElementType extends ElementTypes> implements IAttribute<IControl<ElementType,any,any>> {
    private _parent: IControl<ElementType,any,any>;
    constructor(parent: IControl<ElementType,any,any>) {
        this._parent = parent;
    }

    attributes: { name: string, value: any }[] = [];
    add(attribute: object | string): IControl<ElementType,any,any> {
        if (typeof attribute === "object") {
            Object.keys(attribute).forEach(cn => {

                if (!this.attributes.find(t => t.name === cn)) {
                    this.attributes.push({ name: cn, value: attribute[cn] });
                }


                if (this._parent.element instanceof HTMLElement ||
                    this._parent.element instanceof Element ||
                    this._parent.element instanceof SVGElement ||
                    this._parent.element instanceof SVGAElement) {

                    var attrval = attribute[cn];
                    if (attrval && attrval['toLowerCase'] && attrval.toLowerCase() === 'preserveaspectratio') {
                        attrval = 'preserveAspectRatio'
                    }
                    var self = this;

                    if (typeof attrval === 'function') {
                        this._parent.bind.effect(() => {
                            var v = attrval();
                            if (cn == 'value') {
                                (self._parent.element as HTMLInputElement).value = v;
                            } else {
                                (self._parent.element as Element).setAttribute(cn, v)
                            }
                        });
                    } else if (typeof attrval === 'boolean') {
                        if (attrval == true) {
                            if (cn == 'value') {
                                (self._parent.element as HTMLInputElement).value = '';
                            } else {
                                (self._parent.element as Element).setAttribute(cn, '')
                            }
                        } else {
                            if (cn == 'value') {
                                (self._parent.element as HTMLInputElement).value = '';
                            } else {
                                this._parent.element.removeAttribute(cn)
                            }

                        }
                    } else if (cn === 'class' || cn === 'className' || cn === 'classname') {
                        this._parent.class.add(attrval);
                    } else if (attrval === undefined || attrval === null || attrval === '') {
                        this._parent.element.setAttribute(cn, '')
                    } else {
                        try {
                            if (cn == 'value') {
                                (self._parent.element as HTMLInputElement).value = attrval;
                            } else {
                                (self._parent.element as Element).setAttribute(cn, attrval)
                            }
                        } catch (error) {
                            console.error(cn, attrval)
                        }

                    }
                } else {
                    if (!this.attributes.find(t => t.name === cn)) {
                        this.attributes.push({ name: cn, value: attribute[cn] });
                    } else {
                        var el = this.attributes.find(t => t.name === cn);
                        if (el !== undefined) {
                            el.value = attribute[cn]
                        }
                    }
                }
            })
        } else if (typeof attribute === 'string') {
            if (this._parent.element instanceof HTMLElement ||
                this._parent.element instanceof Element) {

                if (attribute == 'value') {
                    (this._parent.element as HTMLInputElement).value = '';
                } else {
                    (this._parent.element as Element).setAttribute(attribute, '')
                }
 
                if (!this.attributes.find(t => t.name === attribute)) {
                    if (attribute == 'value') {
                        (this._parent.element as HTMLInputElement).value = ''; 
                    } else {
                        (this._parent.element as Element).setAttribute(attribute, '') 
                    } 
                    this.attributes.push({ name: attribute, value: '' });
                }
            }
        }
        return this._parent;
    };
    remove(key: string): IControl<ElementType,any,any> {
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
}
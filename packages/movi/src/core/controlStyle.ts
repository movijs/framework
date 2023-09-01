import { KeyValueItem, toKebab } from ".";
import { IAttribute, IClass, IControl } from "../abstractions";
import { ElementTypes } from "./controlAttribute";

export class controlStyle<ElementType extends ElementTypes>   {
    private _parent: IControl<ElementType,any,any>;
    constructor(parent: IControl<ElementType,any,any>) {
        this._parent = parent;
    }
    set(style: string  | {}): IControl<ElementType,any,any> {
        if (typeof style === 'object') {

            Reflect.ownKeys(style).forEach(c => {
                if (typeof style[c] !== 'function') {
                    if (this._parent.element instanceof HTMLElement) {
                        var cs = c.toString().split(":");
                        this._parent.element.style[cs[0]] = cs[1];
                    }
                }
            })

            this._parent.bind.effect(() => {
                Reflect.ownKeys(style).forEach(c => {
                    if (typeof style[c] === 'function') {
                        if (this._parent.element instanceof HTMLElement) {
                            var cs = c.toString().split(":");
                            this._parent.element.style[cs[0]] = cs[1];
                        }
                    }
                })
            })

        } else if (typeof style === 'string') {

            style.split(";").forEach(cls => {
                if (this._parent.element instanceof HTMLElement) {
                    var c = cls.split(":");
                    this._parent.element.style[c[0]] = c[1];
                }
            })

        }
        return this._parent;
    }
}
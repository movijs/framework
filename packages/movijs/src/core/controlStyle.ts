import { KeyValueItem, toKebab } from ".";
import { IAttribute, IClass, IControl } from "../abstractions";
import { NodeTypes } from "../abstractions/NodeTypesEnum";
import { ElementTypes } from "./controlAttribute";
import { advanceif } from "./internal";

export class controlStyle<ElementType extends ElementTypes>   {
    private _parent: IControl<ElementType, any, any>;
    constructor(parent: IControl<ElementType, any, any>) {
        this._parent = parent;
    }
    set(style: string | {}): IControl<ElementType, any, any> {
        if (typeof style === 'object') {

            Reflect.ownKeys(style).forEach(c => {
                if (typeof style[c] !== 'function') {
                    if (advanceif(this._parent as any, NodeTypes.ELEMENT_NODE)) {
                        (this._parent.element as any).style[toKebab(c as string)] = style[c];
                    }
                }
            })

            this._parent.bind.effect(() => {
                Reflect.ownKeys(style).forEach(c => {
                    if (typeof style[c] === 'function') {
                        if (advanceif(this._parent as any, NodeTypes.ELEMENT_NODE)) {
                            (this._parent.element as any).style[toKebab(c as string)] = style[c];
                        }
                    }
                })
            })

        } else if (typeof style === 'string') {

            style.split(";").forEach(cls => {
                if (advanceif(this._parent as any, NodeTypes.ELEMENT_NODE)) {
                    var c = cls.split(":");
                    (this._parent.element as any).style[toKebab(c[0])] = c[1];
                }
            })

        }
        return this._parent;
    }
}
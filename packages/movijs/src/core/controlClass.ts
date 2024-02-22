import { KeyValueItem, toKebab } from ".";
import { IAttribute, IClass, IControl } from "../abstractions";

export class controlClass<ElementType extends Element | HTMLElement | Text | DocumentFragment | Comment> implements IClass<IControl<ElementType, any, any>> {
    private _parent: IControl<ElementType, any, any>;
    constructor(parent: IControl<ElementType, any, any>) {
        this._parent = parent;
    }

    oldMapper = new Set<string>();
    functionMapper = new Map<Function, string>();
    add(values: string | any[] | {} | Function): IControl<ElementType, any, any> {

        this.oldMapper.clear();
        this.parse(values, '');
        return this._parent;
    }
    remove(classNames: string | string[]): IControl<ElementType, any, any> {

        if (Array.isArray(classNames)) {
            classNames.forEach(cn => {
                cn.trim().split(" ").forEach(cls => {
                    if (this._parent.element instanceof HTMLElement ||
                        this._parent.element instanceof Element && cls.toString().trim().length > 0) {
                        this._parent.element.classList.remove(cls.trim())
                    }
                })
            })
        } else {
            if (classNames == '**') {
                if (this._parent.element instanceof HTMLElement ||
                    this._parent.element instanceof Element) {
                    for (let index = this._parent.element.classList.length; index > -1; index--) {
                        try {
                            this._parent.element.classList.item(index) && this._parent.element.classList.remove();
                        } catch (error) {

                        }
                    }
                }
            } else {
                classNames.trim().split(" ").forEach(cls => {
                    if (this._parent.element instanceof HTMLElement ||
                        this._parent.element instanceof Element && cls.toString().trim().length > 0) {
                        this._parent.element.classList.remove(cls.trim())
                    }
                })
            }
        }
        return this._parent;
    }
    has(className: string): boolean {
        if (this._parent.element instanceof HTMLElement ||
            this._parent.element instanceof Element && className.toString().trim().length > 0) {
            return this._parent.element.classList.contains(className.trim())
        }
        return false;
    }

    parse(values, key) {

        if (typeof values === 'function') {
            // this._parent.bind.effect(() => {
            //     this.parse(values(), key)
            // })

            this._parent.bind.effect(() => {
                var val = values();
                if (this.functionMapper.has(values)) {
                    var removeOld = this.functionMapper.get(values);
                    if (typeof removeOld == 'string' && removeOld.trim().length > 0) {
                        if ((this._parent.element instanceof HTMLElement || this._parent.element instanceof Element)) {
                            this._parent.element.classList.remove(removeOld)
                        }
                    }
                    this.functionMapper.delete(values);
                    this.functionMapper.set(values, val);
                } else {
                    this.functionMapper.set(values, val);
                }
                this.parse(val, key)
            });

        } else if (Array.isArray(values)) {
            values.forEach((cn, index) => {
                this.parse(cn, key)
            })
        } else if (typeof values === 'object') {
            Reflect.ownKeys(values).forEach(keyX => {
                this.parse(values[keyX], keyX)
            })
        } else if (typeof values == 'boolean') {
            if (key) {
                if ((this._parent.element instanceof HTMLElement || this._parent.element instanceof Element)) {
                    if (values == true) {
                        this._parent.element.classList.add(key);
                        if (!this.oldMapper.has(key)) {
                            this.oldMapper.add(key);
                        }
                    } else {
                        this._parent.element.classList.remove(key)
                    }
                }
            }
        } else {
            values && values.trim().split(" ").forEach(cls => {
                var className = cls.trim();
                if ((this._parent.element instanceof HTMLElement || this._parent.element instanceof Element) && cls.trim() !== '' && cls.trim().length > 0) {
                    this._parent.element.classList.add(cls.trim())
                    if (!this.oldMapper.has(cls.trim())) {
                        this.oldMapper.add(cls.trim());
                    }
                }
            })
        }
    }
}
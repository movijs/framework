import { KeyValueItem, toKebab } from ".";
import { IAttribute, IClass, IControl } from "../abstractions";

export class controlClass<ElementType extends Element | HTMLElement | Text | DocumentFragment | Comment> implements IClass<IControl<ElementType,any,any>> {
    private _parent: IControl<ElementType,any,any>;
    constructor(parent: IControl<ElementType,any,any>) {
        this._parent = parent;
    }

    oldMapper = new Map();
    add(values: string | any[] | {} | Function): IControl<ElementType,any,any> {
        var classNames = values;
        if (typeof classNames === 'function') {
            var val = classNames();
            var oldValue = this.oldMapper.get(classNames);
            this._parent.bind.effect(() => {
                var classValue = val();
                if (this._parent.element instanceof HTMLElement ||
                    this._parent.element instanceof Element) {

                    // oldValue.toString().trim().split(" ").forEach(cls => {
                    //     cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.remove(cls.toString().trim())
                    // })

                    // classValue.toString().trim().split(" ").forEach(cls => {
                    //     cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                    // })
                    try {
                        oldValue.toString().trim().split(" ").forEach(cls => {
                            cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.remove(cls.toString().trim())
                        })
                    } catch (error) {

                    }

                    classValue.toString().trim().split(" ").forEach(cls => {
                        cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                    })
                    oldValue = classValue;

                    // if (oldValue.trim() != '') { this._parent.element.classList.remove(oldValue) }
                    // if (classValue.trim() !== '') {
                    //     this._parent.element.classList.add(classValue.toString().trim())
                    //     oldValue = classValue;
                    //     this.oldMapper.delete(classNames);
                    //     this.oldMapper.set(classNames, classValue);
                    // }
                }
            })
        } else if (Array.isArray(classNames)) {
            classNames.forEach((cn, index) => {

                if (typeof cn === 'object') {
                    Reflect.ownKeys(cn).forEach(c => {
                        if (typeof cn[c] !== 'function') {
                            if (this._parent.element instanceof HTMLElement ||
                                this._parent.element instanceof Element) {

                                // c.toString().trim().split(" ").forEach(cls => {
                                //     if (cn[c]) {
                                //         cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                                //     } else {
                                //         cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.remove(cls.toString().trim())
                                //     }
                                // })
                                try {
                                    oldValue.toString().trim().split(" ").forEach(cls => {
                                        cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.remove(cls.toString().trim())
                                    })
                                } catch (error) {

                                }

                                c.toString().trim().split(" ").forEach(cls => {
                                    cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                                })
                                oldValue = c.toString();

                                // if (c.toString().trim() !== '') {
                                //     if (cn[c]) {
                                //         c.toString().trim().length > 0 && this._parent.element.classList.add(c.toString().trim())
                                //     } else {
                                //         c.toString().trim().length > 0 && this._parent.element.classList.remove(c.toString().trim())
                                //     }
                                // }

                            }
                        }
                        if (typeof cn[c] === 'function') {
                            this._parent.bind.effect(() => {
                                var classValue = cn[c]();
                                if (this._parent.element instanceof HTMLElement ||
                                    this._parent.element instanceof Element) {

                                    try {
                                        oldValue.toString().trim().split(" ").forEach(cls => {
                                            cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.remove(cls.toString().trim())
                                        })
                                    } catch (error) {

                                    }

                                    classValue.toString().trim().split(" ").forEach(cls => {
                                        cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                                    })
                                    oldValue = classValue;

                                    // classValue.toString().trim().split(" ").forEach(cls => {
                                    //     cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                                    // })

                                    // if (c.toString().trim() !== '') {
                                    //     if (classValue) {
                                    //         c.toString().trim().length > 0 && this._parent.element.classList.add(c.toString().trim())
                                    //     } else {
                                    //         c.toString().trim().length > 0 && this._parent.element.classList.remove(c.toString().trim())
                                    //     }
                                    // }

                                }
                            })
                        }
                    })
                } else if (typeof cn === 'function') {

                    var oldValue = '';
                    var fx = () => {
                        var classValue = cn();

                        if (this._parent.element instanceof HTMLElement ||
                            this._parent.element instanceof Element) {

                            // if (oldValue.trim() != '' && oldValue.toString().trim().length > 0) { this._parent.element.classList.remove(oldValue) }
                            try {
                                oldValue.toString().trim().split(" ").forEach(cls => {
                                    cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.remove(cls.toString().trim())
                                })
                            } catch (error) {

                            }

                            classValue.toString().trim().split(" ").forEach(cls => {
                                cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                            })
                            oldValue = classValue;
                            // if (classValue.trim() !== '' && classValue.toString().trim().length > 0) {
                            //     this._parent.element.classList.add(classValue.toString().trim())
                            //     oldValue = classValue;
                            // }
                        }
                    };
                    this._parent.bind.effect(() => fx());
                } else {
                    cn.trim().split(" ").forEach(cls => {
                        if (this._parent.element instanceof HTMLElement ||
                            this._parent.element instanceof Element && cls !== '' && cls.trim().length > 0) {
                            this._parent.element.classList.add(cls.trim())
                        }
                    })
                }
            })
        } else if (typeof classNames === 'object') {

            Reflect.ownKeys(classNames).forEach(c => {
                if (typeof classNames[c] !== 'function') {
                    if (this._parent.element instanceof HTMLElement ||
                        this._parent.element instanceof Element) {

                        try {
                            if (oldValue) {
                                c.toString().trim().split(" ").forEach(cls => {
                                    cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.remove(cls.toString().trim())
                                })
                            } 
                        } catch (error) {

                        }
                        if (c) {
                            c.toString().trim().split(" ").forEach(cls => {
                                cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                            })
                        }

                        oldValue = c;

                        // c.toString().trim().split(" ").forEach(cls => {
                        //     cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                        // })

                        // if (c.toString().trim() !== '') {
                        //     if (classNames[c]) {
                        //         c.toString().trim().length > 0 && this._parent.element.classList.add(c.toString().trim())
                        //     } else {
                        //         c.toString().trim().length > 0 && this._parent.element.classList.remove(c.toString().trim())
                        //     }
                        // }
                    }
                }
                if (typeof classNames[c] === 'function') {
                    this._parent.bind.effect(() => {
                        if (this._parent.element instanceof HTMLElement ||
                            this._parent.element instanceof Element) {
                            var classvalue = classNames[c]();

                            try {
                                if (oldValue) {
                                    oldValue.toString().trim().split(" ").forEach(cls => {
                                        cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.remove(cls.toString().trim())
                                    })
                                }

                            } catch (error) {

                            }
                            if (classvalue) {
                                classvalue.toString().trim().split(" ").forEach(cls => {
                                    cls.toString().trim().length > 0 && (this._parent.element as HTMLElement).classList.add(cls.toString().trim())
                                })
                            }

                            oldValue = classvalue;
                            // if (c.toString().trim() !== '') {
                            //     if (classvalue) {
                            //         c.toString().trim().length > 0 && this._parent.element.classList.add(c.toString().trim())
                            //     } else {
                            //         c.toString().trim().length > 0 && this._parent.element.classList.remove(c.toString().trim())
                            //     }
                            // }

                        }
                    })
                }
            })
        } else if (typeof classNames === 'string') {
            classNames.trim().split(" ").forEach(cls => {
                if (this._parent.element instanceof HTMLElement ||
                    this._parent.element instanceof Element && cls != '' && cls.toString().trim().length > 0) {
                    if (cls.trim() != '') {
                        this._parent.element.classList.add(cls.trim())
                    }

                }
            })
        }
        return this._parent;
    }
    remove(classNames: string | string[]): IControl<ElementType,any,any> {

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

}
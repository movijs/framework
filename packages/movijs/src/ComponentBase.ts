

import { IClass, IControl } from "./abstractions";
import { IApplicationService } from "./abstractions/IApplicationService";
import { ApplicationService } from "./ApplicationService";
import { Collection, controlAttribute, ControlCollectionList, CreateLocalElement, ElementTypes, KeyValueItem, styleKeys, toKebab } from "./core";
import { controlClass } from "./core/controlClass";
import { controlStyle } from "./core/controlStyle";
import { system } from "./environment";
import { getTransitionInfo } from "./core/transition";
import { Directive } from "./directive";
import { Component, ReactiveEngine, RouterView, Slot, baseemits, baseeventargs } from ".";
import { dom } from "./core/Dom";
import { NodeTypes } from "./abstractions/NodeTypesEnum";
import { advanceif, isTemplate } from "./core/internal";



export const ElementModelMap = new WeakMap<any, IControl<ElementTypes, any, any>>();
var counter = 0;

const getDefaults = () => {
    return {
        DefaultFragmentElement: dom.createDocumentFragment(),
        PlaceholderElement: dom.createComment('ph')
    }
}

export class StateTypeBase<T = Object>{
    context = ApplicationService.current;
    slots: [] = [];
}


export abstract class MoviComponent<ElementType extends ElementTypes, StateType, caller extends MoviComponent<ElementType, StateType, caller>> implements IControl<ElementType, StateType, caller>{
    public props: StateType = {} as StateType;
    public extend?: any;
    element: ElementType = null as any;
    slots?: IControl<any, any, any>[];
    name?: string;
    bind: Directive = new Directive(this as any);
    isFragment: boolean = false;
    context: IApplicationService = ApplicationService.current;
    controls: ControlCollectionList<IControl<any, any, any>> = new ControlCollectionList(this);
    attr: controlAttribute<ElementType> = new controlAttribute(this as any);
    class: IClass<ElementType> = new controlClass(this as any) as any as IClass<ElementType>;
    isRendered: boolean = false;
    isDisposed: boolean = false;
    isConnected: boolean = false;
    isVisible: boolean = false;
    isRouterView?: boolean | undefined;
    genetic: any;
    private ghostPlaceholder;
    private sendedShow = false;

    public model: any;
    __isbusy: boolean = false;
    __bto;
    private _emitCollection: Map<any, Set<any>> = new Map<any, Set<any>>();

    options = {
        authorize: false,
        headers: null as any,
        settings: {} as any,
        autostyle: new controlStyle(this as any),
        ssrElementId: -1,
        transition: {
            name: ''
        },
        config: {
            argSource: {} as any,
            propSource: {} as any,
            reinitprops: (props) => {
                if (props && props.oncreating) {
                    this.on('oncreating', props.oncreating); delete props.oncreating;
                }
                var assigned = {};
                var self = this;
                if (!props) {
                    props = {};
                }
                const predefinedsettings = ['onstaged', 'preconfig', 'oncreating', 'oncreated', 'onbuilding', 'onbuilded', 'ondisposing', 'ondisposed', 'onconfig', 'onsetup', 'initializeComponent', 'renderTo'];
                if (props) {
                    predefinedsettings.forEach(x => {
                        if (props[x]) { this.on(x, props[x]); delete props[x]; }

                    })
                }
                this.props = props;
            }
        }
    }
    private _parent: IControl<ElementTypes, any, any> = null as any;
    public get parent(): IControl<ElementTypes, any, any> {
        return this._parent;
    };
    public set parent(v: IControl<ElementTypes, any, any>) {
        this._parent = v;
        if (this.onmounted) { this.onmounted(this); }
        this._emitCollection?.get("onmounted")?.forEach(cb => {
            cb(this);
        })
    }
    elementCreating?(current: any, props: any): any;
    protected _ = {
        placeholder: null as unknown as Comment,
        isMainComponent: false,
        isContainer: false,
        waitInit: false,
        waitState: false,
        isInited: false,
        viewInit: false,
        isConfigurated: false,
        on: new Set<any>(),
        replacedHidden: false,
        instanced: false,
        initializing: {
            wait: () => {
                if (!this._.waitInit) {
                    if (this._.waitState === false && this.bind.Configuration.WaitSettings && this.bind.waitDirective && this.parent) {
                        this.parent["_"].methods.AppendElement(this);
                        this.hide();
                        this._.waitState = true;
                        this._.waitInit = true;
                        this.bind.waitDirective.init(this.bind.Configuration.WaitSettings, this as any);
                        return true;
                    }
                }
                return false;
            },
            addPropsClass: (props) => {
                if (this && props && props['class'] && !this.isDisposed) {
                    if (this.element.nodeType == 1) {
                        this.class.add(props.class);
                    } else {
                        this.controls.forEach(x => { x._.initializing.addPropsClass(props) })
                    }
                }
            },
            removePropsClass: (props) => {
                if (this && props && props['class'] && !this.isDisposed) {
                    if (this.element.nodeType == 1) {
                        this.class.remove(props.class);
                    } else {
                        this.controls.forEach(x => { x._.initializing.removePropsClass(props) })
                    }
                }
            },
            addHandler: (event: string, callback: (e: Event | UIEvent | any, sender: IControl<ElementType, any, any>) => any) => {
                if (this.isDisposed == true) { return this }
                if (this.element === null || this.element === undefined) {
                    return this as any
                }
                if (this.element.nodeType != 1) {
                    this.controls.forEach(x => { x._.initializing.addHandler(event, callback) })
                } else {
                    var xname = event.trim();
                    var sender = this;
                    xname.split(" ").forEach(eventName => {

                        var spliter = ".";
                        if (eventName.indexOf("-") > -1) {
                            spliter = "-";
                        } else if (eventName.indexOf(":") > -1) {
                            spliter = ":";
                        }
                        var splt = eventName.split(spliter);
                        const event = {
                            key: splt[0],
                            options: {
                                once: false,
                                capture: false,
                                passive: false,
                                prevent: false,
                                stop: false,
                                trusted: false,
                                self: false,
                            },

                            value: (ev: Event | any) => {

                                var recall = () => {
                                    if (event.options.trusted === true && !ev.isTrusted) {
                                        return;
                                    }
                                    if (event.options.self) {
                                        if ((ev as Event).target !== sender.element) {
                                            return;
                                        }
                                    }

                                    if (splt.length > 1 && ev instanceof KeyboardEvent) {
                                        if (ev['key']?.toLowerCase() == splt[1].toLowerCase()) {
                                            if (event.options.prevent === true) {
                                                ev.preventDefault();
                                            }
                                            if (event.options.stop === true) {
                                                ev.stopPropagation();
                                            }
                                            callback(ev, sender as any)
                                        }
                                    }
                                    else {
                                        if (event.options.prevent === true) {
                                            ev.preventDefault();
                                        }
                                        if (event.options.stop === true) {
                                            ev.stopPropagation();
                                        }
                                        callback(ev, sender as any)
                                    }
                                }
                                Promise.resolve().then(() => {
                                    if (!queueMicrotask) {
                                        queueMicrotask(recall);
                                    } else {
                                        recall();
                                    }
                                })

                            }
                        };

                        for (let index = 2; index <= splt.length; index++) {
                            const element = splt[index];
                            switch (element) {
                                case 'once':
                                    event.options.once = true;
                                    break;
                                case 'passive':
                                    event.options.passive = true;
                                    break;
                                case 'prevent':
                                    event.options.prevent = true;
                                    break;
                                case 'stop':
                                    event.options.stop = true;
                                    break;
                                case 'trusted':
                                    event.options.trusted = true;
                                    break;
                                default:
                                    break;
                            }
                        }

                        this._.eventHandlers.add(event);
                        try {
                            this.element.addEventListener(event.key, event.value, event.options)
                        } catch (err) {
                            console.error(err);
                        }

                    });
                }


                return this as any;
            }
        },
        event: {
            onbuilding: () => {

                if (this.onbuilding) { this.onbuilding(this as any) }
                // if (this._.isInited === false && this['onbuilding']) { this['onbuilding'](this as any); }

                this._emitCollection?.get("onbuilding")?.forEach(cb => {
                    debugger
                    cb(this);
                })
                // if (!this._.isInited) {
                if (this['runover'] && this['runover']['onbuilding']) {

                    this['runover']['onbuilding'](this)
                }
                //}

            },
            onbuilded: () => {

                if (this.onbuilded) { this.onbuilded(this as any) }
                // if (this._.isInited === false && this['onbuilding']) { this['onbuilding'](this as any); }

                this._emitCollection?.get("onbuilded")?.forEach(cb => {
                    cb(this);
                })
                //if (!this._.isInited) {
                if (this['runover'] && this['runover']['onbuilded']) {
                    this['runover']['onbuilded'](this)
                }
                // }

            },
            oncreating: () => {
                if (this.oncreating) this.oncreating(this as any);
                this._emitCollection?.get("oncreating")?.forEach(cb => {
                    cb(this);
                })

                if (this['runover'] && this['runover']['oncreating']) {
                    try {
                        this['runover']['oncreating'](this, this)
                    } catch (error) {
                    }
                }

            },
            oncreated: () => {
                if (this.oncreated) this.oncreated(this as any);
                this._emitCollection?.get("oncreated")?.forEach(cb => {
                    cb(this);
                })
                if (this['runover'] && this['runover']['oncreated']) {
                    this['runover']['oncreated'](this);
                }
            },
            preconfig: () => {

                if (this.preconfig) this.preconfig(this as any);
                this._emitCollection?.get("preconfig")?.forEach(cb => {
                    cb(this);
                })
                if (this['runover'] && this['runover']['preconfig']) {
                    this['runover']['preconfig'](this);
                }
            },
            onconfig: () => {
                if (this._.isConfigurated) { return }
                this._.isConfigurated = true;
                var self = this;
                if (self.onconfig) self.onconfig(self as any);
                self._emitCollection?.get("onconfig")?.forEach(cb => {
                    if (self.onconfig != cb) {
                        cb(self);
                    }
                })
                if (this['runover'] && this['runover']['onconfig']) {
                    if (self.onconfig != self['runover']['onconfig']) {
                        self['runover']['onconfig'](self);
                    }
                }
            }
        },
        methods: {
            addNodes: () => {
                var self = this;
                if (this['nodes']) {
                    this['nodes'].forEach(element => {
                        if (element) { element.parent = self; this.controls.add(element); }
                    });
                }
            },
            addSlots: () => {
                // var self = this;
                // var slots = this._.methods.findSlotNodes(this as any);

                // var namedSlot = false;



                // if (slots && slots.length > 0) {
                //     slots.forEach((x, isd) => {
                //         debugger
                //         var s = self.slots?.find(t => (t.attr.get('slot') === x.attr.get('name')));
                //         if (s) {
                //             s.attr.remove('slot');
                //             s.parent = self;
                //             x.controls.add(s);
                //             namedSlot = true;
                //         }
                //     })
                //     // slots.forEach((x, isd) => {

                //     //     if (!x.props || !x.props.Name) {
                //     //         var s = this.slots?.filter(t => !t.attr.has('slot'));
                //     //         if (s && s.length > 0) {
                //     //             s.forEach(y => {
                //     //                 y.parent = self;
                //     //                 x.controls.add(y);
                //     //             })
                //     //             namedSlot = true;
                //     //         }
                //     //     }
                //     // })


                //     // console.error('slots', this._.methods.findSlotNodes(this),this['slots']);
                // }

                // this.controls.forEach(f => {
                //     f._.methods.addSlots();
                // })
            },
            findSlotNodes: (comp: IControl<any, any, any>): IControl<any, any, any>[] => {
                var founds: IControl<any, any, any>[] = [];

                // // comp.controls.filter((x) => x.element instanceof Slot).forEach(y => {
                // //     founds.push(y);
                // //     var si = comp['_'].methods.findSlotNodes(y);
                // //     if (si && si.length > 0) {
                // //         founds.push(...si)
                // //     }
                // // })

                // comp.controls.forEach(y => {
                //     if (y.element instanceof HTMLSlotElement) {
                //         founds.push(y);
                //     }
                //     var si = comp['_'].methods.findSlotNodes(y);
                //     if (si && si.length > 0) {
                //         founds.push(...si)
                //     }
                // })
                return founds;
            },
            runSetup: async () => {
                var self = this;
                if (self.setup) {

                    await self.setup(self as any);
                }
                await this._emitCollection?.get("setup")?.forEach(async cb => {

                    await cb(self);
                })

                await this._emitCollection?.get("onsetup")?.forEach(async cb => {

                    await cb(self);
                })
                if (this['runover']) {
                    if (this._.isMainComponent) {
                        if (this.controls.length > 0) {
                            await this.controls.forEach(async c => {
                                if (!c['runover'] && this['runover']['setup']) {
                                    c['runover'] = {
                                        setup: this['runover']['setup']
                                    }
                                } else if (this['runover'] && this['runover']['setup']) {
                                    c['runover']['setup'] = this['runover']['setup'];
                                }
                            })
                        }
                    } else {
                        if (this['runover'] && this['runover']['setup']) {
                            this['runover']['setup'](self);
                        }
                    }
                }
                this.isDisposed != true && this.context.extensions && this.context.extensions.forEach((x, y, z) => {
                    Reflect.ownKeys(x).forEach(t => {
                        if (x[t].componentInit) {
                            x[t].componentInit(this);
                        }
                    })
                });

            },
            //waiterFr: getDefaults().DefaultFragmentElement.cloneNode(),
            //waiterin: null as any,
            AppendElement: async (child, reference: any = null) => {
                if (this.isDisposed == true) { return; }
                child._.methods.addEnterTransition();
                if (!this || !this.element || !this.element.childNodes) {
                    debugger;
                    return;
                }
                const array = Array.prototype.slice.call(this.element.childNodes);
                if (this._.isMainComponent || advanceif(this, NodeTypes.TEXT_NODE, NodeTypes.COMMENT_NODE)) {
                    //Mevcut komponent bir fragment içeriyor. Bir üst kontrole yönlendir. ve ana düğümü bulana kadar devam et.
                    //console.error("Ana düğüm bir fragment. üst birimde arama yapılacak") 
                    if (this.parent) {
                        (this.parent as any)._.methods.AppendElement(child, this);
                    } else {
                        console.error("Ana düğüm girişi bulunamadı. İşlem burada sonlandırılır.", child);
                    }
                } else {

                    // Bu kontroller bir html düğümüdür.  
                    if (child._.isMainComponent || advanceif(child, NodeTypes.TEXT_NODE, NodeTypes.COMMENT_NODE)) {

                        //Öğe önceden eklenmiş mi?
                        if (array.indexOf(child.element) > -1) {

                            //console.error("Öğe önceden işaretlenmiş")
                        } else {

                            //console.error("Gelen düğüm işaretlenecek")
                            if (child.parent && array.indexOf(child.parent.element) > -1) {
                                if (child.parent) {
                                    var ito = child['insertTo'];
                                    var ref = child.parent.controls.filter(ff => ff.isRendered)[ito];
                                    if (ref && advanceif(ref, NodeTypes.TEXT_NODE, NodeTypes.COMMENT_NODE)) {
                                        var len = array.indexOf(ref.element) - ref.controls.length;
                                        var newref = array[len];
                                        this.element.insertBefore(child.element, newref);
                                    } else {
                                        if (ref) {
                                            var target = ref.element;
                                            if (ref) {
                                                if (ref.element.isConnected) {
                                                    this.element.insertBefore(child.element, ref.element);
                                                } else if (ref._.placeholder.isConnected) {
                                                    this.element.insertBefore(child.element, ref._.placeholder);
                                                } else {
                                                    this.element.insertBefore(child.element, child.parent.element);
                                                }
                                            } else if (ref._.isMainComponent) {
                                                target = target.previousElementSibling;
                                                this.element.insertBefore(child.element, target);
                                            }
                                        } else {
                                            this.element.insertBefore(child.element, child.parent.element);
                                        }
                                    }

                                } else {
                                    this.element.insertBefore(child.element, child.parent.element);
                                }

                            } else {
                                var ito = child['insertTo'];
                                var ref = this.controls.filter(ff => ff.isRendered)[ito];
                                if (ref && advanceif(ref, NodeTypes.TEXT_NODE, NodeTypes.COMMENT_NODE)) {
                                    var len = array.indexOf(ref.element) - ref.controls.length;
                                    var newref = array[len];
                                    this.element.insertBefore(child.element, newref);
                                } else {

                                    if (advanceif(this, NodeTypes.TEXT_NODE, NodeTypes.COMMENT_NODE)) {
                                        if (this.parent) {
                                            (this.parent as any)._.methods.AppendElement(child);
                                        } else {

                                            this.element.parentElement?.insertBefore(child.element, this.element);
                                        }

                                    } else if (ref) {
                                        //
                                        try {
                                            ref.element.parentElement?.insertBefore(child.element, ref.element);
                                        } catch (error) {
                                            this.element.appendChild(child.element);
                                        }

                                    } else {
                                        this.element.appendChild(child.element);
                                    }
                                }

                            }
                        }


                    } else {
                        //Gelen element bir html öğesi

                        if (array.indexOf(child.element) > -1) {
                            // console.error("Öğe önceden eklenmiş")
                            var ito = child['insertTo'];
                            var ref = this.controls.filter(ff => ff.isRendered)[ito];
                            if (ref && advanceif(ref, NodeTypes.TEXT_NODE, NodeTypes.COMMENT_NODE)) {
                                var len = array.indexOf(ref.element) - ref.controls.length;
                                var newref = array[len];
                                this.element.insertBefore(child.element, newref);
                            } else {
                                if (!advanceif(this, NodeTypes.ELEMENT_NODE)) {
                                    if (this.parent) {
                                        (this.parent as any)._.methods.AppendElement(child);
                                    } else {
                                        this.element.parentElement?.insertBefore(child.element, this.element);
                                    }
                                } else if (ref) {
                                    try {
                                        ref.element.parentElement?.insertBefore(child.element, ref.element);
                                    } catch (error) {
                                        throw error
                                    }

                                } else {
                                    try {
                                        this.element.appendChild(child.element);
                                    } catch (error) {
                                        debugger
                                    }

                                }
                            }
                        } else {
                            //console.error("Gelen düğüm eklenecek",owner?array.indexOf(owner.element):'')
                            if (child.parent && array.indexOf(child.parent.element) > -1) {

                                var ito = child['insertTo'];
                                var ref = child.parent.controls.filter(ff => ff.isRendered)[ito];
                                if (ref && advanceif(ref, NodeTypes.TEXT_NODE, NodeTypes.COMMENT_NODE)) {
                                    var len = array.indexOf(ref.element) - ref.controls.length;
                                    var newref = array[len];
                                    this.element.insertBefore(child.element, newref);
                                } else {
                                    if (ref && ref.isVisible) {
                                        if (ref.element.isConnected) {
                                            if (child.element != ref.element) {
                                                this.element.insertBefore(child.element, ref.element);
                                            }
                                        } else if (ref._.placeholder.isConnected) {
                                            this.element.insertBefore(child.element, ref._.placeholder);
                                        } else {
                                            this.element.insertBefore(child.element, child.parent.element);
                                        }
                                    } else if (ref) {
                                        if (ref._.placeholder.isConnected) {
                                            this.element.insertBefore(child.element, ref._.placeholder);
                                        } else if (ref.element.isConnected) {
                                            this.element.insertBefore(child.element, ref.element);
                                        } else {
                                            this.element.insertBefore(child.element, child.parent.element);
                                        }
                                    } else {
                                        this.element.insertBefore(child.element, child.parent.element);
                                    }
                                }


                            } else {
                                var ito = child['insertTo'];
                                var ref = this.controls.filter(ff => ff.isRendered)[ito];
                                if (ref && advanceif(ref, NodeTypes.TEXT_NODE, NodeTypes.COMMENT_NODE)) {
                                    var len = array.indexOf(ref.element) - ref.controls.length;
                                    var newref = array[len];
                                    this.element.insertBefore(child.element, newref);
                                } else {
                                    if (!advanceif(this, NodeTypes.ELEMENT_NODE)) {
                                        if (this.parent) {
                                            (this.parent as any)._.methods.AppendElement(child);
                                        } else {
                                            this.element.parentElement?.insertBefore(child.element, this.element);
                                        }
                                    } else if (ref) {
                                        try {
                                            ref.element.parentElement?.insertBefore(child.element, ref.element);
                                        } catch (error) {

                                        }
                                    } else {
                                        try {
                                            this.element.appendChild(child.element);
                                        } catch (error) {
                                            debugger
                                        }

                                    }
                                }
                            }
                        }
                    }
                }
                await child._.methods.waitTransition('enter', () => { });
            },
            clearMainSubsicribers: null as any,
            addEnterTransition: async () => {
                if (this.isDisposed == true) { return; }
                var self = this;
                if (this.element.nodeType != 1) { return; }
                if (self?.options?.transition?.name && self.options.transition.name !== '') {
                    var name = self.options.transition.name;
                    self.class.remove([`${name}-leave`, `${name}-leave-end`])
                    self.class.add([`${name}-enter`, `${name}-enter-start`])
                }
                var p: any = self.props;
                if (p?.options?.transition?.name && p.options.transition.name !== '') {
                    var namex = p.options.transition.name;
                    self.class.remove([`${namex}-leave`, `${namex}-leave-end`])
                    self.class.add([`${namex}-enter`, `${namex}-enter-start`])
                }
            },
            addLeaveTransition: async () => {
                if (this.isDisposed == true) { return; }
                if (this.element.nodeType != 1) { return; }
                var self = this;
                if (self?.options?.transition.name && self.options.transition.name !== '') {
                    var name = self.options.transition.name;
                    self.class.remove([`${name}-enter`, `${name}-enter-start`])
                    self.class.add([`${name}-leave`, `${name}-leave-end`])
                }

                var p: any = self.props;
                if (p?.options?.transition.name && p.options.transition.name !== '') {
                    var namex = p.options.transition.name;
                    self.class.remove([`${namex}-enter`, `${namex}-enter-start`])
                    self.class.add([`${namex}-leave`, `${namex}-leave-end`])
                }
            },
            addMoveTransition: async () => {
                if (this.isDisposed == true) { return; }
                if (this.element.nodeType != 1) { return; }
                if (this.options.transition?.name && this.options.transition.name !== '') {
                    var name = this.options.transition.name;
                    this.class.remove([`${name}-enter`, `${name}-enter-start`, `${name}-leave`, `${name}-leave-end`])

                    // await this.waitTransition();
                }
            },
            waitTransition: async (type: string, cb) => {
                if (this.isDisposed == true) { return; }


                var self = this._.methods;
                var _this = this;

                var call = false;
                const onstaged = async () => {
                    if (type !== 'leave') {
                        await this._emitCollection?.get("onstaged")?.forEach(async cbx => {
                            await cbx(this);
                        })
                    }
                }
                if (this.element.nodeType != 1) {
                    onstaged()
                    cb()
                    return;
                }
                if (_this.options.transition.name && _this.options.transition.name !== '' && type !== '') {
                    var name = _this.options.transition.name;
                    var transitionInfo = getTransitionInfo(_this.element as Element, `${name}-${type} ${name}-${type}-start`);
                    this.class.add([`${name}-running`])
                    if (transitionInfo.timeout != null) {

                        return new Promise(resolve => {
                            dom.window.setTimeout(async () => {

                                if (type !== 'leave') {
                                    if (_this.options?.transition?.name && _this.options.transition.name !== '') {
                                        var name = _this.options.transition.name;
                                        _this.class.remove([`${name}-running`, `${name}-enter`, `${name}-enter-start`, `${name}-leave`, `${name}-leave-end`]);
                                    }
                                    onstaged();
                                }
                                resolve(await cb());
                            }, transitionInfo.timeout)
                        });
                    } else {
                        onstaged()
                        cb()
                    }
                } else {
                    onstaged()
                    cb()
                }
            },
            _oldDelayer: null as any,
            delay: async (milliseconds, cb?: any) => {
                if (this.isDisposed == true) { return; }
                var self = this._.methods;

                dom.window.clearTimeout(self._oldDelayer);
                return new Promise((resolve: any) => {
                    self._oldDelayer = dom.window.setTimeout(() => {
                        resolve();
                        if (cb) { cb() }
                    }, milliseconds);
                });
            },
            remove: () => {
                if (this.isDisposed == true) { return; }
                if (this.element) {
                    if (advanceif(this, NodeTypes.TEXT_NODE)) {
                        (this.element as any).remove();
                    }
                    else if (advanceif(this, NodeTypes.ELEMENT_NODE)) {
                        (this.element as any).remove();
                    } else if (advanceif(this, NodeTypes.DOCUMENT_FRAGMENT_NODE)) {
                        this.element.firstChild?.remove();
                    } else if (isTemplate(this)) {
                        (this.element as any).content.firstChild?.remove();
                    } else {
                        (this.element as any).remove();
                    }
                }
            },
            itemadd: (index, item) => {
                if (this.isDisposed == true) { return; }
                // if (typeof item === 'function') {
                //     var newElement = item();
                //     if (newElement instanceof Promise) {
                //         item = new Component({});
                //         //newElement.then(x=> item.add(new x.default()))

                //         newElement.then(x => console.error(x))
                //     }
                // }

                var self = this;

                if (Array.isArray(item)) {
                    item.forEach((t, index2) => {
                        this._.methods.itemadd(index + index2, t);
                        // t['insertTo'] = index + index2;
                        // t.parent = self;
                        // t.build();
                    })
                } else {
                    if (item.build) {
                        item['insertTo'] = index;
                        item.parent = self;
                        item.build();
                    } else {
                        var nitem = item;
                        if (typeof item === 'function') {
                            nitem = item();
                        }
                        if (nitem instanceof Component) {
                            nitem['insertTo'] = index;
                            nitem.parent = self;
                            nitem.build();
                        } else if (typeof nitem === 'boolean' || typeof nitem === 'bigint' || typeof nitem === 'number' || typeof nitem === 'string') {
                            var adding = new Component('text');
                            adding.bind.text(() => item);
                            adding.parent = self;
                            adding['insertTo'] = index;
                            adding.build();
                        } else if (typeof nitem === 'object' && !Array.isArray(nitem)) {
                            var adding = new Component('text');
                            adding.bind.text(() => item);
                            adding.parent = self;
                            adding['insertTo'] = index;
                            adding.build();
                        } else if (Array.isArray(nitem)) {
                            nitem.forEach((t, index2) => {
                                this._.methods.itemadd(index + index2, t);
                                // t['insertTo'] = index + index2;
                                // t.parent = self;
                                // t.build();
                            })
                        } else {
                            console.warn('build err', typeof nitem, nitem, item);
                        }

                    }
                }

            },
            findParentUsableElemet: (source: IControl<any, any, any>) => {
                if (this.isDisposed == true) { return; }
                if (source && source.element && source.element['querySelectorAll']) {
                    return source.element
                } else if (source.parent) {
                    return this._.methods.findParentUsableElemet(source.parent)
                } else {
                    return null
                }
            }
        },
        tempContent: null as unknown as IControl<ElementTypes, any, any>,
        eventHandlers: new Collection<KeyValueItem>(),
        modelInstances: new Set<any>()
    }

    protected constructor(tag, props, args) {

        Object.keys(this._.methods).forEach(k => {
            if (typeof this._.methods[k] === 'function') {
                this._.methods[k] = this._.methods[k].bind(this);
            }
        })



        if (!props) {
            props = {};
        }

        if (props && props.oncreating) {
            this.on('oncreating', props.oncreating); delete props.oncreating;
        }
        if (args && args.oncreating) {
            this.on('oncreating', args.oncreating); delete args.oncreating;
        }
        const predefinedsettings = ['onstaged', 'preconfig', 'oncreating', 'oncreated', 'onbuilding', 'onbuilded', 'ondisposing', 'ondisposed', 'onconfig', 'onsetup', 'initializeComponent', 'renderTo'];
        if (props) {
            predefinedsettings.forEach(x => {
                if (props[x]) { this.on(x, props[x]); delete props[x]; }
            })
        }


        this._.placeholder = getDefaults().PlaceholderElement.cloneNode(true) as any;
        this.setText = this.setText.bind(this);
        this.add = this.add.bind(this);
        this.setTempContent = this.setTempContent.bind(this);
        this.build = this.build.bind(this);
        this.dispose = this.dispose.bind(this);
        this.flush = this.flush.bind(this);
        this.clear = this.clear.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.on = this.on.bind(this);
        this.addHandler = this.addHandler.bind(this);
        this.removeHandler = this.removeHandler.bind(this);
        this.using = this.using.bind(this);

        this._.event.oncreating();

        if (this.elementCreating) { tag = CreateLocalElement(this.elementCreating(tag, props)) }

        Object.keys(this).forEach(k => {
            if (k != 'runover' && typeof this[k] === 'function') {
                this[k] = this[k].bind(this);
            }
        })

        var assigned = {};
        var self = this;

        if (props) {
            Object.keys(props).forEach(k => {
                if (k != 'class' && k != 'onsetup' && k != 'props' && k !== 'preconfig' && k !== 'oncreating' && k !== 'oncreated' && k !== 'onbuilding' && k !== 'onbuilded' && k !== 'ondisposing' && k !== 'ondisposed' && k !== 'onconfig' && k != 'setup') {
                    assigned[k] = props[k];
                }
            })
        }
        // var psd = Object.keys(props).filter(x => x.startsWith('on:'));
        // psd.forEach(x => {
        //     if (predefinedsettings.indexOf(x) < 0) {
        //         predefinedsettings.push(x)
        //     }
        // })


        this.props = props;




        if (this.props['indexkey'] || this.props['key']) {
            this.options.settings['oi'] = typeof this.props['indexkey'] == 'function' ? this.props['indexkey']() : this.props['indexkey'];
            this.options.settings['ni'] = this.props['indexkey'];
            delete this.props['indexkey'];
        }
        // if (this.props['key']) {
        //     this['__list_key__'] = this.props['key'];
        //     delete this.props['key'];
        // }
        if (args) {

            predefinedsettings.forEach(x => {
                if (args[x]) { this.on(x, args[x]); delete args[x]; }
            })

            if (args.setup) { this.on("setup", args.setup); /*this.setup = args.setup; this.on("setup", args.setup.bind(this));*/ }// this.setup = args.setup; 
            Object.keys(args).forEach(k => {
                if (k != 'class' && k != 'onsetup' && k != 'props' && k !== 'preconfig' && k !== 'oncreating' && k !== 'oncreated' && k !== 'onbuilding' && k !== 'onbuilded' && k !== 'ondisposing' && k !== 'ondisposed' && k !== 'onconfig' && k != 'setup') {
                    assigned[k] = args[k];
                }
            })
        }

        Object.assign(this, assigned);

        Object.keys(this).forEach(k => {
            if (k != 'runover' && typeof this[k] === 'function' && k.startsWith('on') && k.length > 2) {
                this.on(k, this[k].bind(this));
            }
        })

        //Object.assign(this, props) 
        var self = this;
        if (this.context.extensions && this.context.extensions.size > 0) {
            var ref = {}
            this.context.extensions.forEach((x, y, z) => {
                delete x['props'];
                var clone = Object.assign({}, x);
                if (typeof clone === 'function') {
                    clone = clone.bind(self);
                }

                Reflect.ownKeys(clone).forEach(t => {
                    if (typeof clone[t] === 'function') {
                        clone[t] = clone[t].bind(self);
                    }
                });

                Reflect.ownKeys(clone).forEach(t => {
                    if (clone[t].run) {
                        clone[t].run(self);
                    }
                })
                //Object.assign(ref, clone);
                Object.assign(self, clone)
            }, this);

        }
        if (tag === undefined || tag === null) {
            this._.isMainComponent = true;

            this._.isContainer = true;
            this.element = getDefaults().PlaceholderElement.cloneNode(true) as ElementType;
        } else {
            this.element = tag;
        }


        if (this.props && this.props["ref"] && typeof this.props['ref'] === 'function') {

            this.props["ref"](this);
        }





        this._.methods.clearMainSubsicribers = this.context.internal.subscribe('routeChanged', this);
        /*
        () => {
            if (this.onRouteChanged && !this.isDisposed) { this.onRouteChanged.call(this, this) }
        }
        */

         
        this.controls.ItemAdded = (item: any) => {
            if (item.genetic) item.genetic = this.genetic;
            if (this.isRendered) this._.methods.itemadd(this.controls.length - 1, item);
            this.onChildAdded && this.onChildAdded(this, item, this.controls.length - 1);
        }
        this.controls.ItemAddedBefore = (item: any) => {
            if (item.genetic) item.genetic = this.genetic;
            if (this.isRendered) this._.methods.itemadd(this.controls.length - 1, item);
            this.onChildAdded && this.onChildAdded(this, item, this.controls.length - 1);
        }

        this.controls.ItemSplice = (index, item: any) => {
            if (item.genetic) item.genetic = this.genetic;
            if (this.isRendered) this._.methods.itemadd(index, item);
            this.onChildAdded && this.onChildAdded(this, item, index);
        }

        this.controls.onItemRemoved = (item, index) => {
            this.onChildRemoved && this.onChildRemoved(this, item as any);
        }


        this._.instanced = true;
        if (!ElementModelMap.has(this.element)) {
            ElementModelMap.set(this.element, this as any);
        }


        // Promise.resolve().then(x => {
        //     if (this.isDisposed) { return }

        // })

        // if (window.queueMicrotask != undefined || window.queueMicrotask != null) {
        //     queueMicrotask(() => {
        //         if (this.isDisposed) { return }
        //         this._.event.preconfig.bind(this)();
        //         this._.event.onconfig.bind(this)();
        //     })
        // } else if (window.requestIdleCallback != null || window.requestIdleCallback != undefined) {
        //     window.requestIdleCallback(() => {
        //         if (this.isDisposed) { return }
        //         this._.event.preconfig.bind(this)();
        //         this._.event.onconfig.bind(this)();
        //     })
        // } else {
        //     window.setTimeout(() => {
        //         if (this.isDisposed) { return }
        //         this._.event.preconfig.bind(this)();
        //         this._.event.onconfig.bind(this)();
        //     }, 0);
        // }

        this._.event.oncreated();

        this.signal('updateState', this.updateState.bind(this));

        //Object.getPrototypeOf(this.element).component=this;
        // (this.element as any).component = ()=> this;




        if (this.initializeComponent) { this.initializeComponent = this.initializeComponent.bind(this); };

        this._emitCollection?.get("initializeComponent")?.forEach(cb => {
            cb(this);
        })


    }

    private _iswait: boolean = false;
    private get iswait(): boolean {
        if (this._iswait === true) {
            if (this.isRendered) {
                this.hide();
            }
        }
        return this._iswait;
    };
    private set iswait(v: boolean) {
        this._iswait = v;
        if (v === false) {
            this.build();
            this.show();
        } else {
            if (this.isRendered) {
                this.hide();
            }
        }
    }

    public add(...args: IControl<any, any, any>[]) {
        if (this.isDisposed == true) { return; }
        args.forEach(x => {
            this.controls.add(x);
            x.parent = this as any;
        })
    }

    setText(value) {
        if (this.isDisposed == true) { return; }
        if (!this._.isMainComponent) {
            this.element.textContent = value;
        }
    }
    private _tempContent?: IControl<any, any, any>;
    setTempContent(control: IControl<any, any, any>) {
        if (this.isDisposed == true) { return; }
        this._tempContent = control;
        if (!control.isRendered) {
            control.build();
        }
        if (this._.isMainComponent) {
            this.element.parentElement?.replaceChild(this.element, control.element)
        } else {
            this.element.appendChild(control.element)
        }
    }
    async build(target?: any) {
        if (this.isDisposed) { return }
        if ((this.element.nodeName == 'A') && ((this.props['useRouter']) || (this.attr.has('useRouter') && this.attr.get('useRouter')))) {

            this.addHandler('click', (e) => {
                var target = this.attr.get('href');
                if (target) {
                    e.preventDefault();
                    this.context.navigate(target);
                    e.stopPropagation();
                }
                return false;
            })
        } else if (((this.props['useRouter']) || (this.attr.has('useRouter') && this.attr.get('useRouter')))) {
            this.addHandler('click', (e) => {
                var target = this.props['href'];
                if (target) {
                    e.preventDefault();
                    this.context.navigate(target);
                    e.stopPropagation();
                }
                return false;
            })
        }

        if (this["ref"] && typeof this["ref"] === 'function') {
            this["ref"](this);
            if (this.onRefCreated) { this.onRefCreated(this as any); }
        }
        if (this['runover'] && this['runover']['ref']) {
            this['runover']['ref'](this);
            if (this.onRefCreated) { this.onRefCreated(this as any); }
        }
        this._.event.onconfig.bind(this)();
        if (this.options.config.propSource['renderTo']) {
            var renderTo = this.options.config.propSource['renderTo'];
            if (typeof renderTo === 'function') {
                renderTo = renderTo(this);
            }
            if (renderTo != null || renderTo != '') {
                if (renderTo instanceof Component) {
                    target = renderTo.element;
                } else if (typeof renderTo == 'string') {
                    target = dom.querySelectorAll(renderTo)[0]
                } else {
                    target = renderTo;
                }
            }
        }
        // if ((this.element instanceof Text || this.element instanceof Comment) && (this.parent.element instanceof Text || this.parent.element instanceof Comment)) { 

        // } 

        // if (this["ref"] && typeof this["ref"] === 'function') {
        //     this["ref"](this);
        // }
        if (this['runover'] && this['runover']['ref']) {
            this['runover']['ref'](this);
        }

        if (this.onupdating) this.onupdating(this as any, { data: this.model, field: '', source: 'building' })




        var _this = this;
        // if (this.props) {
        //     Object.keys(this.props).forEach(txf => {
        //         delete this[txf];
        //     })
        // }
        try {

            if (this.isRendered) {
                if (_this.parent) {
                    _this.parent['_'].methods.AppendElement(this);
                    this.isVisible = true;
                }
                this.controls.forEach((item, index) => {
                    _this._.methods.itemadd(index, item);
                })
                return;
            };


            const resume = async (self) => {

                this._.event.preconfig.bind(this)();
                self._.isInited = true;

                if (self._.initializing.wait()) {
                    return;
                };

                if (self.iswait) {
                    return;
                }

                self._.event.onbuilding();
                self._.methods.addNodes();

                if (target) {
                    target.append(self.element)
                } else {
                    if (self.parent) {
                        self.parent['_'].methods.AppendElement(this);
                        this.isVisible = true;
                    }
                }


                var resume = true;

                if (self.view && !self._.viewInit) {
                    self.isApplicationSecope = true;
                    self.view = self.view.bind(self);
                    var item = self.view ? await self.view.call(self, self) : null as any;
                    if (typeof item === 'string') {
                        var tmp = dom.createElement('template');
                        tmp.innerHTML = item;
                        item = tmp.childNodes;
                    }
                    self._.viewInit = true;
                    if (item != null) {
                        if (Array.isArray(item)) {
                            item.forEach(g => {
                                g.parent = self;
                                self.controls.add(g);
                            })
                        }
                        else if (item instanceof MoviComponent) {
                            if (item && item['nodes']) {
                                item['nodes'].forEach(element => {
                                    if (element && element.element) {
                                        if (item) element.parent = self;
                                        item && item.controls.add(element);
                                    }
                                });
                            }
                            item.parent = self;
                            self.controls.add(item);
                        } else {

                            if (item.view) {
                                item.view = item.view.bind(self);
                            }

                            var itemA = self.view ? await self.view.call(self, self) : null;
                            if (Array.isArray(itemA)) {
                                itemA.forEach(g => {
                                    g.parent = self;
                                    self.controls.add(g);
                                })
                            } else if (itemA instanceof MoviComponent) {
                                if (itemA && itemA['nodes']) {
                                    itemA['nodes'].forEach(element => {
                                        if (element && element.element) {
                                            element.parent = self;
                                            item && item.controls.add(element);
                                        }
                                    });
                                }
                                item.parent = self;
                                self.controls.add(item);
                            } else {
                                item.parent = self;
                                self.controls.add(item);
                            }
                        }
                        if (self._.initializing.wait()) return;

                        if (self.iswait) {
                            resume = false;
                            return;
                        }
                    }
                }

                self._.methods.runSetup();

                if (self._.tempContent) { self._.tempContent.dispose() }

                self.controls.forEach((item, index) => {
                    self._.methods.itemadd(index, item);
                })

                self.isRendered = true;
                self.bind.init();

                self._.event.onbuilded();
                this._.methods.addSlots();

                this._.initializing.addPropsClass(this.props);
                //this._.methods.addEnterTransition();
            }
            var selfMain = this;
            if (!this._.isInited) {
                if (this['interrupt']) {
                    this['interrupt'](this as any, async function () {
                        if (self['runover'] && self['runover']['interrupt']) {
                            self['runover']['interrupt'](self, async function () {
                                resume(selfMain)
                            })
                        } else {
                            resume(selfMain)
                        }
                    })
                } else {
                    resume(selfMain);
                }
            } else {
                resume(selfMain);
            }

        } catch (error) {
            console.error('movi:' + error)
        }

        if (this['const']) {
            this.parent[this['const']] = this;
        }
    }
    updateState(deep: boolean = false, onlyChild: boolean = false) {
        if (this.isDisposed == true) { return; }
        try {

            const resume = async (self) => {
                if (!onlyChild) {
                    self.bind.init();
                }
                if (deep) {
                    self.controls.forEach(x => {
                        if (typeof x.updateState === 'function') {
                            x.updateState(deep);
                        }
                    })
                }
            }
            var selfMain = this;
            resume(selfMain);
        } catch (error) {

        }
    }
    private disposeSlots() {
        if (this.isDisposed == true) { return; }
        try {
            if (this.ghostPlaceholder) {
                this.ghostPlaceholder.dispose();
            }
        } catch (error) {

        }
        try {
            if (this["slots"]) {
                this["slots"].forEach(s => {
                    s.dispose();
                })
            }
        } catch (error) {

        }

    }

    async dispose(cb?) {
        if (this.isDisposed == true) { return; };
        if (this.onupdated) this.onupdated(this as any, { data: this.model, field: '', source: 'dispose' })
        if (this.parent && this.parent.onChildRemoved) {
            this.parent.onChildRemoved(this.parent, this)
        }

        var self = this;

        if (this._.methods.clearMainSubsicribers) { this._.methods.clearMainSubsicribers(); }


        this._.methods.addLeaveTransition();
        return this._.methods.waitTransition('leave', async () => {

            if (self && self._ && self._.on && !self.isDisposed) {
                self._.on.forEach(t => t());
                self._.on.clear();
            }

            if (self['ondisposing']) { self['ondisposing'](self as any); }

            if (this['runover'] && this['runover']['ondisposing']) {
                this['runover']['ondisposing'](this);
            }

            this._emitCollection?.get("ondisposing")?.forEach(cb => {
                cb(this);
            })

            !this.isDisposed && this.disposeSlots && this.disposeSlots.call(this);

            self && self.bind && self.bind.dispose();


            if (self['nodes']) {
                await self['nodes'].forEach(async c => {
                    c.flush();
                })
            }

            if (!self.isDisposed) {


                self._.methods.remove();
                self.context.ControlCollection.delete(self);
                // if (this.parent) this.parent.controls.remove(this);

                self.controls._map.forEach(async control => {

                    if (Array.isArray(control)) {
                        await control.forEach(async t => {
                            t && t.flush();
                        })
                    } else {
                        if (typeof control === 'function') {
                            var d = (<Function>control)();
                            if (d && d instanceof Component) {
                                d.flush();
                            }
                        } else {
                            try {
                                control && typeof control === 'object' && control.isDisposed == false && typeof control.flush === 'function' && control.flush();
                            } catch (error) {

                            }

                        }
                    }
                    // if (self._.isMainComponent || self.element instanceof Comment) {
                    //     control.dispose();

                    // } else {
                    //     control.flush();
                    // }
                })

                if (self.model) {
                    self.context && self.context.clearModel(self.model);
                    self.model = null;
                }
                self._.modelInstances.forEach(m => {
                    var t = (m as ReactiveEngine);
                    t && t.dispose();
                    m = null;
                });
                self._ && self._.modelInstances.clear();
                if (self.parent && !self.parent.isDisposed) {
                    self.parent && self.parent.controls && self.parent.controls.remove(self as any);
                }

                self.controls && self.controls.clear();


                system.GC(self);
                self.isDisposed = true;
                if (cb) cb();
            }

            if (this.ondisposed) this.ondisposed(this as any);
            this._emitCollection?.get("ondisposed")?.forEach(cb => {
                cb(this);
            })
        });


        //this._emitCollection.clear();
    }
    async flush() {

        if (this.isDisposed == true) { return; };
        if (this.onupdated) this.onupdated(this as any, { data: this.model, field: '', source: 'dispose' })
        if (this.parent && this.parent.onChildRemoved) {
            this.parent.onChildRemoved(this.parent, this)
        }

        var self = this;

        if (this._.methods.clearMainSubsicribers) { this._.methods.clearMainSubsicribers(); }

        if (self._.on) {
            self._.on.forEach(t => t());
            self._.on.clear();
        }

        if (self['ondisposing']) { self['ondisposing'](self as any); }
        this._emitCollection?.get("ondisposing")?.forEach(cb => {
            cb(this);
        })

        !this.isDisposed && this.disposeSlots && this.disposeSlots.call(this);

        self.bind.dispose();


        if (self['nodes']) {
            await self['nodes'].forEach(async c => {
                c.flush();
            })
        }

        if (!self.isDisposed) {


            self._.methods.remove();
            self.context.ControlCollection.delete(self);
            // if (this.parent) this.parent.controls.remove(this);

            self.controls._map.forEach(async control => {
                if (Array.isArray(control)) {
                    await control.forEach(async t => {
                        t.flush();
                    })
                } else {
                    if (typeof control === 'function') {
                        var d = (<Function>control)();
                        if (d && d instanceof Component) {
                            d.flush();
                        }
                    } else {
                        control && typeof control === 'object' && control.isDisposed == false && typeof control.flush === 'function' && control.flush();
                        //control && !control.isDisposed && control.flush();
                    }
                }
            })

            if (self.model) {
                self.context.clearModel(self.model);
                self.model = null;
            }
            self._.modelInstances.forEach(m => {
                var t = (m as ReactiveEngine);
                t.dispose();
                m = null;
            });
            self._.modelInstances.clear();
            self.controls.clear();
            system.GC(self);
            self.isDisposed = true;
        }

        if (this.ondisposed) this.ondisposed(this as any);
        this._emitCollection?.get("ondisposed")?.forEach(cb => {
            cb(this);
        })
    }
    async clear(): Promise<any> {
        if (this.isDisposed == true) { return; }
        if (this.onupdated) this.onupdated(this as any, { data: this.model, field: '', source: 'clear' })
        return new Promise((resolveOuter: any) => {
            this.controls.forEach(async (control, index) => {
                await control.dispose();
                this.controls.clear();
                if (index === this.controls.length - 1) {

                    dom.window.setTimeout(resolveOuter, 0);
                }
            })
        });


    }
    async show() {
        if (this.isDisposed == true) { return; }
        if (this.sendedShow) { return }
        //if (this.isVisible) { return };
        this.isVisible = true;
        if (this.element.nodeType != 1) {
            this.controls.forEach(x => { x.show() })
        } else {
            this._.methods.addEnterTransition();

            if (!this.parent || this.parent.element == null) {
                if (this._.placeholder.isConnected && this._.placeholder.parentNode) {
                    dom.body.replaceChild(this.element, this._.placeholder);
                } else {
                    dom.body.appendChild(this.element);
                }
            } else if (this._.placeholder.parentNode) {
                this._.placeholder.parentNode.replaceChild(this.element, this._.placeholder);
            }
            this._.methods.waitTransition('enter', () => { });
        }

        if (this.onupdated) this.onupdated(this as any, { data: this.model, field: '', source: 'show' })
        if (this.onshow && this.sendedShow == false && this.isRendered) { this.isVisible = true; this.sendedShow = true; this.onshow(this as any); }
    }

    async hide() {
        if (this.isDisposed == true) { return; }
        this.sendedShow = false;
        if (this.isRendered && !this.isVisible) { return };
        this.isVisible = false;
        // if (this._.isMainComponent) {
        //     this.controls.forEach(c => { c.hide() })
        // } else {

        //if (this.isRendered && this.isVisible) {
        if (this.element.nodeType != 1) {
            this.controls.forEach(x => { x.hide() })
        } else {
            this._.methods.addLeaveTransition();
            await this._.methods.waitTransition('leave', () => {
                if (!this.parent || !this.parent.element) {
                    // if (this.isRendered) {
                    //     dom.body.replaceChild(this._.placeholder, this.element)
                    // } else { 
                    //     var ph = this._.placeholder;
                    //     this._.placeholder = this.element as any;
                    //     this.element = ph as any;
                    // }
                    dom.body.replaceChild(this._.placeholder, this.element)
                    // if (this.element.isConnected) {

                    // } else {
                    //     dom.body.append(this.element);
                    //     dom.body.replaceChild(this._.placeholder, this.element)
                    // }
                } else if (this.element.parentNode != undefined) {
                    //this.element.parentNode.insertBefore(this._.placeholder, this.element);
                    //this.element.parentNode.removeChild(this.element);
                    this.element.parentNode.replaceChild(this._.placeholder, this.element);
                }
            });
            // } else if (!this.isRendered) {
            //     this.isVisible = false;
            //     this.element.parentNode?.replaceChild(this._.placeholder, this.element);
            // }

            // }
        }

        if (this.onupdated) this.onupdated(this as any, { data: this.model, field: '', source: 'hidding' })
        if (this.onhide && this.isRendered) this.onhide(this as any);
    }

    signal(eventName: string | symbol, cb: (...args: any[]) => any, ...initialValues: any[]) {
        if (this.isDisposed == true) { return; }
        this._.on.add(this.context.on(eventName, cb));
        if (initialValues.length > 0) cb(...initialValues)
    }

    on(event: baseemits, callback: (...args) => void, domEvent: boolean = false) {
        if (this.isDisposed == true) { return; }
        if (event) {
            if (domEvent) {
                this.addHandler(event as any, callback);
            } else {
                if (this._emitCollection.has(event)) {
                    this._emitCollection?.get(event)?.add(callback);
                } else {
                    this._emitCollection.set(event, new Set());
                    this._emitCollection?.get(event)?.add(callback);
                }
            }
        }
    }
    off(event: baseemits, callback: (...args) => void | null, domEvent: false) {
        if (this.isDisposed == true) { return; }
        if (event) {
            if (domEvent) {
                this.removeHandler(event as any);
            } else {
                if (!callback) {
                    this._emitCollection.delete(event);
                } else {
                    if (this._emitCollection.has(event)) {
                        this._emitCollection?.get(event)?.delete(callback);
                    }
                }
            }
        }
    }
    invoke(event: baseemits, ...args) {
        if (this.isDisposed == true) { return; }
        if (this._emitCollection.has(event)) {
            this._emitCollection?.get(event)?.forEach(e => {
                e(...args);
            });
        }
    }

    addHandler(event: string, callback: (e: Event | UIEvent | any, sender: IControl<ElementType, any, any>) => any): IControl<ElementType, any, any> {
        return this._.initializing.addHandler(event, callback)
    }
    removeHandler(event: string): IControl<ElementType, any, any> {
        if (this.isDisposed == true) { return this }
        var xname = event.trim();
        xname.split(" ").forEach(eventName => {
            var spliter = ".";
            if (eventName.indexOf("-") > -1) {
                spliter = "-";
            } else if (eventName.indexOf(":") > -1) {
                spliter = ":";
            }
            var splt = eventName.split(spliter);
            var i = this._.eventHandlers.find(x => x.key == splt[0]);
            if (i != null) {
                this._.eventHandlers.remove(i);
            }
        });
        return this as any;
    }
    async getView(importer: Promise<any>, model) {
        if (this.isDisposed == true) { return; }
        return await importer.then(x => {
            var r = x.default;
            if (r.prototype && r.prototype.constructor) {
                return new x.default(model);
            } else if (typeof r === 'function') {
                return x.default(model)
            } else {
                return r;
            }
        });
    }


    style(properties: styleKeys | string): IControl<ElementType, any, any> {
        if (this.isDisposed) { return this }
        this.options.autostyle.set(properties)
        return this as any;
    };

    view?(): Component<ElementType, StateType>;
    using<T>(waitable: Promise<any>, onfulfilled?: ((value: T) => T | PromiseLike<T>) | undefined | null, onrejected?: ((reason: any) => never | PromiseLike<never>) | undefined | null) {
        waitable.then(
            (value: T) => { this && !this.isDisposed && onfulfilled ? onfulfilled(value) : ''; },
            (reason: any) => { this && !this.isDisposed && onrejected ? onrejected(reason) : '' });
    }
    doWork<T>(waitable: Promise<T> | PromiseLike<T>): Promise<T> {
        return waitable.then(
            (value: T) => {
                if (this && !this.isDisposed) {
                    return value
                } else {
                    return new Error('Component is disposed');
                };
            }) as Promise<T>;
    }


    useModel<T extends object>(model: T): T
    useModel(model: object) {
        if (this.isDisposed == true) { return; }
        var r = new ReactiveEngine();
        var m = r.reactive(model);
        this._.modelInstances.add(r);
        return m;
    }
    onupdating(sender: caller, e: baseeventargs) {
        if (this.isDisposed) { return }
        this._emitCollection?.get("onupdating")?.forEach(cb => {
            cb(sender, e);
        })
    };
    onupdated(sender: caller, e: baseeventargs) {
        if (this.isDisposed == true) { return; }
        this._emitCollection?.get("onupdated")?.forEach(cb => {
            cb(sender, e);
        })
    };
    onChildAdded?(sender: this, child: Component<any, any>, index: number);
    onChildRemoved?(sender: this, child: Component<any, any>);
    //private _siblings = <any>[];
    siblingsDom = {
        all: () => {
            var a = this.siblings.prevAll();
            var b = this.siblings.nextAll();
            return [...a, ...b];
        },
        next: () => this.element.nextSibling,
        prev: () => this.element.previousSibling,
        nextAll: () => {
            const _siblings = <any>[];
            function all(el: any) {
                if (el != undefined && el != null) {
                    if (el.nextElementSibling != null && el.nextElementSibling != undefined) {
                        _siblings.push(el.nextElementSibling);
                    }
                    all(el.nextElementSibling)
                }
            }
            all(this.element);
            return _siblings;
        },
        prevAll: () => {
            const _siblings = <any>[];
            function all(el: any) {
                if (el != undefined && el != null) {
                    if (el.previousElementSibling != null && el.previousElementSibling != undefined) {
                        _siblings.push(el.previousElementSibling);
                    }
                    all(el.previousElementSibling)
                }
            }
            all(this.element);
            return _siblings;
        }
    };
    siblings = {
        all: () => { return this.parent?.controls },
        next: () => { return this.parent?.controls[this.parent.controls.indexOf(this) + 1]; },
        prev: () => this.parent?.controls[this.parent.controls.indexOf(this) - 1],
        nextAll: () => {
            return this.parent?.controls.slice(this.parent.controls.indexOf(this) + 1);
        },
        prevAll: () => {
            return this.parent?.controls.slice(0, this.parent.controls.indexOf(this) - 1);
        }
    };

    //TODO: Scoped based sellector enabling. Currently state not working.
    $(selector) {
        var self = this;
        var result = {
            fromDom: () => {
                var findContainer = this._.methods.findParentUsableElemet(this);
                var findingTarget;
                if (!findContainer) {
                    findingTarget = document;
                } else {
                    findingTarget = findContainer;
                }
                if (findingTarget) {
                    var elements = findingTarget.querySelectorAll(selector);
                    return elements;
                }
                return null;
            },
            fromComponent: () => {
                var findContainer = this._.methods.findParentUsableElemet(this);
                var findingTarget;
                if (!findContainer) {
                    findingTarget = document;
                } else {
                    findingTarget = findContainer;
                }
                var result: IControl<ElementTypes, any, any>[] = [];
                if (findingTarget) {
                    var elements = findingTarget.querySelectorAll(selector);
                    elements.forEach(x => {
                        if (ElementModelMap.has(x)) {
                            var found = ElementModelMap.get(x);
                            if (found != undefined) {
                                result.push(found)
                            }
                        }
                    });
                }
                return result;
            }
        }
        return result;
    }
    getFirstElement(): IControl<any, any, any> {

        //!(this.element.nodeType == NodeTypes.TEXT_NODE) && !(this.element.nodeType == NodeTypes.TEXT_NODE)
        if (advanceif(this, NodeTypes.ELEMENT_NODE)) {
            return this;
        } else {
            return this.parent.getFirstElement();
        }
    }
    setup?(sender: caller);
    initializeComponent?(sender: caller): void;
    activated?(sender: caller);
    activating?(sender: caller);
    routeChanged?(sender: caller): void;
    onRouteChanged?(sender: caller): void;
    interrupt?(sender: caller, next: () => any): void;
    onconfig?(sender: caller);
    onRefCreated?(sender: MoviComponent<any, any, any>);
    preconfig?(sender: caller);
    oncreating?(sender: caller);
    oncreated?(sender: caller);
    onbuilding?(sender: caller);
    onbuilded?(sender: caller);
    ondisposing?(sender: caller);
    ondisposed?(sender: caller);
    onshow?(sender: caller): void;
    onhide?(sender: caller): void;
    reload?: (() => caller) | undefined;
    onmounted?(sender);

    public async navigate(page: IControl<any, any, any>) {
        if (this.isDisposed) { return }
        else if (page == null) { return }
        else if (page.isDisposed) { return }
        else if (this.__isbusy == true) { return }
        else {
            page.parent = this;
            this.__isbusy = true;
            await this._.methods.addLeaveTransition();
            if (this.isDisposed) { return }
            await this._.methods.waitTransition('leave', async () => {

                var expandFunction = (f) => {
                    if (typeof f === 'function') {
                        return expandFunction(f())
                    } else {
                        return f;
                    }
                }
                const complete = async () => {
                    if (this.isDisposed) { return }
                    var xP = expandFunction(page);
                    this.add(xP);
                    this._.methods.addEnterTransition();
                    await this._.methods.waitTransition('enter', async () => {
                        dom.window.clearTimeout(this.__bto);
                        this.__bto = dom.window.setTimeout(() => {
                            this.__isbusy = false;
                        }, 100);
                    });
                }
                if (!this.isDisposed && this.controls.length > 0) {
                    await this.controls._map.forEach(async xr => {
                        if (!xr.isDisposed) {
                            await xr.dispose();
                        }
                    });
                    if (!this.isDisposed && this.controls.filter(x => !x.isDisposed).length == 0) {
                        await complete();
                    }
                } else {
                    await complete();
                }
                //complete();
            });
        }



    }
    public useDynamicView<TSource>(state: () => TSource, render: (value: TSource) => Component<any, any>) {
        this.bind.logic(state, render)
        return this;
    }

}




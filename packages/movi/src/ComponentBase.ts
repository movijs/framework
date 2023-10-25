

import { IClass, IControl } from "./abstractions";
import { IApplicationService } from "./abstractions/IApplicationService";
import { ApplicationService } from "./ApplicationService";
import { Collection, controlAttribute, CreateLocalElement, ElementTypes, KeyValueItem, styleKeys, toKebab } from "./core";
import { controlClass } from "./core/controlClass";
import { controlStyle } from "./core/controlStyle";
import { system } from "./environment";
import { getTransitionInfo } from "./core/transition";
import { Directive } from "./directive";
import { Component, ReactiveEngine, RouterView, baseemits, baseeventargs } from ".";



export const ElementModelMap = new WeakMap<any, IControl<ElementTypes, any, any>>();
var counter = 0;
const PlaceholderElement: Text = document.createTextNode('');
const DefaultFragmentElement: DocumentFragment = document.createDocumentFragment();

const systems = new Set<string>();
systems.add('settings');
systems.add('model');
systems.add('setup');
systems.add('activated');
systems.add('activating');
systems.add('routeChanged');
systems.add('onRouteChanged');
systems.add('interrupt');
systems.add('intervention');
systems.add('onconfig');
systems.add('preconfig');
systems.add('oncreating');
systems.add('oncreated');
systems.add('onbuilding');
systems.add('onbuilded');
systems.add('ondisposing');
systems.add('ondisposed');
systems.add('view');
systems.add('reload');
systems.add('using');
systems.add('context');
systems.add('slots');
export class StateTypeBase<T = Object>{
    context = ApplicationService.current;
    slots: [] = [];
}
export abstract class MoviComponent<ElementType extends ElementTypes, StateType, caller extends MoviComponent<ElementType, StateType, caller>> implements IControl<ElementType, StateType, caller>{
    public props: StateType = {} as StateType;
    private _initprops = false;
    public keepAlive: boolean = true;
    public extend?: any;
    slots?: IControl<any, any, any>[];
    name?: string;
    elementCreating?(current: any): any;

    private _ = {
        placeholder: PlaceholderElement.cloneNode(true) as Comment,
        isMainComponent: false,
        isContainer: false,
        waitInit: false,
        waitState: false,
        isInited: false,
        viewInit: false,
        on: new Set<any>(),
        isHidden: false,
        replacedHidden: false,
        instanced: false,
        initializing: {
            wait: () => {
                if (!this._.waitInit) {
                    if (this._.waitState === false && this.bind.Configuration.WaitSettings && this.bind.waitDirective) {
                        this.parent["_"].methods.AppendElement(this);
                        this.hide();
                        this._.waitState = true;
                        this._.waitInit = true;
                        this.bind.waitDirective.init(this.bind.Configuration.WaitSettings, this as any);
                        return true;
                    }
                }
                return false;
            }
        },
        event: {
            onbuilding: () => {

                if (this.onbuilding) { this.onbuilding(this as any) }
                // if (this._.isInited === false && this['onbuilding']) { this['onbuilding'](this as any); }

                this._emitCollection?.get("onbuilding")?.forEach(cb => {
                    cb(this);
                })
                if (!this._.isInited) {
                    if (this['intervention'] && this['intervention']['onbuilding']) {
                        this['intervention']['onbuilding'](this)
                    }
                }

            },
            oncreating: () => {
                if (this.oncreating) this.oncreating(this as any);
                this._emitCollection?.get("oncreating")?.forEach(cb => {
                    cb(this);
                })

                if (this['intervention'] && this['intervention']['oncreating']) {
                    try {
                        this['intervention']['oncreating'](this, this)
                    } catch (error) {
                        debugger;
                    }

                }

            },
            preconfig: () => {

                if (this.preconfig) this.preconfig(this as any);
                this._emitCollection?.get("preconfig")?.forEach(cb => {
                    cb(this);
                })
                if (this['intervention'] && this['intervention']['preconfig']) {
                    this['intervention']['preconfig'](this);
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
                var self = this;
                var slots = this._.methods.findSlotNodes(this as any);

                var namedSlot = false;
                // console.error(slots,this );
                if (slots && slots.length > 0) {


                    if (this.slots) {
                        slots.forEach((x, isd) => {
                            if (x.props && x.props.Name) {
                                var s = this.slots?.find(t => (t.attr.get('slot') === x.attr.get('name')));
                                if (s) {
                                    s.attr.remove('slot');
                                    s.parent = self;
                                    x.controls.add(s);
                                    namedSlot = true;
                                }
                            }
                        })

                        slots.forEach((x, isd) => {

                            if (!x.props || !x.props.Name) {
                                var s = this.slots?.filter(t => !t.attr.has('slot'));
                                if (s && s.length > 0) {
                                    s.forEach(y => {
                                        y.parent = self;
                                        x.controls.add(y);
                                    })
                                    namedSlot = true;
                                }
                            }
                        })
                    }

                    // console.error('slots', this._.methods.findSlotNodes(this),this['slots']);
                }

                // this.controls.forEach(f => {
                //     f._.methods.addSlots();
                // })
            },
            findSlotNodes: (comp: IControl<any, any, any>): IControl<any, any, any>[] => {
                var founds: IControl<any, any, any>[] = [];
                comp.controls.filter((x) => x.props && x.props['isSlot']).forEach(y => {
                    founds.push(y);
                    var si = comp['_'].methods.findSlotNodes(y);
                    if (si && si.length > 0) {
                        founds.push(...si)
                    }
                })
                return founds;
            },
            runSetup: () => {
                if (this.initializeComponent) { this.initializeComponent = this.initializeComponent.bind(this); };

                this._emitCollection?.get("initializeComponent")?.forEach(cb => {
                    cb(this);
                })

                if (this.setup) {
                    this.setup(this as any);
                }


                this._emitCollection?.get("setup")?.forEach(cb => {
                    cb(this);
                })

                this._emitCollection?.get("onsetup")?.forEach(cb => {
                    cb(this);
                })

                if (this['intervention'] && this['intervention']['setup']) {
                    if (this._.isMainComponent) {
                        if (this.controls.length > 0) {
                            this.controls.forEach(c => {
                                if (!c['intervention']) {
                                    c['intervention'] = {
                                        setup: this['intervention']['setup']
                                    }
                                } else {
                                    c['intervention']['setup'] = this['intervention']['setup'];
                                }
                            })
                        }
                    } else {
                        this['intervention']['setup'](this);
                    }
                }
                this.context.extensions && this.context.extensions.forEach((x, y, z) => {
                    Reflect.ownKeys(x).forEach(t => {
                        if (x[t].componentInit) {
                            x[t].componentInit(this);
                        }
                    })
                });

            },
            waiterFr: DefaultFragmentElement.cloneNode(),// document.createDocumentFragment(),
            waiterin: null as any,
            AppendElement: async (child) => {

                const array = Array.prototype.slice.call(this.element.childNodes);
                if (this._.isMainComponent) {
                    //Mevcut komponent bir fragment içeriyor. Bir üst kontrole yönlendir. ve ana düğümü bulana kadar devam et.
                    //console.error("Ana düğüm bir fragment. üst birimde arama yapılacak")
                    if (this.parent) {
                        (this.parent as any)._.methods.AppendElement(child);
                    } else {

                        console.error("Ana düğüm girişi bulunamadı. İşlem burada sonlandırılır.", child);
                    }
                } else {
                    // Bu kontroller bir html düğümüdür.  
                    if (child._.isMainComponent) {
                        //Öğe önceden eklenmiş mi?
                        if (array.indexOf(child.element) > -1) {
                            //console.error("Öğe önceden işaretlenmiş")
                        } else {
                            //console.error("Gelen düğüm işaretlenecek")
                            if (child.parent && array.indexOf(child.parent.element) > -1) {
                                if (child.parent) {
                                    var ito = child['insertTo'];
                                    var ref = child.parent.controls.filter(ff => ff.isRendered)[ito];
                                    if (ref) {
                                        var target = ref.element;
                                        if (ref._.isMainComponent) {
                                            target = target.previousElementSibling;
                                        }

                                        this.element.insertBefore(child.element, target);
                                    } else {

                                        this.element.insertBefore(child.element, child.parent.element);
                                    }

                                } else {

                                    this.element.insertBefore(child.element, child.parent.element);
                                }

                            } else {
                                this.element.appendChild(child.element);
                            }
                        }
                    } else {
                        //Gelen element bir html öğesi

                        if (array.indexOf(child.element) > -1) {
                            // console.error("Öğe önceden eklenmiş")
                        } else {
                            //console.error("Gelen düğüm eklenecek",owner?array.indexOf(owner.element):'')
                            if (child.parent && array.indexOf(child.parent.element) > -1) {

                                var ito = child['insertTo'];
                                var ref = child.parent.controls.filter(ff => ff.isRendered)[ito];
                                if (ref && ref.isVisible) {
                                    this.element.insertBefore(child.element, ref.element);
                                } else {
                                    this.element.insertBefore(child.element, child.parent.element);
                                }

                            } else {
                                this.element.appendChild(child.element);
                            }

                        }
                    }

                    child._.methods.addEnterTransition();
                    child._.methods.waitTransition('enter', () => { });
                }

            },
            AppendElementBackup: async (child) => {

                var index = 0;
                if (child['isStart']) {
                    child['isStart'] = false;
                    this._.methods.waiterFr.appendChild(child.element)
                    window.clearTimeout(this._.methods.waiterin);
                    var self = this;
                    this._.methods.waiterin = window.setTimeout(() => {
                        self.element?.parentElement?.insertBefore(this._.methods.waiterFr, self.element);
                    })
                } else {

                    if (child['insertTo'] !== null && child['insertTo'] !== undefined) {
                        index = child['insertTo'];
                    }
                    else if (child['toFirst'] !== null && child['toFirst'] !== undefined) {
                        index = 0;
                    }

                    if (this._.isMainComponent) {

                        if (!this.element.isConnected) {
                            this.parent["_"].methods.AppendElement(this)
                        }

                        if (this.element && this.element.parentElement && this.element.parentElement.childNodes) {
                            const array = Array.prototype.slice.call(this.element?.parentElement?.childNodes);
                            var ooLength = this.controls.filter(t => t.isRendered).length;

                            if (child['insertTo'] < 0) {
                                child['insertTo'] = 0;
                            }
                            var insertid = Number.parseInt(child['insertTo']);
                            var els = this.controls.filter(t => t.isRendered)[insertid];


                            var currentLength = (array.indexOf(this.element) - ooLength) + (child['insertTo']);
                            var ref = els != undefined ? els.element : null;

                            if (els && els.element.nodeType === 8) {
                                currentLength = array.indexOf(ref) - els.controls.length;
                            }
                            ref = array[currentLength];

                            // if (els) {
                            //     ref = els.element;
                            // }
                            // if (els && els.isRendered) {
                            //     console.error(array.indexOf(els.element), insertid, els, this.controls) 
                            //     ref = array[array.indexOf(els.element)];
                            // }  

                            if (!ref) {
                                ref = this.element;
                            }

                            this.element.parentElement?.insertBefore(child.element, ref);



                        }

                    } else {
                        var refElementb = this.element.childNodes.item(index)
                        if (refElementb === null) {
                            try {
                                this.element.appendChild(child.element);
                            } catch (error) {
                                console.error("MOVI:" + error, this, child)
                            }

                        } else {
                            if (this.isFragment) {
                                this.parent.controls.add(child.element);
                            } else {
                                try {
                                    if (this.element !== child.element) {
                                        this.element.appendChild(child.element);
                                    } else {
                                        this.element.insertBefore(child.element, refElementb);
                                    }

                                } catch (error) {
                                    console.warn('MOVI:', error);
                                }
                            }
                        }
                    }
                }
                child._.methods.addEnterTransition();
                child._.methods.waitTransition('enter', () => { });

            },
            clearMainSubsicribers: null as any,
            addEnterTransition: async () => {
                var self = this;
                if (self.settings?.transition?.name && self.settings.transition.name !== '') {
                    var name = self.settings.transition.name;
                    self.class.remove([`${name}-leave`, `${name}-leave-end`])
                    self.class.add([`${name}-enter`, `${name}-enter-start`])
                }
                var p: any = self.props;
                if (p?.settings?.transition?.name && p.settings.transition.name !== '') {
                    var namex = p.settings.transition.name;
                    self.class.remove([`${namex}-leave`, `${namex}-leave-end`])
                    self.class.add([`${namex}-enter`, `${namex}-enter-start`])
                }
            },
            addLeaveTransition: async () => {
                var self = this;
                if (self.settings?.transition?.name && self.settings.transition.name !== '') {
                    var name = self.settings.transition.name;
                    self.class.remove([`${name}-enter`, `${name}-enter-start`])
                    self.class.add([`${name}-leave`, `${name}-leave-end`])
                }
            },
            addMoveTransition: async () => {
                if (this.settings?.transition?.name && this.settings.transition.name !== '') {
                    var name = this.settings.transition.name;
                    this.class.remove([`${name}-enter`, `${name}-enter-start`, `${name}-leave`, `${name}-leave-end`])

                    // await this.waitTransition();
                }
            },
            waitTransition: async (type: string, cb) => {
                var self = this._.methods;
                var _this = this;

                if (this.props) {
                    var s = Object.keys(this.props).includes("settings");
                    if (s) {
                        _this.settings = (this.props as any).settings;
                    }
                }

                var call = false;
                if (_this.settings?.transition?.name && _this.settings.transition.name !== '' && type !== '') {
                    var name = _this.settings.transition.name;
                    var transitionInfo = getTransitionInfo(_this.element as Element, `${name}-${type} ${name}-${type}-start`);
                    this.class.add([`${name}-running`])
                    if (transitionInfo.timeout != null) {
                        if (type == 'leave') {
                            //transitionInfo.timeout -= 50;
                        }
                        window.setTimeout(async () => {
                            await cb();
                            if (type !== 'leave') {
                                if (_this.settings?.transition?.name && _this.settings.transition.name !== '') {
                                    var name = _this.settings.transition.name;
                                    _this.class.remove([`${name}-running`, `${name}-enter`, `${name}-enter-start`, `${name}-leave`, `${name}-leave-end`]);
                                }
                            }
                        }, transitionInfo.timeout)

                    } else {
                        cb()
                    }
                } else {
                    cb()
                }

            },

            _oldDelayer: null as any,
            delay: async (milliseconds, cb?: any) => {
                var self = this._.methods;

                window.clearTimeout(self._oldDelayer);
                return new Promise((resolve: any) => {
                    self._oldDelayer = window.setTimeout(() => {
                        resolve();
                        if (cb) { cb() }
                    }, milliseconds);
                });
            },
            remove: () => {
                if (this.element) {
                    if (this.element instanceof Text) {
                        this.element.remove();
                    }
                    else if (this.element instanceof Element) {
                        this.element.remove();
                    } else if (this.element instanceof DocumentFragment) {
                        this.element.firstChild?.remove();
                    } else if (this.element instanceof HTMLTemplateElement) {
                        this.element.content.firstChild?.remove();
                    } else {
                        this.element.remove();
                    }
                }
            },
            itemadd: (index, item) => {
                var self = this;

                if (Array.isArray(item)) {
                    item.forEach((t, index2) => {
                        t['insertTo'] = index + index2;
                        t.parent = self;
                        t.build();
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
                        } else if (typeof nitem === 'boolean' || typeof nitem === 'bigint' || typeof nitem === 'string') {
                            var adding = new Component('text');
                            adding.bind.text(() => item);
                            adding.parent = self;
                            adding['insertTo'] = index;
                            adding.build();
                            ;
                        } else {
                            console.warn('build err', typeof nitem, nitem, item);
                        }

                    }
                }

            },
            findParentUsableElemet: (source: IControl<any, any, any>) => {
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
    constructor(tag, props, args) {
        if (this.elementCreating) { tag = CreateLocalElement(this.elementCreating(tag)) }



        Object.keys(this).forEach(k => {
            if (typeof this[k] === 'function') {
                this[k] = this[k].bind(this);
            }
        })
        Object.keys(this._.methods).forEach(k => {
            if (typeof this._.methods[k] === 'function') {
                this._.methods[k] = this._.methods[k].bind(this);
            }
        })
        var assigned = {};
        var self = this;
        if (!props) {
            props = {};
        }
        this.props = props;
        if (args) {
            //Object.assign(this, args);
            // if (args.preconfig) { this.on("preconfig", args.preconfig.bind(this)); }
            // if (args.oncreating) { this.on("oncreating", args.oncreating.bind(this)); }
            // if (args.oncreated) {this.oncreated = args.oncreated }//this.oncreated = args.oncreated;
            // if (args.onbuilding) {this.onbuilding = args.onbuilding;  }//this.onbuilding = args.onbuilding; 
            // if (args.onbuilded) { this.onbuilded = args.onbuilded; }//this.onbuilded = args.onbuilded;
            // if (args.ondisposing) { this.ondisposing = args.ondisposing;}//this.ondisposing = args.ondisposing;
            // if (args.ondisposed) {this.ondisposed = args.ondisposed; }//this.ondisposed = args.ondisposed;
            // if (args.onconfig) { this.onconfig = args.onconfig; }//this.onconfig = args.onconfig;
            // if (args.setup) { this.setup = args.setup; }// this.setup = args.setup;


            if (args.preconfig) { this.on("preconfig", args.preconfig.bind(this)); }
            if (args.oncreating) { this.on("oncreating", args.oncreating.bind(this)); }
            if (args.oncreated) { this.on("oncreated", args.oncreated.bind(this)); }//this.oncreated = args.oncreated;
            if (args.onbuilding) { this.on("onbuilding", args.onbuilding.bind(this)); }//this.onbuilding = args.onbuilding; 
            if (args.onbuilded) { this.on("onbuilded", args.onbuilded.bind(this)); }//this.onbuilded = args.onbuilded;
            if (args.ondisposing) { this.on("ondisposing", args.ondisposing.bind(this)); }//this.ondisposing = args.ondisposing;
            if (args.ondisposed) { this.on("ondisposed", args.ondisposed.bind(this)); }//this.ondisposed = args.ondisposed;
            if (args.onconfig) { this.on("onconfig", args.onconfig.bind(this)); }//this.onconfig = args.onconfig;
            if (args.onsetup) { this.on("onsetup", args.onsetup.bind(this)); }//this.onconfig = args.onconfig;
            if (args.setup) { this.setup = args.setup; /*this.on("setup", args.setup.bind(this));*/ }// this.setup = args.setup;
            if (args.initializeComponent) { this.on("initializeComponent", args.initializeComponent.bind(this)); }// this.setup = args.setup; 
            Object.keys(args).forEach(k => {
                if (k != 'props' && k !== 'preconfig' && k !== 'oncreating' && k !== 'oncreated' && k !== 'onbuilding' && k !== 'onbuilded' && k !== 'ondisposing' && k !== 'ondisposed' && k !== 'onconfig' && k != 'setup') {
                    assigned[k] = args[k];
                }
            })
        }
        Object.assign(this, assigned);



        Object.keys(this).forEach(k => {
            if (typeof this[k] === 'function' && k.startsWith('on') && k.length > 2) {
                this.on(k, this[k].bind(this));
            }
        })



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
            this.element = PlaceholderElement.cloneNode(true) as ElementType;// document.createComment('REF#' + counter++) as any as ElementType; //document.createComment('ApplicationPlaceholder' + counter++) as ElementType;
            //this.element.textContent = 'REF#' + counter++;
            // this.element = document.createTextNode(' ') as any as ElementType;

        } else {
            this.element = tag;
        }




        this._.event.oncreating();
        this._.event.preconfig();
        if (this['intervention'] && this['intervention']['preconfig']) {
            //this['intervention']['onconfig'] = this['intervention']['onconfig'].bind(this);
            this['intervention']['preconfig'](this);
        }


        if (this.onconfig) { this.onconfig(this as any); }
        if (this['intervention'] && this['intervention']['onconfig']) {
            //this['intervention']['onconfig'] = this['intervention']['onconfig'].bind(this);
            this['intervention']['onconfig'](this);
        }

        this._emitCollection?.get("onconfig")?.forEach(cb => {
            cb(this);
        })



        this._.methods.clearMainSubsicribers = this.context.internal.subscribe('routeChanged', this);
        /*
        () => {
            if (this.onRouteChanged && !this.isDisposed) { this.onRouteChanged.call(this, this) }
        }
        */

        this.controls.ItemAdded = (item: any) => {
            if (this.isRendered) this._.methods.itemadd(this.controls.length - 1, item);
            this.onChildAdded && this.onChildAdded(this, item, this.controls.length - 1);
        }
        this.controls.ItemAddedBefore = (item: any) => {
            if (this.isRendered) this._.methods.itemadd(this.controls.length - 1, item);
            this.onChildAdded && this.onChildAdded(this, item, this.controls.length - 1);
        }

        this.controls.ItemSplice = (index, item: any) => {
            if (this.isRendered) this._.methods.itemadd(index, item);
            this.onChildAdded && this.onChildAdded(this, item, index);
        }

        this.controls.onItemRemoved = (item, index) => {
            this.onChildRemoved && this.onChildRemoved(this, item as any);
        }
        if (this.oncreated) this.oncreated(this as any);
        this._emitCollection?.get("oncreated")?.forEach(cb => {
            cb(this);
        })
        this._.instanced = true;



        //this.element["model"] = this;

        if (!ElementModelMap.has(this.element)) {
            ElementModelMap.set(this.element, this as any);
        }


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
        args.forEach(x => {
            this.controls.add(x);
            x.parent = this as any;
        })
    }

    setText(value) {
        if (!this._.isMainComponent) {
            this.element.textContent = value;
        }
    }
    private _tempContent?: IControl<any, any, any>;
    setTempContent(control: IControl<any, any, any>) {
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
    bind: Directive = new Directive(this as any);
    isFragment: boolean = false;
    context: IApplicationService = ApplicationService.current;
    controls: Collection<IControl<any, any, any>> = new Collection();
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
    element: ElementType = null as any;
    async build(target?: any) {
        if (this.isDisposed) { return }
        if (this.name) {
            console.error('name', this.name, this);
        }
        if (this.onupdating) this.onupdating(this as any, { data: this.model, field: '', source: 'building' })
        if (this["ref"]) { this["ref"](this); }

        if (this['intervention'] && this['intervention']['ref']) {
            //this['intervention']['onconfig'] = this['intervention']['onconfig'].bind(this);
            this['intervention']['ref'](this);
        }

        var _this = this;
        if (this.props) {
            Object.keys(this.props).forEach(txf => {
                delete this[txf];
            })
        }
        try {
            if (this.props && this.props['container']) {

                var tb;
                if (typeof this.props['container'] === 'function') {
                    tb = this.props['container']();
                } else {
                    tb = this.props['container'];
                }
                if (typeof tb === 'string') {
                    target = document.getElementsByTagName(tb)[0]
                } else if (tb instanceof Element) {
                    target = tb;
                }
            }

            if (this.isRendered) {

                // if (this.props && this.props['BuildTo']) {
                //     console.error("render to target")
                // }

                //filter(t => t.isRendered === false || t.isRendered === undefined || t.isRendered === null)

                this.controls.forEach((item, index) => {
                    _this._.methods.itemadd(index, item);
                })

                if (_this.parent) {
                    _this.parent['_'].methods.AppendElement(this);
                }
                return;
            };


            const resume = async (self) => {

                //self._.isInited == false && 
                if (self['intervention'] && self['intervention']['preconfig']) {
                    self['intervention']['preconfig'](self)
                }
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
                    // console.error('orjinale ekle', this.element)
                } else {
                    if (self.parent) {
                        // const array = Array.prototype.slice.call(this.parent.element?.parentElement?.childNodes);
                        // var ooLength = this.parent.controls.filter(t => t.isRendered).length;
                        // var currentLength =   (array.indexOf(this.parent.element) - ooLength) + this['insertTo'];

                        // console.error('parent ekle',this.element,this.parent.element,array[currentLength],ooLength ,array.indexOf(this.parent.element))
                        self.parent['_'].methods.AppendElement(this);
                    } else {
                        // console.error('parent yokki')
                    }
                }


                var resume = true;



                if (self.view && !self._.viewInit) {
                    self.isApplicationSecope = true;
                    self.view = self.view.bind(self);
                    var item = self.view ? await self.view.call(self, self) : null as any;
                    if (typeof item === 'string') {
                        var tmp = document.createElement('template');
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
                        //if (self.onconfig) self.onconfig(self);
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

                if (self.onbuilded) { self.onbuilded(this); }

                this._emitCollection?.get("onbuilded")?.forEach(cb => {
                    cb(this);
                })

                if (self['intervention'] && self['intervention']['onbuilded']) {
                    self['intervention']['onbuilded'](self)
                }
                this._.methods.addSlots();

            }
            var selfMain = this;
            if (!this._.isInited) {
                if (this['interrupt']) {
                    this['interrupt'](this as any, async function () {
                        if (self['intervention'] && self['intervention']['interrupt']) {
                            self['intervention']['interrupt'](self, async function () {
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
            console.error(error)
        }

        if (this['const']) {
            this.parent[this['const']] = this;
        }
    }
    updateState(deep: boolean = false, onlyChild: boolean = false) {

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
    private ghostPlaceholder;
    async dispose(cb?) {
        if (this.isDisposed == true) { return; };
        if (this.onupdated) this.onupdated(this as any, { data: this.model, field: '', source: 'dispose' })
        if (this.parent && this.parent.onChildRemoved) {
            this.parent.onChildRemoved(this.parent, this)
        }

        var self = this;

        if (this._.methods.clearMainSubsicribers) { this._.methods.clearMainSubsicribers(); }


        this._.methods.addLeaveTransition();
        this._.methods.waitTransition('leave', async () => {

            if (self && self._ && self._.on && !self.isDisposed) {
                self._.on.forEach(t => t());
                self._.on.clear();
            }

            if (self['ondisposing']) { self['ondisposing'](self as any); }

            if (this['intervention'] && this['intervention']['ondisposing']) {
                this['intervention']['ondisposing'](this);
            }

            this._emitCollection?.get("ondisposing")?.forEach(cb => {
                cb(this);
            })

            this.disposeSlots.call(this);

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
                            control && !control.isDisposed && control.flush();
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
        });
        if (this.ondisposed) this.ondisposed(this as any);
        this._emitCollection?.get("ondisposed")?.forEach(cb => {
            cb(this);
        })
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

        this.disposeSlots.call(this);

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
                        control && !control.isDisposed && control.flush();
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

        if (this.onupdated) this.onupdated(this as any, { data: this.model, field: '', source: 'clear' })
        return new Promise((resolveOuter: any) => {
            this.controls.forEach(async (control, index) => {
                await control.dispose();
                this.controls.clear();
                if (index === this.controls.length - 1) {

                    window.setTimeout(resolveOuter, 0);
                }
            })
        });


    }
    async show() {
        if (this.sendedShow) { return }

        if (this._.isMainComponent) {
            this.controls.forEach(c => {
                c.show();
            })
        } else {
            this._.methods.addEnterTransition();
            if (this.isRendered && this._.isHidden == true) {
                this._.isHidden = false;
                this.isVisible = true;
                if (this._.replacedHidden && !this.parent) {
                    document.body.appendChild(this.element);
                } else {
                    if (!this.parent || this.parent.element == null) {
                        document.body.replaceChild(this.element, this._.placeholder);
                    } else if (this._.placeholder.parentNode) {
                        this._.placeholder.parentNode.replaceChild(this.element, this._.placeholder);
                    }
                }
                //this._.methods.addEnterTransition(); 
            } else {
                this._.isHidden = false;
                this.isVisible = true;
            }
            this._.methods.waitTransition('enter', () => { });
        }
        if (this.onupdated) this.onupdated(this as any, { data: this.model, field: '', source: 'show' })
        if (this.onshow && this.sendedShow == false && this.isRendered) { this.sendedShow = true; this.onshow(this as any); }
    }
    private sendedShow = false;
    async hide() {
        this.sendedShow = false;

        if (this._.isMainComponent) {
            this.controls.forEach(c => { c.hide() })
        } else {
            if (this.isRendered && this._.isHidden == false) {
                this._.isHidden = true;
                this.isVisible = false;
                this._.methods.addLeaveTransition();
                await this._.methods.waitTransition('leave', () => {
                    if (!this.parent || !this.parent.element) {
                        document.body.replaceChild(this._.placeholder, this.element);
                    } else if (this.element.parentNode != undefined) {
                        this.element.parentNode.replaceChild(this._.placeholder, this.element);
                    }
                });

            } else {
                this._.replacedHidden = true;
                this._.isHidden = true;
                this.isVisible = false;
                this.element.parentNode?.replaceChild(this._.placeholder, this.element);
            }

        }
        if (this.onupdated) this.onupdated(this as any, { data: this.model, field: '', source: 'hidding' })
        if (this.onhide && this.isRendered) this.onhide(this as any);
    }

    signal(eventName: string | symbol, cb: (...args: any[]) => any, ...initialValues: any[]) {
        this._.on.add(this.context.on(eventName, cb));
        if (initialValues.length > 0) cb(...initialValues)
    }
    private _emitCollection: Map<any, Set<any>> = new Map<any, Set<any>>();
    on(event: baseemits, callback: (...args) => void, domEvent: boolean = false) {
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
        if (this._emitCollection.has(event)) {
            this._emitCollection?.get(event)?.forEach(e => {
                e(...args);
            });
        }
    }

    addHandler(event: string, callback: (e: Event | UIEvent | any, sender: IControl<ElementType, any, any>) => any): IControl<ElementType, any, any> {
        if (this.element === null || this.element === undefined) {
            return this as any
        }
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

        return this as any;
    }
    removeHandler(event: string): IControl<ElementType, any, any> {
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
    attr: controlAttribute<ElementType> = new controlAttribute(this as any);
    class: IClass<ElementType> = new controlClass(this as any) as any as IClass<ElementType>;
    isRendered: boolean = false;
    isDisposed: boolean = false;
    isConnected: boolean = false;
    isVisible: Boolean = true;
    style(properties: styleKeys): IControl<ElementType, any, any> {
        if (this.element instanceof HTMLElement) {
            Object.entries(properties).forEach(t => {
                (this.element as any).style[toKebab(t[0])] = t[1];
            });
        }
        return this as any;
    };
    autostyle: controlStyle<ElementType> = new controlStyle(this as any);
    view?(): Component<ElementType, StateType>;
    using<T>(waitable: Promise<any>, onfulfilled?: ((value: T) => T | PromiseLike<T>) | undefined | null, onrejected?: ((reason: any) => never | PromiseLike<never>) | undefined | null) {
        waitable.then(
            (value: T) => { this && !this.isDisposed && onfulfilled ? onfulfilled(value) : ''; },
            (reason: any) => { this && !this.isDisposed && onrejected ? onrejected(reason) : '' });
    }
    doWork<T>(waitable: Promise<T> | PromiseLike<T>): Promise<T> {
        return waitable.then(
            (value: T) => {
                if (this && !this.isDisposed) { return value } else throw "Component is disposed";
            }) as Promise<T>;
    }
    settings?: { isRouterView?: boolean | undefined; keepAlive?: boolean | undefined; transition?: { name?: string | undefined; } | undefined; } | undefined;
    options: {
        authorize: boolean,
        headers: Object,
    } = {
            authorize: false,
            headers: []
        }
    public model: any;
    useModel<T extends object>(model: T): T
    useModel(model: object) {
        var r = new ReactiveEngine();
        var m = r.reactive(model);
        this._.modelInstances.add(r);
        return m;
    }
    onupdating(sender: caller, e: baseeventargs) {
        this._emitCollection?.get("onupdating")?.forEach(cb => {
            cb(sender, e);
        })
    };
    onupdated(sender: caller, e: baseeventargs) {
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
        if (!(this.element instanceof Text) && !(this.element instanceof Comment)) {
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
}




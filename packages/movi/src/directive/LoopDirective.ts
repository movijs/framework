import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable";
import { getRaw, pauseTracking, resetTracking } from "../Reactive/common";
import { IFxMapper } from "../Reactive/ReactiveEngine";
import { ApplicationService, Component, Lazy, ReactiveEngine, deepClone } from "..";


export class LoopDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: DirectiveBindingType = "function";
    public oldValue: any;
    render?(data: any, index?): IControl<any, any, any>;
    public fragment: IControl<any, any, any> = null as any;
}

export class LoopDirective implements IDirective<LoopDirectiveSettings>{
    id: any = null as any;
    isArray: boolean = true;
    oldCollection: any[] = [];
    collection: any[] = [];
    settings!: LoopDirectiveSettings;
    arg: any;
    Bindabler?: Bindable | undefined;
    FxMapper: IFxMapper = null as any;
    private _settings: LoopDirectiveSettings = null as any;
    private _source: IControl<any, any, any> = null as any
    constructor() {
        this.updateAsync = this.updateAsync.bind(this);
        this.push = this.push.bind(this);
        this.init = this.init.bind(this);
        this.getData = this.getData.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.removeDom = this.removeDom.bind(this);
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.build = this.build.bind(this);
        this.splice = this.splice.bind(this);
        new Bindable(this);
    }

    private inits = false;
    pageCount = ApplicationService.current.ModelSettings.PageSize;
    getData() {

        if (this._settings == null) { return }
        if (!this._source || this._source.isDisposed) { return }
        var items = CheckType(this._settings);
        if (typeof items === "function") {
            items = items();
        }
        // if (this._settings.oldValue === items && this._settings.oldValue.length === items.length) {
        //     return;
        // }

        if (ApplicationService.current?.Options?.onReactiveEffectRun) {
            ApplicationService.current.Options.onReactiveEffectRun('binding.loop.changed', this)
        }

        if (this.inits) {
            if (this._source.onupdating) this._source.onupdating(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'loop' });
            return this.update(items);

        }
        if (this._source.onupdating) this._source.onupdating(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'loop' });

        const paged = (current) => {
            if (this._source && !this._source.isDisposed) {
                items.slice(current, current + this.pageCount).forEach((t: any, i: any) => {
                    var elm = this.build(t, i + current);
                    if (elm) {
                        elm['isStart'] = true;
                        this._source.controls.add(elm);
                        this._source.parent && this._source.parent.onChildAdded && this._source.parent.onChildAdded(this._source.parent, elm, i + current);
                    }
                });
                if (current < items.length) {
                    window.requestIdleCallback(() => {
                        Promise.resolve().then(t => {
                            paged(current + this.pageCount)
                        })
                    }, { timeout: 0 })
                }
            }
        }

        if (items.length > this.pageCount) {
            paged(0);
        } else {
            items.forEach((t: any, i: any) => {
                var elm = this.build(t, i);
                if (elm) {
                    elm['isStart'] = true;
                    this._source.controls.add(elm)
                    this._source.parent && this._source.parent.onChildAdded && this._source.parent.onChildAdded(this._source.parent, elm, i);
                }
            })
        }

        this._settings.oldValue = items;
        this.inits = true;

        if (this._source.onupdated) this._source.onupdated(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'loop' });
    }
    start(key?) {


    }

    private wm = new Map();
    private lastTimer;
    update(key?) {

        var self = this;
        self.updateAsync.call(self, key);

    }
    async updateAsync(items) {

        var settings = this._settings;
        var Source = this._source;

        if (Source.isDisposed) {
            await this.dispose(settings, Source);
            return;
        }

        if (settings == null) { return }
        if (Source.isDisposed || Source.element === null) { return }

        if (Array.isArray(items) && items.length == 0) {
            //this.wm.clear();
            this._source.controls.forEach(t => {
                this._source.parent && this._source.parent.onChildRemoved && this._source.parent.onChildRemoved(this._source.parent, t);
                t.dispose()
            })
            //await this._source.clear();
        } else if (items === null || items === undefined) {
            // this.wm.clear();
            // await this._source.clear();
            this._source.controls.forEach(t => {
                this._source.parent && this._source.parent.onChildRemoved && this._source.parent.onChildRemoved(this._source.parent, t);
                t.dispose()
            })
        }

        pauseTracking()
        if (Array.isArray(items)) {
            var arr = [];

            var newItems = items.map(x => getRaw(x));
            var odlItems = this._source.controls.map(t => { return { key: getRaw(t.__key__), item: t } })

            var dif = odlItems.filter(x => {
                return !newItems.includes(x.key)
            })
            // console.error('YENI', newItems, 'eski', odlItems, 'fark', dif)

            dif.forEach(async element => {
                this._source.parent && this._source.parent.onChildRemoved && this._source.parent.onChildRemoved(this._source.parent, element.item);
                await element.item.dispose();
            })

        }
        resetTracking()
        if (Source.isDisposed) {
            this.wm.clear();
            await this.dispose(settings, Source);
            return;
        }

        var isStart = false;
        if (this._settings && this._settings.oldValue.length == 0) {
            isStart = true;
        } else if (!this._settings) {
            //console.error(this);
        }

        const paged = (current) => {
            if (this._source && !this._source.isDisposed) {
                items.slice(current, current + this.pageCount).forEach(async (item, index) => {
                    //console.error('forEach')
                    if (typeof item !== "undefined") {
                        if (Source.isDisposed) {
                            await this.dispose(settings, Source);
                            return;
                        }
                        // var elm = this._settings && this._settings.render ? this._settings.render(data, index) : null;
                        var exit = this._source.controls.find(x => { return getRaw(x.__key__) === getRaw(item) });
                        if (!exit) {
                            var elm = this.build(item, index + current);
                            if (elm) {
                                elm['isStart'] = isStart;
                                elm.options.settings["__loop__item__"]
                                Source.controls.insert(index + current, elm);
                                Source.parent && Source.parent.onChildAdded && Source.parent.onChildAdded(Source.parent, elm, index + current);
                            }
                        } else {
                            var key;
                            if (exit['__list_key__'] != undefined && exit['__list_key__'] != null) {
                                key = this.findkey(item, exit['__list_key__']);
                            } else {
                                key = index;
                            }

                            if (key != exit['index'] && Source.controls.indexOf(exit) != index) {
                                await exit.dispose();
                                var elm = this.build(item, index + current);
                                if (elm) {
                                    elm['isStart'] = isStart;
                                    elm.options.settings["__loop__item__"] = true;
                                    Source.controls.insert(index + current, elm);
                                    Source.parent && Source.parent.onChildAdded && Source.parent.onChildAdded(Source.parent, elm, index + current);
                                }
                                exit = elm;
                            } else {
                                // console.error(exit['index']);
                                // var elm = this._settings && this._settings.render ? this._settings.render(item, index) : null;
                                // exit = elm;
                            }
                        }
                    }
                })
                if (current < items.length) {
                    window.requestIdleCallback(() => {
                        Promise.resolve().then(t => {
                            paged(current + this.pageCount)
                        })
                    }, { timeout: 50 })
                }
            }
        }

        if (items && items.length > this.pageCount) {
            paged(0);
        } else if (items) {
            items.forEach(async (item, index) => {
                //console.error('forEach')
                if (typeof item !== "undefined") {
                    if (Source.isDisposed) {
                        await this.dispose(settings, Source);
                        return;
                    }
                    // var elm = this._settings && this._settings.render ? this._settings.render(data, index) : null;
                    var exit = this._source.controls.find(x => { return getRaw(x.__key__) === getRaw(item) }); 
                    if (!exit) {
                        var elm = this.build(item, index);
                        if (elm) {
                            elm['isStart'] = isStart;
                            elm.options.settings["__loop__item__"] = true;
                            Source.controls.insert(index, elm);
                            Source.parent && Source.parent.onChildAdded && Source.parent.onChildAdded(Source.parent, elm, index);
                        }
                    } else {
                        var indexChanged = false;
                        var _settings = exit?.options?.settings;
                        if (_settings) {
                            var ni = typeof _settings['ni'] == 'function' ? _settings['ni']() : _settings['ni'];
                            var oi = _settings['oi'];
                            if ((ni != undefined && oi != undefined) && ni != oi && Source.controls.indexOf(exit) != index) {
                                indexChanged = true;
                            } else if (ni == undefined || oi == undefined) {
                                if (Source.controls.indexOf(exit) != index) {
                                    indexChanged = true;
                                }
                            }
                        } else { indexChanged = true; }
                        if (indexChanged) {
                            await exit.dispose();
                            var elm = this.build(item, index);
                            if (elm) {
                                elm['isStart'] = isStart;
                                elm.options.settings["__loop__item__"] = true;
                                Source.controls.insert(index, elm);
                                Source.parent && Source.parent.onChildAdded && Source.parent.onChildAdded(Source.parent, elm, index);
                            }
                            exit = elm;
                        }
                        // var key;
                        // if (exit['__list_key__'] != undefined && exit['__list_key__'] != null) {
                        //     key = this.findkey(item, exit['__list_key__']);
                        // } else {
                        //     key = index;
                        // } 
                        // if (key != exit['index']  && Source.controls.indexOf(exit) != index) { 
                        //     await exit.dispose();
                        //     var elm = this.build(item, index);
                        //     if (elm) {
                        //         elm['isStart'] = isStart;
                        //         elm.options.settings["__loop__item__"] = true;
                        //         Source.controls.insert(index, elm);
                        //         Source.parent && Source.parent.onChildAdded && Source.parent.onChildAdded(Source.parent, elm, index);
                        //     }
                        //     exit = elm;
                        // } 
                    }
                    // if (!this.wm.has(getRaw(item))) {
                    //     var elm = this.build(item, index);
                    //     if (elm) {
                    //         elm['index'] = index;
                    //         elm['isStart'] = isStart;
                    //         Source.controls.insert(index, elm)
                    //     }

                    // } else {
                    //     var exist = this.wm.get(getRaw(item));
                    //     if (key === 'modify') {

                    //         exist.element.remove();
                    //         Source.controls.remove(exist);
                    //         Source.controls.insert(index, exist)
                    //     } else {
                    //         exist.index = index;

                    //     }
                    // }
                }
            })
        }



        pauseTracking();
        if (this._settings) { this._settings.oldValue = items; }

        resetTracking();
        if (this._source.onupdated) this._source.onupdated(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'loop' });
        return

    }
    findkey(data, key: string) {
        var keys = key.split(".");
        if (keys.length > 1) {
            var xk = keys.shift();
            if (xk) {
                return this.findkey(data[xk], keys.join("."))
            }
        } else {
            return data[key]
        }
    }
    awaiableSetup: boolean = false;
    setupCompleted = false;
    setup(target, key) {
        if (!this.setupCompleted && this._settings) {
            if (this._source.isDisposed) {
                // if (this.fx) {
                //     ///this.fx.stop(this._settings.Property, this._settings.FieldName);
                // }
                this.dispose(this._settings, this._source);
                return;
            }

            pauseTracking()
            this._settings.Property = target;
            this._settings.FieldName = key;
            resetTracking();
            this.setupCompleted = true;
        }
    }


    init(settings: LoopDirectiveSettings, Source: IControl<any, any, any>): void {
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.FxMapper.run();
        //this.fx = register(this);
        //this.fx.run();

    }
    async push(val) {

        var settings = this._settings;
        var Source = this._source;
        if (this._settings) {
            if (Source.isDisposed) {

                await this.dispose(settings, Source);
                return;
            }

            if (settings == null) { return }
            if (Source.isDisposed || Source.element === null) { return }

            var items = settings.callback();
            items.forEach((item, index) => {
                if (!this.wm.has(getRaw(item))) {
                    var elm = this.build(item, index);
                    if (elm) {

                        elm['isStart'] = false;
                        Source.controls.insert(index, elm)
                    }
                }
            })
        } else {
            await this.dispose(settings, Source);
        }


    }
    oldvalues = new Map<IControl<any, any, any>, any>();
    build(data: any, index: any) {

        var elm = this._settings && this._settings.render ? this._settings.render(data, index) : null;
        if (elm instanceof Promise) {
            elm = Lazy(() => elm as any)
        }
        // console.error('elm', elm)

        // var el = <any>[];
        // if (elm.element.nodeType == 8) { 
        //     elm.controls.forEach(t => { 
        //         el.push(t);
        //     })
        // }
        if (elm) {
            pauseTracking();
            this.wm.set(getRaw(data), elm);
            this.oldvalues.set(elm, getRaw(data));
            (elm as any)['__key__'] = data;
            if (elm['__list_key__']) { (elm as any)['index'] = this.findkey(data, elm['__list_key__']); } else { (elm as any)['index'] = index; }
            resetTracking();
            elm.parent = this._source;
        }

        return elm;


    }
    disposed: boolean = false;
    dispose(settings: LoopDirectiveSettings, Source: IControl<any, any, any>) {
        this.Bindabler && this.Bindabler.fxm.dispose();
        this.Bindabler = undefined;
        this._source = null as any;
        this._settings = null as any;
        this.disposed = true;
    }

    async splice(val) {
        if (val) {
            val.forEach(t => {
                if (this.wm.has(getRaw(t))) {
                    var c = this.wm.get(getRaw(t));
                    if (c && !c.isDisposed) {
                        this._source.parent && this._source.parent.onChildRemoved && this._source.parent.onChildRemoved(this._source.parent, c);
                        c.dispose();
                        this.wm.delete(t);
                    }
                }
            })
        }

    }
    removeDom() {
        if (this._source && !this._source.isDisposed) {
            this._source.dispose();
        }
    }
}
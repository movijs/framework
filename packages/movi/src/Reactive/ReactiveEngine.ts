
import { ApplicationService, LinkedList, MicrotaskDelay, StopWatch } from "..";
import { IDirective } from "../abstractions/IDirective";
import { system } from "../environment";
import { TargetType, UnwrapNestedRefs, UnwrapValueRefs, enableTracking, followTracking, getRaw, getTargetType, isObject, pauseTracking, resetTracking } from "./common";
import { ArrayMethods } from "./handlers/arrayMethods";
import { createGetter } from "./handlers/getter";
import { createDelelte, createHas } from "./handlers/orhers";
import { createSetter } from "./handlers/setter";

export type ReactiveListeners = Map<any, Map<any, Set<FxMapper>>>;
export let currentFx: FxMapper | null = null;
function clearAllDepFX(effect: FxMapper) {
    const { depends } = effect
    depends.forEach(depend => {
        depends.delete(depend);
    })
}

export interface IFxMapper {
    callback;
    directive;
    run();
    dispose();
}

export class FxMapper implements IFxMapper {
    constructor(public engine: ReactiveEngine) {
        this.run = this.run.bind(this);
        this.dispose = this.dispose.bind(this);
    }
    callback;
    depends: Set<FxMapper> = new Set<FxMapper>();;
    parentFx: FxMapper | null = null;
    directive: IDirective<any> | null = null;
    run() {
        var result;
        this.parentFx = currentFx;
        currentFx = this;
        result = this.callback();
        currentFx = this.parentFx;
        return result;
    }
    parent;
    dispose() {
        this.parent?.delete(this);
        this.depends.clear();
        
        clearAllDepFX(this); 
    }
}

export const ReactiveEngineMapper = new WeakSet<ReactiveEngine>();
const AllreactiveMap: WeakMap<any, any> = new WeakMap();
window['arm'] = AllreactiveMap;
export class ReactiveEngine {
    constructor() {
        this.reactive = this.reactive.bind(this);
        this.effect = this.effect.bind(this);
        this.clearModel = this.clearModel.bind(this);
        this.track = this.track.bind(this);
        this.trackEffects = this.trackEffects.bind(this);
        this.trigger = this.trigger.bind(this);
        this.triggerEffects = this.triggerEffects.bind(this);
        this.ArrayTrigger = this.ArrayTrigger.bind(this);
        this.triggerEffect = this.triggerEffect.bind(this);
        ReactiveEngineMapper.add(this);
    }
    DisposeMapper = new LinkedList();
    dispose() { 
        var cnt = true;
        while (cnt == true) {
            if (this.DisposeMapper.size > 0) {
                const element = this.DisposeMapper.pop();
                ApplicationService.current?.Options?.onReactiveEffectRun && Promise.resolve().then(() => {
                    if (ApplicationService.current?.Options?.onReactiveEffectRun) {
                        ApplicationService.current.Options.onReactiveEffectRun('reactive.map.dispose', this, element, AllreactiveMap.has(element), AllreactiveMap.get(element));
                    }
                })
                AllreactiveMap.delete(element);
            } else {
                cnt = false
            }
        }

        this.DisposeMapper.clear();

        ReactiveEngineMapper.delete(this);
        this.TargetMap.forEach(x => {
            if (x && x.forEach) {
                x.forEach(c => {
                    if (c && c.forEach) {
                        c.forEach(tx => {
                            clearAllDepFX(tx);
                            if (tx.parent && !tx.parent.isDisposed) {
                                tx.dispose();
                            }
                        })
                        c.clear();
                    }
                });
                x.clear();
            }
        });
        this.TargetMap.clear();
        this.TargetMap = new Map<any, Map<any, Set<FxMapper>>>();
        this.cacheFx.forEach((x, y) => {
            clearAllDepFX(y);
            if (x && x.forEach) {
                x.forEach(t => {
                    t = null;
                })
                x.clear();
            }
        });
        this.cacheFx.clear();

        if (this._original) AllreactiveMap.delete(this._original);
        delete this._original;
        //this.ReactiveMap = new WeakMap();
        if (ApplicationService.current?.Options?.onReactiveEffectRun) {
            ApplicationService.current.Options.onReactiveEffectRun('reactive.dispose', this, ReactiveEngineMapper);
        }
        //system.GC(this);
    }
    //ReactiveMap: WeakMap<any, any> = new WeakMap();
    ReactiveMap: () => WeakMap<any, any> = () => AllreactiveMap; //new WeakMap();
    TargetMap: ReactiveListeners = new Map<any, Map<any, Set<FxMapper>>>();
    activeCallback: any;
    isReadonly: boolean = false;
    superficial: boolean = false;
    arrayMethods: ArrayMethods = new ArrayMethods(this);
    deepHandler = {
        get: createGetter(this),
        set: createSetter(this),
        has: createHas(this),
        deleteProperty: createDelelte(this)
    } as ProxyHandler<any>
    arrayHandler = {
        get: createGetter(this),
        set: createSetter(this),
        has: createHas(this),
        deleteProperty: createDelelte(this)
    }
    _original;
    reactive<T extends object>(model: T): UnwrapNestedRefs<T> {

        var self = this;
        if (!isObject(model)) {
            return model
        }
        const targetType = getTargetType(model)
        if (targetType === TargetType.SYSTEM || targetType === TargetType.COLLECTION || TargetType.INVALID) {
            return model as any
        }


        // let other = AllreactiveMap.get(model);
        // if (other) { 
        //     return other;
        // }

        // other = AllreactiveMap.get(getRaw(model));
        // if (other) {
        //     return other;
        // }

        let existingProxy = AllreactiveMap.get(model)
        if (existingProxy) {
            return existingProxy as any
        }



        existingProxy = AllreactiveMap.get(getRaw(model))
        if (existingProxy) {
            return existingProxy as any
        }


        // if (targetType === TargetType.INVALID) {
        //     return model as any
        // }
        this._original = model;
        if (Array.isArray(model)) {
            var proxy = new Proxy(model, this.arrayHandler);
            // var original = Object.getPrototypeOf(proxy);
            // original["copy"] = () => { return model; }
            // Object.setPrototypeOf(proxy, original); 
            // proxy.prototype.copy = () => { 
            //     return "copied";
            // }
            //AllreactiveMap.set(model, proxy);
            this.DisposeMapper.push(model);
            AllreactiveMap.set(model, proxy);
            return proxy;
        } else {
            var proxy = new Proxy(model, this.deepHandler);
            // AllreactiveMap.set(model, proxy);
            this.DisposeMapper.push(model);
            AllreactiveMap.set(model, proxy);
            return proxy;
        }

    }

    hook<T>(val: any): UnwrapValueRefs<T> {
        if (typeof val === 'object') {
            return this.reactive(val)
        } else {
            var ref = { value: val } as any;
            return this.reactive(ref)
        }
    }
    effect(cb: () => any) {
        var fm = new FxMapper(this);
        fm.callback = cb;
        fm.run();
    }

    dynamicRender(cb: () => any) {
        var fm = new FxMapper(this);
        fm.callback = cb;
        return fm.run();
    }

    registerEffect(dir: IDirective<any>): IFxMapper {
        var fm = new FxMapper(this);
        fm.directive = dir;
        fm.callback = dir.getData;
        fm.directive.FxMapper = fm;
        return fm;
    }


    async clearModel(model) {
        if (model != null && model != undefined) {
            Object.keys(model).forEach((key) => {
                if (typeof model[key] === 'object') {
                    if (this.TargetMap.has(getRaw(model[key])) || this.TargetMap.has(model[key]) || AllreactiveMap.has(model[key]) || AllreactiveMap.has(getRaw(model[key]))) {
                        this.clearModel(model[key])
                    }
                }
                AllreactiveMap.delete(getRaw(model[key]));
                AllreactiveMap.delete(model[key]);
                this.TargetMap.delete(model[key])
                this.TargetMap.delete(getRaw(model[key]))
            })
            AllreactiveMap.delete(getRaw(model));
            AllreactiveMap.delete(model);
            this.TargetMap.delete(model);
            this.TargetMap.delete(getRaw(model));
        }

    }
    track(model, key) {
        if (currentFx && followTracking && AllreactiveMap.get(getRaw(model))) {
            var raw = model;
            let depsMap = this.TargetMap.get(raw)
            if (!depsMap) {
                try {
                    this.TargetMap.set(raw, (depsMap = new Map()))
                } catch (error) {
                    this.TargetMap.set(raw, (depsMap = new Map()))
                }
            }
            let dep = depsMap.get(key)
            if (!dep) {
                depsMap.set(key, (dep = new Set<FxMapper>()))
            }
            this.trackEffects(dep, model, key);

        }

        // this.TargetMap.forEach(async yy => {
        //     yy.forEach(tt => {
        //         if (tt.size == 0) {
        //             yy.delete(tt);
        //         }
        //     })
        // }) 
    }
    trackEffects(dep: Set<FxMapper>, model, key) {
        let shouldTrack = !dep.has(currentFx!);
        if (currentFx && shouldTrack && AllreactiveMap.get(getRaw(model))) {
            if (!dep.has(currentFx)) {
                currentFx.directive && currentFx.directive.setup && currentFx.directive.setup(this.reactive(model), key)
                dep.add(currentFx);
                currentFx.parent = dep;
                // dep.forEach(x => {
                //     if (currentFx) currentFx.parent = dep;
                //     currentFx?.depends.add(x)
                // })
                if (ApplicationService.current?.Options?.onReactiveEffectRun) {
                    ApplicationService.current.Options.onReactiveEffectRun('track', dep, model, key)
                }
            }

        }
    }

    trigger(model, key: any, value) {
        const effects: FxMapper[] = [];
        var raw = getRaw(model);
        var items = this.TargetMap.get(raw)?.get(key);
        var exist = this.TargetMap.get(raw);
        // this.TargetMap.forEach(x => {
        //     x.forEach(tx => {
        //         tx.forEach(mx => {
        //             if (mx.directive.isDisposed) {
        //                 tx.delete(mx); 
        //                 console.error(mx);
        //             }
        //        })
        //     })
        // })
        if (exist) {
            items = exist.get(key);
        }
        if (items) {
            items.forEach(f => {
                if (f && f.directive && f.directive.disposed) {
                    items?.delete(f);
                } else {
                    effects.push(f);
                }
            })
        }
        if (effects.length > 0) {
            this.triggerEffects(effects, key)
        }

    }
    cacheFx = new Map<FxMapper, Set<any>>();
    cacheTimer;
    async triggerEffects(dep: FxMapper[], key: any) {
        const effects = Array.isArray(dep) ? dep : [...dep]
        for (const effect of effects) {
            if (!this.cacheFx.has(effect)) {
                this.cacheFx.set(effect, key);
                // for (const depEffect of effect.depends) {
                //     // for (const adddepth of depEffect.depends) {
                //     if (!this.cacheFx.has(depEffect)) {
                //         this.cacheFx.set(depEffect, key);
                //     }
                //     // }
                // }
                // for (const depEffect of effect.depends) {

                //     for (const adddepth of depEffect.depends) {
                //         if (!this.cacheFx.has(adddepth)) {
                //             this.cacheFx.set(adddepth, key);
                //         }
                //     }
                // }
            }
        }
        this.cacheTimer && window.clearTimeout(this.cacheTimer)
        this.cacheTimer = window.setTimeout(async () => {

            Promise.resolve().then(() => {
                if (ApplicationService.current?.Options?.onReactiveEffectRun) {
                    ApplicationService.current.Options.onReactiveEffectRun('trigger', this.cacheFx, key)
                }
                this.cacheFx.forEach(async (v, k) => {
                    if (k.directive && !k.directive.disposed) {
                        //promises.push(this.triggerEffect(k, v))
                        this.triggerEffect(k, v);
                    }
                })
                this.cacheFx = new Map<FxMapper, Set<any>>();
            });
        })
    }

    async triggerEffect(
        effect: FxMapper, key: any) {
        if (effect !== currentFx && (effect.directive && !effect.directive.disposed)) {
            effect.run();
        }
    }

    // trigger(target, key) { 
    //     var items = this.TargetMap.get(target)?.get(key);
    //     var rf = Array.from(this.TargetMap);
    //     if (items) {
    //         items.forEach(x => {
    //             x();
    //         })
    //     }
    // }

    ArrayTrigger(target, key, ...args) {
        this.trigger(target, key, args);
        // var model = getRaw(target);
        // var items = this.TargetMap.get(model);
        // items && items.forEach(t => {

        // });
        // var re = args;
        // return re;
        // var element = args;
        // var rf = Array.from(this.TargetMap);
        // rf.forEach(x => {

        // })

        // if (items) {
        //     items.forEach(x => {
        //         x();
        //     })
        // }

    }

    onValueChanged?: (model, key) => any;

    // trackStack: boolean[] = []
    // followTracking = true;
    // pauseTracking() {
    //     this.trackStack.push(this.followTracking)
    //     //setFollowTracing(false);
    //     this.followTracking = false;
    // }

    // enableTracking() {
    //     this.trackStack.push(this.followTracking)
    //     //setFollowTracing(true);
    //     this.followTracking = true;
    // }

    // resetTracking() {
    //     const last = this.trackStack.pop()
    //     //setFollowTracing(last === undefined ? true : last);
    //     this.followTracking = last === undefined ? true : last
    // }


    toRaw(item) {
        return JSON.parse(JSON.stringify(this.deepClone(item)));
    }

    deepClone(item) {
        var self = this;
        if (!item) { return item; }
        var types = [Number, String, Boolean],
            result;
        types.forEach(function (type) {
            if (item instanceof type) {
                result = type(item);
            }
        });

        if (typeof result == "undefined") {
            if (Object.prototype.toString.call(item) === "[object Array]") {
                result = [];
                item.forEach(function (child, index, array) {
                    result[index] = self.deepClone(child);
                });
            } else if (typeof item == "object") {
                if (item.nodeType && typeof item.cloneNode == "function") {
                    result = item.cloneNode(true);
                } else if (!item.prototype) {
                    if (item instanceof Date) {
                        result = new Date(item);
                    } else {
                        result = {};
                        for (var i in item) {
                            result[i] = self.deepClone(item[i]);
                        }
                    }
                } else {
                    if (false && item.constructor) {
                        result = new item.constructor();
                    } else {
                        result = item;
                    }
                }
            } else {
                result = item;
            }
        }
        return result;
    }


    pauseTracking() {
        pauseTracking();
    }

    enableTracking() {
        enableTracking();
    }

    resetTracking() {
        resetTracking();
    }

}
import { IDirective } from "../abstractions/IDirective";
import { ReactiveEngine, ReactiveListeners } from "./ReactiveEngine";
import { IHook, UnwrapNestedRefs, UnwrapValueRefs } from "./common";

export const engine = new ReactiveEngine();

export function reactiveConfig(config: {
    onValueChanged?: (model, key) => any
    onItemAdded?: (model, key, value) => any
    onItemRemoved?: (model, key, value) => any
}) {
    engine.onValueChanged = config.onValueChanged;
}

//export type UnwrapNestedRefs<T> = T extends IHook ? T : UnwrapRefSimple<T>

export function reactiveListeners(model?): ReactiveListeners {
    if (!model) {
        var m = new Map<any, Map<any, Set<any>>>();
        var item = engine.TargetMap.get(model);
        if (item) {
            m.set(model, item)
        }
        return m;
    }
    return engine.TargetMap;
}

export function reactive<T extends Object>(model: T): UnwrapNestedRefs<T>{
    return engine.reactive(model);
}

export function hook<T>(data: T): UnwrapValueRefs<T> {
    return engine.hook<T>(data);
} 

export function effect(cb: () => any) {
    return engine.effect(cb);
}

export function registerEffect(dir:IDirective<any>) {
    return engine.registerEffect(dir);
}

export function ClearModel(model) {
    return engine.clearModel(model);
}

export function dynamicRender(cb: () => any) {
    return engine.dynamicRender(cb);
}

export { ReactiveEngine };
 
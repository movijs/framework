import { ReactiveEngine } from "../ReactiveEngine";
import { ITERATE_KEY, builtInSymbols, hasOwn, isSymbol, pauseTracking, resetTracking } from "../common";

export function createOwn(engine: ReactiveEngine) {
    return function ownKeys(target) {
        engine.track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
        var res = Reflect.ownKeys(target)
        return res;
    }
}

export function createHas(engine: ReactiveEngine) {
    return function has(target, p) {
        const result = Reflect.has(target, p)
        if (!isSymbol(p) || !builtInSymbols.has(p)) {
            engine.track(target, p)
        }
        return result
    }
}

export function createDelelte(engine: ReactiveEngine) {
    return function deleteProperty(target, p) {
        pauseTracking()
        const isOwned = hasOwn(target, p);
        const oldValue = (target as any)[p];
        const result = Reflect.deleteProperty(target, p);
        if (isOwned && Array.isArray(target)) {
            engine.trigger(target, 'length',null);
        } else {
            engine.trigger(target, p,null);
        }
        engine.TargetMap.get(target)?.delete(p)
        engine.TargetMap.delete(target);
        resetTracking();
        return result
    }
}
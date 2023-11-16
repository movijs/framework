import { reactive } from "../";
import { ReactiveEngine } from "../ReactiveEngine";
import { Flags, addArrayStack, builtInSymbols, closeSetup, getRaw, hasOwn, isNonTrackableKeys, isObject, isSymbol, objectToString, pauseTracking, removeArrayStack, resetTracking, setupListener } from "../common";



export function createGetter(engine: ReactiveEngine) {
    return function (target, p, receiver) {
        if (p === Flags.IS_REACTIVE) { return !engine.isReadonly }
        else if (p === Flags.IS_READONLY) { return engine.isReadonly }
        else if (p === Flags.IS_SUPERFICIAL) { return engine.superficial }
        else if (p === Flags.RAW && receiver === engine.ReactiveMap().get(target)) { return target }
        if (p === Flags.GET_SETUP) { return target }
         
        const modelIsArray = Array.isArray(target)
        if (!engine.isReadonly && modelIsArray && hasOwn(engine.arrayMethods.get, p)) { 
            addArrayStack(p);
            var x = Reflect.get(engine.arrayMethods.get, p, receiver);  
            return x;
        }  
        if (typeof setupListener === 'function') {
            pauseTracking();
            setupListener(target,p);
            closeSetup();
            resetTracking();
        }
        
        var res = Reflect.get(target, p, receiver);

       
        if (isSymbol(p) ? builtInSymbols.has(p) : isNonTrackableKeys(p as string)) { return res }
        if (!engine.isReadonly) { engine.track(target, p) }
        if (engine.superficial) { return res }
        if (isObject(res)) { return engine.isReadonly ? engine.reactive(res) : engine.reactive(res) }
        return res;
    }
} 
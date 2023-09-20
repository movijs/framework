import { ReactiveEngine } from "../ReactiveEngine";
import { Flags, arrayScope, builtInSymbols, getRaw, hasOwn, isModified, isNonTrackableKeys, isNumericKey, isObject, isSymbol, removeArrayStack } from "../common";


export function createSetter(engine: ReactiveEngine) {
    return function (target, p, newValue, receiver) {


        let oldValue = (target as any)[p]
        const isNew = Array.isArray(target) && isNumericKey(p) ? Number(p) < (target.length) : hasOwn(target, p)

        var oldIndex = -9999;
        if (isNumericKey(p)) {
            oldIndex = (target as unknown as []).indexOf(newValue as never);
        }

        var res = Reflect.set(target, p, newValue, receiver);

        if (engine.onValueChanged) {
            engine.onValueChanged(target, p);
        }
        var raw = getRaw(receiver);
        var resulme = getRaw(target) === getRaw(receiver);
 
        if (!Array.isArray(target) && !isModified(newValue, oldValue)) {
            resulme = false; 
        } else if (Array.isArray(target) && !isNew) {
            resulme = false;
        }  

        if (resulme) {
            engine.trigger(target, p, newValue);


            // if (arrayScope.enabled) { 
            //     var origin = arrayScope.key; 
            //     removeArrayStack();  
            //     if (p === 'length') {
            //         engine.trigger(target, "length", arrayScope)
            //     } else if (isNumericKey(p)) {
            //         engine.trigger(target, p, arrayScope);
            //     } else {
            //         engine.trigger(target, arrayScope.key, arrayScope);
            //     }
            // } else if (isNumericKey(p)) {
            //     var kn = p as unknown as number;
            //     if (oldIndex != -1 && oldIndex != kn) {
            //         engine.trigger(target, p, newValue)
            //     }
            // } else if (!isNew) {
            //     engine.trigger(target, p, newValue);
            // } else if (isModified(newValue, oldValue)) {
            //     engine.trigger(target, p, newValue)
            // } else if (p === 'length') {
            //     engine.trigger(target, p, newValue)
            // } else {
            //     engine.trigger(target, p, newValue)
            // }
        }

        return res;

    }
} 
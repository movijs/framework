import { ReactiveEngine } from "../ReactiveEngine";
import { addArrayStack, getRaw, pauseTracking, removeArrayStack, resetTracking, targetTypeMap } from "../common";

export class ArrayMethods {
    constructor(public engine: ReactiveEngine) { }
    methods: Record<string, Function> = {};
    get = this.createArrayMethods();
    createArrayMethods() {
        var self = this;
        const methods: Record<string, Function> = {};

        (['includes', 'indexOf', 'lastIndexOf'] as const).forEach(key => {
            methods[key] = function (this: unknown[], ...args: any[]) {
                const arr = getRaw(this) as any as any
                //self.engine.track(arr, key);
                for (let i = 0, l = this.length; i < l; i++) {
                    self.engine.track(arr, i + '')
                }
                const res = arr[key](...args)
                if (res === -1 || res === false) {
                    // if that didn't work, run it again using raw values.
                    return arr[key](...args.map(getRaw))
                } else {
                    return res
                }
            }
        });

        (['push', 'pop', 'shift', 'unshift', 'splice','concat'] as const).forEach(key => {
            methods[key] = function (this: unknown[], ...args: any[]) { 
                pauseTracking()
                const arr = getRaw(this) as any as any
                var res = arr[key].apply(this, args);
                resetTracking()
                return res; 
            }
        });

        return methods
    }

}
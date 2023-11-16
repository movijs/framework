import { Component } from "../Component"; 

export function Lazy<T>(caller: () => Promise<T>): Component {
    var getDefault = (source) => {
        if (typeof source['default'] === "function") {
            return source.default;
        }
        return source
    } 
    var _plc = new Component({});
    caller().then(x => {
        _plc.add(getDefault(x));
    });
    return _plc;
}

 
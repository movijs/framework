import { Component } from "../Component"; 
import { Frame } from "../Frame";

export function Lazy<T>(caller: () => Promise<T>): Component {
    var getDefault = (source) => {
        if (typeof source['default'] === "function") {
            return source.default;
        }
        return source
    } 
    var _plc = new Frame({});
    caller().then(x => {
        _plc.navigate(getDefault(x));
    });
    return _plc;
}

 
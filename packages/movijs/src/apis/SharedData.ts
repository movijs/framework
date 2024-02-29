import { Component } from "../Component";
const sharedDataValues = new WeakMap<any, any>();
const symbolsShared = <{ key: any, symbol: Symbol, stringKey: string }[]>[];

export function addShared<T>(key: Symbol | string, data: T, owner: Component<any, any>);
export function addShared<T>(key: Symbol | string, data: T): T;
export function addShared<T>(): T {
    var args = arguments;
    var key = args[0];
    var data = args[1];
    if (typeof key === 'string') {
        var exist = symbolsShared.find(t => t.stringKey === key);
        if (exist) {
            key = exist.symbol;
        } else {
            var stringKey = key;
            key = Symbol(key);
            symbolsShared.push({
                key: key,
                symbol: key,
                stringKey: stringKey
            })
        }
    }
    if (args.length > 2) {
        var c = args[2];
        if (c && c instanceof Component && !c.isDisposed) {
            c.on('ondisposing', () => {
                clearShared(key);
            });
        }
    }
    if (!sharedDataValues.has(key)) {
        sharedDataValues.set(key, data);
    }
    return sharedDataValues.get(data);
};

export function getShared<T>(key: Symbol | string): T {
    if (typeof key === 'string') {
        var exist = symbolsShared.find(t => t.stringKey === key);
        if (exist) {
            key = exist.symbol;
        } else {
            return null as T;
        }
    }
    if (sharedDataValues.has(key)) {
        return sharedDataValues.get(key);
    }
    return null as T;
};

export function clearShared(key: Symbol | string) {
    if (typeof key === 'string') {
        var exist = symbolsShared.find(t => t.stringKey === key);
        if (exist) {
            key = exist.symbol;

        }
    }
    var ref = symbolsShared.find(t => t.key === key);
    ref && symbolsShared.splice(symbolsShared.indexOf(ref), 1);
    if (typeof key !== 'string') {
        if (sharedDataValues.has(key)) {
            sharedDataValues.delete(key);
        }
    }

};

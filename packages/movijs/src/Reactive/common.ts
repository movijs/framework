import { Component } from ".."
import { RouteManager } from "../Router/RouteManager"
import { ServiceManager } from "../ServiceManager"

export const enum Flags {
    SKIP = '[__skip__]',
    IS_REACTIVE = '[__isReactive__]',
    IS_READONLY = '[__isReadonly__]',
    IS_SUPERFICIAL = '[__issuperficial__]',
    RAW = '[__raw__]',
    CONTEXT = 'context',
    GET_SETUP = '[__get_setup__]'
}

export const enum TargetType {
    SYSTEM = 0,
    INVALID = 0,
    COMMON = 1,
    COLLECTION = 2
}


export interface IModelType {
    [Flags.SKIP]?: boolean
    [Flags.IS_REACTIVE]?: boolean
    [Flags.IS_READONLY]?: boolean
    [Flags.IS_SUPERFICIAL]?: boolean
    [Flags.RAW]?: any
}

export const ITERATE_KEY = Symbol('')
export let followTracking: boolean = true;
export let arrayScope: { enabled: boolean, key: string } = { enabled: false, key: '' };
export function setFollowTracing(s) {
    followTracking = s;
}


export function getRaw<T>(observed: T): T {
    const raw = observed && (observed as any)[Flags.RAW]
    return raw ? getRaw(raw) : observed
}


export const isModified = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)

export function isReadonly(value: unknown): boolean {
    return !!(value && (value as any)[Flags.IS_READONLY])
}


export function isSuperficial(value: unknown): boolean {
    return !!(value && (value as any)[Flags.IS_SUPERFICIAL])
}

export const objectToString = Object.prototype.toString
export const propertyExist = Object.prototype.hasOwnProperty
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val => propertyExist.call(val, key);
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol';
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';
export const isString = (val: unknown): val is string => typeof val === 'string';

export const builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol)
    .filter(key => key !== 'arguments' && key !== 'caller')
    .map(key => (Symbol as any)[key])
    .filter(isSymbol))

export function mapCreator(str: string, expectsLowerCase?: boolean): (key: string) => boolean {
    const map: Record<string, boolean> = Object.create(null)
    const list: Array<string> = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}


export const isNonTrackableKeys = mapCreator(`__proto__`)


// export function toReadonlyReactive(model: IModelType) {
//     //return readonly(model)
// }
export function toTypeString(value: unknown): string { return objectToString.call(value) }

export function toRawType(value: unknown): string {
    return toTypeString(value).slice(8, -1)
}

export function targetTypeMap(rawType: string) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return TargetType.COMMON
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return TargetType.COLLECTION
        default:
            return TargetType.INVALID
    }
}

export function getTargetType(value: any): TargetType {
    if (value instanceof RouteManager || value instanceof ServiceManager || value instanceof Component ) {
        return TargetType.SYSTEM;
    }
    return !Object.isExtensible(value)
        ? TargetType.INVALID
        : targetTypeMap(toRawType(value))
}

export const isNumericKey = (key: unknown) => isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;


const trackStack: boolean[] = []

export function pauseTracking() {
    trackStack.push(followTracking)
    setFollowTracing(false);
}

export function enableTracking() {
    trackStack.push(followTracking)
    setFollowTracing(true);
}

export function resetTracking() {
    const last = trackStack.pop()
    setFollowTracing(last === undefined ? true : last);
}

const arrayStack: { enabled: boolean, key: string }[] = []


export function addArrayStack(key) {
    arrayStack.push(arrayScope)
    arrayScope.enabled = true;
    arrayScope.key = key;
}
export function removeArrayStack() {
    const last = arrayStack.pop();
    if (arrayStack.length > 0) {
        arrayScope = last === undefined ? { enabled: false, key: '' } : last;
    } else {
        arrayScope = { enabled: false, key: '' }
    }

}


export declare const RefSymbol: unique symbol
export declare const sfRefMarker: unique symbol
export declare const sfReactiveMarker: unique symbol
export declare const RawSymbol: unique symbol

export interface IHook<T = any> {
    value: T
    [RefSymbol]: true
}
export type BaseTypes = string | number | boolean
export type IterableCollections = Map<any, any> | Set<any>
export type WeakCollections = WeakMap<any, any> | WeakSet<any>
export type CollectionTypes = IterableCollections | WeakCollections
export interface RefUnwrapBailTypes { }

export type SuperficialRef<T = any> = IHook<T> & { [sfRefMarker]?: true }
export type UnwrapRef<T> = T extends SuperficialRef<infer V>
    ? V : T extends IHook<infer V>
    ? UnwrapRefSimple<V> : UnwrapRefSimple<T>

export type UnwrapRefSimple<T> = T extends | Function | CollectionTypes | BaseTypes | IHook | RefUnwrapBailTypes[keyof RefUnwrapBailTypes] | { [RawSymbol]?: true }
    ? T : T extends Array<any>
    ? { [K in keyof T]: UnwrapRefSimple<T[K]> } : T extends object & { [sfReactiveMarker]?: never }
    ? { [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]> } : T

export type UnwrapNestedRefs<T> = T extends IHook ? T : UnwrapRefSimple<T>

export interface RefUnwrapValueTypes<T> { value: T }

export type UnwrapValueRefs<T> = T extends number ? RefUnwrapValueTypes<T> :
    T extends number ? RefUnwrapValueTypes<T> :
    T extends boolean ? RefUnwrapValueTypes<T> :
    T extends object ? UnwrapNestedRefs<T> :
    T extends Array<T> ? UnwrapNestedRefs<T> :UnwrapRefSimple<T>;


export var setupListener;
export function listenSetup(key) {
    setupListener = key;
}

export function closeSetup() {
    setupListener = null;
}
import { KeyValueItem } from "../core";

export interface IAttribute<BaseType> {
    
    add(attribute: object | string): BaseType;
    remove(key: string): BaseType;
    has(key: string): boolean;
    get(key: string): string|null;
}

 
export interface IClass<BaseType> {
    add(classNames: string[] | string | {}): BaseType;
    remove(classNames: string[] | string): BaseType;
    has(className: string): boolean;
}

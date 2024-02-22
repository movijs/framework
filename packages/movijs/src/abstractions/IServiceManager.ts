import { Dictionary,Collection } from "../core"; 
import { IControl } from "./IControl";
export interface IServiceManager { 
    AddService<types extends any>(service: types, name?: string):void
    ImportService(p:Promise<any>):void
    GetServices(): Dictionary<string, any>
    GetService(serviceType:any):void
    FindService(service: string): void
    AddComponent(component: IControl<any,any,any>, name?: string): void
    GetComponent(name: string):IControl<any,any,any> | undefined
}
import { IControl } from "./IControl";
import { IRouter } from "./Router";

export interface routerValidateEventArgs{
    uri:string,
    key:any,
    routes:Map<any,RouteRecord>,
    params:any
}
export class RouteRecord{
    control: IControl<any,any,any> | Promise<IControl<any,any,any>> | undefined;
    layout:  IControl<any,any,any> | Promise<IControl<any,any,any>> | undefined;
    path: string | undefined;
    parent: RouteRecord| undefined;
    ParentPath: string| undefined;
    isDefault: boolean | undefined;
    keepAlive: boolean = true;
    instances: {
        layout: IControl<any,any,any>;
        control: IControl<any,any,any>;
    } | undefined;
    extend?: any = {};
    onShow?: (e: IControl<any,any,any>) => void;
    public name: string | undefined;
    public default?: any;
    validate?:(e:routerValidateEventArgs)=>boolean;
}

export interface IChildRoute { 
    AddRoute(Patern: string, Page:any): IChildRoute;
}
export class RouteItem { 
    public path:string | undefined;
    public control: any;  
    public childs?: RouteItem[] = [];
    public extend?: any = {};
    public keepAlive: boolean = true;
    onShow?: (e: IControl<any,any,any>) => void; 
    public name:string | undefined;
    validate?:(e:routerValidateEventArgs)=>boolean;
}

export interface IRouteManager {
    routes: Map<any, RouteRecord>; 
    add(item: RouteItem, layout?: any): void; 
    insert(target: string|RouteRecord, item: RouteItem)
    get(name: string): RouteRecord;
    router: IRouter;  
}

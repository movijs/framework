import { IControl } from "..";
import { IRouteManager } from "./IRouteManager";

export interface IModelSettings { 
     PageSize:number
}
export interface IConfigurationOptions {
     Route: IRouteManager;
     middleware(ref: (next: () => any, e: IControl<any, any, any>) => void); 
     ModelSettings:IModelSettings
}
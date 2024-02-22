import { IControl } from "..";
import { IRouteManager } from "./IRouteManager";

export interface IModelSettings {
     PageSize: number
}
export interface IConfigurationOptions {
     Route: IRouteManager;
     middleware(ref: (next: () => any, e: IControl<any, any, any>) => void);
     ModelSettings: IModelSettings;
     onObjectRender?: (data: Object, component: IControl<any, any, any>) => void;
     onReactiveEffectRun?: (type: string, ...args) => void;
     onExternalCompiler?: (tag: any, ctx: any, props: any) => any;
     setStateProvider: (name: string, values: object) => void;
}
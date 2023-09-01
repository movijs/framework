import { IControl } from "..";

export interface IRouterView extends IControl<any,any,any> { 
     navigate(page: IControl<any,any,any>):Promise<any>;
}
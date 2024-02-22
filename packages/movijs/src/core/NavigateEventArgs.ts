

import { IControl  } from "../abstractions";
export type routeType = {
    path: string,
    extend: any,
    params: any,
    name: string,
    tree:string[]
}
export class NavigateEventArgs {
    route: routeType | undefined;
    resume: boolean = true;
    onShow: ((IControl: IControl<any,any,any>) => void) | undefined;
    redirect: string = "";
    currentPage!: IControl<any,any,any>;
    prev:any
}
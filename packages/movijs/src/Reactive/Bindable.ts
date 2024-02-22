import { registerEffect } from ".";
import { IDirective } from "../abstractions/IDirective";
import {   IFxMapper } from "./ReactiveEngine";

export default class Bindable {
    fxm: IFxMapper;
    directive: IDirective<any>
    constructor(directive: IDirective<any>) {
        this.fxm = registerEffect(directive); 
        this.directive = directive;
        this.fxm.directive = directive;
        this.fxm.callback = directive.getData;
    }  
}
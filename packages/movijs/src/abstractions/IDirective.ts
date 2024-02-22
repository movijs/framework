import Bindable from "../Reactive/Bindable";
import { IFxMapper } from "../Reactive/ReactiveEngine";
import { pauseTracking, resetTracking } from "../Reactive/common";
import { IControl } from "./IControl";

export interface IDirective<SettingsModel> {
    awaiableSetup: boolean;
    disposed: boolean;
    getData?(val?);
    init(settings: any, Source: IControl<any,any,any>): void
    setup?(target, key);
    removeDom?();
    FxMapper: IFxMapper | null;
    Bindabler?: Bindable | undefined;
    dispose(settings?: any, Source?: IControl<any,any,any>); 
    bind?(prop: any, key: string)
    bind?(callback: () => void) 
    name?: string 
    Configuration?:{
        Property: any,
        FieldName:  string,
        type: string,
        callback()
    }
}

export abstract class ComponentDirective<T> implements IDirective<T>{
    awaiableSetup: boolean = true;
    disposed: boolean = false;
    getData() { };
    setup(target: any, key: any) {
        if (this.owner.isDisposed) {

            this.dispose(this.Configuration, this.owner);
            return;
        }
        pauseTracking()
        this.Configuration.Property = target;
        this.Configuration.FieldName = key;
        resetTracking();
    };
    FxMapper: IFxMapper | null = null;
    Bindabler?: Bindable | undefined;
    dispose(settings?: any, Source?: IControl<any,any,any> | undefined) {
        this.Bindabler && this.Bindabler.fxm.dispose();
        this.Bindabler = undefined; 
        this.disposed = true;
    }
    init(): void {
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.FxMapper && this.FxMapper.run();
    }
    Configuration = {
        Property: null as any,
        FieldName: '' as string,
        type: '',
        callback() { }
    }
    bind(prop: any, key: string);
    bind(callback: () => void);
    bind(): any {
        if (arguments.length === 2) {
            this.Configuration.Property = arguments[0]
            this.Configuration.FieldName = arguments[1];
            this.Configuration.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.callback = arguments[0];
                this.Configuration.type = "function";
            }
        }

        if (this.owner.isRendered) {
            if (this.Configuration) this.init();
        }
    }
    constructor(public owner: IControl<any,any,any>) {
        this.getData = this.getData.bind(this);
        this.init = this.init.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        new Bindable(this);
    }
    name: string | undefined;
}

export class CustomDirective extends ComponentDirective<any>{
    name: string | undefined = "bindme";
    bind(prop: any, key: string);
    bind(callback: () => void);
    bind() { }
}


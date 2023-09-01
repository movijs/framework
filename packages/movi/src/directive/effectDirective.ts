import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable"; 
import { IFxMapper } from "../Reactive/ReactiveEngine";
export class EffectDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: "function" | "expression" = "function";

}

export class EffectDirective implements IDirective<EffectDirectiveSettings>{
    awaiableSetup: boolean=false;
    id: any;
    isArray: boolean = false; 
    Bindabler?: Bindable | undefined;
    FxMapper: IFxMapper = null as any;
    private _settings: EffectDirectiveSettings = null as any;
    private _source: IControl<any,any,any> = null as any;
    constructor() {
        this.getData = this.getData.bind(this);
        this.init = this.init.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.removeDom = this.removeDom.bind(this);
        this.start = this.start.bind(this);
        new Bindable(this); 
    }
    getData() {  
        if (this._source.onupdating) this._source.onupdating(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'effect'});
        if (this._settings && this._settings.callback) {
            var val = (this._settings.callback as any)(this._source);   
        }  
        if (this._source.onupdated) this._source.onupdated(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'effect'});
    }
    start() { 
        // this.fx.init();
        // //if (this._settings == null) { return }
        // var val = CheckType(this._settings); 
        // this.fx.complete();
        // return val;
    }

    update() {
        // if (this._settings == null) { return }
        // if (this._source.isDisposed || this._source.element === null) { return }
        // this.fx.init();
        // this._settings.callback.call(this._source);
        // this.fx.complete();
    }
    setupCompleted = false;
    times;
    setup(target, key) {
       
        //if (!this.setupCompleted) {
        // if (this._source.isDisposed) {
        //     if (this.fx) {
        //         ///this.fx.stop(this._settings.Property, this._settings.FieldName);
        //     }
        //     this.dispose(this._settings, this._source);
        //     return;
        // }
        // this.fx.init();
        // pauseTracking()
        // this._settings.Property = target;
        // this._settings.FieldName = key;
        // resetTracking();
        // this.fx.complete();
        // this.setupCompleted = true;
        //}
    }
    init(settings: EffectDirectiveSettings, Source: IControl<any,any,any>): void {
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.FxMapper.run();
        // this.fx = register(this);
        // this.fx.run();
    }
    disposed: boolean = false;
    dispose(settings: EffectDirectiveSettings, Source: IControl<any,any,any>) { 
        this.Bindabler && this.Bindabler.fxm.dispose();
        this.Bindabler = undefined;
        this._source = null as any;
        this._settings = null as any;
        this.disposed = true;
    }
    removeDom() {
        if (this._source && !this._source.isDisposed) {
            this._source.dispose();
        }
    }
}
import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable"; 
import { IFxMapper } from "../Reactive/ReactiveEngine";

export class ReloadSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type:DirectiveBindingType= "function";

}

export class ReloadDirective implements IDirective<ReloadSettings>{
    id: any = null as any;
    isArray: boolean = false; 
    private _settings: ReloadSettings= null as any;
    private _source: IControl<any,any,any> = null as any;
    Bindabler?: Bindable | undefined;
    FxMapper: IFxMapper = null as any;
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
        if (this._settings == null) { return }
        if (this._source.onupdating) this._source.onupdating(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'reload'});
        var val  = CheckType(this._settings); 
        var r = false;

        if (typeof val === 'number') {
            r = val > 0;
        } else if (typeof val === 'boolean') {
            r = val;
        } else if (val === undefined) {
            r = false;
        } else if (typeof val === "string") {
            if (val.length > 0) {
                r = true;
            } else {
                r = false;
            }
        } else if (Array.isArray(val)) {
            if (val != null) { 
                if (val.length > 0) {
                    r = true;
                } else {
                    r = false;
                } 
            } else {
                r = false;
            }
        } else if (typeof val === 'object') {
            if (val != null) { 
                if (Object.keys(val).length > 0) {
                    r = true;
                } else {
                    r = false;
                } 
            } else {
                r = false;
            }
        } else if (val == null) {
            r = false;
        } 
        if (r === true) {
           if(this._source.reload) this._source.reload(); 
        } 

        if (this._source.onupdated) this._source.onupdated(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'reload'});
    }
    start() {
       
    }

    update() {

    }
    awaiableSetup: boolean=false;
    setupCompleted = false;
    setup(target, key) { 
        // if (!this.setupCompleted) {
        //     if (this._source.isDisposed) {
        //         if (this.fx) {
        //             ///this.fx.stop(this._settings.Property, this._settings.FieldName);
        //         }
        //         this.dispose(this._settings, this._source);
        //         return;
        //     }

        //     pauseTracking()
        //     this._settings.Property = target;
        //     this._settings.FieldName = key;
        //     resetTracking(); 
        //     this.setupCompleted = true;
        // }
    }
    init(settings: ReloadSettings, Source: IControl<any,any,any>): void {
        if (settings == null) { return }
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this); 
        this.FxMapper.run();
        //this.fx.run();
    }

    disposed: boolean = false;
    async dispose(settings: ReloadSettings, Source: IControl<any,any,any>) {
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
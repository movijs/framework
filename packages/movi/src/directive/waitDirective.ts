import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable"; 
import { IFxMapper } from "../Reactive/ReactiveEngine";
export class WaitSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: DirectiveBindingType = "function";

}

export class WaitDirective implements IDirective<WaitSettings>{
    id: any = null as any;
    isArray: boolean = false; 
    Bindabler?: Bindable | undefined; 
    FxMapper: IFxMapper = null as any;
    private _settings: WaitSettings = null as any;
    private _source: IControl<any,any,any>= null as any;
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
        var val= CheckType(this._settings); 
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

        this._source['iswait'] = r;   
    }
    start() {
        
         
    }
    
    update() { 
        //this.start();
    }
    setupCompleted = false;
    awaiableSetup: boolean=false;
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
    init(settings: WaitSettings, Source: IControl<any,any,any>): void {
        if (settings == null) { return }
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this); 
        this.FxMapper.run();
        //this.Bindabler && register(this.Bindabler.fxm); 
        //this.fx.run();
    }
    disposed: boolean = false;
    async dispose(settings: WaitSettings, Source: IControl<any,any,any>)  {
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
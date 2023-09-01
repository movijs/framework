import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable"; 
import { IFxMapper } from "../Reactive/ReactiveEngine";
export class VisibilitySettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type:DirectiveBindingType = "function";
    public oldValue: any; 

}

export class VisibilityDirective implements IDirective<VisibilitySettings>{
    id: any = null as any;
    isArray: boolean = false; 
    Bindabler?: Bindable | undefined; 
    FxMapper: IFxMapper = null as any;
    private _settings: VisibilitySettings= null as any;
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
        if (this._source.onupdating) this._source.onupdating(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'visiblity'});
        var nValue = CheckType(this._settings);
        if (this._settings.oldValue === nValue) {
            return;
        }

        this._settings.oldValue= nValue; 
        var r = false;

        if (typeof this._settings.oldValue === 'number') {
            r = this._settings.oldValue > 0;
        } else if (typeof this._settings.oldValue === 'boolean') {
            r = this._settings.oldValue;
        } else if (this._settings.oldValue === undefined) {
            r = false;
        } else if (typeof this._settings.oldValue === "string") {
            if (this._settings.oldValue.length > 0) {
                r = true;
            } else {
                r = false;
            }
        } else if (typeof this._settings.oldValue === 'object') {
            if (this._settings.oldValue != null) {

                if (Object.keys(this._settings.oldValue).length > 0) {
                    r = true;
                } else {
                    r = false;
                }

            } else {
                r = false;
            }
        } else if (this._settings.oldValue == null) {
            r = false;
        } 
        if (r === true) {
            this._source.show(); 
        } else {
            this._source.hide(); 
        }   

        if (this._source.onupdated) this._source.onupdated(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'visibilty'});
    }
    start() {
       
    }

    update() {

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
    init(settings: VisibilitySettings, Source: IControl<any,any,any>): void {
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
    async dispose(settings: VisibilitySettings, Source: IControl<any,any,any>)  {
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
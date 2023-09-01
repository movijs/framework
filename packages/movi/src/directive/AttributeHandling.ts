 
import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable"; 
import { IFxMapper } from "../Reactive/ReactiveEngine";
import { engine } from "..";
export class AttributeHandlingSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: DirectiveBindingType = "function";
    public attributes: Set<string> = new Set();
    public oldValue;
}

export class AttributeHandlingDirective implements IDirective<AttributeHandlingSettings>{
    id: any = null as any;
    isArray: boolean = false;
    FxMapper: IFxMapper = null as any;
    private _settings: AttributeHandlingSettings = null as any;
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
    awaiableSetup: boolean = true;
    getData() {
        if (this._source.onupdating) this._source.onupdating(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'attribute'});
        if (this._settings == null) { return }

        var nValue = CheckType(this._settings);
        if (this._settings.oldValue === nValue) {
            return;
        }
        this._settings.oldValue = nValue;
         

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
            this._settings.attributes.forEach(atr => {
                if (this._source.element[atr]) this._source.element[atr]();
            })
        }
        if (this._settings.oldValue !== null) {
            this.awaiableSetup = false;
        }

        if (this._source.onupdated) this._source.onupdated(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'attribute'});
    }
    Bindabler?: Bindable | undefined;
    push?(val: any) {
        throw new Error("Method not implemented.");
    }
    splice?(val: any) {
        throw new Error("Method not implemented.");
    }
    slice?(val: any) {
        throw new Error("Method not implemented.");
    }
    pop?(val: any) {
        throw new Error("Method not implemented.");
    }
    shift?(val: any) {
        throw new Error("Method not implemented.");
    }
    unshift?(val: any) {
        throw new Error("Method not implemented.");
    }
    set?(val: any) {
        throw new Error("Method not implemented.");
    }
    reverse?(val: any) {
        throw new Error("Method not implemented.");
    }
    start() {
        if (this._source.onupdating) this._source.onupdating(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'attribute'});
        if (this._settings == null) { return }

       

        var val = CheckType(this._settings);

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
        if (r === true) {
            this._settings.attributes.forEach(atr => {
                if (this._source.element[atr]) this._source.element[atr]();
            })
        }

        if (this._source.onupdated) this._source.onupdated(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'attribute'});
    }

    update() {
     
    }
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
        //     //pauseTracking()
        //     this._settings.Property = target;
        //     this._settings.FieldName = key;
        //     //resetTracking();
        //     this.setupCompleted = true;
        // }
    }
    init(settings: AttributeHandlingSettings, Source: IControl<any,any,any>): void {
        if (settings == null) { return }
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.FxMapper.run();
        // this.Bindabler && this.Bindabler.
        // this.fx = register(this);
        // this.fx.run();
        //this.fx = effect(this.start, this.setup).effect;
    }
    disposed: boolean = false;
    dispose(settings: AttributeHandlingSettings, Source: IControl<any,any,any>) {

        if (settings == null) { return }
        if (Source.isDisposed || Source.element === null) { return }
        
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
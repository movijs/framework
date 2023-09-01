
// import { Component, register } from "../../";
import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable";
import { IFxMapper } from "../Reactive/ReactiveEngine";
import { Component } from "../Component";

export class LogicDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: (val: any) => any;
    public logicalFn!: () => any;
    public type: DirectiveBindingType = "function";

}

export class LogicDirective implements IDirective<LogicDirectiveSettings>{
    id: any;
    awaiableSetup: boolean = false;
    isArray: boolean = false;
    Bindabler?: Bindable | undefined;
    FxMapper: IFxMapper = null as any;
    private _settings: LogicDirectiveSettings = null as any;
    private _source: IControl<any,any,any> = null as any;
    private _prevControl: IControl<any,any,any> | undefined = undefined;
    public ph: IControl<any,any,any> | undefined = undefined;
    constructor(c) {
        this.ph = c;
        this._source = c;
        this.getData = this.getData.bind(this);
        this.init = this.init.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.removeDom = this.removeDom.bind(this);
        this.start = this.start.bind(this);
        new Bindable(this);
    }
    getData() {
        this.update();
        // if (this._settings == null) { return }
        // var val = this._settings.logicalFn();
        // if (this._prevControl != null) {
        //     if (typeof val === 'boolean') {
        //         if (val) {
        //             var pi = this._source.controls.indexOf(this._prevControl);
        //             this._prevControl.dispose();
        //             this._prevControl = this._settings.callback(val);
        //             if (this._prevControl === undefined || this._prevControl === null) {
        //                 this._prevControl = new Component(document.createComment(''), {});
        //             }
        //             this._source.controls.insert(pi, this._prevControl);
        //         } else {
        //             var pi = this._source.controls.indexOf(this._prevControl);
        //             this._prevControl.dispose();
        //             this._prevControl = new Component(document.createComment(''), {});
        //             this._source.controls.insert(pi, this._prevControl);
        //         }

        //     } else {
        //         var pi = this._source.controls.indexOf(this._prevControl);
        //         this._prevControl.dispose();
        //         this._prevControl = this._settings.callback(val);
        //         if (this._prevControl === undefined || this._prevControl === null) {
        //             this._prevControl = new Component(document.createComment(''), {});
        //         }
        //         this._source.controls.insert(pi, this._prevControl);
        //     }

        // } else {
        //     if (typeof val === 'boolean') {
        //         this._prevControl = new Component(document.createComment('PCHOLDER'), {});
        //         this._source.controls.add(this._prevControl);
        //     } else {

        //         this._prevControl = this._settings.callback(val);

        //         if (this._prevControl === undefined || this._prevControl === null) {
        //             this._prevControl = new Component(document.createComment('PCHOLDER'), {});
        //         }
        //         this._source.controls.add(this._prevControl);
        //     }
        // }
    }
    start() {
    }

    oldValue = null;
    update() {

        if (this._settings == null) { return }
        if (this._source.onupdating) this._source.onupdating(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'logical'});
        if (this._source.isDisposed || this._source.element === null) { return }
        var val = this._settings.logicalFn();
        if (typeof val === 'function') {
            val = val();
        }
        if (this.oldValue != val) { 
            this.oldValue = val;
            var newElement = this._settings.callback(val);
            var index = this._source.controls.indexOf(this._source);
            if (Array.isArray(this._prevControl)) {
                this._prevControl.forEach(pc => {
                    if (pc && !pc.isDisposed) {
                        pc.dispose();
                    }
                })
            } else {
                if (this._prevControl && !this._prevControl.isDisposed) { 
                    this._prevControl.dispose();
                }
            }
            this._prevControl = newElement;
            this._source.controls.insert(index, newElement);
        }

        if (this._source.onupdated) this._source.onupdated(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'logical'});

        // if (typeof val === 'boolean') {
        //     if (val) {
        //         var pi = this._source.controls.indexOf(this._prevControl);
        //         this._prevControl?.dispose();
        //         this._prevControl = this._settings.callback(val);
        //         if (this._prevControl === undefined || this._prevControl === null) {
        //             this._prevControl = new Component(document.createComment(''), {});
        //         }
        //         this._source.controls.insert(pi, this._prevControl);
        //     } else {
        //         var pi = this._source.controls.indexOf(this._prevControl);
        //         this._prevControl?.dispose();
        //         this._prevControl = new Component(document.createComment(''), {});
        //         this._source.controls.insert(pi, this._prevControl);
        //     }
        // } else {
        //     var pi = this._source.controls.indexOf(this._prevControl);
        //     this._prevControl?.dispose();
        //     this._prevControl = this._settings.callback(val);

        //     if (this._prevControl === undefined || this._prevControl === null) {
        //         this._prevControl = new Component(document.createComment(''), {});
        //     }
        //     this._source.controls.insert(pi, this._prevControl);
        // }



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

        //     pauseTracking()
        //     this._settings.Property = target;
        //     this._settings.FieldName = key;
        //     resetTracking();
        //     this.setupCompleted = true;
        // }
    }
    init(settings: LogicDirectiveSettings, Source: IControl<any,any,any>): void {
        this._settings = settings;
        //this._source = Source; 
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.FxMapper.run();
        //this.Bindabler && register(this.Bindabler.fxm);
        //this.fx.run();
    }
    disposed: boolean = false;
    dispose(settings: LogicDirectiveSettings, Source: IControl<any,any,any>) {
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
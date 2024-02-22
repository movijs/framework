import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable";
import { IFxMapper } from "../Reactive/ReactiveEngine";
import { ApplicationService, Component } from "..";
export class TextDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: DirectiveBindingType = "function";
    public oldValue;

}

export class TextDirective implements IDirective<TextDirectiveSettings>{
    id: any = null as any;
    isArray: boolean = false;
    private _settings: TextDirectiveSettings = null as any;
    private _source: IControl<any, any, any> = null as any;
    Bindabler?: Bindable | undefined;
    FxMapper: IFxMapper = null as any;
    constructor() {
        this.init = this.init.bind(this);
        this.getData = this.getData.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.removeDom = this.removeDom.bind(this);
        this.start = this.start.bind(this);
        new Bindable(this);

    }


    getData() {

        if (this._settings == null) { return }
        if (!this._source || this._source.isDisposed) { return } 
        if (this._source.onupdating) this._source.onupdating(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'text' });
        var nValue = CheckType(this._settings);
        if (this._settings.oldValue === nValue) {
            return;
        }
        this._settings.oldValue = nValue;

        if (Array.isArray(this._settings.oldValue)) {
            var arrayToString = '';
            this._settings.oldValue.forEach(tx => {
                arrayToString = `${arrayToString} ${tx}`
            })
            this._source.element.textContent = arrayToString;
        } else if (typeof this._settings.oldValue === 'object') {
            var objectToString = '';
            if (ApplicationService.current?.Options?.onObjectRender) {
                var el = ApplicationService.current.Options.onObjectRender(this._settings.oldValue, this._source);
            } else {
                Object.keys(this._settings.oldValue).forEach(tx => {
                    objectToString = `${objectToString} ${tx}:${this._settings.oldValue[tx]}`
                })
                this._source.element.textContent = objectToString;
            }
        } else {
            if (this._settings.oldValue === undefined || this._settings.oldValue === null) {
                this._settings.oldValue = '';
            } else {
                this.setupCompleted = true;
            }

            this._source.element.textContent = this._settings.oldValue;
        }

        if (ApplicationService.current?.Options?.onReactiveEffectRun) {
            ApplicationService.current.Options.onReactiveEffectRun('binding.text.changed', this)
        }
        if (this._source.onupdated) this._source.onupdated(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'text' });
    }
    start() {

        //
    }

    update() {

        // if (this._settings == null) { return }
        // if (this._source.isDisposed || this._source.element === null) { return }
        // var val = this._settings.callback();
        // if (val === undefined || val === null) {
        //     val = '';
        // }
        // if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {

        //     this._source.element.textContent = val;
        // } else {
        //     this._source.element.textContent = this._settings.callback();
        // }
    }
    awaiableSetup: boolean = false;
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
    init(settings: TextDirectiveSettings, Source: IControl<any, any, any>): void {
        if (settings == null) { return }
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.FxMapper.run();

        // this.fx.run();
    }

    disposed: boolean = false;
    async dispose(settings: TextDirectiveSettings, Source: IControl<any, any, any>) {
        this.Bindabler && this.Bindabler.fxm.dispose();
        this.Bindabler = undefined;
        this._source = null as any;
        this._settings = null as any;
        this.disposed = true;

    }

    async removeDom() {
        if (this._source && !this._source.isDisposed) {
            await this._source.dispose();

        }
    }

}
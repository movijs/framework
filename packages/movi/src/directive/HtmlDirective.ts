import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable";
import { IFxMapper } from "../Reactive/ReactiveEngine";
import { ApplicationService } from "..";
export class HtmlDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: DirectiveBindingType = "function";
    public oldValue;

}

export class HtmlDirective implements IDirective<HtmlDirectiveSettings>{
    id: any = null as any;
    awaiableSetup: boolean = false;
    isArray: boolean = false;
    Bindabler?: Bindable | undefined;
    FxMapper: IFxMapper = null as any;
    private _settings: HtmlDirectiveSettings = null as any;
    private _source: IControl<any, any, any> = null as any;
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
        if (!this._source || this._source.isDisposed) { return }
        if (this._source.onupdating) this._source.onupdating(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'html' });
        var nValue = CheckType(this._settings);
        if (this._settings.oldValue === nValue) {
            return;
        }
        this._settings.oldValue = nValue;
        if (this._source.element.tagName == 'script' || this._source.element.tagName == 'SCRIPT' || this._source.element instanceof HTMLScriptElement) { 
            return null;
        }
         
        if (this._settings.oldValue === undefined || this._settings.oldValue === null) {
            this._settings.oldValue = '';
        }

        if (Array.isArray(this._settings.oldValue)) {
            var arrayToString = '';
            this._settings.oldValue.forEach(tx => {
                arrayToString = `${arrayToString} ${tx}`
            })
            //this._source.element.textContent = arrayToString;
            if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
                this._source.element.innerHTML = arrayToString.replace(/(\<script)([\S\s\.]*)(script\>)/gi, '');
            } else {
                this._source.element.textContent = arrayToString.replace(/(\<script)([\S\s\.]*)(script\>)/gi, '');
            }

        } else if (typeof this._settings.oldValue === 'object') {
            var objectToString = '';
            if (ApplicationService.current?.Options?.onObjectRender) {
                ApplicationService.current.Options.onObjectRender(this._settings.oldValue, this._source);
            } else {
                Object.keys(this._settings.oldValue).forEach(tx => {
                    objectToString = `${objectToString} ${tx}:${this._settings.oldValue[tx]}`
                })
                //this._source.element.textContent = objectToString;
                if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
                    this._source.element.innerHTML = objectToString.replace(/(\<script)([\S\s\.]*)(script\>)/gi, '');
                } else {
                    this._source.element.textContent = objectToString.replace(/(\<script)([\S\s\.]*)(script\>)/gi, '');
                }
            }
        } else {
            if (this._settings.oldValue === undefined || this._settings.oldValue === null) {
                this._settings.oldValue = '';
            } else {
                this.setupCompleted = true;
            }
            //this._source.element.textContent = this._settings.oldValue;
            if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
                this._source.element.innerHTML = this._settings.oldValue.replace(/(\<script)([\S\s\.]*)(script\>)/gi, '');
            } else {
                this._source.element.textContent = this._settings.oldValue.replace(/(\<script)([\S\s\.]*)(script\>)/gi, '');
            }
        }

        // if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
        //     this._source.element.innerHTML = this._settings.oldValue;
        // } else {
        //     this._source.element.textContent = this._settings.oldValue;
        // }
        if (this._source.onupdated) this._source.onupdated(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'html' });
    }
    start() {

    }

    update() {
        // if (this._settings == null) { return }
        // var val = this._settings.callback();
        // if (this._source.isDisposed || this._source.element === null) { return }
        // if (val === undefined || val === null) {
        //     val = '';
        // }
        // if (this._source.element instanceof HTMLElement || this._source.element instanceof Element) {
        //     this._source.element.innerHTML = val;
        // } else {
        //     this._source.element.textContent = val;
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
    init(settings: HtmlDirectiveSettings, Source: IControl<any, any, any>): void {
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
    dispose(settings: HtmlDirectiveSettings, Source: IControl<any, any, any>) {
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
import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckModelType, CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable";
import { closeSetup, listenSetup, pauseTracking, resetTracking } from "../Reactive/common";
import { IFxMapper } from "../Reactive/ReactiveEngine";

export class ModelDirectiveSettings {
    public Property!: any;
    public FieldName!: string;
    public callback!: () => any;
    public type: DirectiveBindingType = "function";
    public oldValue: any;
    public bind: { get: () => any, set: (val) => void } | null = null
}

export class ModelDirective implements IDirective<ModelDirectiveSettings>{
    id: any = null as any;
    isArray: boolean = false;
    setupCompleted: boolean = false;
    Bindabler?: Bindable | undefined;
    FxMapper: IFxMapper = null as any;
    constructor() {
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.getData = this.getData.bind(this);
        this.removeDom = this.removeDom.bind(this);
        new Bindable(this);
    }


    getData() {
        if (this._settings == null) { return }

        if (this._source.onupdating) this._source.onupdating(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'model' });
        //if (this.setupCompleted) { return this.update() }

        this._settings.oldValue = CheckModelType(this._settings, (data, expr) => {
            this.setupCompleted = true;
            if (this._source.isDisposed) {
                this.dispose(this._settings, this._source);
                return;
            }

            pauseTracking()
            this._settings.Property = data;
            this._settings.FieldName = expr;
            resetTracking();
        })


        var tn = '';
        if (this._source.element) {
            tn = (this._source.element as HTMLElement).tagName;
        }
        if (this._settings.oldValue == undefined || this._settings.oldValue == null) {
            return;
        }
        if (this.setupCompleted) {
            return this.update();
        }

        switch (tn) {
            case 'select': case 'SELECT':
                var select = <HTMLSelectElement>this._source.element;

                if (this._settings.oldValue !== undefined || this._settings.oldValue !== null) {
                    select.value = this._settings.oldValue;
                }

                !this.setupCompleted && this._source.addHandler("change", (sender, e) => {
                    if (this._settings.type == 'model') {
                        this._settings.bind?.set(select.value);
                    } else {
                        if (this._settings.oldValue != select.value) {
                            this._settings.Property[this._settings.FieldName] = select.value as unknown as any;
                            this._settings.oldValue = select.value;
                        }
                    }

                });
                break;
            default:
                var ut = 'input';

                if (this._source && this._source.props && this._source.props.updatemode) {
                    var setter = this._source.props.updatemode;
                    if (setter !== null) {
                        ut = setter;
                    }
                }

                var ii = (this._source.element as unknown as HTMLInputElement);
                var self = this;
                if (ii.type == 'checkbox' || ii.type == 'radio') {

                    var Select = (this._source.element as unknown as HTMLInputElement);

                    if (this._settings.oldValue !== undefined || this._settings.oldValue !== null) {
                        Select.checked = this._settings.oldValue;
                    } else {
                        Select.checked = false;
                    }

                    !this.setupCompleted && this._source.addHandler('change', (e: Event, sender: IControl<any, any, any>) => {
                        var nval = (e as any).target.checked;
                        if (this._settings.type == 'model') {
                            this._settings.bind?.set(nval);
                        } else {
                            this._settings.Property[this._settings.FieldName] = nval;
                            this._settings.oldValue = nval;
                        }

                        this._settings.oldValue = nval;
                    })
                } else {
                    if (this._settings.oldValue !== undefined || this._settings.oldValue !== null) {
                        (this._source.element as unknown as HTMLInputElement).value = this._settings.oldValue;
                    }
                    if (ut === 'changed') { ut = 'keydown' }
                    !this.setupCompleted && this._source.addHandler(ut, (e: Event, sender: IControl<any, any, any>) => {

                        if (e instanceof KeyboardEvent) {
                            if (e.key == 'Enter') {
                                var nval = (e.target as HTMLInputElement).value as any;

                                if (self._settings.oldValue != nval) {
                                    if (typeof self._settings.oldValue === 'number' || typeof nval === 'number') {
                                        nval = parseFloat(nval);
                                    }

                                    if (this._settings.type == 'model') {
                                        this._settings.bind?.set(nval);
                                    } else {
                                        self._settings.Property[self._settings.FieldName] = nval;
                                    }


                                    self._settings.oldValue = nval;
                                }
                            }
                        } else {
                            var nval = (e.target as HTMLInputElement).value as any;
                            if (self._settings.oldValue != nval) {

                                if (typeof self._settings.oldValue === 'number' || typeof nval === 'number') {
                                    nval = parseFloat(nval);
                                }

                                if (this._settings.type == 'model') {
                                    this._settings.bind?.set(nval);
                                } else {
                                    self._settings.Property[self._settings.FieldName] = nval;
                                }
                                self._settings.oldValue = nval;
                            }
                        }
                    })
                }
                break;
        }

        if (this._source.onupdated) this._source.onupdated(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'model' });
        this.setupCompleted = true;
    }
    setup(target, key) {
        if (!this.setupCompleted) {
            if (this._source.isDisposed) {

                this.dispose(this._settings, this._source);
                return;
            }

            pauseTracking()
            this._settings.Property = target;
            this._settings.FieldName = key;
            resetTracking();
        }

    }
    start() {

    }
    update() {

        if (this._settings == null) { return }
        if (this._source.onupdating) this._source.onupdating(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'model' });
        //if (!this.setupCompleted) { return this.setupCompleted }
        //Source.element.textContent = settings.callback(); 
        var nv = CheckModelType(this._settings, (data, expr) => {
            this.setupCompleted = true;
            if (this._source.isDisposed) {
                this.dispose(this._settings, this._source);
                return;
            } 
            pauseTracking()
            this._settings.Property = data;
            this._settings.FieldName = expr;
            resetTracking();
        });

        if (nv === undefined || nv === null) {
            if (typeof nv === 'number') { nv = 0; }
            //return;
        }
        if (this._source.isDisposed || this._source.element === null) { return }

        switch ((this._source.element as HTMLElement).tagName) {
            case 'input': case 'INPUT':
                var ii = (this._source.element as unknown as HTMLInputElement);
                if (ii.type == 'checkbox' || ii.type == 'radio') {
                    if (typeof this._settings.Property[this._settings.FieldName] === 'boolean') {
                        (this._source.element as unknown as HTMLInputElement).checked = nv;
                    } else {
                        (this._source.element as unknown as HTMLInputElement).checked = false;
                        (this._source.element as unknown as HTMLInputElement).value = nv;
                    }
                } else {
                    (this._source.element as unknown as HTMLInputElement).value = nv;
                }


                break;
            case 'button': case 'BUTTON':
                var se = <any>this._source.element;
                se.value = nv;
                break;
            case 'select': case 'SELECT':
                (this._source.element as unknown as HTMLSelectElement).value = nv;
                break;
            case 'option': case 'OPTION':
                (this._source.element as unknown as HTMLOptionElement).value = nv;
                break;
            default:
                (this._source.element as any).value = nv;
                break;
        }

        if (this._source.onupdated) this._source.onupdated(this._source, { data: this._settings.Property, field: this._settings.FieldName, source: 'model' });

    }
    private _settings: ModelDirectiveSettings = null as any;
    private _source: IControl<any, any, any> = null as any;
    awaiableSetup: boolean = false;
    init(settings: ModelDirectiveSettings, Source: IControl<any, any, any>): void {
        if (settings == null) { return }
        this._settings = settings;
        this._source = Source;
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.FxMapper.run();
        //this.fx = register(this);
        //this.fx.run();
    }


    disposed: boolean = false;
    dispose(settings: ModelDirectiveSettings, Source: IControl<any, any, any>) {
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
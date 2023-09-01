import { IControl } from "../abstractions";
import { IDirective } from "../abstractions/IDirective";
import { CheckType, DirectiveBindingType } from "../abstractions/DirectiveBindingTypes";
import Bindable from "../Reactive/Bindable"; 
import { IFxMapper } from "../Reactive/ReactiveEngine";

export class ValueDirectiveSettings {
    public Property!: any;
    public FieldName!: string;
    public callback!: () => any;
    public type: DirectiveBindingType = "function";
    public oldValue: any;
}

export class ValueDirective implements IDirective<ValueDirectiveSettings>{
    id: any = null as any;
    isArray: boolean = false; 
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
        if (this._source.onupdating) this._source.onupdating(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'value'});
        var nValue = CheckType(this._settings);
        if (this._settings.oldValue === nValue) {
            return;
        }
        this._settings.oldValue = nValue;  
        var tn = '';
        if (this._source.element) {
            tn = (this._source.element as HTMLElement).tagName;
        }
        if (this._settings.oldValue == undefined || this._settings.oldValue == null) { 
            return;
        }
        

        switch (tn) {

            case 'select': case 'SELECT':
                var select = <HTMLSelectElement>this._source.element;
                this._source.addHandler("change", (sender, e) => {
                    if (this._settings.oldValue != select.value) {
                        this._settings.Property[this._settings.FieldName] = select.value as unknown as any;
                        this._settings.oldValue = select.value;
                    }
                });
                select.value = this._settings.oldValue;
                break;
            case 'option': case 'OPTION':
                var option = (this._source.element as unknown as HTMLOptionElement);
                option.value = this._settings.oldValue;
                break;
            case 'optiongroup': case 'OPTIONGROUP':
                var optiongroup = (this._source.element as unknown as HTMLOptGroupElement);
                optiongroup.textContent = this._settings.oldValue;
                break;
            default:
                var ii = (this._source.element as unknown as HTMLInputElement);
                if (ii.type == 'checkbox' || ii.type == 'radio') {
                    var Select = (this._source.element as unknown as HTMLInputElement);
                    Select.checked = this._settings.oldValue;
                } else {
                    var inpt = (this._source.element as unknown as HTMLInputElement);
                    inpt.value = this._settings.oldValue;
                }
                break;
        }
        if (this._source.onupdated) this._source.onupdated(this._source, {data:this._settings.Property,field:this._settings.FieldName, source:'value'});
    }
    start() {
      
    }
    update() {

        // if (this._settings == null) { return } 
        // var nv = CheckType(this._settings);
        // if (this._source.isDisposed || this._source.element === null) { return }
        // switch ((this._source.element as HTMLElement).tagName) {
        //     case 'input': case 'INPUT':
        //         var ii = (this._source.element as unknown as HTMLInputElement);
        //         if (ii.type == 'checkbox' || ii.type == 'radio') {
        //             if (typeof this._settings.Property[this._settings.FieldName] === 'boolean') {
        //                 (this._source.element as unknown as HTMLInputElement).checked = nv;
        //             } else {
        //                 (this._source.element as unknown as HTMLInputElement).value = nv;
        //             }
        //         } else {
        //             (this._source.element as unknown as HTMLInputElement).value = nv;
        //         }
        //         break;
        //     case 'button': case 'BUTTON':
        //         var se = <any>this._source.element;
        //         se.value = nv;
        //         break;
        //     case 'select': case 'SELECT':
        //         (this._source.element as unknown as HTMLSelectElement).value = nv;
        //         break;
        //     case 'option': case 'OPTION':
        //         (this._source.element as unknown as HTMLOptionElement).value = nv;
        //         break;
        //     default:
        //         (this._source.element as unknown as HTMLElement).innerHTML = nv;
        //         break;
        // }

    }
    private _settings: ValueDirectiveSettings= null as any;
    private _source: IControl<any,any,any>= null as any;
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
    init(settings: ValueDirectiveSettings, Source: IControl<any,any,any>): void {
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
    async dispose(settings: ValueDirectiveSettings, Source: IControl<any,any,any>)  {
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
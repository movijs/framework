
import { ApplicationService, Component, Frame, MoviComponent } from "../";
import { IControl } from "../abstractions";
import { EffectDirective, EffectDirectiveSettings } from "./effectDirective";
import { HtmlDirective, HtmlDirectiveSettings } from "./HtmlDirective";
import { LoopDirective, LoopDirectiveSettings } from "./LoopDirective";
import { ModelDirective, ModelDirectiveSettings } from "./ModelDirective";
import { ReloadDirective, ReloadSettings } from "./reloadDirective";
import { TextDirective, TextDirectiveSettings } from "./TextDirective";
import { ValueDirective, ValueDirectiveSettings } from "./ValueDirective";
import { VisibilityDirective, VisibilitySettings } from "./VisiblityDirective";
import { WaitDirective, WaitSettings } from "./waitDirective";
import { AttributeHandlingDirective, AttributeHandlingSettings } from "./AttributeHandling";
import { LogicDirective, LogicDirectiveSettings } from "./logicDirective";
import { IDirective } from "../abstractions/IDirective";
import { dom } from "../core/Dom";

export type pickValues = {};



export class Directive {
    public textDirective: TextDirective | undefined;
    public htmlDirective: HtmlDirective | undefined;
    public modelDirective: ModelDirective | undefined;
    public loopDirective: LoopDirective | undefined;
    public effectDirective: EffectDirective | undefined;
    public valueDirective: ValueDirective | undefined;
    public displayDirective: VisibilityDirective | undefined;
    public relloadDirective: ReloadDirective | undefined;
    public waitDirective: WaitDirective | undefined;
    public logicDirective: LogicDirective | undefined;
    public attributeDirectives: Map<AttributeHandlingSettings, AttributeHandlingDirective> = new Map();
    public effecttorDirectives: Map<EffectDirectiveSettings, EffectDirective> = new Map();
    public logicDirectives: Map<LogicDirectiveSettings, LogicDirective> = new Map();
    public loopDirectives: Map<LoopDirectiveSettings, LoopDirective> = new Map();
    public WaitInit: boolean = false;
    constructor(public owner: IControl<any, any, any>) {
        this.ChangeTarget = this.ChangeTarget.bind(this);

        ApplicationService.current.Directives.forEach(x => {
            var dir = new x(owner);
            this.register(dir);
        })
    }

    private _directives = new Map<string, IDirective<any>>();

    public register(directive: IDirective<any>) {
        if (directive.name) {


            if (!this._directives.has(directive.name)) {
                this._directives.set(directive.name, directive);
                this[directive.name] = directive.bind;
            } else {
                throw "'" + directive.name + "'" + "Directive already registered.";
            }
        } else {
            throw "Directive required unique name.";
        }
    }

    public Configuration = {
        TextSettings: null as unknown as TextDirectiveSettings,
        ModelSettings: null as unknown as ModelDirectiveSettings,
        LoopSettings: null as unknown as LoopDirectiveSettings,
        HtmlSettings: null as unknown as HtmlDirectiveSettings,
        EffectSettings: null as unknown as EffectDirectiveSettings,
        ValueSettings: null as unknown as ValueDirectiveSettings,
        DisplaySettings: null as unknown as VisibilitySettings,
        ReloadSettings: null as unknown as ReloadSettings,
        WaitSettings: null as unknown as WaitSettings,
        LogicDirectiveSettings: null as unknown as LogicDirectiveSettings
    }

    public dispose() {

        this._directives.forEach(d => {
            d.dispose();
        })

        if (this.Configuration.LoopSettings && this.loopDirective) this.loopDirective.dispose(this.Configuration.LoopSettings, this.Configuration.LoopSettings.fragment);
        if (this.Configuration.TextSettings && this.textDirective) this.textDirective.dispose(this.Configuration.TextSettings, this.owner);
        if (this.Configuration.ModelSettings && this.modelDirective) this.modelDirective.dispose(this.Configuration.ModelSettings, this.owner);

        if (this.Configuration.HtmlSettings && this.htmlDirective) this.htmlDirective.dispose(this.Configuration.HtmlSettings, this.owner);
        //if (this.Configuration.EffectSettings && this.effectDirective) this.effectDirective.dispose(this.Configuration.EffectSettings, this.owner);
        if (this.Configuration.ValueSettings && this.valueDirective) this.valueDirective.dispose(this.Configuration.ValueSettings, this.owner);

        if (this.Configuration.DisplaySettings && this.displayDirective) this.displayDirective.dispose(this.Configuration.DisplaySettings, this.owner);
        if (this.Configuration.ReloadSettings && this.relloadDirective) this.relloadDirective.dispose(this.Configuration.ReloadSettings, this.owner);
        if (this.Configuration.WaitSettings && this.waitDirective) this.waitDirective.dispose(this.Configuration.WaitSettings, this.owner);
        if (this.Configuration.LogicDirectiveSettings && this.logicDirective) this.logicDirective.dispose(this.Configuration.LogicDirectiveSettings, this.owner);
        
        this.loopDirectives.forEach((v, k) => {
            v.dispose(k, k.fragment);
        })
        
        this.attributeDirectives.forEach((v, k) => {
            v.dispose(k, this.owner);
        })
        this.effecttorDirectives.forEach((v, k) => {
            v.dispose(k, this.owner);
        });
        this.effecttorDirectives.clear();
        this.attributeDirectives.clear();
    }
    public hasUsedState(): boolean {
        if (this.Configuration.LoopSettings && this.loopDirective) return true;
        if (this.Configuration.TextSettings && this.textDirective) return true;
        if (this.Configuration.ModelSettings && this.modelDirective) return true;

        if (this.Configuration.HtmlSettings && this.htmlDirective) return true;
        if (this.Configuration.EffectSettings && this.effectDirective) return true;
        if (this.Configuration.ValueSettings && this.valueDirective) return true;

        if (this.Configuration.DisplaySettings && this.displayDirective) return true;
        if (this.Configuration.ReloadSettings && this.relloadDirective) return true;
        if (this.Configuration.WaitSettings && this.waitDirective) return true;
        if (this.Configuration.LogicDirectiveSettings && this.logicDirective) return true;
        if (this.loopDirectives && this.loopDirectives.size > 0) return true;
        if (this.attributeDirectives.size > 0) { return true }
        if (this.effecttorDirectives.size > 0) { return true }
        return false;
    }
    public async init() {

        this._directives.forEach(d => {
            //d.init();
            if (d.Configuration && (d.Configuration.FieldName || d.Configuration.Property || d.Configuration.callback != null)) {
                d.init(d.Configuration, this.owner);
            }
        })

        this.loopDirectives.forEach((v, k) => {
            
            v.init(k, k.fragment);
        })

        if (this.Configuration.LoopSettings && this.loopDirective) this.loopDirective.init(this.Configuration.LoopSettings, this.Configuration.LoopSettings.fragment);
        if (this.Configuration.TextSettings && this.textDirective) this.textDirective.init(this.Configuration.TextSettings, this.owner);
        if (!this.WaitInit && this.Configuration.ModelSettings && this.modelDirective) this.modelDirective.init(this.Configuration.ModelSettings, this.owner);

        if (this.Configuration.HtmlSettings && this.htmlDirective) this.htmlDirective.init(this.Configuration.HtmlSettings, this.owner);
        // if (this.Configuration.EffectSettings && this.effectDirective) this.effectDirective.init(this.Configuration.EffectSettings, this.owner);
        if (!this.WaitInit && this.Configuration.ValueSettings && this.valueDirective) this.valueDirective.init(this.Configuration.ValueSettings, this.owner);

        if (this.Configuration.DisplaySettings && this.displayDirective) this.displayDirective.init(this.Configuration.DisplaySettings, this.owner);
        if (this.Configuration.ReloadSettings && this.relloadDirective) this.relloadDirective.init(this.Configuration.ReloadSettings, this.owner);
        //if (this.Configuration.LogicDirectiveSettings && this.logicDirective) this.logicDirective.init(this.Configuration.LogicDirectiveSettings, this.owner);
        // if (this.Configuration.WaitSettings && this.waitDirective) this.waitDirective.init(this.Configuration.WaitSettings, this.owner);
       

        this.logicDirectives.forEach((v, k) => {
            v.init(k, this.owner);
        })

        this.attributeDirectives.forEach((v, k) => {
            v.init(k, this.owner);

        })
        this.effecttorDirectives.forEach((v, k) => {
            v.init(k, this.owner);
        })
    }

    public async update(prop: any, key: any, type: string) {

    }
    public setup(prop: any, key: any) {

    }

    public text(prop: any, key: string): Directive
    public text(callback: () => void): Directive
    public text(): Directive {

        this.Configuration.TextSettings = new TextDirectiveSettings();
        this.textDirective = new TextDirective();
        if (arguments.length === 2) {
            this.Configuration.TextSettings.Property = arguments[0]
            this.Configuration.TextSettings.FieldName = arguments[1];
            this.Configuration.TextSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.TextSettings.callback = arguments[0];
                this.Configuration.TextSettings.type = "function";
            }
        }

        if (this.owner.isRendered) {
            if (this.Configuration.TextSettings && this.textDirective) this.textDirective.init(this.Configuration.TextSettings, this.owner);
        }

        return this;
    }

    public html(prop: any, key: string): Directive
    public html(callback: () => void): Directive
    public html(): Directive {
        this.Configuration.HtmlSettings = new HtmlDirectiveSettings();
        this.htmlDirective = new HtmlDirective();
        if (arguments.length === 2) {
            this.Configuration.HtmlSettings.Property = arguments[0]
            this.Configuration.HtmlSettings.FieldName = arguments[1];
            this.Configuration.HtmlSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.HtmlSettings.callback = arguments[0].bind(this.owner);
                this.Configuration.HtmlSettings.type = "function";
            }
        }

        if (this.owner.isRendered) {
            if (this.Configuration.HtmlSettings && this.htmlDirective) this.htmlDirective.init(this.Configuration.HtmlSettings, this.owner);
        }
        return this;
    }

    public model(bind: { get: () => any, set: (value) => any }): Directive
    public model(prop: any, key: string): Directive
    public model(callback: () => void): Directive
    public model(getter: () => any, setter: (value) => any): Directive
    public model(): Directive {

        this.Configuration.ModelSettings = new ModelDirectiveSettings();
        this.modelDirective = new ModelDirective();
        if (arguments.length === 2) {

            if (typeof arguments[0] == 'function' && typeof arguments[1] == 'function') {
                this.Configuration.ModelSettings.bind = { get: arguments[0], set: arguments[1] };
                this.Configuration.ModelSettings.type = "model";
            } else {
                this.Configuration.ModelSettings.Property = arguments[0]
                this.Configuration.ModelSettings.FieldName = arguments[1];
                this.Configuration.ModelSettings.type = "expression";
            }


            // var data =isReactive(this.Configuration.ModelSettings.Property ); 
            // console.error('dataA',data)
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.ModelSettings.callback = arguments[0];
                this.Configuration.ModelSettings.type = "function";
                // var data = isReactive(arguments[0]()); 
                // console.error('dataB',data)
            } else if (typeof arguments[0] === 'object') {
                this.Configuration.ModelSettings.bind = arguments[0];
                this.Configuration.ModelSettings.type = "model";
            }
        }
        if (this.owner.isRendered && !this.WaitInit) {
            if (this.Configuration.ModelSettings && this.modelDirective) this.modelDirective.init(this.Configuration.ModelSettings, this.owner);
        }
        return this;
    }

    public bind(bind: { get: () => any, set: (value) => any }): Directive {
        this.Configuration.ModelSettings = new ModelDirectiveSettings();
        this.modelDirective = new ModelDirective();
        if (typeof bind === 'function') {
            this.Configuration.ModelSettings.bind = (bind as any)();
        } else {
            this.Configuration.ModelSettings.bind = bind;
        }

        this.Configuration.ModelSettings.type = "model";

        if (this.owner.isRendered && !this.WaitInit) {
            if (this.Configuration.ModelSettings && this.modelDirective) this.modelDirective.init(this.Configuration.ModelSettings, this.owner);
        }
        return this;
    }


    public value(prop: any, key: string): Directive
    public value(callback: () => void): Directive
    public value(): Directive {
        this.Configuration.ValueSettings = new ValueDirectiveSettings();
        this.valueDirective = new ValueDirective();
        if (arguments.length === 2) {
            this.Configuration.ValueSettings.Property = arguments[0]
            this.Configuration.ValueSettings.FieldName = arguments[1];
            this.Configuration.ValueSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.ValueSettings.callback = arguments[0];
                this.Configuration.ValueSettings.type = "function";
            }
        }
        if (this.owner.isRendered && !this.WaitInit) {

            if (this.Configuration.ValueSettings && this.valueDirective) this.valueDirective.init(this.Configuration.ValueSettings, this.owner);
        }
        return this;
    }

    public loop(prop: any, key: string, itemTemplate: (data: any) => IControl<any, any, any>): Component<any, any>
    public loop(callback: () => void, itemTemplate: (data: any) => IControl<any, any, any>): Component<any, any>
    public loop(): Component<any, any> {


        const __LoopSettings = new LoopDirectiveSettings();
        const __loopDirective = new LoopDirective();

        if (arguments.length === 3) {
            __LoopSettings.Property = arguments[0]
            __LoopSettings.FieldName = arguments[1];
            __LoopSettings.render = arguments[2];
            __LoopSettings.type = "expression";
        }
        else if (arguments.length === 2) {
            if (typeof arguments[0] === 'function') {
                __LoopSettings.callback = arguments[0];
                __LoopSettings.render = arguments[1];
                __LoopSettings.type = "function";
            }
            else if (Array.isArray(arguments[0])) {
                __LoopSettings.callback = () => arguments[0];
                __LoopSettings.render = arguments[1];
                __LoopSettings.type = "function";
            }
        }
        var fr = new Component(dom.createComment('map'), {});
        __LoopSettings.fragment = fr;
        this.owner.controls.add(fr);

        this.loopDirectives.set(__LoopSettings, __loopDirective);

        if (this.owner.isRendered) {
            if (__LoopSettings && __loopDirective) __loopDirective.init(__LoopSettings, fr);
        } 
        return fr; 
    }
    public effect(callback: () => any): Directive {

        var Settings = new EffectDirectiveSettings();
        Settings.callback = callback;
        Settings.type = "function";
        var Directive = new EffectDirective();
        this.effecttorDirectives.set(Settings, Directive);

        // if (this.Configuration.EffectSettings == null) this.Configuration.EffectSettings = new EffectDirectiveSettings();
        // this.effectDirective = new EffectDirective();
        // this.Configuration.EffectSettings.callback = callback;
        // this.Configuration.EffectSettings.type = "function";
        if (this.owner.isRendered) {
            Directive.init(Settings, this.owner);
        }
        return this;
    }
    public watch(callback: () => any): Directive {

        var Settings = new EffectDirectiveSettings();
        Settings.callback = callback;
        Settings.type = "function";
        var Directive = new EffectDirective();
        this.effecttorDirectives.set(Settings, Directive);

        // if (this.Configuration.EffectSettings == null) this.Configuration.EffectSettings = new EffectDirectiveSettings();
        // this.effectDirective = new EffectDirective();
        // this.Configuration.EffectSettings.callback = callback;
        // this.Configuration.EffectSettings.type = "function";
        if (this.owner.isRendered) {
            Directive.init(Settings, this.owner);
        }
        return this;
    }
    public display(prop: any, key: string): Directive
    public display(callback: () => void): Directive
    public display(): Directive {
        this.Configuration.DisplaySettings = new VisibilitySettings();
        this.displayDirective = new VisibilityDirective();
        if (arguments.length === 2) {
            this.Configuration.DisplaySettings.Property = arguments[0]
            this.Configuration.DisplaySettings.FieldName = arguments[1];
            this.Configuration.DisplaySettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.DisplaySettings.callback = arguments[0];
                this.Configuration.DisplaySettings.type = "function";
            }
        }
        if (this.owner.isRendered) {
            if (this.Configuration.DisplaySettings && this.displayDirective) this.displayDirective.init(this.Configuration.DisplaySettings, this.owner);
        }
        return this;
    }

    public reload(prop: any, key: string): Directive
    public reload(callback: () => void): Directive
    public reload(): Directive {
        this.Configuration.ReloadSettings = new ReloadSettings();
        this.relloadDirective = new ReloadDirective();
        if (arguments.length === 2) {
            this.Configuration.ReloadSettings.Property = arguments[0]
            this.Configuration.ReloadSettings.FieldName = arguments[1];
            this.Configuration.ReloadSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.ReloadSettings.callback = arguments[0];
                this.Configuration.ReloadSettings.type = "function";
            }
        }
        if (this.owner.isRendered) {
            if (this.Configuration.ReloadSettings && this.relloadDirective) this.relloadDirective.init(this.Configuration.ReloadSettings, this.owner);
        }
        return this;
    }

    public wait(prop: any, key: string): Directive
    public wait(callback: () => void): Directive
    public wait(): Directive {

        this.Configuration.WaitSettings = new VisibilitySettings();
        this.waitDirective = new WaitDirective();
        if (arguments.length === 2) {
            this.Configuration.WaitSettings.Property = arguments[0]
            this.Configuration.WaitSettings.FieldName = arguments[1];
            this.Configuration.WaitSettings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                this.Configuration.WaitSettings.callback = arguments[0];
                this.Configuration.WaitSettings.type = "function";
            }
        }

        // if (this.owner.isRendered) { 
        //     if (this.Configuration.WaitSettings && this.waitDirective) this.waitDirective.init(this.Configuration.WaitSettings, this.owner);
        // }

        return this;
    }

    public focus(prop: any, key: string): Directive
    public focus(callback: () => void): Directive
    public focus(): Directive {

        var Settings = new AttributeHandlingSettings();
        Settings.attributes.add("focus")
        var Directive = new AttributeHandlingDirective();
        if (arguments.length === 2) {
            Settings.Property = arguments[0]
            Settings.FieldName = arguments[1];
            Settings.type = "expression";
        }
        else if (arguments.length === 1) {
            if (typeof arguments[0] === 'function') {
                Settings.callback = arguments[0];
                Settings.type = "function";
            }
        }
        this.attributeDirectives.set(Settings, Directive);
        if (this.owner.isRendered) {
            Directive.init(Settings, this.owner);
            // if (this.Configuration.WaitSettings && this.waitDirective) this.waitDirective.init(this.Configuration.WaitSettings, this.owner);
        }

        return this;
    }

    public logic(state, cb) {

         
        var fr = new Frame({}); 
        this.owner.controls.add(fr);

        var Settings = new LogicDirectiveSettings();
        Settings.logicalFn = state;
        Settings.callback = cb;
        Settings.type = "function";
        var Directive = new LogicDirective(fr);
        this.logicDirectives.set(Settings, Directive);
        if (this.owner.isRendered) {
            Directive.init(Settings, fr);
        }
 
        return this;
    }

    public computed(a) {
        var r = a();
        if (Array.isArray(r)) {
            r.forEach(rr => {
                if (typeof rr === 'string') {
                    var c = new Component('text');
                    c.setText(rr);
                    this.owner.controls.add(c)
                } else {
                    this.owner.controls.add(rr)
                }

            })
        } else {
            if (typeof r === 'string') {
                var c = new Component('text');
                c.setText(r);
                this.owner.controls.add(c)
            } else {
                this.owner.controls.add(r)
            }

        }


    }

    public ChangeTarget(newOwner: IControl<any, any, any>) {
        this.owner = newOwner;
        this.WaitInit = false;
        // if (this.Configuration.LoopSettings && this.loopDirective) this.loopDirective.init(this.Configuration.LoopSettings, this.Configuration.LoopSettings.fragment);
        //  if (this.Configuration.TextSettings && this.textDirective) this.textDirective.init(this.Configuration.TextSettings, this.owner);
        if (this.Configuration.ModelSettings && this.modelDirective) this.modelDirective.init(this.Configuration.ModelSettings, this.owner);

        // if (this.Configuration.HtmlSettings && this.htmlDirective) this.htmlDirective.init(this.Configuration.HtmlSettings, this.owner);
        // if (this.Configuration.EffectSettings && this.effectDirective) this.effectDirective.init(this.Configuration.EffectSettings, this.owner);
        if (this.Configuration.ValueSettings && this.valueDirective) this.valueDirective.init(this.Configuration.ValueSettings, this.owner);

        // if (this.Configuration.DisplaySettings && this.displayDirective) this.displayDirective.init(this.Configuration.DisplaySettings, this.owner);
        // if (this.Configuration.ReloadSettings && this.relloadDirective) this.relloadDirective.init(this.Configuration.ReloadSettings, this.owner);
        // if (this.Configuration.LogicDirectiveSettings && this.logicDirective) this.logicDirective.init(this.Configuration.LogicDirectiveSettings, this.owner);
        // if (this.Configuration.WaitSettings && this.waitDirective) this.waitDirective.init(this.Configuration.WaitSettings, this.owner);

        // this.attributeDirectives.forEach((v, k) => {
        //     v.init(k, this.owner);

        // })
        // this.effecttorDirectives.forEach((v, k) => {
        //     v.init(k, this.owner);
        // })

    }

    public custom(name: string, bind: { get: () => any, set: (value) => any }): Directive
    public custom(name: string, callback: () => void): Directive
    public custom(name: string, getter: () => any, setter: (value) => any): Directive
    public custom(name: string, prop: any, key: string): Directive
    public custom(): Directive {
        if (this._directives.has(arguments[0])) {
            var dr = this._directives.get(arguments[0]);
            if (dr) {

                if (arguments.length === 2) {
                    if (typeof arguments[1] === 'function') {
                        dr.Configuration = {
                            callback: () => arguments[1],
                            FieldName: '',
                            Property: '',
                            type: 'function'
                        }
                    } else if (typeof arguments[1] === 'object') {
                        dr.Configuration = {
                            callback: () => arguments[1],
                            FieldName: '',
                            Property: '',
                            type: 'model'
                        }
                    }
                } else if (arguments.length === 3) {
                    if (typeof arguments[1] === 'function') {
                        dr.Configuration = {
                            callback: () => { return { get: arguments[1], set: arguments[2] } },
                            FieldName: '',
                            Property: '',
                            type: 'model'
                        }
                    } else {
                        dr.Configuration = {
                            callback: () => { },
                            FieldName: arguments[1],
                            Property: arguments[2],
                            type: 'expression'
                        }
                    }
                }
                if (this.owner.isRendered) {
                    dr.init(dr.Configuration, this.owner);
                }
            }
        }
        return this;
    }


}
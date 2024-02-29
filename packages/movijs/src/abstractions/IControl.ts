
import { Collection, controlAttribute, styleKeys } from "../core";
import { ElementTypes } from "../core/controlAttribute";
import { controlStyle } from "../core/controlStyle";
import { Directive } from "../directive";
import { CommonEventHandlers } from "./CommonEventHandlers";
import { IApplicationService } from "./IApplicationService";
import { IClass } from "./IAttribute";

export interface baseeventargs {
    data: any,
    field: string,
    source: string
}


export interface ControlProps<caller, Props> extends CommonEventHandlers {
    props?: Props;
    extend?: any;
    slots?: IControl<any, any, any>[];
    oncreating?: (sender: caller) => any;
    oncreated?: (sender: caller) => any;
    onbuilding?: (sender: caller) => any;
    onbuilded?: (sender: caller) => any;
    ondisposing?: (sender: caller) => any;
    ondisposed?: (sender: caller) => any;
    onconfig?: (sender: caller) => any;
    setup?: (sender: caller) => any;
    view?();
    onshow?(sender: caller): void;
    onhide?(sender: caller): void;
    onupdating?(sender: caller, e: baseeventargs): void;
    onupdated?(sender: caller, e: baseeventargs): void;
    initializeComponent?(sender: caller);
    renderTo?: any; 
}


export interface IComponentProps<Props> {
    props?: Props;
    extend?: any;
    oncreating?(sender: this);
    oncreated?(sender: this);
    onbuilding?: (sender: this) => any;
    onbuilded?: (sender: this) => any;
    ondisposing?: (sender: this) => any;
    ondisposed?: (sender: this) => any;
    onconfig?: (sender: this) => any;
    setup?: (sender: this) => any;
    view?(context: this);
    onshow?(sender: this): void;
    onhide?(sender: this): void;
    onupdating?(sender: this, e: baseeventargs): void;
    onupdated?(sender: this, e: baseeventargs): void;
    initializeComponent?(sender: this);
}


export type baseemits = "onbuilded" | "onbuilding" | "onconfig" | "oncreating" | "oncreated" | "ondisposing" | "ondisposed" | "onmounted" | String | Symbol;
export interface IControl<ElementType extends ElementTypes, Props, caller> extends ControlProps<caller, Props>, ControlProps<caller, Props> {
    props?: Props;
    bind: Directive;
    isFragment: boolean;
    slots?: IControl<any, any, any>[];
    name?: string;
    reload?: (() => caller) | undefined;
    context: IApplicationService;
    controls: Collection<IControl<any, any, any>>
    parent: IControl<ElementTypes, any, any>;
    element: ElementType;
    attr: controlAttribute<ElementType>;
    class: IClass<ElementType>;
    isRendered: boolean;
    isDisposed: boolean;
    isConnected: boolean;
    isVisible: Boolean;
    genetic: any;
    options: {
        authorize: boolean,
        headers: Object,
        settings: object,
        autostyle: controlStyle<ElementType>,
        ssrElementId:number,
        transition: {
            name: string
        }
        config: {
            argSource: object,
            propSource: object
        }
    }
    build(target?: any);
    dispose(cb?): Promise<any>;
    flush();
    clear();
    show();
    hide();
    signal(eventName: string | symbol, cb: (...args) => any, ...initialValues);
    on(event: baseemits, callback: (sender, ...args) => void, domEvent: boolean);
    off(event: baseemits, callback: (sender, ...args) => void, domEvent: boolean);
    invoke(event: baseemits, ...args);
    addHandler(event: string, callback: (e: Event | UIEvent | any, sender: IControl<ElementType, Props, caller>) => any): IControl<ElementType, Props, caller>;
    removeHandler(event: string): IControl<ElementType, Props, caller>;

    style(properties: styleKeys | string): IControl<ElementType, Props, caller>;

    view?(): any;
    using<T>(waitable: Promise<any>, onfulfilled?: ((value: T) => T | PromiseLike<T>) | undefined | null, onrejected?: ((reason: any) => never | PromiseLike<never>) | undefined | null);
    useModel<T extends object>(model: T): T
    useModel(model: object);
    getView(viewname: Promise<any>, model): Promise<any>;
    $(selector: string): any;
    onshow?(sender: caller): void;
    onhide?(sender: caller): void;
    onChildAdded?(sender: this, child: any, index: number);
    onChildRemoved?(sender: this, child: any);
    getFirstElement(): IControl<any, any, any>;

    doWork<T>(waitable: Promise<T> | PromiseLike<T>): Promise<T>
}
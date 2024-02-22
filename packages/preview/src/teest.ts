// import { IFxMapper, getRaw, pauseTracking, resetTracking,Bindable } from "movijs";
// import { BaseProp, Component } from "movijs"; 
// import { IDirective } from "movijs";

// export interface LoopContainerProps<T> {
//     itemSource: () => T[],
//     keyExpr?: string,
//     template(data: T): Component<any, any>;
//     el?: string
// }


// export class LoopContainerDirectiveSettings {
//     public Property!: object;
//     public FieldName!: string;
//     public callback!: () => any;
//     public type: "function" | "expression" = "function";

// }

// export class LoopContainerDirective implements IDirective<LoopContainerDirectiveSettings>{
//     awaiableSetup: boolean = false;
//     id: any;
//     isArray: boolean = false;
//     Bindabler?: Bindable | undefined;
//     FxMapper: IFxMapper = null as any;
//     private _settings: LoopContainerDirectiveSettings = null as any;
//     private _source: LoopContainer<any> = null as any;
//     constructor() {
//         this.getData = this.getData.bind(this);
//         this.init = this.init.bind(this);
//         this.dispose = this.dispose.bind(this);
//         this.setup = this.setup.bind(this);
//         this.removeDom = this.removeDom.bind(this);
//         this.start = this.start.bind(this);
//         new Bindable(this);
//     }
//     getData(val) {
//         if (!this._source || this._source.isDisposed) { return }
//         var val = this._settings.callback();
//         this._source.removeUnlisted(val);
//         if (Array.isArray(val)) {
//             val.forEach((item, index) => this._source.renderItem(item, index));
//         }
//     }
//     start() {

//     }

//     update() {

//     }
//     setupCompleted = false;
//     times;
//     setup(target, key) {
//     }
//     init(settings: LoopContainerDirectiveSettings, Source: LoopContainer<any>): void {
//         this._settings = settings;
//         this._source = Source;
//         this.start = this.start.bind(this);
//         this.update = this.update.bind(this);
//         this.dispose = this.dispose.bind(this);
//         this.setup = this.setup.bind(this);
//         this.FxMapper.run(this.getData);
//     }
//     disposed: boolean = false;
//     dispose(settings: LoopContainerDirectiveSettings, Source: LoopContainer<any>) {
//         this.Bindabler && this.Bindabler.fxm.dispose();
//         this.Bindabler = undefined;
//         this._source = null as any;
//         this._settings = null as any;
//         this.disposed = true;
//     }
//     removeDom() {
//         if (this._source && !this._source.isDisposed) {
//             this._source.dispose();
//         }
//     }
// }

// export class LoopContainer<T> extends Component<HTMLElement, LoopContainerProps<T>> {
//     directive?: LoopContainerDirective;
//     directiveSettings?: LoopContainerDirectiveSettings;
//     constructor(props: BaseProp<LoopContainerProps<T>>) {
//         super(props.props?.el ? props.props.el : "", props);

//         // if (props.props && props.props.el) {
//         //     super(props.props.el, props);
//         // } else {
//         //     super(props);
//         // }

//     }
//     onbuilded(sender: Component<HTMLElement, LoopContainerProps<T>>) {
//         this.directiveSettings && this.directive?.init(this.directiveSettings, this);
//     }
//     ondisposing(sender: Component<HTMLElement, LoopContainerProps<T>>) {
//         this.directiveSettings && this.directive?.dispose(this.directiveSettings, this);
//     }
//     setup(sender?: Component<HTMLElement, LoopContainerProps<T>> | undefined) {
//         this.directive = new LoopContainerDirective();
//         this.directiveSettings = new LoopContainerDirectiveSettings();

//         this.directiveSettings.callback = this.props.itemSource;
//         this.directiveSettings.type = 'function';

//         // this.bind.loop(this.props.itemSource, (item) => {
//         //     var c = this.props.template(item);
//         //     if (this.props.keyExpr) {
//         //         var k = this.props.keyExpr ? this.props.keyExpr : "";
//         //         c.options.settings['oi'] = item[k];
//         //         c.options.settings['ni'] = () => item[k];
//         //     }
//         //     return c;
//         // })
//     }

//     removeUnlisted(items: T[]) {
//         pauseTracking()
//         if (Array.isArray(items)) {
//             var newItems = items.map(x => getRaw(x));
//             var odlItems = this.controls.map(t => { return { key: getRaw(t.elementData), item: t } })
//             var dif = odlItems.filter(x => {
//                 return !newItems.includes(x.key)
//             })
//             dif.forEach(async element => {
//                 this.parent && this.parent.onChildRemoved && this.parent.onChildRemoved(this.parent, element.item);
//                 await element.item.dispose();
//             })
//         }
//         resetTracking()
//     }

//     renderItem(data: T, index) {
//         var exist = this.controls.find(x => x['elementData'] == data);
//         if (exist) {
//             debugger
//             var indexOf = this.controls.indexOf(exist);
//             if (indexOf != index) {

//                 var pa = this.controls[index].element.parentElement;
//                 if (index >= this.controls.length) {
//                     pa.append(exist.element)
//                 } else {
//                     pa.insertBefore(this.controls[index].element, exist.element)
//                 }
//                 //this.controls.insert(index, exist);
//                 //this.controls[index].element.before(exist.element);
//             }
//         } else {
//             var x = this.props.template(data);
//             x['elementData'] = data;
//             this.controls.insert(index, x);
//         }
//     }
// }
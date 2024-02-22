import { ControlCollectionList, IControl, IFxMapper, getRaw, pauseTracking, resetTracking } from "..";
import { BaseProp, Component } from "../Component";
import Bindable from "../Reactive/Bindable";
import { IDirective } from "../abstractions/IDirective";

export interface LoopContainerProps<T> {
    itemSource: () => T[],
    keyExpr: string,
    template(data: T): Component<any, any>;
    el?: string,
}


export class LoopContainerDirectiveSettings {
    public Property!: object;
    public FieldName!: string;
    public callback!: () => any;
    public type: "function" | "expression" = "function";
    public load!: () => any;

}

export class LoopContainerDirective implements IDirective<LoopContainerDirectiveSettings>{
    awaiableSetup: boolean = false;
    id: any;
    isArray: boolean = false;
    Bindabler?: Bindable | undefined;
    FxMapper: IFxMapper = null as any;
    private _settings: LoopContainerDirectiveSettings = null as any;
    private _source: LoopContainer<any> = null as any;
    constructor() {
        this.getData = this.getData.bind(this);
        this.init = this.init.bind(this);
        this.dispose = this.dispose.bind(this);
        this.setup = this.setup.bind(this);
        this.removeDom = this.removeDom.bind(this);
        this.start = this.start.bind(this);
        new Bindable(this);
    }
    private _old;
    async getData(val) {
        if (!this._source || this._source.isDisposed) { return }

        var val = this._settings.load();
        var json = JSON.stringify(val);
        if (json != this._old) {
            this._old = json;
            await this._source.removeUnlisted(val);

            var placeholder = new DocumentFragment();

            if (Array.isArray(val)) {
                val.forEach((item, index) => {
                    var el = new Component('div');
                    el.element['listData'] = item;
                });
            }

            if (Array.isArray(val)) {
                val.forEach((item, index) => this._source.renderItem(item, index, val));
            }

            //     for (let index = 0; index <  this._source.controls.length; index++) {
            //         var oldindex = this._source.controls.find(t => t.element.index == index);
            //         console.error(oldindex.element.index, index,oldindex);
            //     }
            //     // this._source.controls.forEach((item, index) => {

            //     //     // var check = this._source.element.childNodes.item(index) != item.element;
            //     //     // if (check) {
            //     //     //     this._source.element.appendChild(item.element);
            //     //     //     console.warn(item.element);
            //     //     // }

            //     // })
        }
        // this._source.removeUnlisted(val);

        // if (Array.isArray(val)) {
        //     val.forEach((item, index) => this._source.renderItem(item, index, val));
        // }
    }
    start() {

    }

    update() {

    }
    setupCompleted = false;
    times;
    setup(target, key) {
    }
    init(settings: LoopContainerDirectiveSettings, Source: LoopContainer<any>): void {
        this._settings = settings;
        this._source = Source;
        this.FxMapper.run();

    }
    disposed: boolean = false;
    dispose(settings: LoopContainerDirectiveSettings, Source: LoopContainer<any>) {
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

export class LoopContainer<T> extends Component<HTMLElement, LoopContainerProps<T>> {
    directive?: LoopContainerDirective;
    directiveSettings?: LoopContainerDirectiveSettings;
    elementCreating(current: any ) {
        // if (props.el) {
        //     return props.el as any
        // }
        return current as any;
    }
    constructor(props: BaseProp<LoopContainerProps<T>>) {
        super(props);

        // if (props.props && props.props.el) {
        //     super(props.props.el, props);
        // } else {
        //     super(props);
        // }

    }


    onbuilded(sender: Component<HTMLElement, LoopContainerProps<T>>) { 
        this.directiveSettings && this.directive?.init(this.directiveSettings, this);
    }
    ondisposing(sender: Component<HTMLElement, LoopContainerProps<T>>) {
        this.directiveSettings && this.directive?.dispose(this.directiveSettings, this);
    }
    setup(sender?: Component<HTMLElement, LoopContainerProps<T>> | undefined) {
        this.directive = new LoopContainerDirective();
        this.directiveSettings = new LoopContainerDirectiveSettings();

        this.directiveSettings.load = this.props.itemSource;
        this.directiveSettings.type = 'function';

        // this.bind.loop(this.props.itemSource, (item) => {
        //     var c = this.props.template(item);
        //     if (this.props.keyExpr) {
        //         var k = this.props.keyExpr ? this.props.keyExpr : "";
        //         c.options.settings['oi'] = item[k];
        //         c.options.settings['ni'] = () => item[k];
        //     }
        //     return c;
        // })
    }

    async removeUnlisted(items: T[]) {
        pauseTracking()
        if (Array.isArray(items)) {
            var newItems = items.map(x => getRaw(x));
            var odlItems = this.controls.map(t => { return { key: getRaw(t.elementData), item: t } })
            var dif = odlItems.filter(x => {
                return !newItems.includes(x.key)
            })
            await dif.forEach(async (element) => {
                this.parent && this.parent.onChildRemoved && this.parent.onChildRemoved(this.parent, element.item);
                await element.item.dispose();
            })
        }
        resetTracking()
        return null;
    }

    async renderItem(data: T, index, array: T[]) {
        var exit = this.controls.find(x => { return getRaw(x.elementData) === getRaw(data) });

        if (exit) {

            // var parentArray = Array.prototype.slice.call(exit.element.parentElement.childNodes);
            // var domIndex = parentArray.indexOf(exit.element);
            // var controlIndex = this.controls.indexOf(exit);
            // console.warn(domIndex, index, controlIndex, data);
            // if (controlIndex != domIndex) {

            // exit['insertTo'] = index;
            // await exit.build();
            // this.controls.move(this.controls.indexOf(exit), index);
            //   }

            // var indexChanged = false;
            // var _settings = exit?.options?.settings;
            // if (_settings) {
            //     var ni = typeof _settings['ni'] == 'function' ? _settings['ni']() : _settings['ni'];
            //     var oi = _settings['oi'];
            //     if ((ni != undefined && oi != undefined) && ni != oi && this.controls.indexOf(exit) != index) {
            //         indexChanged = true;
            //     } else if (ni == undefined || oi == undefined) {
            //         if (this.controls.indexOf(exit) != index) {
            //             indexChanged = true;
            //         }
            //     }
            // } else { indexChanged = true; }

            // if (indexChanged) {
            //     // exit['insertTo'] = index;
            //     // exit.options.settings['oi'] = data[this.props.keyExpr];
            //     // this.build();
            //     // this.controls.move(this.controls.indexOf(exit), index);

            await exit.dispose();
            var x = this.props.template(data);
            x.options.settings['oi'] = data[this.props.keyExpr];
            x.options.settings['ni'] = () => data[this.props.keyExpr];

            x.element.index = index;
            x['elementData'] = data;
            x['insertTo'] = index;
            this.controls.insert(index, x);
            // }
        } else {
            var x = this.props.template(data);
            x.element.index = index;
            x.element.elementData = index;
            x.options.settings['oi'] = data[this.props.keyExpr];
            x.options.settings['ni'] = () => data[this.props.keyExpr];
            x['elementData'] = data;
            x['insertTo'] = index;
            this.controls.insert(index, x);
        }
    }
}

 
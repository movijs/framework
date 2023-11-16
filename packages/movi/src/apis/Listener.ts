import { BaseProp, Component } from "../Component";
import { MoviComponent } from "../ComponentBase";

export function promises<T>(lazy: Promise<T>): Promise<T> {
    return lazy
}

interface ListenerProps {
    loader?: Component,
    childs?: any[]
}
export class Listener extends Component<any, ListenerProps> {
    constructor(props: BaseProp<ListenerProps>) {
        super(props);
    }

    extractFunction(source) {
        if (typeof source == 'function') {
            var result = (source as Function)();
            if (typeof result == 'function') {
                return this.extractFunction(result);
            } else {
                return result;
            }
        }
    }

    getDefault(source) {
        if (typeof source['default'] === "function") {
            return source.default;
        }
        return source
    }

    setup(sender: Component<any, ListenerProps>) {

        if (this.props.loader) {
            this.add(this.props.loader)
        }
        var all = <any>[];
        if (this.slots) { all.push(...this.slots) }
        if (this.props.childs) { all.push(...this.props.childs) }
        this.slots && Promise.all(all).then(async c => {
            const res = <any>[];
            if (this.isDisposed) { return }
            await c.forEach(async comp => {
                var element;
                if (typeof comp == 'function') {
                    element = this.extractFunction(comp);
                } else {
                    element = comp;
                }
                element = this.getDefault(element);
                if (element instanceof Promise) {
                    const _plc = new Component({});
                    await element.then(async x => {
                        _plc.add(await x.default);
                    })
                    res.push(_plc);
                } else {
                    res.push(element);
                }

            });
            if (this.isDisposed) { return }
            return res;
        }).then(t => {
            if (this.isDisposed) { return }  
            this.add(...t);
            if (this.props.loader) { this.props.loader.dispose() }
        })

    }
}
import { Component } from "./Component";
import { ControlProps, IControl } from "./abstractions";


export interface SlotProp extends ControlProps<any, any> {
    source?: Component<any, any> | Component<any, any>[] | IControl<any, any, any> | IControl<any, any, any>[] | Function;
}

export class Slot extends Component<any, SlotProp> {
    constructor(props: SlotProp) {
        super({ props: props });
        if (props.source) {
            if (Array.isArray(props.source)) {
                this.bind.loop(() => props.source, d => {
                    return d;
                })
            } else if (typeof props.source === 'function') {
                this.bind.loop(() => {
                    var data = (props.source as any)();
                    if (Array.isArray(data)) {
                        return data;
                    }
                    return [data];
                }, d => {
                    return d;
                })
            } else {
                props.source && this.add(props.source)
            }
        }
    }
} 
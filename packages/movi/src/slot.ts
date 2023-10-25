import { Component } from "./Component";
import { ControlProps, IControl } from "./abstractions";

 
export interface SlotProp extends ControlProps<any,any>{ 
    source?:Component<any, any> | Component<any, any>[]|IControl<any, any,any> | IControl<any, any,any>[]
}

export class Slot extends Component<any,SlotProp> {
    constructor(props:SlotProp) {
        super({props:props});
        if (props.source) {
            if (Array.isArray(props.source)) {
                props.source && this.add(...props.source)
            } else {
                props.source && this.add(props.source)
            }
        }
    }
} 
import { Component, MoviComponent } from "movijs";
export interface Deneme {
    name: string
}
export class Test extends Component<HTMLDivElement, Deneme>{
    constructor(props) {
        super(props);
        
    }
    view(): Component<any, any> {
        return <div></div>
    }
    onconfig(sender: Component<HTMLDivElement, { name: any; }>) {
        this.view().props.name
    }
}
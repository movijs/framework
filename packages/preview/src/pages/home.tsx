
import { BaseProp, Component, ContentBlock, ContentBody, MoviComponent, cache } from "movijs";
import { Test } from "../component/test.jsx";
import View from "./view.jsx";


export class SlotDemo extends Component {
    constructor(props: BaseProp<any>) {
        super(props)
        this.add(...this.props.slots)
    }
}
//anchor:RouterLink
export default class HomePage extends Component<any, any> {
    constructor() {
        super('div');
        // debugger
        //new moviCompiler.default.Compiler().start(`<div {...this.model}></div>`, "deneme.tsx"); 
        this.options.transition.name = "fade";

    }
    oncreating(sender: Component<any, any>) {
        sender.options.settings.symbol = Symbol('x');

    }
    cacheData = cache.get<any>("x");
    model = this.useModel({
        count: 0,
        items: [
            { order: 6, name: 'A0' },
            { order: 1, name: 'A1' },
            { order: 2, name: 'A2' },
            { order: 3, name: 'A3' },
            { order: 4, name: 'A4' }
        ],
        abbas: null,
        todo: [
            { title: 'A1', completed: false },
            { title: 'A2', completed: false },
            { title: 'A3', completed: false },
            { title: 'A4', completed: false },
            { title: 'A5', completed: false },
            { title: 'A6', completed: true },
            { title: 'A7', completed: true },
            { title: 'A8', completed: true },
            { title: 'A9', completed: true },
            { title: 'A10', completed: true }
        ]
    })

    onRefCreated(sender: MoviComponent<any, any, any>) {

    }
    view() {

        return <div>
            <SlotDemo>
                <div>Internal Items</div>
            </SlotDemo>
            <ContentBlock target="normal">
                <h1>A</h1>
            </ContentBlock>
            <ContentBlock target="anormal">
                <h1>B</h1>
            </ContentBlock>
            <ContentBlock target="expr">
                <h1>C</h1>
            </ContentBlock>
            <div>
                NORMAL
                <ContentBody name="normal"></ContentBody>
            </div>
            <div>
                anormal
                <ContentBody name="anormal"></ContentBody>
            </div>
            <div>
                EXPRESSIONED
                <ContentBody name="expr"></ContentBody>
            </div>
        </div>
    }

}
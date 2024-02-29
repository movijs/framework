
import { Component, ReactiveEngineMapper, reactiveListeners, ContentBlock, ContentBody, RouterLink, ApplicationService } from "movijs";

export default class HomePage extends Component<any, any> {
    constructor() {
        super('div');
        this.options.transition.name = "fade";


    }



    model = this.useModel({
        count: 0,
        items: [
            { order: 6, name: 'A0' },
            { order: 1, name: 'A1' },
            { order: 2, name: 'A2' },
            { order: 3, name: 'A3' },
            { order: 4, name: 'A4' }
        ],
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
    view() {

        return <>
            <ContentBody name="deneme"></ContentBody>

            <RouterLink to={`/${this.context.route.params.lang}`}>HOME</RouterLink> | <RouterLink to={`/${this.context.route.params.lang}/about`}>ABOUT</RouterLink>
            {this.context.route.params.page}
        </>
    }
}
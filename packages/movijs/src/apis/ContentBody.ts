import { ApplicationService } from "../ApplicationService";
import { BaseProp, Component } from "../Component";
import { Frame } from "../Frame";


const ContentBodyCollection = new Map<string, ContentBody>();
const ContentBodyCollectionHandable = new Map<string, ContentBody>();
const changeBodyCollectionHandler = Symbol('changeBodyCollectionHandler')
Object.defineProperty(ContentBodyCollection, 'set', {
    writable: false,
    configurable: true,
    enumerable: false,
    value: (s, x) => {
        ContentBodyCollectionHandable.set(s, x);
        ApplicationService.current.send(changeBodyCollectionHandler);
    }
})


interface ContentBlockProps {
    target: string
}
export class ContentBlock extends Component<any, ContentBlockProps> {
    constructor(props: ContentBlockProps) {
        super(null, props);
    }
    // onChildAdded(sender: this, child: Component<any, any>, index: number) {
    //     var cb = ContentBodyCollectionHandable.get(this.props.target);
    //     if (cb) { 
    //         cb.add(child);
    //     }
    //     console.warn('Added')
    // }
    setup(sender: Component<HTMLElement, any>) {
        var cb = ContentBodyCollectionHandable.get(this.props.target);
        var isCompleted = false;
        if (cb) {
            if (this.slots) {
                if (cb.props.disableMultiContent != true) {
                    cb.clear();
                }
                cb.add(...this.slots);
            }
            cb.add(...this.controls);
        } else {
            this.signal(changeBodyCollectionHandler, () => {
                if (isCompleted) { return }
                isCompleted = true;
                var cb = ContentBodyCollectionHandable.get(this.props.target);
                if (cb) {
                    if (this.slots) {
                        if (cb.props.disableMultiContent != true) {
                            cb.clear();
                        }
                        cb.add(...this.slots)
                    }
                    cb.add(...this.controls);
                }
            })
        }
    }
    ondisposing(sender: Component<any, ContentBlockProps>) {
        if (this.slots) {
            this.slots.forEach(s => { s.dispose() })
        }
    }
}
interface ContentBodyProps {
    name: string,
    disableMultiContent?: boolean
}
export class ContentBody extends Component<any, ContentBodyProps> {
    constructor(props: ContentBodyProps) {
        super(null, props);
        ContentBodyCollection.set(this.props.name, this);
    }
    ondisposing(sender: Component<any, ContentBodyProps>) {
        ContentBodyCollectionHandable.delete(this.props.name);
    }
}
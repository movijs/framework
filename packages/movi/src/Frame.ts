import { IControl } from "./abstractions";
import { ApplicationService } from "./ApplicationService";
import { Component } from "./Component";
export class Frame extends Component<any, any>{
    public current: IControl<any,any,any> | null = null;
    isBusy: boolean = false;
    onmounted(sender) {
        if (sender.context.ControlCollection.has(sender.parent)) {
            sender.context.ControlCollection.delete(sender.parent)
        }
        sender.context.ControlCollection.set(sender.parent, sender);
    }

    public async dispose() {
        this.context.ControlCollection.delete(this.parent);
        this.context.ControlCollection.delete(this);
        if (this.current != null) {
            await this.current.dispose();
        }
        await super.dispose();
    }
    public async flush() {
        if (this.current != null) {
            this.current.dispose();
        }
        super.flush();
    }
    public async clear() {
        if (this.current != null) {
            this.current.dispose();
        }
        super.clear();
    } 
    constructor() {
        super(document.createComment(''), { settings: { isRouterView: true } });
        this.isFragment = true;
        (this as any)._.isMainComponent = true;

    }
    previouspage;
    currentlist = new Set();
    public async navigate(page: IControl<any,any,any>) {
        if (page == null) { return }
        if (this.isBusy == true) { return };
        if (this.current !== null && this.current === page) {
            return
        }

        this.isBusy = true;
        page.parent = this;


        const complete = () => {
            this.current = page;
             
            try {
                page.build();
                if (page['nodes']) {
                    page['nodes'].forEach(async c => {
                        c.parent = this;
                        if (!c.isRendered) {
                            c.build();
                        }
                    })
                }
                

            } catch (error) {
                console.error(error)
            }
            this.isBusy = false; 
            this.previouspage = page; 
        }

        if (this.current != null) {
            this.current.dispose(() => {
                complete();
            });
        } else {
            complete();
        }
    }
}

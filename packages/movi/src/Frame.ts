import { IControl } from "./abstractions";
import { Component } from "./Component";
export class Frame extends Component<any, any>{
    public current: IControl<any, any, any> | null = null;
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
        super(document.createComment('f'), { settings: { isRouterView: true } });
        this.isFragment = true;
        (this as any)._.isMainComponent = true;

    }
    previouspage;
    currentlist = new Set();
    public async navigate(page: IControl<any, any, any>, keepOldControl: boolean = false) {
        if (page == null) { return }
        if (this.isBusy == true) { return };
        if (this.current !== null && this.current === page) {
            return
        }

        this.isBusy = true;
        page.parent = this;

        var expandFunction = (f) => {
            if (typeof f === 'function') {
                return expandFunction(f())
            } else {
                return f;
            }
         }

        const complete = () => {
            var xP = expandFunction(page);
            this.current =xP;

            try {
                xP.build();
                if (xP['nodes']) {
                    xP['nodes'].forEach(async c => {
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
            this.previouspage = xP;
        }

        if (this.current != null && !keepOldControl) {
            if (!this.current.isDisposed) {
                this.current.dispose(() => {
                    complete();
                });
            } else {
                complete();
            }
        } else {
            complete();
        }
    }
}

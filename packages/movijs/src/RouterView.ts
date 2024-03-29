import { IControl } from "./abstractions";
import { ApplicationMiddleware, ApplicationService } from "./ApplicationService";
import { Component } from "./Component";
import { dom } from "./core/Dom";
import { getTransitionInfoFromElement } from "./core/transition";
export let isBusy: boolean = false;
export class RouterView extends Component<any, any>{
    public current: IControl<any, any, any> | null = null;
    private isNavigated: boolean = false;
    private currentUri = "";
    genetic: any = null;
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
        super(dom.createComment('rw'), { isRouterView: true });
        this.isFragment = true;
        (this as any)._.isMainComponent = true;
    }
    previouspage;
    currentlist = new Set();
    public async navigate(page: IControl<any, any, any>) {
        if (page == null) { return }
        if (isBusy == true) { return };
        if (this.current !== null && this.current === page) {
            return
        }

        isBusy = true;
        page.parent = this;


        const complete = () => {
            this.current = page;

            ApplicationService.current['lastPage'] = page;
            try {
                this.add(page)
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
            this.currentUri = page.context.route.path;
            this.isNavigated = true;


            if (this.previouspage && !this.previouspage.isDisposed) {
                var connected = this.previouspage.element;
            } else {
                this.previouspage = page;
            }
            isBusy = false;
        }
        if (this.current != null) {
            // try {
            //     (this.current as any)._.methods.addLeaveTransition();
            //     (this.current as any)._.methods.waitTransition('leave',() => {
            //         this.current?.dispose(() => { });
            //         complete();
            //     });
            // } catch (error) {
            //     this.current?.dispose(() => { });
            //     complete();
            // } 
            if (this.options.transition.name != '' && this.options.transition.name != null && this.options.transition.name != undefined) {
                this.current.options.transition.name = this.options.transition.name;
            }
            await this.current?.dispose();
            complete();
        } else {
            complete();
        }
    }
}

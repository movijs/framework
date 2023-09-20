import { IControl } from "./abstractions";
import { ApplicationMiddleware, ApplicationService } from "./ApplicationService";
import { Component } from "./Component";
import { getTransitionInfoFromElement } from "./core/transition";
export let isBusy: boolean = false;
export class RouterView extends Component<any, any>{
    public current: IControl<any, any, any> | null = null;
    private isNavigated: boolean = false;
    private currentUri = "";
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
        super(document.createComment('router-view'), { settings: { isRouterView: true } });
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
           ;
            ApplicationService.current['lastPage'] = page;

            try { 
                this.add(page)
                if (page['nodes']) {
                    page['nodes'].forEach(async c => {
                        c.parent = this;
                        //*****this.parent.element.insertBefore(c.element, this.element);
                        if (!c.isRendered) {
                            c.build();
                        }
                    })
                } else {
                    //****this.parent.element.insertBefore(page.element, this.element);
                } 
                //(page as any)._.addEnterTransition();

                // (page as any)._.methods.waitTransition('enter', () => {

                // });

            } catch (error) {
                console.error(error)
            }

            // if (this.currentUri != this.context.route.path) {
            //     this.context.internal.notify('routeChanged')
            // }
            this.currentUri = page.context.route.path;
            this.isNavigated = true;


            if (this.previouspage && !this.previouspage.isDisposed) {

                var connected = this.previouspage.element;
                // this.previouspage.dispose();
                //debugger;
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
            this.current?.dispose(() => {complete(); });
            
        } else {
            complete();
        }
    }
}

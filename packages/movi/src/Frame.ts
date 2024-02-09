import { IControl } from "./abstractions";
import { Component } from "./Component";
import { dom } from "./core/Dom";
export class Frame extends Component<any, any>{
    public current: IControl<any, any, any> | null = null;
    isBusy: boolean = false; 
    public async dispose() {
        // this.context.ControlCollection.delete(this.parent);
        // this.context.ControlCollection.delete(this);
        if (this.current != null) {
            if (Array.isArray(this.current)) {
                await this.current.forEach(async xr => {
                    if (!xr.isDisposed) {
                        await xr.dispose();
                    }
                })
            } else if (this.current && !this.current.isDisposed) {
                await this.current.dispose();
            }
        }
        await super.dispose();
    }
    public async flush() {
        if (this.current != null) {

            if (Array.isArray(this.current)) {
                await this.current.forEach(async xr => {
                    if (!xr.isDisposed) {
                        await xr.dispose();
                    }
                })
            } else if (this.current && !this.current.isDisposed) {
                this.current.dispose();
            }
        }
        super.flush();
    }
    public async clear() {
        if (this.current != null) {
            if (Array.isArray(this.current)) {
                await this.current.forEach(async xr => {
                    if (!xr.isDisposed) {
                        await xr.dispose();
                    }
                })
            } else {
                this.current.dispose();
            }
        }
        super.clear();
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
            this.current = xP;

            try {
                if (Array.isArray(xP)) {
                    xP.forEach(x => {
                        x.build();
                        if (x['nodes']) {
                            x['nodes'].forEach(async c => {
                                c.parent = this;
                                if (!c.isRendered) {
                                    c.build();
                                }
                            })
                        }
                    })
                } else {
                    xP.build();
                    if (xP['nodes']) {
                        xP['nodes'].forEach(async c => {
                            c.parent = this;
                            if (!c.isRendered) {
                                c.build();
                            }
                        })
                    }
                }

            } catch (error) {
                console.error(error)
            }
            this.isBusy = false;
            this.previouspage = xP;
        }

        if (this.current != null && !keepOldControl) {
            if (Array.isArray(this.current)) {
                this.current.forEach(xr => {
                    if (!xr.isDisposed) {
                        xr.dispose();
                    }
                })
                complete();
            } else {
                if (!this.current.isDisposed) {
                    this.current.dispose(() => {
                        complete();
                    });
                } else {
                    complete();
                }
            }

        } else {
            complete();
        }
    }
}

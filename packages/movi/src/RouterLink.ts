import { MoviComponent } from ".";
import { ControlProps, IControl } from "./abstractions/IControl";
import { Component } from "./Component";
import { CreateLocalElement } from "./core";
import { isBusy } from "./RouterView";

export class RouterLinkOptions {
    public to?: string = "/";
    public el?: string = "a";
    public showHref?: boolean = false;
    public text?: string = "Link";
    public exactClass?: string = '';
    public activeClass?: string = '';
    public bypass?: boolean = false;
}


export function RouterFunctionalLink(props: RouterLinkOptions) {

}
export class RouterLink extends Component<HTMLElement, RouterLinkOptions> {
    private _href: string = "/";
    public name: string = '';
    public to?: string = "/";
    public el?: string = "a";
    public showHref?: boolean = false;
    public text: string = "Link";
    public exactClass: string = '';
    public activeClass: string = '';
    public bypass: boolean = false;
    onExact?();
    offExact?();
    onActive?();
    offActive?();
    onbuilded(sender) {
        this.setClassed()
        return sender;
    }
    onRouteChanged(sender): void {
        this.setClassed();
    }
    activated() {
        if (this.name != null && this.name != '') {
            var newpath = this.context.RouteManager.get(this.name);
            if (newpath) {

                this.href = newpath.ParentPath as string;
            }
        }
    }
    public set href(v: string) {

        if (v === undefined || v === null) { return }

        this._href = v;
        if (this.context.RouteManager.router.mode === "history") {

            if (!v.startsWith("/") && !v.startsWith("http")) {
                this._href = "/" + this._href;
            }
        } else {
            if (!v.startsWith("#") && !v.startsWith("http")) {
                this._href = "#" + this._href;
            }
        }

        if (this.element instanceof HTMLAnchorElement) {
            this.attr.add({ 'href': v });
        } else {
            if (this['showHref'] && this['showHref'] === true) {
                this.attr.add({ 'to': v });
            }
        }
    }
    public get href(): string {
        return this._href;
    }
    //public to: string = "/", public el: string = "a", public options: any = {},public caption:string = "Link"
    constructor(option: ControlProps<RouterLink, RouterLinkOptions>) {

        // if (!Object.keys(option).includes('props')) {
        //     option = { props: option } as any;
        // }
        var elName = "a";
        if (option.props && option.props.el) { elName = option.props.el; };
        if (option["el"]) { elName = option["el"]; };
        super(CreateLocalElement(elName) as any, option as any)

        if (this.props) {
            //Object.assign(this, { ...option });
            //this.props = option;
            if (this.props.text) { this.bind.text(() => option.props?.text); }
            if (this.props.to) {
                if (typeof this.props.to === 'object') {
                    var to_ = this.props.to['to'] as any;
                    if (this.element instanceof HTMLAnchorElement) {
                        this.attr.add({ href: this.props.to['to'] })
                    } else {
                        this.attr.add({ to: this.props.to['to'] })
                    }


                } else {
                    if (this.element instanceof HTMLAnchorElement) {
                        this.attr.add({ href: this.props.to })
                    } else {
                        this.attr.add({ to: this.props.to })
                    }
                }
            } else {
                this.href = "/";
            }
            if (this['slots'] && this['slots'].length > 0) {
                this['slots'].forEach(slot => {
                    this.controls.add(slot);
                })
            }
            if (this.props['slots'] && this.props['slots'].length > 0) {
                this.props['slots'].forEach(slot => {
                    this.controls.add(slot);
                })
            }
        }


        this.linkClick = this.linkClick.bind(this);
        this.addHandler('click', this.linkClick);
        var self = this;
        this.setClassed = this.setClassed.bind(this);
    }
    setup() {
        this.setClassed();
    }

    private setClassed() {

        try {
            var hrf: any[] = [''];
            if (this.href) {
                hrf = this.href.split('?');
            } else if (this.to) {
                hrf = this.to.split('?');
            } if (this.props.to) {
                hrf = this.props.to.split('?');
            }

            if (this.props && this.props.activeClass && this.props.activeClass !== '' && this.context.route.path.split("?")[0] === hrf[0]) {
                if (this.props.activeClass) {
                    var cls = this.props.activeClass.split(" ");
                    cls.forEach(l => {
                        if (l.trim().length > 0) this.element.classList.add(l);
                        //if (l.trim().length > 0) { this.element.classList.remove(l); }
                    })
                }
                if (this.onActive) { this.onActive() }
            } else {
                if (this.props && this.props.activeClass) {
                    var cls = this.props.activeClass.split(" ");
                    cls.forEach(l => {
                        if (l.trim().length > 0) { this.element.classList.remove(l); }
                    })
                }

                if (this.offActive) { this.offActive() }
                if (this.props && this.props.exactClass && this.props.exactClass !== '' && this.context.route.tree) {

                    if (this.props.exactClass) {
                        var cls = this.props.exactClass.split(" ");
                        cls.forEach(l => {
                            if (l.trim().length > 0) {
                                var i = this.context.route.tree.find(t => t.split("?")[0] === hrf[0]);
                                if (i) {
                                    this.element.classList.add(l);
                                    if (this.onExact) { this.onExact() }
                                } else {
                                    if (this.offExact) { this.offExact() }
                                    this.element.classList.remove(l);
                                }
                            }
                        })
                    }
                }
            }
        } catch (error) {
            var err = error;

        }

    }
    private linkClick(e: Event, sender: IControl<any, any, any>) {

        if (isBusy) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        if (this.bypass) {
            //e.stopPropagation();
            e.preventDefault();
            return false;
        }

        e.preventDefault();

        var to_ = this.props.to as any;
        var target = this.href;
        if (typeof to_ === 'function') {
            target = to_();
        } else {
            target = to_;
        }

        if (this.context.RouteManager.router.mode === "history") {
            this.context.RouteManager.router.trigger(target);
            e.stopPropagation();
            this.Openned?.call(this);
            return false;
        } else {
            this.context.RouteManager.router.trigger(target);
            return true;
        }


    }

    public Openned!: () => void;

}


import { MoviComponent } from ".";
import { ControlProps, IControl } from "./abstractions/IControl";
import { BaseProp, Component } from "./Component";
import { CreateLocalElement, URI } from "./core";
import { isBusy } from "./RouterView";

export class RouterLinkOptions {
    public to?: string = "/";
    public el?: string = "a";
    public showHref?: boolean = false;
    public text?: string = "Link";
    public exactClass?: string = '';
    public activeClass?: string = '';
    public bypass?: boolean = false;
    public target?: string = '';
    public onExact?();
    public offExact?();
    public onActive?();
    public offActive?();
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

        if (this.element.tagName == "A") {
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

    constructor(options: ControlProps<RouterLink, RouterLinkOptions> | BaseProp<RouterLinkOptions> | RouterLinkOptions) {

        var elName = "a";
        const option = <ControlProps<RouterLink, RouterLinkOptions>>options;
        if (option.props && option.props.el) { elName = option.props.el; };
        if (option["el"]) { elName = option["el"]; };

        super(CreateLocalElement(elName) as any, option as any)

        if (this.props) {
            if (this.props.text) { this.bind.text(() => this.props.text); }
            if (this.props.to) {
                if (typeof this.props.to === 'object') {
                    var to_ = this.props.to['to'] as any;
                    if (this.element.tagName == "A") {
                        this.attr.add({ href: this.props.to['to'] })
                    } else {
                        this.attr.add({ to: this.props.to['to'] })
                    }


                } else {
                    if (this.element.tagName == "A") {
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


        if (elName == 'a') {
            if (this.props.target) {
                if (typeof this.props.target === 'object') {
                    var to_ = this.props.target['target'] as any;
                    this.attr.add({ target: this.props.target['target'] })
                } else {
                    this.attr.add({ target: this.props.target })
                }
            }
        }
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

            let requestpath = this.context.route.path;
            if (!requestpath.startsWith("/")) {
                requestpath = "/" + requestpath
            }

            if (!this.isDisposed) {
                var i = this.context.route.tree.find(t => t.split("?")[0] === hrf[0]);
                if (i) {
                    if (this.onExact) { this.onExact() }
                    if (this.props.onExact) { this.props.onExact() }
                } else {
                    if (this.offExact) { this.offExact() }
                    if (this.props.offExact) { this.props.offExact() }
                }

                if (requestpath.split("?")[0] === hrf[0] || requestpath === this.props.to) {
                    if (this.onActive) { this.onActive() }
                    if (this.props.onActive) { this.props.onActive() }
                } else {
                    if (this.offActive) { this.offActive() }
                    if (this.props.offActive) { this.props.offActive() }
                }

                if (this.props && this.props.activeClass && this.props.activeClass !== '' && requestpath.split("?")[0] === hrf[0]) {
                    if (this.props.activeClass) {
                        var cls = this.props.activeClass.split(" ");
                        cls.forEach(l => {
                            if (l.trim().length > 0) this.element.classList.add(l);
                        })
                    }
                } else {
                    if (this.props && this.props.activeClass) {
                        var cls = this.props.activeClass.split(" ");
                        cls.forEach(l => {
                            if (l.trim().length > 0) { this.element.classList.remove(l); }
                        })
                    }


                    if (this.props && this.props.exactClass && this.props.exactClass !== '' && this.context.route.tree) {

                        if (this.props.exactClass) {
                            var cls = this.props.exactClass.split(" ");
                            cls.forEach(l => {
                                if (l.trim().length > 0) {
                                    var i = this.context.route.tree.find(t => t.split("?")[0] === hrf[0]);
                                    if (i) {
                                        this.element.classList.add(l);
                                    } else {
                                        this.element.classList.remove(l);
                                    }
                                }
                            })
                        }
                    }


                }
            }

        } catch (error) {
            var err = error;

        }

    }
    private linkClick(e: Event, sender: IControl<any, any, any>) {

        var t = URI.parse(URI.UrlParse(this.props.to ? this.props.to : ''));

        if (t.scheme == 'http' || t.scheme == 'https') {
            return true;
        }

        if (isBusy) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        if (this.bypass) {
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
        target = URI.UrlParse(target);


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


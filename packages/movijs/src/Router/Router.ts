import { IControl } from "../abstractions/IControl";
import { IRouter } from "../abstractions/Router";
import { ApplicationService } from "../ApplicationService";
import { NavigateEventArgs } from "../core/NavigateEventArgs";
import { RouterView } from "../RouterView";
import { reactive } from "../Reactive";
import { dom } from "../core/Dom";
import { renderPreProcessing } from "../apis/PreProcessing";

export class Router implements IRouter {

    constructor(manager: any) {
        this.mode = 'history';
        this.HandlePopChange = this.HandlePopChange.bind(this);
        this.HandleHashChange = this.HandleHashChange.bind(this);
        this.navigate = this.navigate.bind(this);
        this.manager = manager;

        this.removeUriListener();
        this.addUriListener();

    }
    defaultLayout: any;
    values: { name: string; value: string; }[] = null as any;
    public prev = "__boot__";
    value(name: string) {
        return this.values.filter(x => x.name == name)[0]?.value;
    }

    private _mode = 'history';
    public set mode(m: string) {
        this._mode = m;
        this.removeUriListener();
        this.addUriListener();
    }
    public get mode(): string {
        return this._mode;
    }

    root: string = '/';
    manager: any;
    _skipCheck: any = false;
    HandleChange: (e: any) => void = null as any;
    gate?: ((next: () => any, e: NavigateEventArgs) => any) | undefined;
    navigated?();

    private Handlers = new Set<any>()
    public onChange(callback: any) {
        if (!this.Handlers.has(callback)) {
            this.Handlers.add(callback);
        }
    }
    public offChange(callback: any) {
        this.Handlers.delete(callback);
    }

    previousRoute = null as any;
    public async trigger(uri: string, bypas: boolean = false) {

        if (this.prev !== uri) {

            var fx = this.manager.GetRouteDetailsFromString(uri);
            var ea = new NavigateEventArgs();
            ea.currentPage = ApplicationService.current['lastPage'] as unknown as IControl<any, any, any>;
            ea.route = {
                path: uri,
                extend: fx.extend,
                params: fx.params,
                name: fx.name,
                tree: fx.tree,

            };
            var self = this;

            const goto = async function () {
                var p = ea.route ? ea.route.path : '/';
                if (ea.redirect !== '' && self.manager.routeNames.has(ea.redirect)) {
                    p = self.manager.routeNames.get(ea.redirect).path;
                }


                var nxt = self.manager.GetRouteDetailsFromString(p);

                var route = {
                    path: p,//self.manager.router.getFragment(),
                    extend: nxt.extend,
                    params: nxt.params,
                    name: nxt.name,
                    tree: nxt.tree
                };
                // Object.keys(route).forEach(t => {
                //     (ApplicationService.current as any)["route"][t] = route[t];
                // });
                (ApplicationService.current as any)["route"] = route;


                self.previousRoute = ea;

                var c = await self.manager.GetController(p, (found, pages) => {
                    if (!found) {
                        self.manager.getNotFound();
                    }


                });
                renderPreProcessing();
                self.navigate(p, bypas);
                ApplicationService.current.internal.notify('routeChanged')

            }
            var resume = true;

            if (this.gate) {
                ea.prev = this.previousRoute;
                this.gate(async () => { await goto() }, ea);

            } else {
                goto();
            }

        }
    }
    public scrollState = {
        x: 0, y: 0
    }
    public navigate(url: string, bypas: boolean = false) {
        this.scrollState.x = dom.window.scrollX;
        this.scrollState.y = dom.window.scrollY;
        if (dom.window.location.protocol != 'file:') {
            if (this.mode === "history") {
                if (dom.window.history != null) {
                    if (!url.startsWith("/")) {
                        url = "/" + url;
                    }
                    this.prev = url;
                    if (!bypas) { dom.window.history.pushState({}, '', url); };
                    if (this.navigated) this.navigated.call(this)
                }
            } else {
                if (this.prev !== url) {
                    this.prev = url;
                    if (!bypas) { dom.window.location.hash = url };
                    if (this.navigated) this.navigated.call(this)
                }
            }
        }
    }
    public HandlePopChange() {
        this.trigger(this.CurrentPage, true);
    }
    public HandleHashChange() {

        this.trigger(this.CurrentPage, true);

    }


    public get CurrentPage(): string { return this.getFragment(); };

    addUriListener() {
        if (dom.window && dom.window.addEventListener) {
            if (this.mode === "history") {
                dom.window.addEventListener('popstate', this.HandlePopChange.bind(this));
            } else {
                dom.window.addEventListener('hashchange', this.HandleHashChange.bind(this))
            }
        }

        return this;
    }
    removeUriListener() {
        if (dom.window) {
            dom.window.onpopstate = null;
            dom.window.onhashchange = null;
        } 
        return this;
    }

    _getHistoryFragment() {
        var fragment = decodeURI(dom.window.location.pathname + dom.window.location.search);
        if (this.root !== "/") {
            fragment = fragment.replace(this.root, "");
        }
        return this._trimSlashes(fragment);
    }
    _getHashFragment() {
        var hash = dom.window.location.hash.substring(1).replace(/(\?.*)$/, "");
        if (!hash.startsWith("/")) {
            hash = "/" + hash;
        }
        return this._trimSlashes(hash);
    }
    getFragment() {
        var h;
        if (this.mode === "history") {
            h = this._getHistoryFragment();
        } else {
            h = this._getHashFragment();
        }
        return h;
    }

    private previouspath!: string;
    public isChanged(): boolean {
        var r = this.previouspath != this.getFragment();
        this.previouspath = this.getFragment();
        return r;
    }

    private _trimSlashes(path: string) {
        if (typeof path !== "string") {
            return "";
        }
        var tt = path.toString().replace(/\/$/, "").replace(/^\//, "");
        if (!tt.startsWith("/")) {
            tt = "/" + tt;
        }
        return tt;
    }

}

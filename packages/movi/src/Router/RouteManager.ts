
import { IControl } from "../abstractions/IControl";
import { IRouteManager, RouteItem, RouteRecord } from "../abstractions/IRouteManager";
import { IRouter } from "../abstractions/Router";
import { ApplicationMiddleware, ApplicationService } from "../ApplicationService";
import { Component } from "../Component";
import { RouterView } from "../RouterView";
import { Router } from "./Router";
import Scanner from "./scanner";
export class RouteManager implements IRouteManager {
    public routes = new Map<any, RouteRecord>();
    public routeNames = new Map<string, RouteRecord>();
    public router: IRouter = new Router(this);
    public params: any = {}
    public get(name: string): RouteRecord {
        return this.routeNames.get(name) as any;
    }
    public add(item: RouteItem, layout?: any) {

        if (item.path == "") { item.path = "/" }
        item.path = this._trimSlashes(item.path as string);

        var rc = new RouteRecord();
        rc.control = item.control;
        rc.layout = layout;
        rc.path = this._trimSlashes(item.path);
        rc.parent = undefined;
        rc.isDefault = false;
        rc.keepAlive = item.keepAlive;
        rc.instances = { layout: null as any, control: null as any },
            rc.extend = item.extend;
        rc.onShow = item.onShow;
        rc.name = item.name;
        if (rc.name) {
            this.routeNames.set(rc.name, rc);
        }
        this.routes.set(item.path, rc);
        this.AddChildNode(item, item.childs, this._trimSlashes(item.path), rc);

    }

    /**
     * 
     * @param target Name or Route Item
     * @param item 
     */
    public insert(target: string | RouteRecord, item: RouteItem) {  
        var addded = false;
        this.routes.forEach(x => {
            if (x.name == target || x === target || x.path == target) {
                addded = true;
                if (item.path == "") { item.path = "/" }
                item.path = this._trimSlashes(item.path as string);
                var rc = new RouteRecord();
                rc.control = item.control;
                rc.path = this._trimSlashes(item.path);
                rc.parent = undefined;
                rc.isDefault = false;
                rc.keepAlive = item.keepAlive;
                rc.parent = x;
                rc.instances = { layout: null as any, control: null as any },
                    rc.extend = item.extend;
                rc.onShow = item.onShow;
                rc.name = item.name;
                if (rc.name) {
                    this.routeNames.set(rc.name, rc);
                }
                this.routes.set(item.path, rc);
                this.AddChildNode(item, item.childs, this._trimSlashes(item.path), rc);
            }
        });
        if (!addded) {
            this.add(item);
        }
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
    private AddChildNode(item: RouteItem, ch: RouteItem[] | undefined, prefix: any, parentObject: RouteRecord) {

        ch?.forEach(c => {
            var pp = prefix + c.path;
            pp = this._trimSlashes(pp);
            c.path = this._trimSlashes(c.path as string);

            var rc = new RouteRecord();
            rc.control = c.control;
            rc.layout = item.control;
            rc.path = c.path;
            rc.ParentPath = pp;
            rc.parent = parentObject;
            rc.isDefault = false;
            rc.keepAlive = c.keepAlive;
            rc.instances = { layout: null as any, control: null as any },
                rc.extend = c.extend;
            rc.onShow = c.onShow;
            rc.name = c.name;

            if (c.path == "/") {
                (parentObject as any)['firstChild'] = c.control;
            }

            if (!this.routes.has(pp)) {
                if (rc.name) {
                    this.routeNames.set(rc.name, rc);
                }
                this.routes.set(pp, rc);
            }

            if (c.childs && c.childs.length > 0) {
                this.AddChildNode(c, c.childs, pp, rc);
            }
        })
    }
    private deepsearch(control: IControl<any, any, any>): RouterView {
        var result;
        if (!control) {
            return result;
        } else if (control && control.isDisposed) {
            return result;
        }
        var i;
        if (Array.isArray(control)) {
            control.forEach(t => {
                if (i != null && i != undefined) {
                    i = t.controls.filter(x => {
                        return x instanceof RouterView && !x.isDisposed
                    })
                }
            })
        } else {
            i = control.controls.filter(x => {
                return x instanceof RouterView && !x.isDisposed
            })
        }

        if (i && i.length > 0) {
            result = i[0];
        } else {
            if (Array.isArray(control)) {
                control.forEach(tx => {
                    tx.controls.forEach(x => {
                        if (result != null && result != undefined) {
                            result = this.deepsearch(x);
                        }
                    });
                })
            } else {
                control.controls.forEach(x => {
                    result = this.deepsearch(x)
                });
            }

        }
        return result;
    }
    private findBody(c: IControl<any, any, any>): RouterView | undefined {

        var findMain: RouterView = null as any;

        var self = this;
        if (Array.isArray(c)) {
            c.forEach(r => {
                if (r && !r.isDisposed) {
                    if (ApplicationService.current.ControlCollection.has(r)) {
                        findMain = ApplicationService.current.ControlCollection.get(r);
                    } else {
                        r.controls && r.controls.forEach(t => {
                            var f = self.findBody(t);
                            if (f) {
                                findMain = f as RouterView;
                            }
                        })
                    }
                }
            })
        } else {
            if (ApplicationService.current.ControlCollection.has(c)) {
                findMain = ApplicationService.current.ControlCollection.get(c);
            } else {
                c.controls && c.controls.forEach(t => {
                    var f = self.findBody(t);
                    if (f) {
                        findMain = f as RouterView;
                    }
                })
            }
        }

        return findMain;
        // Object.keys(c).forEach(key => {
        //     if (c[key] instanceof RouterView  && !c[key].isDisposed) {
        //         findMain = c[key] as RouterView
        //     }
        // })
        // if (findMain != null) {
        //     return findMain;
        // }
        // findMain = this.deepsearch(c);
        // if (findMain != null) {
        //     return findMain;
        // }
        // var item;
        // if (Array.isArray(c)) {
        //     c.forEach(cc => { 
        //         if (item != null && item != undefined) { 
        //               item = cc.controls.filter(x => {
        //                 return x instanceof RouterView && !x.isDisposed
        //             })[0];
        //         }
        //     })
        // } else { 
        //       item = c.controls.filter(x => {
        //         return x instanceof RouterView  && !x.isDisposed
        //     })[0];
        // }


        // if (item) {
        //     return item;
        // } else {
        //     if (Array.isArray(c)) { 
        //         c.forEach(xx => {
        //             xx.controls.forEach(x => { 
        //                 if (item != null && item != undefined) { 
        //                     item = this.findBody(x);
        //                 }
        //             });
        //          })
        //     } else {
        //         c.controls.forEach(x => {
        //             if (item != null && item != undefined) { 
        //                 item = this.findBody(x);
        //             } 
        //         });
        //     }

        //     return item;
        // }
        // return undefined;
    }
    start() {
        this.router.trigger(this.router.CurrentPage);
    }
    public async CreateObject(prm: any) {
        var c = prm;

        if (c instanceof Promise) {
            c = await c.then(x => {
                c = x.default;
                return x.default;
            })
        }

        if (Object.prototype.toString.call(prm) === "[object Module]") {
            c = prm.default;
        }


        var result;
        // var contextExtend = { context: ApplicationService.current };

        if (typeof c === "function") {

            if (c.prototype instanceof Component || c instanceof Component) {

                result = new c;
            } else if (c.prototype && typeof c.prototype.constructor === 'function') {

                try {
                    // result = Object.assign(new Component(), { view: () => { return new c.prototype(contextExtend)  } }); 
                    if (c.prototype.constructor) {

                        result = new Component({ view: (ctx?) => new c(ctx) });
                        // result = new c(contextExtend);
                    } else {

                        result = new Component({ view: c });//c(contextExtend);
                    }

                } catch (error) {

                    try {

                        //result = (new c(contextExtend));
                        result = (new c());
                    } catch (error) {

                        //result = (c({ context: ApplicationService.current }));
                        result = (c());
                    }
                }
            } else {


                try {
                    ///result = new c(contextExtend);
                    result = new c();
                } catch (error) {
                    //result = c(contextExtend);
                    result = c();
                }
            }

            if (result instanceof Promise) {
                result = await result.then(x => {
                    result = x.default;
                    return x.default;
                })
            }



            if (result.prototype && typeof result.prototype.constructor === 'function') {

                try {
                    if (typeof result.prototype.add === 'function') {

                        //result = (new (result as any)(null, null));
                        result = (new (result as any)());
                    } else {
                        //result = new Component({ view: result });
                        result = new Component({ view: result });
                    }
                    // if (result instanceof Component) {

                    //     result = (new (result as any)(null, null));
                    // } else {
                    //     result = new Component({ view: result });
                    // }
                    // if (/^\s*class/.test(result.toString())) {
                    //     result = (new result(contextExtend));
                    // } else { 
                    //     result = new Component({view:result});
                    // }
                    //result = (new result(contextExtend));


                } catch (error) {

                    // result = (new result(contextExtend));
                    result = (new result());
                    // var options = {
                    //     view:result
                    // }

                    // result = new Component(options);




                    //result = (result(contextExtend));
                }
            }
            var isComponent = result instanceof Component;
            if (!isComponent) {
                result = await result;
                //result = new Component({ ...result, ...contextExtend });
                result = new Component({ ...result });
            }

            if (result) {
                result.initializeComponent && result.initializeComponent();
            }

            return result;
        } else {
            var xComponent = new Component<any, any>(c.tag ? c.tag : 'div', c)
            //xComponent["initializeComponent"] && xComponent["initializeComponent"]();
            return xComponent;
        }
    }

    private async startBuild(route: any) {

        // var ea = new NavigateEventArgs();

        // var nxt = this.GetRouteDetails(this.router.getFragment());
        // ea.route = {
        //     path: this.router.getFragment(),
        //     extend: nxt.extend,
        //     params: nxt.params,
        //     name: nxt.name,
        //     tree: nxt.tree
        // };
        // //(ApplicationService.current as any)["route"] = ea.route;
        // this.router.gate && this.router.gate(ea);
        // if (!ea.resume && this.router.prev != '__boot__') {
        //     return false;
        // }


        this._objectMapper.clear();
        if (route.parent != null) {
             //this.buildmapMiddlewared(route.parent, route);

            await this.buildmap(route.parent, route);
        }



        if (route.keepAlive == false) {
            route.instances.control = await this.CreateObject(route.control);
        }
        !this._objectMapper.has(route) && this._objectMapper.add(route);


        if (route.instances.control == null || route.instances.control.isDisposed) {
            route.instances.control = await this.CreateObject(route.control);
        }



        if (!route.instances.control || route.instances.control.isDisposed) {
            route.instances.control = await this.CreateObject(route.control);
        }

        if (route.instances.control.activating) route.instances.control.activating();


        if (route.parent == null) {
            var RootBody = await this.findBody(ApplicationService.current.MainPage) as RouterView;
            await RootBody.navigate(route.instances.control);
            if (route.instances.control.activated) route.instances.control.activated();

        } else {

            var b = await this.findBody(route.parent.instances.control) as RouterView;
            if (b == undefined) {

            } else {

                if (!route.instances.control || route.instances.control.isDisposed) {
                    route.instances.control = await this.CreateObject(route.control);
                }

                await b.navigate(route.instances.control);
                if (route.instances.control && route.instances.control.activated) {
                    route.instances.control.activated();
                }
            }

        }
        if (route['firstChild']) {

            var ChildBody = await this.findBody(route.instances.control) as RouterView;
            var ins = await this.CreateObject(route['firstChild']);


            if (ins.activating != null) { ins.activating(); }
            if (ChildBody) {
                await ChildBody.navigate(ins);
                if (ins.activated != null) {
                    ins.activated();
                }
            }
        }
        return false;
    }
    singleShot = false;
    private async buildmap(item: any, route) {



        if (item.parent != undefined) {
            await this.buildmap(item.parent, route)
        }
        if (item.parent != null && (!item.parent.instances.control || item.parent.instances.control.isDisposed)) {

            item.parent.instances.control = await this.CreateObject(item.parent.control);

            if (item.parent.instances.control.activating) item.parent.instances.control.activating();
        }


        if (!item.instances.control || item.instances.control.isDisposed) {

            item.instances.control = await this.CreateObject(item.control);
        }

        if (item.instances.control && item.instances.control.activating) item.instances.control.activating();

        if (item.parent == null) {
            item.instances.body = this.findBody(ApplicationService.current.MainPage);
            await item.instances.body.navigate(item.instances.control);
            if (item.instances.control.activated) item.instances.control.activated();
        } else {
            item.instances.body = this.findBody(item.parent.instances.control);
            await item.instances.body.navigate(item.instances.control);
            if (item.instances.body.activated) item.instances.body.activated();
            if (item.instances.control.activated) item.instances.control.activated();
        }

        item.isLatestPage = false;
    }

    private _objectMapper = new Set();
    private async buildmapMiddlewared(item: any, route) {

        if (item.parent != undefined) {
            await this.buildmapMiddlewared(item.parent, route)
        }
        !this._objectMapper.has(item) && this._objectMapper.add(item);
    }

    private async GetController(RequestUri: string, cb: (found, controller) => any) {

        var fio = window.location.href.indexOf("?");
        const urlSearchParams = new URLSearchParams(window.location.href.substring(fio));

        var cnt;
        var lyt;
        var _RequestUri = RequestUri.split("?")[0];
        const values = Array.from(this.routes.keys());
        var found = false;
        await values.map(async (keys) => {
            if (!found) {
                var key = new Scanner(keys);
                var rx = key.exist(_RequestUri);
                if (rx) {
                    found = true;
                    var r = this.routes.get(keys) as any;
                    this.params = key.parameters;
                    await this.startBuild(r);
                    var allMiddleware = 0;
                    var next = () => {
                        if (allMiddleware === ApplicationMiddleware.size) {
                            cb(found, r.instances.control);
                        }
                    }

                    if (ApplicationMiddleware.size > 0) {
                        ApplicationMiddleware.forEach(mw => {
                            allMiddleware++;
                            if (mw) {
                                const subs = (item) => {
                                    if (item.parent) {
                                        subs(item.parent)
                                    }
                                    mw(next, item);
                                }
                                subs(r.instances.control);
                                //mw(next, r.instances.control);
                                // if (r.instances.layout) {
                                //     mw(next, r.instances.layout);
                                // }
                                // if (r.instances.control) {
                                //     mw(next, r.instances.control);
                                // }
                            }


                        })
                    } else {
                        next();
                    }
                    return true;
                }
                return false;
            }
        })
        if (!found) {
            cb(found, null);
        }
        return { control: cnt, layout: lyt };
    }

    private GetRouteDetails(RequestUri: string): any {

        var urlSearchParams = new URLSearchParams(window.location.search);
        if (this.router.mode != "history" && RequestUri.split('?').length > 1) {
            urlSearchParams = new URLSearchParams(RequestUri.split("?")[1]);
        }
        var rdd = {};
        var ru = RequestUri.split("/");
        var pp: string[] = [];
        var extender = {};
        var pr = "";
        ru.forEach(rx => {
            if (rx.length > 0) {
                pr = pr + "/" + rx.split("?")[0];
                pp.push(pr)
            }

        });
        var found = false;
        this.routes.forEach((r, keys) => {
            if (!found) {

                var key = new Scanner(keys);
                this.params = {};
                var ex = key.exist(RequestUri.split('?')[0]);

                const extendTree = function (r: RouteRecord) {
                    if (r.extend) {
                        Object.keys(r.extend).forEach(x => {
                            if (!extender[x]) {
                                extender[x] = r.extend[x]
                            }
                        })
                    }
                    //if (r.extend) Object.assign(extender, r.extend);
                    if (r.parent) {
                        extendTree(r.parent);
                    }
                };
                if (ex) {
                    found = true;
                    this.params = key.parameters;
                    extender = {};
                    extendTree(r);

                    rdd = {
                        extend: extender,
                        params: this.params,
                        name: r.name,
                        onShow: r.onShow,
                        tree: pp
                    };
                }

            }
        })


        return rdd;
    }
    private filterHtml(val: any) {
        var el = document.createElement("div");
        el.innerHTML = val;
        return el.innerText;
    }

    getNotFound() {
        var RootBody = this.findBody(ApplicationService.current.MainPage) as RouterView;
        RootBody.navigate(ApplicationService.current.NotFoundPage);
    }

}

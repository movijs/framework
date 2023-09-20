import { ClearModel as clsModel } from "./Reactive";
import { IControl, IModelSettings, IServiceManager } from "./abstractions";
import { IApplicationService, IDisposable, SysInternalNotification } from "./abstractions/IApplicationService";
import { IRouteManager } from "./abstractions/IRouteManager";
import { Component } from "./Component";
import { Dictionary, routeType } from "./core";
import { RouteManager } from "./Router/RouteManager";
import { ServiceManager } from "./ServiceManager";
import { reactive, effect } from "./Reactive";
import { CustomDirective, IDirective } from "./abstractions/IDirective";


const AppWatch = new Map<any, any>();
const AppWatchKeys = new Dictionary<string | symbol | any, Set<any>>();
const latestAppValue = new Dictionary<string | symbol | any, any>();

export const ApplicationMiddleware = new Set<(next: () => any, e: IControl<any, any, any>) => void>();
export class MoviApplicationService implements IApplicationService {
    public services: IServiceManager = new ServiceManager();
    public extensions: Set<any> = new Set();
    public RouteManager: IRouteManager = new RouteManager();
    public MainPage!: IControl<any, any, any>;
    public NotFoundPage!: IControl<any, any, any>;
    public Loading!: IControl<any, any, any>;
    public ControlCollection: WeakMap<any, any> = new WeakMap();
    public Directives = new Set<any>();
    public starters = new Set<Function>();
    ModelSettings: IModelSettings = { PageSize: 25 };
    public state = this.useModel({});
    GarbageCollection = {
        items: [] as IDisposable[],
        add(item: IDisposable) {
            this.items.push(item)
        },
        except() {
            this.items.map(c => {
                c.dispose();
            })
            this.items = [];
        }
    }
    public store = {};
    public useModel(data) {

        return reactive(data)
    }
    public clearModel(data) {
        clsModel(data);
        return null;
    }
    constructor() {
        //this.Directives.add(CustomDirective);
    }
    on(eventName: string | symbol | any, cb: (...args: any[]) => any, ...args) {

        Promise.resolve().then(() => {
            if (AppWatchKeys.has(eventName)) {
                AppWatchKeys.item(eventName).value.add(cb);
            } else {
                AppWatchKeys.Add(eventName, new Set<any>());
                AppWatchKeys.item(eventName).value.add(cb);
            }

            if (latestAppValue.has(eventName)) {
                cb(...latestAppValue.item(eventName).value)
            }
        });
        return () => {
            AppWatchKeys.item(eventName).value.delete(cb);
        };
    }

    handle(eventName: string | symbol | any, cb: (...args: any[]) => any, ...args) {

        Promise.resolve().then(() => {
            if (AppWatchKeys.has(eventName)) {
                AppWatchKeys.item(eventName).value.add(cb);
            } else {
                AppWatchKeys.Add(eventName, new Set<any>());
                AppWatchKeys.item(eventName).value.add(cb);
            }
        });
        return () => {
            AppWatchKeys.item(eventName).value.delete(cb);
        };
    }

    async send(eventName: string | symbol | any, ...args: any[]) {
        Promise.resolve().then(() => {
            if (latestAppValue.has(eventName)) {
                latestAppValue.remove(eventName)
            }
            latestAppValue.Add(eventName, args);
            AppWatchKeys.item(eventName)?.value?.forEach(t => {
                t(...args)
            })
        });
    }


    watch(fn: () => any) {
        effect(fn);
    }

    internal: SysInternalNotification = new SysInternalNotification();
    route: routeType = reactive({ path: '' }) as any;
    use(module: any) {
        if (Reflect.ownKeys(module).includes("name")) {
            if (!this.extensions.has(module)) {
                Reflect.ownKeys(module).forEach(k => {
                    if (typeof module[k] === 'function') {
                        module[k] = module[k].bind(module)
                    }
                })
                var init = {};
                init[module.name] = module;
                this.extensions.add(init);
                if (Reflect.ownKeys(module).includes("install")) {
                    module.install(this);
                    delete module.install;
                }
            }
        } else {
            if (!this.extensions.has(module)) {
                this.extensions.add(module);
            }
        }
    }
 
    middleware(ref: (next: () => any, e: IControl<any, any, any>) => void) {
        ApplicationMiddleware.add(ref);
    }


    public CreateObject(type, params) {
        var c = type;

        if (Object.prototype.toString.call(type) === "[object Module]") {
            c = type.default;
        }
        var result;
        if (typeof c === "function") {
            if (c.prototype instanceof Component) {
                result = new c(params);
            } else if (c.prototype && typeof c.prototype.constructor === 'function') {
                try {
                    result = (new c.prototype(params));
                } catch (error) {
                    result = (c(params));
                }
            } else {
                result = c();
            }
            return result;
        }
    }

    navigate(uri) {
        this.RouteManager.router.trigger(uri)
    }

    startup(settings:(context:IApplicationService)=> void) {
        if (!this.starters.has(settings)) {
            this.starters.add(settings);            
        }
    }
}

export class ApplicationService {
    public static current: IApplicationService = new MoviApplicationService();
} 
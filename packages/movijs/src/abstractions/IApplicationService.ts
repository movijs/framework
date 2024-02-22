import { Component, IConfigurationOptions, IModelSettings } from "..";
import { routeType } from "../core/NavigateEventArgs";
import { IControl } from "./IControl";
import { IRouteManager } from "./IRouteManager";
import { IServiceManager } from "./IServiceManager";
const InternalEventStoreMap = new Map<any, any>();

export interface IInternalEventStoreBase {
    event: string
}
export class SysInternalNotification {
    public subscribe(event, callback): any {
        if (!InternalEventStoreMap.has(callback)) {
            InternalEventStoreMap.set(callback, event);
        }
        return () => {
            InternalEventStoreMap.delete(callback)
        };
    }

    notifyQ;
    public notify(event: string) {

        window.clearTimeout(this.notifyQ);
        this.notifyQ = window.setTimeout(() => {
            InternalEventStoreMap.forEach((k, v) => {
                if (k === event) {
                    if (typeof v !== 'function') {
                        if (v.onRouteChanged && !v.isDisposed) {
                            if (!v.element.parentElement && v.isMainComponent) {
                                v.dispose();
                            } else if (v.isRendered) {
                                v.onRouteChanged.call(v, v)
                            }
                        }
                    } else {
                        v();
                    }
                }
            })
        })

    }
}

export interface IDisposable {
    dispose(cb?: Function);
}

export interface IModule {
    name: string,
    install: () => {},
    run: () => {}
}
export interface IApplicationService {
    Options: IConfigurationOptions;
    services: IServiceManager;
    starters: Set<Function>;
    ControlCollection: WeakMap<any, any>;
    RouteManager: IRouteManager;
    MainPage: IControl<any, any, any>;
    NotFoundPage: IControl<any, any, any>;
    Loading: IControl<any, any, any>;
    state: any;
    store: any;
    Directives: Set<any>;
    route: routeType;
    extensions: Set<any>;
    use(module: any): void;
    internal: SysInternalNotification;
    send(eventName: string | Symbol | symbol, ...args);
    on(eventName: string | Symbol | symbol, cb: (...args) => any);
    handle(eventName: string | symbol, cb: (...args) => any);
    useModel(data): any;
    clearModel(data): any;
    watch(fn: () => any);
    CreateObject(type, params);
    navigate(uri: string);
    middleware(ref: (next: () => any, e: IControl<any, any, any>) => void)
    ModelSettings: IModelSettings;
    GarbageCollection: {
        items: IDisposable[],
        add(item: IDisposable);
        except();
    }
    startup(settings: (context: IApplicationService) => void);
    addToMain(...controls: Component<any, any>[]);
}
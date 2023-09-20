import { IConfigurationOptions, IModelSettings, IMoviApp, IServiceManager } from "./abstractions";
import { IApplicationService } from "./abstractions/IApplicationService";
import { ApplicationService } from "./ApplicationService";
import { Component } from "./Component";
import { NavigateEventArgs } from "./core";
import { RouterView } from "./RouterView";

export class CreateMoviApp implements IMoviApp {
    context: IApplicationService = ApplicationService.current;

    public use(module: any) {
        ApplicationService.current.use(module);
    };
    Services?: IServiceManager | undefined;
    public offline?(sender: IMoviApp, e: Event) { }
    public online?(sender: IMoviApp, e: Event) { }
    public Configuration?(options: IConfigurationOptions) { }
    public ServiceConfiguration?(services: IServiceManager) { }
    public Navigate?(e: NavigateEventArgs) { }
    public constructor(options?: IMoviApp) {
        if (options) {
            Object.assign(this, options);
        }
        if (this.Configuration) { this.Configuration = this.Configuration.bind(this); }
        if (this.Configuration) this.Configuration({
            Route: ApplicationService.current.RouteManager,
            middleware: ApplicationService.current.middleware,
            ModelSettings: ApplicationService.current.ModelSettings
        });
        ApplicationService.current.starters.forEach(f => {
            f(this.context);
        })
        if (this.ServiceConfiguration) this.ServiceConfiguration(ApplicationService.current.services);
        if (this.offline) window.addEventListener("offline", (e) => { this.offline && this.offline(this, e) })
        if (this.online) window.addEventListener("online", (e) => { this.online && this.online(this, e) })

    }
    private async CreateObject(prm: any) {

        var c = prm;
        if (c instanceof Promise) {
            await prm.then((x: any) => {
                c = x.default;
            })
        }

        var result = c;
        if (typeof c === "function") {
            if (c["constructor"]) {
                try {
                    result = (new c());
                } catch (error) {
                    try {
                        result = (c());
                    } catch (error) {

                    }

                }

                var isComponent = result instanceof Component;
                if (!isComponent) {
                    var np = new Component({});
                    result.build = np.build;
                    Object.assign(result, np)
                }
            } else {
                return (c());
            }

        } else {
            var xComponent = new Component<any, any>(c)
            return xComponent;
        }

    }

    public run(element: HTMLElement) {
        var MainPage = new Component(element, {});
        //MainPage._.isMainComponent = true;
        var frm = new RouterView();
        MainPage.controls.add(frm);
        ApplicationService.current.MainPage = MainPage;
        ApplicationService.current.MainPage.build();
        (ApplicationService.current.RouteManager as any)["start"]();



    }

    private async _start(t: any, element: any) {
        ApplicationService.current.MainPage = t;
        ApplicationService.current.MainPage.build();
        (ApplicationService.current.RouteManager as any)["start"]();
    }

}

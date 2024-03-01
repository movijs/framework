import { IServiceManager } from "./abstractions";
import { IConfigurationOptions, IApplicationService } from "./abstractions/IApplicationService";
import { renderPreProcessing } from "./apis/PreProcessing";
import { ApplicationService } from "./ApplicationService";
import { Component } from "./Component";
import { dom, NavigateEventArgs } from "./core";
import { RouterView } from "./RouterView";
// import { browser } from "./core";

export interface IMoviApp<T extends IConfigurationOptions> {
    Services?: IServiceManager;
    Configuration?(options: T): void;
    ServiceConfiguration?(services: IServiceManager): void;
    Navigate?(e: NavigateEventArgs): void;
    offline?(sender: IMoviApp<T>, e: Event): void;
    online?(sender: IMoviApp<T>, e: Event): void;
    onfullscreen?(isFullscreen: boolean): void;
    use?(module: any): void;
    context?: IApplicationService;
}

interface ConfigurationOptions extends IConfigurationOptions {
    setErrorPages: (type: '404', page: () => Component<any, any>) => void;
}

export class CreateMoviApp implements IMoviApp<ConfigurationOptions> {
    context: IApplicationService = ApplicationService.current;
    public use(module: any) {
        ApplicationService.current.use(module);
    };
    Services?: IServiceManager | undefined;
    public offline?(sender: IMoviApp<ConfigurationOptions>, e: Event) { }
    public online?(sender: IMoviApp<ConfigurationOptions>, e: Event) { }
    public onfullscreen?(isFullscreen: boolean) { }
    public Configuration?(options: ConfigurationOptions) { }
    public ServiceConfiguration?(services: IServiceManager) { }
    public Navigate?(e: NavigateEventArgs) { }

    public constructor(options?: IMoviApp<ConfigurationOptions>) {
        if (options) {
            Object.assign(this, options);
        }
        this.context.Options = {
            Route: ApplicationService.current.RouteManager,
            middleware: ApplicationService.current.middleware,
            ModelSettings: ApplicationService.current.ModelSettings,
            setStateProvider: (name, values) => { this.context.state[name] = values; },
            setErrorPages: (type: '404', page: () => Component<any, any>) => { this.context.NotFoundPage = page; }
        } as IConfigurationOptions;
        if (this.Configuration) { this.Configuration = this.Configuration.bind(this); }
        if (this.Configuration) this.Configuration(this.context.Options as any);

        ApplicationService.current.starters.forEach(f => {
            f(this.context);
        })
        if (this.ServiceConfiguration) this.ServiceConfiguration(ApplicationService.current.services);
        if (this.offline) dom.window.addEventListener("offline", (e) => { this.offline && this.offline(this, e) })
        if (this.online) dom.window.addEventListener("online", (e) => { this.online && this.online(this, e) })
        //this.onfullscreen && browser.onDidChangeFullscreen(i => { this.onfullscreen &&  this.onfullscreen(i) })

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
        renderPreProcessing();
        //element.innerHTML = "";
        var MainPage = new Component(element, {});
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


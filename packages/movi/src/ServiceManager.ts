import { IControl, IServiceManager } from "./abstractions";
import { Dictionary } from "./core/Dictionary";

export class ServiceManager implements IServiceManager {
    private _Components = new Dictionary<string, any>();
    AddComponent(component: IControl<any,any,any>, name?: string  ): void {
        if (name != "" && name!=undefined) {
            this._Components.Add(name, component)
        }
        else { 
            this._Components.Add((component as any)["constructor"]?.name, component)
        } 
    }
    GetComponent(name: string): IControl<any,any,any> | undefined {
        return this._services.find(x=> x.Key == name)?.value;
    }
    ImportService(p: Promise<any>) {
        p.then(x => { this.AddService(x, x.name)}); 
    }
    private _services = new Dictionary<string, any>();
    public AddService<type extends any>(service: type, name: string = "") {
       
        if (name != "") {
            this._services.Add(name, service)
        }
        else if (typeof service === "function") {
            if (service.name == undefined) {
                name = (<any>service).toString().match(/^function\s*([^\s(]+)/)[1];
                this._services.Add(name, service)
            } else {
                this._services.Add(service.name, service)
            }
           
        } else { 
            this._services.Add((service as any)["constructor"]?.name, service)
        } 
    } 
     
    public GetServices(): Dictionary<any, any> {
        return this._services; 
    }

    public GetService(service:Function) {
        return this._services.filter(x=> x.Key == service.name)[0].value;
    }
    public FindService(service: string) {
        var sn = service?.toLowerCase() + "";
        return this._services.filter(x => x.Key?.toLowerCase() == sn)[0]?.value;
    }
     
}
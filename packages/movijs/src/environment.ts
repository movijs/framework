import { ApplicationService } from "./ApplicationService";
import { Component, moviComponent } from "./Component";

export class ___protoclass { }
const __protoclass__ = new ___protoclass();
export function CreateObject(objectRef: any, props: any, isPage: boolean = false) {
    
    const Ctx = Object.assign({}, {
        context: ApplicationService.current,
    })
    if (Array.isArray(objectRef)) {
        return objectRef[0];
    } else if (objectRef instanceof Component || (objectRef.prototype instanceof Component || (objectRef.prototype && objectRef.prototype.constructor instanceof Component))) {
        var p = props['props'];
        delete props['props'];
        return new objectRef({ ...p, ...props });
    } else if (typeof objectRef === "function") {
       
        if (objectRef instanceof Component || (objectRef.prototype && objectRef.prototype instanceof Component)) {
            var p = props['props'];
            delete props['props'];
            return new objectRef({ ...p, ...props });
             
        } else if (typeof objectRef === 'object') {
            return new Component({ ...objectRef, ...Ctx, ...props });
        } else {
           
            return new Component({ view: objectRef, ...props });// Object.assign(getFn, Ctx); 
        }
    } else { 
        return new Component({...objectRef,...Ctx,...props}); 
    } 
}

export class system {
    public static GC(item: any): any {
        
        Object.keys(item).forEach(key => {
            item[key] = null;
            delete item[key];
        });
        Object.setPrototypeOf(item, null);
        return null;
    }
}
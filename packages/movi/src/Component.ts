import { ApplicationService } from "./ApplicationService";
import { MoviComponent } from "./ComponentBase";
import { ControlProps } from "./abstractions";
import { CreateLocalElement, ElementTypes } from "./core";

// export class ComponentBasic extends MoviComponent<any, any, ComponentBasic>{
//     constructor(tag: ElementTypes | string)
//     constructor(options: ControlProps<Component<ElementTypes, any>, any>)
//     constructor(tag: ElementTypes | string, options: ControlProps<Component<ElementTypes, any>, any>)
//     constructor() {
//         var tag;
//         var props;
//         var args: ControlProps<Component<ElementTypes, any>, any> | undefined = undefined;

//         if (tag !== undefined && typeof tag === 'function') {
//             var caller = (tag as any)(props);
//             super(caller.element, caller, args)
//         } else {
//             if (arguments.length === 1) {
//                 var arg = arguments[0];
//                 if (typeof arg === "object" && (arg instanceof Element) === false) {
//                     if (arg) {
//                         props = arg.props;
//                     }

//                 } else {
//                     tag = arg;
//                 }
//             } else if (arguments.length === 2) {
//                 tag = arguments[0];
//                 if (arguments[1]) {
//                     props = arguments[1].props;
//                     args = arguments[1];
//                 }
//             }
//             if ((tag === undefined || tag === null) && (props === undefined || props === null)) {
//                 super(tag as any, props as any, args)
//             } else if (tag === undefined && props !== undefined) {
//                 super(CreateLocalElement(tag), props, args)
//             } else if (tag && !props) {
//                 super(CreateLocalElement(tag), props as any, args)
//             } else if (tag && props) {
//                 super(CreateLocalElement(tag, props['__isSvgElement']), props, args)
//             } else {
//                 super(CreateLocalElement(tag), props as any, args)
//             }
//         }
//     }

//     view?(context: this): MoviComponent<ElementTypes, any, Component<ElementTypes, any>>;
//     elementCreating?(current: any): any;
// }


export class Component<ElementType extends ElementTypes = HTMLElement, StateType = {}> extends MoviComponent<ElementType, StateType, Component<ElementType, StateType>> {
    constructor(options: ControlProps<Component<ElementType, StateType>, StateType>)
    constructor(tag: ElementType | string)
    constructor(tag: ElementType | string, options: ControlProps<Component<ElementType, StateType>, StateType>)
    constructor() {
        var tag;
        var props;
        var args: ControlProps<Component<ElementType, StateType>, StateType> | undefined = undefined;

        if (tag !== undefined && typeof tag === 'function') {
            var caller = (tag as any)(props);
            super(caller.element, caller, args)
        } else {
            if (arguments.length === 1) {
                var arg = arguments[0];
                if (typeof arg === "object" && (arg instanceof Element) === false) {
                    if (arg) {
                        props = arg.props;
                    }

                } else {
                    tag = arg;
                }
            } else if (arguments.length === 2) {
                tag = arguments[0];
                if (arguments[1]) {
                    props = arguments[1].props;
                    args = arguments[1];
                }
            }
            if ((tag === undefined || tag === null) && (props === undefined || props === null)) {
                super(tag as any, props as any, args)
            } else if (tag === undefined && props !== undefined) {
                super(CreateLocalElement(tag), props, args)
            } else if (tag && !props) {
                super(CreateLocalElement(tag), props as any, args)
            } else if (tag && props) {
                super(CreateLocalElement(tag, props['__isSvgElement']), props, args)
            } else {
                super(CreateLocalElement(tag), props as any, args)
            }
        }

    }
    setup?(sender?: Component<ElementType, StateType> | undefined);
    view?(): MoviComponent<ElementType, StateType, Component<ElementType, StateType>>;
    elementCreating?(current: any): any;
}

// export class ComponentDetailed<ElementType extends ElementTypes, StateType, caller extends ComponentDetailed<ElementType, StateType, caller>> extends MoviComponent<ElementType, StateType, ComponentDetailed<ElementType, StateType, caller>> {

//     constructor(tag: ElementType | string)
//     constructor(options: ControlProps<Component<ElementType, StateType>, StateType>)
//     constructor(tag: ElementType | string, options: ControlProps<Component<ElementType, StateType>, StateType>)
//     constructor() {
//         var tag;
//         var props;
//         var args: ControlProps<Component<ElementType, StateType>, StateType> | undefined = undefined;

//         if (tag !== undefined && typeof tag === 'function') {
//             var caller = (tag as any)(props);
//             super(caller.element, caller, args)
//         } else {
//             if (arguments.length === 1) {
//                 var arg = arguments[0];
//                 if (typeof arg === "object" && (arg instanceof Element) === false) {
//                     if (arg) {
//                         props = arg.props;
//                     }

//                 } else {
//                     tag = arg;
//                 }
//             } else if (arguments.length === 2) {
//                 tag = arguments[0];
//                 if (arguments[1]) {
//                     props = arguments[1].props;
//                     args = arguments[1];
//                 }
//             }
//             if ((tag === undefined || tag === null) && (props === undefined || props === null)) {
//                 super(tag as any, props as any, args)
//             } else if (tag === undefined && props !== undefined) {
//                 super(CreateLocalElement(tag), props, args)
//             } else if (tag && !props) {
//                 super(CreateLocalElement(tag), props as any, args)
//             } else if (tag && props) {
//                 super(CreateLocalElement(tag, props['__isSvgElement']), props, args)
//             } else {
//                 super(CreateLocalElement(tag), props as any, args)
//             }
//         }
//     }

//     view?(context: this): MoviComponent<ElementType, StateType, Component<ElementType, StateType>>;
//     elementCreating?(current: any): any;
// }

// const Both: typeof ComponentDetailed & { new(): ComponentBasic } = ComponentDetailed as any ;

// var b = new Both<any, any, any>('div', {
//     setup(sender) {

//     },
// });

export function AsyncContainer(importer, props) {
    var result = new Component({});
    if (importer instanceof Promise) {
        result.using(importer, (c: any) => {
            if (c.default) {
                result.controls.add(resolveElement(c.default, props) as any);    
            } else {
                throw new Error("has not found default export.",c); 
            }
            
        })
    }
    return result;
}

// const Components = new Set();
// Components.add('movicompoent');
export function moviComponent(tag?: any, options?: any): Component<any, any> {
    if (typeof tag === 'string' || tag instanceof Element) {
        if (tag instanceof HTMLSlotElement || tag === 'slot') {
            if (options && options.props) {
                options.props['isSlot'] = true;
            } else {
                options = { ...options, props: { isSlot: true } }
            }
            return resolveElement(null, { ...options });
        } else
            if (tag instanceof HTMLUnknownElement) {
                return resolveElement('div', options);
            } else if (typeof tag === 'function') {
                return new Component({ view: () => tag, ...options });
            } else {
                return new Component(tag, options);
            }

    } else {

        return resolveElement(tag, options);
    }
}

export function createElement(tag: any, options: any): Component<any, any> {
    if (typeof tag === 'string' || tag instanceof Element) {
        return new Component(tag, options);
    } else {
        return resolveElement(tag, options);
    }
} 
export function moviFragment(options: any): Component<any, any> {
    // console.error("[MOVIJS]: fragment is not supported. auto convert to div element.")
    // return moviComponent('div', {...options});
    return new Component({ ...options });
    var ops = {
        settings: { isRouterView: true },
        isFragment: true,
        ...options
    };

    // var f = new Fragment<any>(ops);// new Component({ isFragment: true, ...options });
    // console.error(options)
    // // f.onmounted = (s) => { 
    // //     //Object.assign(s, options);


    // // }
    // // f.onbuilded = (sender) => { 
    // //     if (options.nodes && Array.isArray(options.nodes)) { 
    // //         options.nodes.forEach(txs => {
    // //            // s.controls.add(moviComponent('div', {}))
    // //            // console.error('Mounted',s.controls._map.has(txs))
    // //             sender.controls.add(txs);
    // //         })
    // //     } 
    // //     console.error('onbuilded',sender);
    // //     return sender;
    // // }
    // // //Object.assign(f, options);
    // // //f.controls.add(moviComponent('div', {}))
    // // console.error('fragment',f);
    // return f;
} 
function resolveElement(tag, props): Component<any, any> {

    var controller: any;
    const Ctx = Object.assign({}, {
        context: ApplicationService.current,
    })

    if (Array.isArray(tag)) {
        controller = tag[0];
    } else if (tag instanceof Component) {

        controller = tag;
    } else if (typeof tag === "function") {


        try {
            // tag = tag.bind(Ctx)
            var getFn = tag;


            if (getFn instanceof Component || (getFn.prototype && getFn.prototype instanceof Component)) {
                // var p = props['props'];
                // delete props['props'];
                controller = new getFn(props);
                Object.assign(controller, props);
                //controller.props = p;
                // p && Object.keys(p).forEach(pname => {
                //     // delete controller[pname];
                // })

            } else if (typeof getFn === 'object') {
                controller = new Component({ ...getFn, ...Ctx, ...props });
            } else {
                var ntag; 
                try {
                    if (tag && Object.getPrototypeOf(tag) && Object.getPrototypeOf(tag).constructor) {
                        ntag = new tag({...props });
                    } else {
                        ntag = tag(props);
                    }
                } catch (error) {
                    ntag = tag(props);
                } 

                if (ntag instanceof Promise) {
                    controller = AsyncContainer(ntag, props);
                } else if (ntag instanceof Component) { 
                    return ntag;
                    //controller = new Component({ view: () => ntag, ...props })
                } else {
                    controller = new Component({ view: () => ntag, ...props })
                }

            }

        } catch (error) {
            controller = tag(props);
            // if (!controller['bind']) {
            //     controller = Object.assign(controller, new Component(props));
            // }
        }
    } else {

        controller = new Component({ ...tag, ...Ctx, ...props });

    }

    return controller;
} 
import { Component, CreateMoviApp, cache } from "movijs";
import router from "./config/router.js";
import "./index.css";

var lngList = new Set<string>();
lngList.add("tr");
lngList.add("en");
const apps = new CreateMoviApp({
    Configuration(options) {
        options.setStateProvider('ui', {
            theme: 'light'
        });
        options.Route.router.gate = (next, e) => {
            if (e.route.params.lang == '' || !lngList.has(e.route.params.lang.toLowerCase())) {
                //window.location.href = "/tr";
                e.route.path = "/tr"
            }
            next();
        }
        router.map((r) => {
            options.Route.add(r as any);
        })
        cache.set("x", this.context.useModel({ isminis: 'Ekrem Erşahin' }));
        // useCache(() => { }, this.context.MainPage as any)
        options.setErrorPages('404',()=>new Component('div'))
        // options.onReactiveEffectRun = (s,t) => {
        //     console.error(s,t);
        // }
    },
    ServiceConfiguration() {

    } 
});

// var privateNames = new Set<string>();
// privateNames.add('attr');
// privateNames.add('bind');
// privateNames.add('class');
// privateNames.add('context');
// privateNames.add('controls');
// privateNames.add('current');
// privateNames.add('currentlist');
// privateNames.add('element');
// privateNames.add('ghostPlaceholder');
// privateNames.add('options');
// privateNames.add('previouspage');
// privateNames.add('siblings');
// privateNames.add('siblingsDom');
// privateNames.add('slots');
// privateNames.add('_');
// privateNames.add('_emitCollection');
// privateNames.add('_parent');
// privateNames.add('_tempContent');
// privateNames.add('intervention');
// privateNames.add('directiveSettings');
// privateNames.add('directive');
// privateNames.add('elementData');
// document.addEventListener('click', () => {
//     var getSubItems = (el) => {
//         if (el) {
//             var rds = [];
//             el.forEach(x => {


//                 var props = {};
//                 Object.keys(x).forEach(y => {
//                     if (typeof x[y] !== 'function' && x[y] != undefined && y != 'Prototype' && !privateNames.has(y) && !(x[y] instanceof Element)) {
//                         props[y] = x[y]
//                     }
//                 })
//                 var proto = Object.getPrototypeOf(x);
//                 rds.push({
//                     node: {
//                         name: (proto && proto.constructor && proto.constructor.name) ? proto.constructor.name : x.element.nodeName,
//                         el: x.element.nodeName,
//                         type: x.element.nodeType
//                     },
//                     data: props,
//                     childs: getSubItems(x.controls)
//                 })
//             })
//             return rds;
//         } else {
//             return {};
//         }
//     }

//     console.error(JSON.parse(JSON.stringify(getSubItems(apps.context.MainPage.controls))));
//     window.postMessage({
//         element: JSON.parse(JSON.stringify(getSubItems(apps.context.MainPage.controls)))
//     }, '*');
// })

apps.run(document.getElementById("app") as HTMLElement);
// var style = makeStyles(reactive({
//     body: {
//         backgroundColor: '#ff0000'
//     }
// }));

// document.addEventListener('click', () => {
//     style.style.body.backgroundColor = '#0000FF';
// });


// ApplicationService.current.MainPage.bind.effect(() => {
//     var styles = style.render();
//     ApplicationService.current.MainPage.class.add(styles.body);
// })


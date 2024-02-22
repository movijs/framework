import { CreateMoviApp, ReactiveEngineMapper, reactiveListeners } from "movijs";
import router from "./config/router.js";
import "./index.css";
window['rem'] = ReactiveEngineMapper;
window['rl'] = reactiveListeners;
const apps = new CreateMoviApp({
    Configuration(options) {
        options.setStateProvider('ui', {
            theme: 'light'
        });
        options.Route.router.gate = (next, e) => {
            next();
        }
        router.map((r) => {
            options.Route.add(r as any);
        })

        // options.onReactiveEffectRun = (s,t) => {
        //     console.error(s,t);
        // }
    },
    ServiceConfiguration() {

    }

});

apps.run(document.getElementById("app") as HTMLElement);


// new StyleManager();

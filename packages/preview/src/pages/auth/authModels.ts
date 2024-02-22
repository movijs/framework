import axios from "axios";
import { engine } from "movijs";

export const ShellController = engine.reactive({
    shellSettings: {} as any,
    t(key, val) {
        return this.shellSettings[key] ? this.shellSettings[key] : val;
    },
    loadShelData() {
        axios.get("/api/Configrations/GetConfiguration?Scope=login").then(x => {
            if (x.data) {
                this.shellSettings = x.data.result.shellSettings;
                console.error(this.shellSettings)
            } 
        });
    },
    clearSettings() { engine.clearModel(ShellController) }
})
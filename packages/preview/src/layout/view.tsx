import { LayoutViewModel } from "./view.model";

export default function (model: LayoutViewModel) {
    var current;
    if (model.current == 0) {
        current = <div onclick={() => { model.current = 1 }}>
            {model.text}
        </div>
    } else {
        current = <div onclick={() => { model.current = 0 }}>
            {model.text2}
        </div>
    }
    return current;
}
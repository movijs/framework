import { styles, btn } from "./index.style";
import "./index.style.css";

export default function ({ appearance, ...props }) {
    return <div class={'button'}>
        <div>
            {props.slots.map(t => t)}
        </div>
    </div>
}
import { Component } from "../Component";
import { Frame } from "../Frame";
interface RenderEffectProps {
    expression: () => any,
    render: (sender) => any
}
export class RenderEffect extends Frame {
    constructor(props: RenderEffectProps) {
        super(props);
        this.useDynamicView(props.expression, props.render);
    }
} 
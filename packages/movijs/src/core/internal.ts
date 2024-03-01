import { Component } from "../Component";
import { NodeTypes } from "../abstractions/NodeTypesEnum";
import { dom } from "./Dom";

export function advanceif(source: Component<any, any>, ...targets: NodeTypes[]) {
    if (targets.indexOf(source.element.nodeType) > -1) {
        return true;
    }
    return false;
}

export function advelif(source: any, ...targets: NodeTypes[]) {
    if (targets.indexOf(source.nodeType) > -1) {
        return true;
    }
    return false;
}
export function isAnchorElement(source: Component<any, any>) {
    return source.element.nodeName == 'A';
}

export function isElement(source: Component<any, any>) {
    return source.element.nodeType == NodeTypes.ELEMENT_NODE;
}
export function isTemplate(source: Component<any, any>) {
    return source.element.nodeName == 'TEMPLATE';
}

export function canUseDOM(): boolean {
    return typeof dom.window !== 'undefined' && !!(dom.window.document && dom.window.document.createElement);
}
import { ANIMATION, CSSTransitionInfo, TRANSITION, TransitionProps } from "../abstractions/transition";
import { dom } from "./Dom";
var fxElement = dom.createElement('div');

export function getTransitionInfo(
    el: Element,
    name: string,
    Type?: TransitionProps['type']
): CSSTransitionInfo {
    var oldC;
    var isnew = false;
    var styles;
    if (!el.isConnected) {
        fxElement.setAttribute('style', 'width:0!important;height:0!important;display:none');
        dom.body.appendChild(fxElement);
        fxElement.setAttribute('class', name);
        isnew = true;
        styles = window.getComputedStyle(fxElement);
    } else if (el.isConnected && el.nodeType !=8) { 
        styles = window.getComputedStyle(el);
    } else {
        fxElement.setAttribute('style', 'width:0!important;height:0!important;display:none');
        dom.body.appendChild(fxElement);
        fxElement.setAttribute('class', name);
        isnew = true;
        styles = window.getComputedStyle(fxElement);
    }

    if (styles) {
        const getStyleProperties = (key: string) => (styles[key] || '').split(', ')

        const transitionDelays = getStyleProperties(TRANSITION + '-delay')
        const transitionDurations = getStyleProperties(TRANSITION + '-duration')
        const transitionTimeout = getTimeout(transitionDelays, transitionDurations)
        const animationDelays = getStyleProperties(ANIMATION + '-delay')
        const animationDurations = getStyleProperties(ANIMATION + '-duration')
        const animationTimeout = getTimeout(animationDelays, animationDurations)

        let type: CSSTransitionInfo['type'] = null
        let timeout = 0
        let propCount = 0
        if (Type === TRANSITION) {
            if (transitionTimeout > 0) {
                type = TRANSITION
                timeout = transitionTimeout
                propCount = transitionDurations.length
            }
        } else if (Type === ANIMATION) {
            if (animationTimeout > 0) {
                type = ANIMATION
                timeout = animationTimeout
                propCount = animationDurations.length
            }
        } else {
            timeout = Math.max(transitionTimeout, animationTimeout)
            type =
                timeout > 0
                    ? transitionTimeout > animationTimeout
                        ? TRANSITION
                        : ANIMATION
                    : null
            propCount = type
                ? type === TRANSITION
                    ? transitionDurations.length
                    : animationDurations.length
                : 0
        }
        const hasTransform =
            type === TRANSITION &&
            /\b(transform|all)(,|$)/.test(styles[TRANSITION + 'Property'])

        if (isnew) {
            fxElement.remove();
        }
        return {
            type,
            timeout,
            propCount,
            hasTransform
        }
    }


    return {
        type: 'animation',
        timeout: 0,
        propCount: 0,
        hasTransform: false
    }

}


export function getTransitionInfoFromElement(
    el: Element,
    Type?: TransitionProps['type']
): CSSTransitionInfo {
    var oldC;
    var isnew = false;
    var styles; 
    styles = window.getComputedStyle(el); 
    if (styles) {
        const getStyleProperties = (key: string) => (styles[key] || '').split(', ')

        const transitionDelays = getStyleProperties(TRANSITION + '-delay')
        const transitionDurations = getStyleProperties(TRANSITION + '-duration')
        const transitionTimeout = getTimeout(transitionDelays, transitionDurations)
        const animationDelays = getStyleProperties(ANIMATION + '-delay')
        const animationDurations = getStyleProperties(ANIMATION + '-duration')
        const animationTimeout = getTimeout(animationDelays, animationDurations)

        let type: CSSTransitionInfo['type'] = null
        let timeout = 0
        let propCount = 0
        if (Type === TRANSITION) {
            if (transitionTimeout > 0) {
                type = TRANSITION
                timeout = transitionTimeout
                propCount = transitionDurations.length
            }
        } else if (Type === ANIMATION) {
            if (animationTimeout > 0) {
                type = ANIMATION
                timeout = animationTimeout
                propCount = animationDurations.length
            }
        } else {
            timeout = Math.max(transitionTimeout, animationTimeout)
            type =
                timeout > 0
                    ? transitionTimeout > animationTimeout
                        ? TRANSITION
                        : ANIMATION
                    : null
            propCount = type
                ? type === TRANSITION
                    ? transitionDurations.length
                    : animationDurations.length
                : 0
        }
        const hasTransform =
            type === TRANSITION &&
            /\b(transform|all)(,|$)/.test(styles[TRANSITION + 'Property'])

        if (isnew) {
            fxElement.remove();
        }
        return {
            type,
            timeout,
            propCount,
            hasTransform
        }
    }


    return {
        type: 'animation',
        timeout: 0,
        propCount: 0,
        hasTransform: false
    }

}

function getTimeout(delays: string[], durations: string[]): number {
    while (delays.length < durations.length) {
        delays = delays.concat(delays)
    }
    return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])))
}

function toMs(s: string): number {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

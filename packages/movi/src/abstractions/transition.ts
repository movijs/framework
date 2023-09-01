export const TRANSITION = 'transition'
export const ANIMATION = 'animation'

export interface CSSTransitionInfo {
    type: typeof TRANSITION | typeof ANIMATION | null
    propCount: number
    timeout: number
    hasTransform: boolean
}

export interface TransitionProps {
    name?: string
    type?: typeof TRANSITION | typeof ANIMATION
    css?: boolean
    duration?: number | { enter: number; leave: number }
    // custom transition classes
    enterFromClass?: string
    enterActiveClass?: string
    enterToClass?: string
    appearFromClass?: string
    appearActiveClass?: string
    appearToClass?: string
    leaveFromClass?: string
    leaveActiveClass?: string
    leaveToClass?: string
}
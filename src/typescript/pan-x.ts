import {addToConstructorQueue, AnyWidget, EventConfig, registerCleanUp} from '@feather-ts/feather-ts'
import {addEventListeners, hasPointers, removeEventListeners, supportsOnlyTouch} from './util'

type EventType = 'start' | 'move' | 'end'
type EventSet = {[k in EventType]: string[]}
type PointerEvent = MouseEvent & TouchEvent

const PointerEvents: EventSet = {
    start: ['pointerdown'],
    move: ['pointermove'],
    end: ['pointerup']
}

const OnlyTouch: EventSet = {
    start: ['touchstart'],
    move: ['touchmove'],
    end: ['touchend']
}

const NoPointerEvents: EventSet = {
    start: ['touchstart', 'mousedown'],
    move: ['touchmove', 'mousemove'],
    end: ['touchend', 'mouseup']
}

const eventSet = hasPointers ? PointerEvents : (supportsOnlyTouch ? OnlyTouch : NoPointerEvents)

export enum Phase {
    start,
    move,
    end
}

interface ExtraInfo {
    startX: number
    startY: number
    startTime: number
}

export interface PanXEventInit {
    x: number,
    y: number,
    phase: Phase,
    diffX: number,
    diffY: number,
    diffTime: number,
    target: EventTarget
}

const getPanXEvent = (ev: PointerEvent, phase: Phase, extra = {} as ExtraInfo) => {
    const x = ev.clientX || (ev.touches && ev.touches.length ?
        ev.touches[0].pageX : ev.changedTouches[0].pageX)
    const y = ev.clientY || (ev.touches && ev.touches.length ?
        ev.touches[0].pageY : ev.changedTouches[0].pageY)
    return new CustomEvent<PanXEventInit>('pan-x', {
        bubbles: true,
        cancelable: true,
        detail: {
            x,
            y,
            phase,
            diffX: x - extra.startX,
            diffY: y - extra.startY,
            diffTime: +new Date() - extra.startTime,
            target: ev.target
        }
    })
}

const doc = document.documentElement

const distance = (s: CustomEvent<PanXEventInit>) =>
    Math.sqrt(s.detail.diffX * s.detail.diffX + s.detail.diffY * s.detail.diffY)

const initPanX = (widget: AnyWidget, method: string, conf: EventConfig, node: HTMLElement) => {
    if (conf.selector) {
        node = node.querySelector(conf.selector)
    }
    const handler = (sev: PointerEvent) => {
        const time = +new Date(),
              isMouse = /mouse/.test(sev.type)
        if (sev.which === 3) {
            return;
        }
        const setIndex = isMouse ? 1 : 0
        // - - - start - - - //
        sev.preventDefault()
        const startEvent = getPanXEvent(sev, Phase.start)
        const extra = {
            startTime: time,
            startX: startEvent.detail.x,
            startY: startEvent.detail.y
        }
        // - - - move - - - //
        widget[method](startEvent)
        const moveListener = (mev: PointerEvent) => {
            const moveEvent = getPanXEvent(mev, Phase.move, extra)
            if (distance(moveEvent) > 5) {
                mev.preventDefault()
                widget[method](moveEvent)
            }
        }
        doc.addEventListener(eventSet.move[setIndex], moveListener)
        // - - - end - - - //
        const endListener = (eev: PointerEvent) => {
            const endEvent = getPanXEvent(eev, Phase.end, extra)
            if (distance(endEvent) < 5) {
                eev.target.dispatchEvent(new CustomEvent('tap', {bubbles: true, cancelable: true}))
            }
            widget[method](endEvent)
            doc.removeEventListener(eventSet.move[setIndex], moveListener)
            doc.removeEventListener(eventSet.end[setIndex], endListener)
        }
        doc.addEventListener(eventSet.end[setIndex], endListener)
    }
    addEventListeners(eventSet.start, node, handler)
    registerCleanUp(node, () => removeEventListeners(eventSet.start, node, handler))
}

export const PanX = (conf: EventConfig = {}) => (proto: AnyWidget, method: string) => {
    addToConstructorQueue(proto.constructor as any,
        (widget: AnyWidget, node: HTMLElement) => {
            initPanX(widget, method, conf, node)
        })
}

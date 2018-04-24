import {addToConstructorQueue, AnyWidget} from '@feather-ts/feather-ts/dist/decorators/construct'
import {EventConfig} from '@feather-ts/feather-ts/dist/decorators/event'
import {registerCleanUp} from '@feather-ts/feather-ts/dist/core/cleanup'

const hasPointers = ('onpointerup' in document.documentElement)

type EventType = 'start' | 'move' | 'end'
type EventSet = {[k in EventType]: string[]}
type PointerEvent = MouseEvent & TouchEvent

const PointerEvents: EventSet = {
    start: ['pointerdown'],
    move: ['pointermove'],
    end: ['pointerup']
}

const NoPointerEvents: EventSet = {
    start: ['touchstart', 'mousedown'],
    move: ['touchmove', 'mousemove'],
    end: ['touchend', 'mouseup']
}

const eventSet = hasPointers ? PointerEvents : NoPointerEvents

const addEventListeners = (types: string[], node: Element, listener: EventListener, options?) => {
    types.forEach(type => node.addEventListener(type, listener, options))
}

const removeEventListeners = (types: string[], node: Element, listener: EventListener) => {
    types.forEach(type => node.removeEventListener(type, listener))
}

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
    x: number
    y: number
    phase: Phase
    diffX: number
    diffY: number
    diffTime: number
}

const getPanXEvent = (ev: PointerEvent, phase: Phase, extra = {} as ExtraInfo) => {
    const x = ev.clientX || (ev.touches && ev.touches.length ? ev.touches[0].pageX : ev.changedTouches[0].pageX)
    const y = ev.clientY || (ev.touches && ev.touches.length ? ev.touches[0].pageY : ev.changedTouches[0].pageY)
    return new CustomEvent<PanXEventInit>('pan-x', {
        bubbles: true,
        cancelable: true,
        detail: {
            x,
            y,
            phase,
            diffX: x - extra.startX,
            diffY: y - extra.startY,
            diffTime: +new Date() - extra.startTime
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

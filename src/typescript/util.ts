export const hasPointers = 'onpointerdown' in document.documentElement
export const supportsOnlyTouch = /android|iphone|webos|ipad|ipod|blackberry/i.test(navigator.userAgent);

export const addEventListeners = (types: string[], node: Element, listener: EventListener, options?) => {
    types.forEach(type => node.addEventListener(type, listener, options))
}

export const removeEventListeners = (types: string[], node: Element, listener: EventListener) => {
    types.forEach(type => node.removeEventListener(type, listener))
}

const click = hasPointers ? 'pointerdown' : 'touchstart'

export const documentClick = (el: HTMLElement, func: Function) => {
    const doc = document.documentElement
    const handler = (ev: PointerEvent) => {
        if (!el.contains(ev.target as Element)) {
            doc.removeEventListener(click, handler)
            func()
        }
    }
    doc.addEventListener(click, handler, {passive: false, capture: false})
}

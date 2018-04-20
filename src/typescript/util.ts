export const documentClick = (el: HTMLElement, func: Function) => {
    const doc = document.documentElement
    const handler = (ev: PointerEvent) => {
        if (!el.contains(ev.target as Element)) {
            doc.removeEventListener('pointerdown', handler)
            func()
        }
    }
    doc.addEventListener('pointerdown', handler)
}

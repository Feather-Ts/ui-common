import {Construct, Widget} from '@feather-ts/feather-ts/dist/decorators/construct'
import {On} from '@feather-ts/feather-ts/dist/decorators/event'
import {PanX, PanXEventInit, Phase} from './pan-x'
import './snap-scroll.pcss'

@Construct({selector: '.snap-scroll'})
export class SnapScroll implements Widget {

    element: HTMLElement
    currentSlide: number
    slideChanged: (slide: number) => void

    init = (el: HTMLElement) => {
        this.element = el
        this.applyCurrentSlide()
    }

    private applyCurrentSlide() {
        this.element.style.transform = `translateX(${-this.currentSlide * 100}%)`
    }

    next() {
        this.go(this.currentSlide + 1, true)
    }

    prev() {
        this.go(this.currentSlide - 1, true)
    }

    reset(slide: number) {
        this.go(slide, false)
    }

    go(slide: number, animate: boolean) {
        if (animate) {
            const cls = this.element.classList
            if (cls.contains('animate')) {
                return
            }
            cls.add('animate')
        }
        this.currentSlide = slide
        this.applyCurrentSlide()
    }

    @PanX()
    panX1(ev: CustomEvent<PanXEventInit>) {
        const el = this.element,
              detail = ev.detail,
              cls = el.classList
        if (cls.contains('animate')) {
            return
        }
        switch (detail.phase) {
            case Phase.start:
                cls.add('drag')
                break;
            case Phase.move:
                el.style.transform = `translateX(${-this.currentSlide * 100}%) translateX(${detail.diffX}px)`
                break;
            case Phase.end:
                cls.remove('drag')
                const diffX = Math.abs(detail.diffX)
                if (diffX !== 0) {
                    cls.add('animate')
                    if ((detail.diffTime < 150 && diffX > 10) || (diffX > el.getBoundingClientRect().width / 2)) {
                        this.currentSlide += detail.diffX < 0 ? 1 : -1
                    }
                    this.applyCurrentSlide()
                }
                break;
        }
    }

    @On({})
    transitionend(ev: TransitionEvent) {
        this.element.classList.remove('animate')
        this.slideChanged(this.currentSlide)
    }
}

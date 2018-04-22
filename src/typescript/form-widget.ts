import {Widget, render} from '@feather-ts/feather-ts';

export interface FormWidgetConfig<T> {
    initialValue: T
    changed: (value: T) => void
}

export class FormWidget<T> implements Widget {

    config: T

    init = (el: Element) => render(this, el)

}

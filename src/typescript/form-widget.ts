import {Widget} from '@feather-ts/feather-ts/dist/decorators/construct';
import {render} from '@feather-ts/feather-ts/dist/core/bind';

export interface FormWidgetConfig<T> {
    initialValue: T
    changed: (value: T) => void
}

export class FormWidget<T> implements Widget {

    config: T

    init = (el: Element) => render(this, el)

}

import { Component, ContentBlock, MoviComponent, RouterView } from "movijs";
import { LayoutViewModel } from "./view.model";
import view from "./view";
export function AccordionTitle({ title, ...props }) {
    console.error(props)
    return <h2 id="accordion-collapse-heading-1" {...props}>
        <button type="button" class="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200   dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3" data-accordion-target="#accordion-collapse-body-1" aria-expanded="true" aria-controls="accordion-collapse-body-1">
            <span>{title}</span>
            <svg data-accordion-icon class="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5" />
            </svg>
        </button>
    </h2>
}
export function AccordionContent(props) {

    return <div id="accordion-collapse-body-1" aria-labelledby="accordion-collapse-heading-1">
        <div class="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
            {props.slots.map(t => t)}
        </div>
    </div>
}

export function AccordionItem({ title, itemClick, ...props }) {
    console.error(props);
    return <div {...props}>
        <AccordionTitle title={title} ></AccordionTitle>
        <AccordionContent >
            {() => props.slots.map(t => t)}
        </AccordionContent>
    </div>
}

export function Accordion({ ...props }) {
    return <div id="accordion-collapse" data-accordion="collapse">
        {() => props.slots.map(t => t)}
    </div>
}
export default class MainLayout extends Component {
    constructor() {
        super({});
        this.closeAll = this.closeAll.bind(this);
    }
    panel1;
    panel2;
    panel3;
    closeAll(panel) {
        this.panel1.class.add('hidden');
        this.panel2.class.add('hidden');
        this.panel3.class.add('hidden');
        panel.class.remove('hidden');
    }
    model = this.useModel({
        selectedItem: {} as any
    })
    view() {
        return <div class={""}>
            <h1>{this.context.route.params.lang}</h1>
            <RouterView onconfig={(s) => {
                s.options.transition.name = 'fade'
            }}></RouterView>

            <ContentBlock target="normal">
                <h1 onclick={(e, s) => { s.dispose() }}>AX1</h1>
            </ContentBlock>
            <ContentBlock target="anormal">
                <h1>BX1</h1>
            </ContentBlock>
            <ContentBlock target="expr">
                <h1>CX!</h1>
            </ContentBlock>
        </div>
    }
}


import { Component, MoviComponent, cache } from "movijs";
import { Test } from "../component/test.jsx";
import View from "./view.jsx";

globalThis.activateMovi = () => { }

//anchor:RouterLink
export default class HomePage extends Component<any, any> {
    constructor() {
        super('div');
        // debugger
        //new moviCompiler.default.Compiler().start(`<div {...this.model}></div>`, "deneme.tsx"); 
        this.options.transition.name = "fade";

    }
    oncreating(sender: Component<any, any>) {
        sender.options.settings.symbol = Symbol('x');

    }
    cacheData = cache.get<any>("x");
    model = this.useModel({
        count: 0,
        items: [
            { order: 6, name: 'A0' },
            { order: 1, name: 'A1' },
            { order: 2, name: 'A2' },
            { order: 3, name: 'A3' },
            { order: 4, name: 'A4' }
        ],
        abbas: null,
        todo: [
            { title: 'A1', completed: false },
            { title: 'A2', completed: false },
            { title: 'A3', completed: false },
            { title: 'A4', completed: false },
            { title: 'A5', completed: false },
            { title: 'A6', completed: true },
            { title: 'A7', completed: true },
            { title: 'A8', completed: true },
            { title: 'A9', completed: true },
            { title: 'A10', completed: true }
        ]
    })

    onRefCreated(sender: MoviComponent<any, any, any>) {

    }
    view() {
        var pch = <>
            <h1>A1</h1>
            <h1>A2</h1>
            <h1>A3</h1>
            <h1>A4</h1>
            <h1>A5</h1>
        </>;


        return <div>
            <View
                onclick={() => alert('ok')}
                onmouseover={() => { }}
                class={["evet", 'hayır', () => 'xm-' + this.model.count]}
                onbuilded={(S) => S.class.add('olabilir')}></View>
            {() => pch}
            {/* {() => {

                this.bind.effect(() => {
                    if (this.model.abbas) {
                        pch.navigate(<div>ABBAS MEVCUT</div>);
                    } else {
                        pch.navigate(<div>ABBAS YOK</div>);
                    }
                });
                return pch
            }} */}

            <Test props={{ name: '' }} x-ref={(s) => { this.model.abbas = s; this.onRefCreated(s) }}></Test>
            {this.cacheData.isminis}

            <div onclick={() => {this.model.count++; }}>DEĞİŞTİR</div>

            <a href={`/tr`} class="bg-blue-400 px-3 py-1 text-white border-l m-2" useRouter={true} initializeComponent={(s) => { this.useModel({ deneme: 'OK' }) }}>TR</a>
            <a href={"/en"} class="bg-blue-400 px-3 py-1 text-white border-l m-2" useRouter={true} initializeComponent={(s) => { this.useModel({ deneme: 'OK' }) }}>EN</a>

            <a href={`/${this.context.route.params.lang}/about`} useRouter={true} initializeComponent={(s) => { this.useModel({ deneme: 'OK' }) }}>Linkten Giden</a>
            <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
                <div class="shrink-0">
                    <svg class="h-12 w-12" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="a"><stop stop-color="#2397B3" offset="0%"></stop><stop stop-color="#13577E" offset="100%"></stop></linearGradient><linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="b"><stop stop-color="#73DFF2" offset="0%"></stop><stop stop-color="#47B1EB" offset="100%"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><path d="M28.872 22.096c.084.622.128 1.258.128 1.904 0 7.732-6.268 14-14 14-2.176 0-4.236-.496-6.073-1.382l-6.022 2.007c-1.564.521-3.051-.966-2.53-2.53l2.007-6.022A13.944 13.944 0 0 1 1 24c0-7.331 5.635-13.346 12.81-13.95A9.967 9.967 0 0 0 13 14c0 5.523 4.477 10 10 10a9.955 9.955 0 0 0 5.872-1.904z" fill="url(#a)" transform="translate(1 1)"></path><path d="M35.618 20.073l2.007 6.022c.521 1.564-.966 3.051-2.53 2.53l-6.022-2.007A13.944 13.944 0 0 1 23 28c-7.732 0-14-6.268-14-14S15.268 0 23 0s14 6.268 14 14c0 2.176-.496 4.236-1.382 6.073z" fill="url(#b)" transform="translate(1 1)"></path><path d="M18 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM24 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM30 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="#FFF"></path></g></svg>
                </div>
                <div>
                    <div class="text-xl font-medium text-black">ChitChat</div>
                    <p class="text-slate-500">You have a new message!</p>
                </div>
            </div>

            <ul role="list" class="p-6 divide-y divide-slate-200">
                {this.model.items.map(person => {
                    return <li class="flex py-4 first:pt-0 last:pb-0">
                        <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                        <div class="ml-3 overflow-hidden">
                            <p class="text-sm font-medium text-slate-900">{person.name}</p>
                            <p class="text-sm text-slate-500 truncate">{person.name}</p>
                        </div>
                    </li>
                })}


            </ul>

            <div class="max-w-lg mx-auto p-8">
                <details class="open:bg-white dark:open:bg-slate-900 open:ring-1 open:ring-black/5 dark:open:ring-white/10 open:shadow-lg p-6 rounded-lg transition" open>
                    <summary class="text-sm leading-6 text-slate-900 dark:text-white font-semibold select-none">
                        Why do they call it Ovaltine?
                    </summary>
                    <div class="mt-3  text-sm leading-6 text-slate-600 dark:text-slate-400">
                        <p>The mug is round. The jar is round. They should call it Roundtine.</p>
                    </div>
                </details>
            </div>

            <input id="draft" class="peer/draft" type="radio" name="status" checked />
            <label for="draft" class="peer-checked/draft:text-sky-500">Draft</label>

            <input id="published" class="peer/published" type="radio" name="status" />
            <label for="published" class="peer-checked/published:text-sky-500">Published</label>


            <button class="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">
                Değişiklikleri Kaydet
            </font></font></button>

            <div class="py-8 px-8 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
                <img class="block mx-auto h-24 rounded-full sm:mx-0 sm:shrink-0" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Woman's Face" />
                <div class="text-center space-y-2 sm:text-left">
                    <div class="space-y-0.5">
                        <p class="text-lg text-black font-semibold">
                            Erin Lindford
                        </p>
                        <p class="text-slate-500 font-medium">
                            Product Engineer
                        </p>
                    </div>
                    <button class="px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">Message</button>
                </div>
            </div>

            <button class="border border-slate-300 hover:border-indigo-300">
                Send email
            </button>
            <div class="bg-white rounded-xl shadow-lg  space-x-4">
                <div class="flex items-center space-x-2 text-base">
                    <h4 class="font-semibold text-slate-900">Contributors</h4>
                    <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">204</span>
                </div>
                <div class="mt-3 flex -space-x-2 overflow-hidden">
                    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="" />
                    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                    <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                </div>
                <div class="mt-3 text-sm font-medium">
                    <a href="#" class="text-blue-500">+ 198 others</a>
                </div>
            </div>

            <br></br>
            asdasdsadasd
        </div>
    }

}
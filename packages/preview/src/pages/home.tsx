
import { Component, ReactiveEngineMapper, reactiveListeners, ContentBlock, ContentBody, LoopContainer, RouterLink } from "movijs";
import * as moviCompiler from "movijsx";
import { makeStyles } from "movistyler";

export default class HomePage extends Component<any, any> {
    constructor() {
        super('div');
        // debugger
        //new moviCompiler.default.Compiler().start(`<div {...this.model}></div>`, "deneme.tsx"); 
    }



    model = this.useModel({
        count: 0,
        items: [
            { order: 6, name: 'A0' },
            { order: 1, name: 'A1' },
            { order: 2, name: 'A2' },
            { order: 3, name: 'A3' },
            { order: 4, name: 'A4' }
        ],
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
    view() {
        return <>
            {/* <LoopContainer props={{
                itemSource: () => this.model.items,
                keyExpr: 'order',
                el: 'div',
                template: (x) => {
                    return <div >
                        <input x-value={() => x.order} onchange={(e) => x.order = parseInt(e.target.value)}></input>
                        {x.name} -- {x.order}
                    </div>
                }
            }}></LoopContainer> */}
            <div onconfig={(s) => {
                s.bind.loop(() => this.model.items.sort((a, b) => { return a.order < b.order ? -1 : 0 }), (x) => {
                    return <div>
                        <input x-value={() => x.order} onchange={(e) => x.order = parseInt(e.target.value)}></input>
                        {x.name} -- {x.order}
                    </div>
                })
            }}></div>
            <input x-value={this.model.items[0].order} onchange={(e) => { this.model.items[0].order = e.target.value }}></input>
            <RouterLink to="/">HOME</RouterLink> | <RouterLink to="/about">ABOUT</RouterLink>
            HOME PAGE

            <h1>--</h1>
            {
                this.model.items.sort((a, b) => { return a.order < b.order ? -1 : 0 }).map(x => {
                    return <div key={x.order}>
                        <input x-value={() => x.order} onchange={(e) => x.order = parseInt(e.target.value)}></input>
                        {x.name} -- {x.order}
                    </div>
                })
            }
            <div>
                <div key={this.model.count} onconfig={(s) => {
                    console.error(s);
                }}>
                    {this.model.items[0].order} {this.context.state.ui.theme}
                </div>
                <button onclick={(e, s) => {
                    this.model.count++;
                    if (this.context.state.ui.theme == 'dark') {
                        this.context.state.ui.theme = 'light'
                    } else {
                        this.context.state.ui.theme = 'dark'
                    }
                }}>Convert to dark</button>

            </div>


        </>
    }
}
import * as movi from "movijs";
import { Component } from "movijs";
//import { moviComponent as _mc, Component as _mcomp } from "movijs";

import * as m from 'monaco-editor';
import   * as Compiler from 'movijsx';
console.warn(Compiler);
//import * as Compiler from 'movijsx';

declare global {
    interface Window {
        monaco: typeof m
        init: () => void
    }
}

interface PersistedState {
    src: string
}



export class Explorer extends movi.Component<any, any> {
    persistedState = JSON.parse(localStorage.getItem('state') || '{}')
    sharedEditorOptions: m.editor.IStandaloneEditorConstructionOptions = {
        theme: 'vs-dark',
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        contextmenu: true,
        minimap: {
            enabled: true,
        },
    }
    editors = {
        editor: null as any,
        output: null as any
    }
    monaco = window['monaco']

    constructor() {
        super('div');
        const { monaco } = window;
        this.monaco = monaco;
        this.catchChanges = this.catchChanges.bind(this);
        this.sourceEditorSettings = this.sourceEditorSettings.bind(this);
        this.outputEditorSettings = this.outputEditorSettings.bind(this);
        this.CompileSource = this.CompileSource.bind(this);
    }

    setup() {

        this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            allowJs: true,
            allowNonTsExtensions: true,
            jsx: this.monaco.languages.typescript.JsxEmit.Preserve,
            target: this.monaco.languages.typescript.ScriptTarget.Latest,
            noSyntaxValidation: true,
        });
        var self = this;
        this.class.add("editor_flex-layout");
        this.add(movi.moviComponent("div", {
            setup: (s) => {
                s.attr.add({
                    "id": "header"
                });
                s.add(movi.moviComponent("text", {
                    setup: (s) => {
                        s.setText("MOVI JSX Explorer");
                    }
                }));
            }
        }));
        this.add(movi.moviComponent("div", {
            setup: (sx) => {
                sx.class.add("split_editor");
                sx.add(movi.moviComponent("div", {
                    onbuilded: (s) => self.sourceEditorSettings(s),
                    setup: (s) => {
                        s.attr.add({
                            "id": "source"
                        });
                        s.class.add("editor");
                    }
                }));
                sx.add(movi.moviComponent("div", {
                    onbuilded: (s) => {

                        self.outputEditorSettings(s);
                        this.editors.editor.layout();
                        this.editors.output.layout();
                        window.addEventListener('resize', () => {
                            this.editors.editor.layout();
                            this.editors.output.layout();
                        });

                        this.CompileSource();
                        this.editors.editor.onDidChangeModelContent(this.catchChanges(this.CompileSource));
                    },
                    setup: (s) => {
                        s.attr.add({
                            "id": "output"
                        });
                        s.class.add("editor");
                    }
                }));
            }
        }));


    }
    onbuilded(sender: movi.Component<any, any>): any {

    }
    CompileSource() {



        const src = this.editors.editor.getValue();
        const state = JSON.stringify({ src });
        localStorage.setItem('state', state);
        // var c = new Compiler();

        // var res =  c.start(src, '');
        // if (res !== null) {
        //   this.editors.output.setValue(res.code + '');
        // } else {
        //   this.editors.output.setValue('asas');
        // }
        try {
            //   var c = new Compiler();

            //   var res = c.start(src, './test.tsx');
            //   if (res !== null) {
            //     this.editors.output.setValue(res.code + '');
            //   } else {
            //     this.editors.output.setValue('');
            //   }

        } catch (error) {
            this.editors.output.setValue((error as Error).stack);
        }
    }


    catchChanges<T extends (...args: any[]) => any>(
        cb: T,
        timolut = 500): T {
        let oldTimer: number | null = null;
        return ((...args: any[]) => {
            if (oldTimer) { clearTimeout(oldTimer); }
            oldTimer = window.setTimeout(() => { cb(...args); oldTimer = null; }, timolut);
        }) as any;
    }

    sourceEditorSettings(sender: movi.Component<any, any>) {
        var opt = {
            value: this.persistedState.src || 'const App = () => <div>Hello World</div>',
            language: 'javascript',
            tabSize: 4,
            readOnly: false,
            ...this.sharedEditorOptions,
        };

        this.editors.editor = this.monaco.editor.create(sender.element, opt);
    }

    outputEditorSettings(sender: movi.Component<any, any>) {
        var opt: m.editor.IStandaloneEditorConstructionOptions = {
            ...this.sharedEditorOptions,
            value: '',
            language: 'typescript',
            readOnly: true,
            tabSize: 4,
        };
        this.editors.output = this.monaco.editor.create(sender.element, opt);
    }
};

window.onload = () => {
    var exp = new Explorer();
    exp.build(document.body);
}


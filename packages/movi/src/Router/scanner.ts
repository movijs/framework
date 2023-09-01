
export const enum CharacterCodes {
    slash = 0x2F,                 // /
    question = 0x3F,              // ?
    colon = 0x3A,                 // :
    openBrace = 0x7B,             // {
    closeBrace = 0x7D,            // }
    equals = 0x3D,                // =
    $ = 0x24,
    backslash = 0x5C,             // \
}




export interface IToken {
    type: 'static' | 'optional' | 'parameter',
    regexs: []
    input: string,
    default: string,
    parameterName: string,
    isOptinal: boolean,
    parameterIndex: number,
    sectionIndex: number
}
export default class Scanner {

    constructor(public source: string) {
        this.tokens = [];
    }
    currentColumn = 0;
    tokens: IToken[] = [];
    AddToken(token: IToken) {
        this.tokens.push(token);
    }

    public parse(): RegExp {
        if (!this.source.startsWith("/")) {
            this.source = "/" + this.source;
        }

        var currentType: 'static' | 'optional' | 'parameter' | 'defaultValue' = 'static';
        var parentTokenIndex = -1;
        var parameterIndex = 0;
        var sectionIndex = -1;
        while (this.currentColumn < this.source.length) {

            var cpa = this.codePointAt(this.source, this.currentColumn);

            var currentToken = this.tokens[parentTokenIndex];
            switch (cpa) {
                case CharacterCodes.slash:
                    sectionIndex++;
                    if (currentToken === undefined || currentToken.input.length > 1) {
                        this.tokens.push({ default: '', input: '/', isOptinal: false, regexs: [], type: 'static', parameterName: '', parameterIndex: parameterIndex, sectionIndex });
                        parentTokenIndex = this.tokens.length - 1;
                    }
                    break;
                case CharacterCodes.openBrace:
                    parameterIndex++;
                    this.tokens.push({ default: '', input: '', isOptinal: false, regexs: [], type: 'parameter', parameterName: '', parameterIndex: parameterIndex, sectionIndex });
                    parentTokenIndex = this.tokens.length - 1;
                    currentType = 'parameter';
                    break;
                case CharacterCodes.closeBrace:
                    currentType = 'static';
                    parentTokenIndex = -1;
                    break;
                case CharacterCodes.colon:
                    currentType = 'defaultValue';
                    break;

                case CharacterCodes.question: 
                    if (currentToken) {
                        currentToken.isOptinal = true;
                    } 
                    break;
                default:
                    if (currentToken) {
                        if (currentType === 'parameter') {
                            currentToken.parameterName = `${currentToken.parameterName + this.source[this.currentColumn]}`;
                        } else if (currentType === 'defaultValue') {
                            currentToken.default = `${currentToken.default + this.source[this.currentColumn]}`;
                        } else {
                            currentToken.input = `${currentToken.input + this.source[this.currentColumn]}`;
                        }
                    }
                    break;
            }
            this.currentColumn++;
        }

        var rtx = "";

        this.tokens.forEach(t => {
            if (t.isOptinal) {
                rtx = rtx + t.input + "?([\\w\\d\\_\\-\\%\\&\\$\\+\\#\\,\\.\\{\\}\\(\\)\\[\\]\\?\\:\\=\\;\\'\"\\~\\\\]*)";
            } else if (t.type === 'parameter') {
                rtx = rtx + t.input + "([\\w\\d\\_\\-\\%\\&\\$\\+\\#\\,\\.\\{\\}\\(\\)\\[\\]\\?\\:\\=\\;\\'\"\\~\\\\]{1,255})";
            } else if (t.type === 'static') {
                if (rtx === '') {
                    rtx = t.input;
                } else {
                    rtx = rtx + t.input;
                }
            }
        })

        return new RegExp(rtx, "g");
    }
    private filterHtml(val: any) {
        var el = document.createElement("div");
        el.innerHTML = val;
        return el.innerText;
    }
    public parameters = {};
    public exist(input: string): boolean {
        var tx = this.parse();
        var rx = tx.exec(input);

        if (rx) {
            var i = rx ? rx.length : 0;
            var arr = <any>[];

            this.parameters = {};
            rx?.forEach((t, indx) => {
                arr.push(t);
            })

            var fio = window.location.href.indexOf("?");
            const urlSearchParams = new URLSearchParams(window.location.search);
            urlSearchParams.forEach((val, key) => {
                this.parameters[key] = this.filterHtml(val);
            });
            if (rx.input === arr[0]) {

                rx?.forEach((t, indx) => {

                    if (indx !== 0) {
                        var all = this.tokens.find(t => t.parameterIndex == indx);
                        if (all) {
                            this.parameters[all.parameterName] = t ? t : all.default;
                        }
                    }
                })

                /*TODO: Send DevTool message with all route details.*/
                return true;
            }
        }

        return false;
    }
    codePointAt: (s: string, i: number) =>
        number = (String.prototype as any).codePointAt ?
            (s, i) => (s as any).codePointAt(i) : function codePointAt(str, i): number {
                const size = str.length;
                if (i < 0 || i >= size) {
                    return undefined!;
                }
                const first = str.charCodeAt(i);
                if (first >= 0xD800 && first <= 0xDBFF && size > i + 1) {
                    const second = str.charCodeAt(i + 1);
                    if (second >= 0xDC00 && second <= 0xDFFF) {
                        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                    }
                }
                return first;
            };

}
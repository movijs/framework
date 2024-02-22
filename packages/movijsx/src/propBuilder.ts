import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';

import { moviComponent, State } from './constants';
import { getChildren } from './moviParser';

const WriteError = (msg: string, line: any, path: NodePath<t.JSXElement>) => {
    throw path.buildCodeFrameError(`[MOVIJS] ${msg} ${line}`);
}

export const makeHtmlAttr = (prop: NodePath<t.JSXAttribute | t.JSXSpreadAttribute>,
    name: string,
    value: t.Expression | t.ObjectMethod,
    path: NodePath<t.JSXElement>
): t.ObjectProperty | null => {
    if (t.isStringLiteral(value) && value !== null) {
        return t.objectProperty(t.stringLiteral(name), value);
    } else if (t.isBooleanLiteral(value)) {
        return t.objectProperty(t.stringLiteral(name), value || t.booleanLiteral(true));
    } else if (t.isArrowFunctionExpression(value) && value !== null) {
        var el;
        if (t.isBlockStatement(value.body)) {
            el = t.functionExpression(null, value.params, value.body);
        } else {
            el = t.functionExpression(null, value.params, t.blockStatement([t.returnStatement(value.body)]));
        }
        return t.objectProperty(t.stringLiteral(name), value);
    } else if (t.isFunctionExpression(value)) {
        return t.objectProperty(t.stringLiteral(name), value);
    } else {
        if (value != null) {
            if (t.isCallExpression(value) && t.isIdentifier(value.callee)) {
                if (value.callee.name !== 'moviComponent' && value.callee.name !== moviComponent()) {
                    return t.objectProperty(t.stringLiteral(name), value);
                }
            } else if (t.isIdentifier(value)) {
                return t.objectProperty(t.stringLiteral(name), value);

            } else if (t.isExpression(value)) {
                return t.objectProperty(t.stringLiteral(name), returnIfStatement(value, false));
            }
        }

    }
    return null;
}

export const mergeHtmlAttributes = (htmlAttrlist: t.ObjectProperty[]): t.ExpressionStatement[] => {
    const htmlProps: t.ExpressionStatement[] = [];
    if (htmlAttrlist.length > 0) {
        var totalAttr: t.ObjectProperty[] = [];
        var totalClass: t.ObjectProperty[] = [];
        var totalBindClass: t.Expression[] = [];
        var totalStringClass: t.Expression[] = [];
        htmlAttrlist.forEach(attr => {

            if (t.isObjectProperty(attr)) {
                if (t.isStringLiteral(attr.key)) {
                    if (attr.key.value.toLowerCase() === 'class' || attr.key.value.toLowerCase() === 'classname') {


                        if (t.isObjectExpression(attr.value)) {
                            var objectProperties: t.ObjectProperty[] = [];

                            attr.value.properties.forEach(p => {

                                if (t.isObjectProperty(p)) {
                                    if (t.isStringLiteral(p.value)) {
                                        totalStringClass.push(p.key as t.StringLiteral)
                                    } else if (t.isBooleanLiteral(p.value)) {
                                        totalStringClass.push(p.key as t.StringLiteral)
                                    } else if (t.isFunctionExpression(p.value) || t.isArrowFunctionExpression(p.value)) {
                                        objectProperties.push(p);
                                    } else {
                                        totalClass.push(p)
                                    }
                                } else if (t.isFunctionExpression(p) || t.isArrowFunctionExpression(p)) {
                                    totalBindClass.push(p);
                                }
                            })
                            if (objectProperties.length > 0) {
                                totalBindClass.push(t.objectExpression(objectProperties))
                            }
                        } else if (t.isMemberExpression(attr.value) || t.isCallExpression(attr.value)) {

                            totalBindClass.push(attr.value);
                        } else if (t.isFunctionExpression(attr.value) || t.isArrowFunctionExpression(attr.value)) {

                            totalBindClass.push(attr.value);
                        } else if (t.isIdentifier(attr.value)) {
                            totalBindClass.push(attr.value);
                        } else if (t.isStringLiteral(attr.value)) {
                            totalStringClass.push(t.stringLiteral(attr.value.value))
                        } else if (t.isArrayExpression(attr.value)) {
                            attr.value.elements.forEach(element => {
                                if (t.isObjectExpression(element)) {
                                    element.properties.forEach(p => {
                                        if (t.isObjectProperty(p)) {
                                            if (t.isStringLiteral(p.value)) {
                                                totalStringClass.push(p.key as t.StringLiteral)
                                            } else if (t.isBooleanLiteral(p.value)) {
                                                totalStringClass.push(p.key as t.StringLiteral)
                                            } else if (t.isFunctionExpression(p) || t.isArrowFunctionExpression(p)) {
                                                totalBindClass.push(p);
                                            } else {
                                                totalClass.push(p)
                                            }
                                        } else if (t.isFunctionExpression(p) || t.isArrowFunctionExpression(p)) {
                                            totalBindClass.push(p);
                                        }
                                    })
                                } else if (t.isStringLiteral(element)) {
                                    totalStringClass.push(element)
                                } else if (t.isFunctionExpression(element) || t.isArrowFunctionExpression(element)) {
                                    totalBindClass.push(element);
                                }
                            });
                        }
                    } else if (attr.key.value.toLowerCase() === 'style') {
                        if (t.isObjectExpression(attr.value)) {
                            htmlProps.push(t.expressionStatement(t.callExpression(t.identifier('sender.style'), [attr.value])));
                        } else if (t.isStringLiteral(attr.value)) {
                            htmlProps.push(t.expressionStatement(t.callExpression(t.identifier('sender.style'), [attr.value])));
                        } else if (t.isExpression(attr.value)) {
                            htmlProps.push(t.expressionStatement(t.callExpression(t.identifier('sender.style'), [attr.value])));
                        }
                    } else {
                        totalAttr.push(attr);
                        if (t.isObjectProperty(attr)) {
                            if (t.isMemberExpression(attr.value) || t.isArrowFunctionExpression(attr.value)) {
                            }
                        }
                    }
                }
            }
        })


        if (totalAttr.length > 0) {
            htmlProps.push(t.expressionStatement(t.callExpression(t.identifier('sender.attr.add'), [t.objectExpression(totalAttr)])));
        }
        if (totalBindClass.length > 0) {
            htmlProps.push(t.expressionStatement(t.callExpression(t.identifier('sender.class.add'), [t.arrayExpression(totalBindClass)])));
        }
        if (totalClass.length > 0) {
            htmlProps.push(t.expressionStatement(t.callExpression(t.identifier('sender.class.add'), [t.objectExpression(totalClass)])));
        }
        if (totalStringClass.length > 0) {
            htmlProps.push(t.expressionStatement(t.callExpression(t.identifier('sender.class.add'), [...totalStringClass])));
        }
    }

    return htmlProps;
}

export const makeHtmlEvents = (prop: NodePath<t.JSXAttribute | t.JSXSpreadAttribute>,
    name: string,
    value: t.Expression | t.ObjectMethod,
    path: NodePath<t.JSXElement>
): t.CallExpression | null => {
    if (!t.isStringLiteral(value) && !t.isBooleanLiteral(value) && value !== null) {
        if (t.isArrowFunctionExpression(value)) {
            var el;
            if (t.isBlockStatement(value.body)) {
                el = t.arrowFunctionExpression(value.params, value.body);
            } else {
                el = t.arrowFunctionExpression(value.params, t.blockStatement([t.returnStatement(value.body)]));
            }
            var evName = name.toLowerCase().replace("on", '').replace('doubleclick', 'dblclick');

            return t.callExpression(t.identifier("sender.addHandler"), [t.stringLiteral(evName), el]);
        } else if (t.isFunctionExpression(value)) {
            var el;
            if (t.isBlockStatement(value.body)) {
                el = t.functionExpression(null, value.params, value.body);
            } else {
                el = t.functionExpression(null, value.params, t.blockStatement([t.returnStatement(value.body)]));
            }
            var evName = name.toLowerCase().replace("on", '').replace('doubleclick', 'dblclick');

            return t.callExpression(t.identifier("sender.addHandler"), [t.stringLiteral(evName), el]);
        }
        else {
            if (t.isExpression(value)) {
                var evName = name.toLowerCase().replace("on", '').replace('doubleclick', 'dblclick');
                return t.callExpression(t.identifier("sender.addHandler"), [t.stringLiteral(evName), value]);
            }

        }
    } else {
        if (t.isJSXAttribute(prop.node)) {
            WriteError(`html events is not allowed using string or boolean.`, `[${prop.parent.loc?.end.line}]${name}:${value}`, path);
        } else {
            WriteError(`html events is not allowed using string or boolean.`, `[${prop.parent.loc?.end.line}]${name}:${value}`, path);
        }
    }
    return null;
}

export const makeGlobalEvents = (prop: NodePath<t.JSXAttribute | t.JSXSpreadAttribute>,
    name: string,
    value: t.Expression | t.ObjectMethod,
    path: NodePath<t.JSXElement>
): t.CallExpression | null => {
    if (!t.isStringLiteral(value) && !t.isBooleanLiteral(value) && value !== null) {
        if (t.isArrowFunctionExpression(value)) {
            var el;
            if (t.isBlockStatement(value.body)) {
                el = t.functionExpression(null, value.params, value.body);
            } else {
                el = t.functionExpression(null, value.params, t.blockStatement([t.returnStatement(value.body)]));
            }
            var evName = name.toLowerCase().replace("on-", '').replace('on:', '').replace('on_', '');

            return t.callExpression(t.identifier("sender.on"), [t.stringLiteral(evName), el]);
        } else {
            if (t.isExpression(value)) {
                var evName = name.toLowerCase().replace("on", '').replace('doubleclick', 'dblclick');
                return t.callExpression(t.identifier("sender.on"), [t.stringLiteral(evName), value]);
            }

        }
    } else {
        if (t.isJSXAttribute(prop.node)) {
            WriteError(`html events is not allowed using string or boolean.`, `[${prop.parent.loc?.end.line}]${name}:${value}`, path);
        } else {
            WriteError(`html events is not allowed using string or boolean.`, `[${prop.parent.loc?.end.line}]${name}:${value}`, path);
        }
    }
    return null;
}

export const makeComponentTraps = (prop: NodePath<t.JSXAttribute | t.JSXSpreadAttribute>,
    name: string,
    value: t.Expression | t.ObjectMethod,
    path: NodePath<t.JSXElement>
): t.ObjectProperty | null => {
    if (t.isFunctionExpression(value) ||
        t.isArrowFunctionExpression(value) && value !== null ||
        t.isObjectExpression(value) ||
        t.isMemberExpression(value) ||
        t.isObjectMethod(value) ||
        t.isIdentifier(value)) {

        if (t.isExpression(value)) {
            return t.objectProperty(t.identifier(name), value);
        } else {
            return null;
        }

    } else {
        if (t.isJSXAttribute(prop.node)) {
            WriteError(`component traps support only function or object type declaration. failed trap name "${name}"`, ``, path);
        } else {
            WriteError(`component traps support only function or object type declaration. failed trap name "${name}"`, ``, path);
        }
        return null;
    }
}


const directiveNames = new Set(['wait', 'reload', 'model', 'bind', 'text', 'to', 'html', 'value', 'display', 'effect', 'watch', 'loop', 'focus', 'interrupt']);

const ParentIfStatement = (path: t.Expression | t.BlockStatement, state: any[]): any[] => {
    if (t.isExpression(path)) {
        state.push(path)
    } else {

    }
    if (t.isFunctionExpression(path)) {
        state = ParentIfStatement(path.body, state);
    } else if (t.isArrowFunctionExpression(path)) {
        state = ParentIfStatement(path.body, state);
    } else if (t.isObjectExpression(path)) {

    } else if (t.isMemberExpression(path)) {

        state = ParentIfStatement(path.object, state);
    } else if (t.isObjectMethod(path)) {


    } else if (t.isIdentifier(path)) {

    } else if (t.isCallExpression(path)) {

        if (t.isExpression(path.callee)) {
            state = ParentIfStatement(path.callee, state);
        }
    } else {

    }

    return state;
}

export const returnIfStatement = (value: any, enableDefaultreturn: boolean = true, defaultLiteral: any = t.booleanLiteral(false)): any => {
    var ifStatement = findIfStatements(value);
    var mx = t.binaryExpression('===', t.unaryExpression('typeof', value), t.stringLiteral('function'));
    var rtrn;

    if (t.isLogicalExpression(value)) { 
        rtrn = t.returnStatement(value);
        if (enableDefaultreturn) {
            return t.arrowFunctionExpression([], t.blockStatement([rtrn, t.returnStatement(defaultLiteral)]));
        } else {
            return t.arrowFunctionExpression([], t.blockStatement([rtrn]));
        }

    } else if (t.isMemberExpression(value) || t.isIdentifier(value)) { 
        rtrn = t.returnStatement(value);
        var rtrns = t.ifStatement(ifStatement!, t.blockStatement([rtrn]));
        if (enableDefaultreturn) {
            return t.arrowFunctionExpression([], t.blockStatement([rtrns, t.returnStatement(defaultLiteral)]));
        } else {
            return t.arrowFunctionExpression([], t.blockStatement([rtrns]));
        }

    } else if (t.isFunctionExpression(value)) { 
        rtrn = t.returnStatement(value);
        var rtrns = t.ifStatement(ifStatement!, t.blockStatement([rtrn]));
        if (enableDefaultreturn) {
            return t.arrowFunctionExpression([], t.blockStatement([rtrns, t.returnStatement(defaultLiteral)]));
        } else {
            return t.arrowFunctionExpression([], t.blockStatement([rtrns]));
        }
        return value;
    } else if (t.isBinaryExpression(value)) {
        var ifStatementA = findIfStatements(value.left as any);
        var ifStatementB = findIfStatements(value.right);
        var le = t.logicalExpression('&&', ifStatementA, ifStatementB);
        rtrn = t.returnStatement(value);
        if (enableDefaultreturn) {
            return t.arrowFunctionExpression([], t.blockStatement([t.ifStatement(le, t.blockStatement([rtrn])), t.returnStatement(defaultLiteral)]));
        } else {
            return t.arrowFunctionExpression([], t.blockStatement([t.ifStatement(le, t.blockStatement([rtrn]))]));
        }

    } else if (t.isCallExpression(value)) {

        rtrn = t.returnStatement(t.conditionalExpression(mx, t.callExpression(value, []), value));
        var rtrns = t.ifStatement(ifStatement!, t.blockStatement([rtrn]));
        if (enableDefaultreturn) {
            return t.arrowFunctionExpression([], t.blockStatement([rtrns, t.returnStatement(defaultLiteral)]));
        } else {
            return t.arrowFunctionExpression([], t.blockStatement([rtrns]));
        }

    } else {
        return value;
    }


}
export const findIfStatements = (value: t.Expression): any => {
    var ifs: any[] = [];
    if (t.isExpression(value)) {

        ifs = ParentIfStatement(value, ifs);
    }

    if (ifs.length == 1) {
        ifs[0] = t.logicalExpression('&&', t.binaryExpression('!==', ifs[0], t.nullLiteral()), t.binaryExpression('!==', ifs[0], t.identifier('undefined')))
    }

    const setRight = (l: t.Expression, x: t.Expression, current: number) => {
        if (t.isLogicalExpression(l) && t.isNullLiteral(l.right)) {
            l.right = x;
        } else {
            if (t.isLogicalExpression(l)) {
                setRight(l.right, x, current)
            }
        }
    }

    ifs.reverse();
    var ifStatement: t.LogicalExpression | t.Expression = null as any;
    var indexer = 0;

    if (ifs.length > 1) {
        ifs.forEach((ttt, index) => {
            if (!t.isArrowFunctionExpression(ttt) || !t.isFunctionExpression(ttt)) {
                if (ifStatement) {
                    setRight(ifStatement, t.logicalExpression('&&', ttt, t.nullLiteral()), index)
                } else {
                    ifStatement = t.logicalExpression('&&', ttt, t.nullLiteral());
                }
            } else {
                ifStatement = ttt;
            }
        })
    } else {
        ifStatement = ifs[0];
    }

    const latestRightFind = (x: t.LogicalExpression, p: t.LogicalExpression) => {
        if (t.isLogicalExpression(x)) {
            if (t.isNullLiteral(x.right)) {
                if (p === null) {
                    x.right = x.left;
                } else {
                    p.right = t.logicalExpression('&&', t.binaryExpression('!==', (x as t.LogicalExpression).left, t.nullLiteral()), t.binaryExpression('!==', (x as t.LogicalExpression).left, t.identifier('undefined')));
                }
            } else {

                latestRightFind(x.right as t.LogicalExpression, x)
            }
        }
    }

    if (ifStatement && t.isLogicalExpression(ifStatement)) {
        latestRightFind(ifStatement, null as any);
        if (t.isArrowFunctionExpression(ifStatement.right)) {
            {
                ifStatement = ifStatement.left;
            }
        }
    }

    return ifStatement;
}
export const makeDirectives = (prop: NodePath<t.JSXAttribute | t.JSXSpreadAttribute>,
    name: string,
    value: t.Expression | t.ObjectMethod,
    path: NodePath<t.JSXElement>,
    state: State
): t.ExpressionStatement | null => {
    var result = null as any;
    if (value != null) {
        var clearedName = name.toLowerCase().replace("x:", "").replace("x-", "").replace("on:", "");

        if (clearedName === 'to') {
            clearedName = 'watch';
        }
        var callerName = `sender.bind.${clearedName}`;
        if (name === 'ref') {
            result = t.expressionStatement(t.callExpression(t.identifier(callerName), []));
        } else if (directiveNames.has(clearedName)) {
            if (clearedName !== 'wait' && clearedName !== 'loop' && clearedName !== 'bind') {
                var ifStatement: any = findIfStatements(value as any);

                if (t.isFunctionExpression(value) ||
                    t.isArrowFunctionExpression(value) && value !== null ||
                    t.isObjectExpression(value) ||
                    t.isMemberExpression(value) ||
                    t.isObjectMethod(value) ||
                    t.isIdentifier(value) ||
                    t.isCallExpression(value) && value !== null) {
                    if (t.isFunctionExpression(value)) {
                        result = t.expressionStatement(t.callExpression(t.identifier(callerName), [value]));
                    } else if (t.isArrowFunctionExpression(value)) {
                        var el;
                        if (t.isBlockStatement(value.body)) {
                            var kx = t.functionExpression(null, [], value.body);
                            el = t.expressionStatement(t.callExpression(t.identifier(callerName), [kx]));
                        } else {
                            if (t.isStringLiteral(value.body)) {
                                var rtrn = t.returnStatement(value.body);
                                var kx = t.functionExpression(null, [], t.blockStatement([rtrn]));
                                el = t.expressionStatement(t.callExpression(t.identifier(callerName), [kx]));
                            } else {
                                el = t.expressionStatement(t.callExpression(t.identifier(callerName), [returnIfStatement(value, false)]));
                            }

                        }
                        result = el;

                    } else {
                        if (t.isExpression(value)) {
                            result = t.expressionStatement(t.callExpression(t.identifier(callerName), [returnIfStatement(value, false)]));
                        }
                    }

                } else if (t.isBinaryExpression(value)) {
                    var addDefault = false;
                    var defaultLiteral = t.booleanLiteral(false);
                    if (clearedName === "text") {
                        addDefault = false;
                    }
                    result = t.expressionStatement(t.callExpression(t.identifier(callerName), [returnIfStatement(value, addDefault, defaultLiteral)]));
                } else {
                    WriteError(`component directives support only function or object type declaration. failed directive name "${name}"`, ``, path);
                }
            } else if (clearedName === 'loop') {
                if (t.isBinaryExpression(value)) {
                    var resVal = returnIfStatement(value.right, true, t.arrayExpression())
                    const children = getChildren(path.get('children'), state);
                    var prms: t.Identifier[] = [];
                    if (t.isSequenceExpression(value.left)) {
                        value.left.expressions.forEach(exp => {
                            if (t.isIdentifier(exp)) {
                                prms.push(exp);
                            }
                        });
                    } else if (t.isIdentifier(value.left)) {
                        prms.push(value.left);
                    }

                    result = t.expressionStatement(t.callExpression(t.identifier(callerName), [resVal, t.functionExpression(null, prms, t.blockStatement([t.returnStatement(children[0] as any)]))]));

                } else {
                    var sdir: string[] = [];
                    directiveNames.forEach(x => sdir.push(x));
                    WriteError(`loop directive only binary data type.
            Supported directives:${JSON.stringify(sdir)}
            https://movijs.com/directives`, ``, path);
                }

            } else if (clearedName === 'bind') {
                if (t.isFunctionExpression(value) ||
                    t.isArrowFunctionExpression(value) && value !== null ||
                    t.isObjectExpression(value) ||
                    t.isMemberExpression(value) ||
                    t.isObjectMethod(value) ||
                    t.isIdentifier(value) ||
                    t.isCallExpression(value) && value !== null) {
                    if (t.isFunctionExpression(value)) {
                        result = t.expressionStatement(t.callExpression(t.identifier(callerName), [value]));
                    } else if (t.isArrowFunctionExpression(value)) {
                        var el;
                        if (t.isBlockStatement(value.body)) {
                            var kx = t.functionExpression(null, [], value.body);
                            el = t.expressionStatement(t.callExpression(t.identifier(callerName), [kx]));
                        } else {
                            if (t.isStringLiteral(value.body)) {
                                var rtrn = t.returnStatement(value.body);
                                var kx = t.functionExpression(null, [], t.blockStatement([rtrn]));
                                el = t.expressionStatement(t.callExpression(t.identifier(callerName), [kx]));
                            } else {
                                el = t.expressionStatement(t.callExpression(t.identifier(callerName), [returnIfStatement(value, false)]));
                            }

                        }
                        result = el;

                    } else {
                        if (t.isExpression(value)) {
                            result = t.expressionStatement(t.callExpression(t.identifier(callerName), [returnIfStatement(value, false)]));
                        }
                    }

                } else if (t.isBinaryExpression(value)) {
                    var addDefault = false;
                    var defaultLiteral = t.booleanLiteral(false);

                    result = t.expressionStatement(t.callExpression(t.identifier(callerName), [returnIfStatement(value, addDefault, defaultLiteral)]));
                } else {
                    WriteError(`component directives support only function or object type declaration. failed directive name "${name}"`, ``, path);
                }
            }
        }
    }
    return result;
}

export const makePreDirectives = (prop: NodePath<t.JSXAttribute | t.JSXSpreadAttribute>,
    name: string,
    value: t.Expression | t.ObjectMethod,
    path: NodePath<t.JSXElement>
): t.ExpressionStatement | null => {
    var result = null as any;
    if (value != null) {
        var clearedName = name.toLowerCase().replace("x:", "").replace("x-", "").replace("on:", "");
        var callerName = `sender.bind.${clearedName}`;


        if (directiveNames.has(clearedName)) {
            if (t.isObjectExpression(value)) {
                var sdir: string[] = [];
                directiveNames.forEach(x => sdir.push(x));
                WriteError(`predirective ObjectExpression is not supported. 
                https://movijs.com/directives`, ``, path);
            } else {
                if (clearedName === 'wait' && t.isExpression(value)) {
                    result = t.expressionStatement(t.callExpression(t.identifier(callerName), [returnIfStatement(value, true, t.booleanLiteral(true))]));
                } else if (clearedName === 'interrupt' && t.isExpression(value)) {
                    result = t.expressionStatement(t.assignmentExpression('=', t.identifier('sender.interrupt'), value as t.Expression));
                }
            }

        } else {
            var sdir: string[] = [];
            directiveNames.forEach(x => sdir.push(x));
            WriteError(`predirective "${clearedName}" is not supported.
            Supported directives:${JSON.stringify(sdir)}
            https://movijs.com/directives`, ``, path);
        }

    }
    return result;
}
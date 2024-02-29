import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import * as babel from '@babel/core';
import syntax_jsx from "@babel/plugin-syntax-jsx";
import syntax_flow from "@babel/plugin-syntax-flow";
import preset_flow from "@babel/preset-flow";
import babelParser5 from "@babel/preset-env";
import preset_typescript from "@babel/preset-typescript";
import { ParseComponent, ParseFrament } from './moviParser';
import { moviComponent, moviFragment, State } from "./constants";

//import fs from 'node:fs' 

export default class Compiler {
    public start(code: string, filename: string): babel.BabelFileResult | null {
 
        return babel.transformSync(code, {
            sourceType: 'module',
            ast: true, 
            babelrc: false,
            cloneInputAst: false,
            code: true,
            sourceMaps: 'inline',
            comments: true,
            highlightCode: false,
            minified: false,
            compact: false,
            filename:filename,
            presets: [preset_flow,preset_typescript],
            plugins: [
                syntax_flow,
                syntax_jsx,
                function () {
                    return {
                        visitor: {
                            JSXElement: {
                                exit(path: NodePath<t.JSXElement>, state: State) {
                                    state.set('filename', filename); 
                                    path.replaceWith(ParseComponent(path, state));
                                    // var findProgram = (p: any): any => {
                                    //     if (p.parent !== null) {
                                    //         if (t.isProgram(p.parent)) {
                                    //             return p.parent;
                                    //         } else {
                                    //             return findProgram(p.parent)
                                    //         }
                                    //     } else {
                                    //         return p;
                                    //     }
                                    // }

                                }
                            },
                            Class: {
                                exit(path: NodePath<t.ClassExpression>, state: State) {

                                }
                            },
                            GenericTypeAnnotation: {
                                exit(path: NodePath<t.GenericTypeAnnotation>, state: State) {


                                }
                            },
                            TypeParameterInstantiation: {
                                exit(path: NodePath<t.TypeParameterInstantiation>, state: State) {

                                }
                            },
                            Function: {
                                exit(path: NodePath<t.JSXElement>, state: State) {

                                    // if (t.isClassMethod(path.node)) {
                                    //     (t.isIdentifier((path.node as t.ClassMethod).key))
                                    //     {
                                    //         if (((path.node as t.ClassMethod).key as t.Identifier).name === "view") {
                                    //             (path.node as t.ClassMethod).body.body.splice(0,0,t.variableDeclaration('const',[t.variableDeclarator(t.identifier('__root__'), t.thisExpression())]))
                                    //         }
                                    //      }
                                    // }
                                }
                            },
                            JSXFragment: {
                                exit(path: NodePath<t.JSXElement>, state: State) {
                                    state.set('filename', filename);
                                    path.replaceWith(ParseFrament(path, state));
                                    var findProgram = (p: any): any => {
                                        if (p.parent !== null) {
                                            if (t.isProgram(p.parent)) {
                                                return p.parent;
                                            } else {
                                                return findProgram(p.parent)
                                            }
                                        } else {
                                            return p;
                                        }
                                    }
                                }
                            },
                            Program: {
                                exit(path: NodePath<t.Program>, state: State) {

                                    const body = path.get('body') as NodePath[];
                                    const specifiersMap = new Map<string, t.ImportSpecifier>();
                                    specifiersMap.set('moviComponent', t.importSpecifier(t.identifier(moviComponent()), t.identifier("moviComponent")))
                                    if (state.get(moviFragment())) {
                                        specifiersMap.set('moviFragment', t.importSpecifier(t.identifier(moviFragment()), t.identifier("moviFragment")));
                                    }

                                    var isSFC = false;
                                    var viewReturn: t.CallExpression = null as any;
                                    var setInternal: t.Statement[] = [];
                                    var setOriginal: t.Statement[] = [];
                                    path.node.body.forEach(tx => {
                                        if (t.isVariableDeclaration(tx)) {
                                            // tx.declarations.forEach(y => {
                                            //     if (t.isObjectExpression(y.init)) {
                                            //         y.init = t.callExpression(t.identifier('sender.useModel'), [y.init])
                                            //     }
                                            // })
                                            setInternal.push(tx);
                                        } else if (t.isIfStatement(tx)) {
                                            setInternal.push(tx);
                                        } else if (t.isExpressionStatement(tx) && t.isAssignmentExpression(tx.expression)) {
                                            setInternal.push(tx);
                                        } else if (t.isExpressionStatement(tx) && t.isCallExpression(tx.expression) && t.isMemberExpression(tx.expression.callee)) {
                                            setInternal.push(tx);
                                        } else if (t.isExpressionStatement(tx) && t.isCallExpression(tx.expression) && t.isIdentifier(tx.expression.callee)) {
                                            if (tx.expression.callee.name === '_mc' || tx.expression.callee.name === '_mf') {
                                                isSFC = true;
                                                viewReturn = tx.expression;
                                            }
                                        } else {
                                            setOriginal.push(tx);
                                        }


                                    });
                                    if (isSFC) {
                                        var rtrn = t.returnStatement(viewReturn);
                                        var r = t.exportDefaultDeclaration(t.functionDeclaration(null, [t.identifier('sender')], t.blockStatement([...setInternal, rtrn])));

                                        //t.interfaceExtends(t.identifier('Component'))
                                        specifiersMap.set('Component', t.importSpecifier(t.identifier("_mC"), t.identifier("Component")));
                                        var cls = t.exportDefaultDeclaration(t.classDeclaration(t.identifier('runtimeClass'), t.identifier('_mC'), t.classBody([t.classMethod('method', t.identifier('view'), [t.identifier('sender')], t.blockStatement([...setInternal, rtrn]))])));


                                        path.node.body = [...setOriginal, cls];
                                        //path.replaceWith(t.functionDeclaration(null,[],t.blockStatement([...setInternal])));
                                        //console.error('JSX', isSFC,viewReturn)
                                    }
                                    state.set('filename', filename);
                                    body
                                        .filter(
                                            (nodePath) =>
                                                t.isImportDeclaration(nodePath.node) &&
                                                nodePath.node.source.value === 'movijs'
                                        ).forEach((nodePath) => {
                                            const { specifiers } = nodePath.node as t.ImportDeclaration;
                                            let shouldRemove = false;
                                            specifiers.forEach((specifier) => {
                                                if (
                                                    !specifier.loc &&
                                                    t.isImportSpecifier(specifier) &&
                                                    t.isIdentifier(specifier.imported) &&
                                                    !specifiersMap.has(specifier.imported.name)
                                                ) {
                                                    specifiersMap.set(specifier.imported.name, specifier);
                                                    shouldRemove = true;
                                                }
                                            });
                                            if (shouldRemove) {
                                                nodePath.remove();
                                            }
                                        });


                                    const specifiers = [...specifiersMap.keys()].map(
                                        (imported) => specifiersMap.get(imported)!
                                    );


                                    if (specifiers.length) {
                                        path.unshiftContainer(
                                            'body',
                                            t.importDeclaration(specifiers, t.stringLiteral('movijs'))

                                        );
                                    }
                                }
                            }
                        },
                    }
                }
            ],

        })
    }
}
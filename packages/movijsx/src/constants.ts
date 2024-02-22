import * as BabelCore from '@babel/core';
export const moviComponent = () => { return "_mc" }
export const moviFragment = () => { return "_mf" }

export type State = {
    get: (name: string) => any;
    set: (name: string, value: any) => any; 
    file: BabelCore.BabelFile
};
 

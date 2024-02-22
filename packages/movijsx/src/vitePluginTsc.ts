import fs from 'fs'  
const fileRegex = /\.(jsx)|\.(tsx)|\.(aio)$/;

function tsCompile(source: string, options: ts.TranspileOptions) { 
  if (null === options) {
      options = { compilerOptions: { module: ts.ModuleKind.CommonJS }};
  }
  return ts.transpileModule(source, options);
}

import * as ts from "typescript";

export default function vitePluginTsc() {
    return {
      name: 'transform-file-movi-tscjsx', 
      transform(src:string, id:string) {  
        if (fileRegex.test(id)) {  
          var code = fs.readFileSync(id, 'utf-8')
          try {
            var result = tsCompile(code, {});
            if (result) {  
              return { 
                code:result.outputText, 
                map:result.sourceMapText
              } 
            } 
          } catch (error) {
            return {
              code: (error as Error).message,
              map:null
            }
          }
        } 
      }
    }
  }
   
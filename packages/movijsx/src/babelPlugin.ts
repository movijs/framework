 
import * as BabelCore from '@babel/core'; 
import syntaxJsx from '@babel/plugin-syntax-jsx';  
import Compiler from './compiler';
 
import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';
var compiler = new Compiler();
export default ({ types }: typeof BabelCore) => ({ 
  name: 'babel-plugin-jsx',
  inherits: syntaxJsx,
  visitor: {
    ...compiler, 
    Program: { 
      exit(path: NodePath<t.Program>) { 
      }
    },
  },
});
 


 
import Compiler from './compiler'; 
  
const fileRegex = /\.(jsx)|\.(tsx)|\.(ts)|\.(js)|\.(aio)$/;
export default function movijsxRollup() {
    return {
        name: 'movijsxRollup',
        transform(code, id) { 
            if (fileRegex.test(id)) {
                 
                if (!code.includes("//useReact") && !code.includes("//useVue")) {
                    try {
                        var result = new  Compiler().start(code, id);
                        if (result) {
                            return {
                                code: result.code,
                                map: result.map
                            }
                        }
                    } catch (error) {
                        return {
                            code: (error as Error).message,
                            map: null
                        }
                    }
                }
            }
            return code; 
        }
    };
}

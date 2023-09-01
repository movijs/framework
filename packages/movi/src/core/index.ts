 
export type ElementTypes = Element | HTMLElement | Text | DocumentFragment | Comment;
export const toKebab = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
export const TempElement = document.createElement('template');
const Elements: Record<string,Element> = {};
const fragment: HTMLTemplateElement = document.createElement('template')
var defaulttext = document.createTextNode('');
var defaultFragment = document.createDocumentFragment();
export function CreateLocalElement<ElementType extends Element | HTMLElement | Text | DocumentFragment | Comment | string>(el: any,isSvg?:any): ElementType {
    
   

    switch (typeof el) {
       
        case "string":
            
            if (el === 'svg' || el === 'path' || el === 'g' || el === 'defs' || el === 'polygon'|| el === 'linearGradient' || el === 'stop' || isSvg == true) { 
                return document.createElementNS('http://www.w3.org/2000/svg', el, {}) as ElementType;
            } else
                if (el === 'text') { 
                    return defaulttext.cloneNode(true)  as ElementType;// document.createTextNode('') as ElementType;
            }
            else if (el === 'fragment') { 
                    return defaultFragment.cloneNode(true) as ElementType;// null as unknown as  ElementType;
            }
            else if (el.startsWith("<")) {
                TempElement.innerHTML = el.toString();
                return TempElement.content.firstChild as ElementType;
            } else {
                if (!Elements[el]) { 
                   Elements[el] = document.createElement(el);
               }
                 return Elements[el].cloneNode(true) as ElementType;
                // TempElement.innerHTML = `<${el}></${el}>`;
                // return TempElement.content.firstChild as ElementType;
            } 
            
        default:  
            return el;
    }
 

}

export * from "./NameValuePair"
export * from "./Collection"
export * from "./List"
export * from "./Dictionary"
export * from "./NavigateEventArgs"
export * from "./ComponentProps"
export * from "./StyleKeys"
export * from "./controlAttribute"
import { reactive } from "..";
import { closeSetup, listenSetup } from "../Reactive/common";
import { ModelDirectiveSettings } from "../directive/ModelDirective";
import { IDirective } from "./IDirective";

export type DirectiveBindingType = "function" | "expression" | 'model';

export function CheckType(_settings) {
    var val;

    /*
    if (_source.element instanceof HTMLElement || _source.element instanceof Element) {
                val = _settings.callback();
            } else {
                val = _settings.callback();
            }
    */




    switch (_settings.type) {
        case "expression":
            if (_settings.Property && _settings.FieldName) {
                _settings.callback = () => {
                    var val = (_settings.Property as any)[_settings.FieldName];
                    return val;
                }
                val = _settings.callback();
            }
            break;
        case "function":

            val = _settings.callback();

            break;
        case "model": 
            if (_settings.bind) {
                _settings.callback = _settings.bind.get;
            }
            val = _settings.callback();
            break;
        default:
            break;
    }

    if (typeof val === 'function') {
        val = val();
    }

    return val;
}


export function CheckModelType(_settings: ModelDirectiveSettings, callback?: (source, expr) => any) {
    var val;

    /*
    if (_source.element instanceof HTMLElement || _source.element instanceof Element) {
                val = _settings.callback();
            } else {
                val = _settings.callback();
            }
    */

    switch (_settings.type) {
        case "expression":
            if (_settings.Property && _settings.FieldName) {
                if (callback) { callback(_settings.Property, _settings.FieldName) };
                _settings.callback = () => {
                    var val = (_settings.Property as any)[_settings.FieldName];
                    return val;
                }
                val = _settings.callback();
            }

            break;
        case "function":

            val = _settings.callback();

            break;
        case "model":

            // if (_settings.bind) {
            //     var setter = _settings.bind;
            //     if (typeof _settings.bind === 'function') {
            //         setter = (_settings.bind as any)();
            //     }  
            //     _settings.callback = _settings.bind.get;
            // }

            val = _settings.bind?.get();
            break;
        default:
            break;
    }

    if (typeof val === 'function') {
        val = val();
    }

    return val;
}

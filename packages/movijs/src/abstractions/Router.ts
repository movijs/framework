import { NavigateEventArgs } from "../core/NavigateEventArgs";


export interface IRouter { 
    values: { name: string, value: string }[];
    value(name: string);
    mode: string;
    root: string;
    manager;
    _skipCheck;
    prev: string;
    HandleChange: (e: any) => void;

    gate?: (next: () => any, e: NavigateEventArgs) => any;
    navigated?();
    onChange(callback: any);
    offChange(callback: any);
    trigger(uri: string);
    navigate(next,bypas );
    HandlePopChange();
    HandleHashChange();
    get CurrentPage(): string;

    addUriListener();

    removeUriListener();

    _getHistoryFragment();

    _getHashFragment();
    getFragment();

    isChanged(): boolean;
}

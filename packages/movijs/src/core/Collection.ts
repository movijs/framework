
export class Collection<T extends Object> extends Array {
    public ItemAdded?: (i: T) => void;
    public ItemAddedBefore?: (i: T) => void;
    public ItemSplice?: (start: number, i: T) => void;
    public onItemRemoved?: (item: T, index: number) => void
    public _map: Set<T> = new Set<T>();
    public add(item: T): number {
        this._map.add(item);
        var i = this.push(item) - 1;
        try {
            if (this.ItemAdded != undefined) { this.ItemAdded(item); };
            return i;
        } finally {

        }

    }
    public addBefore(item: T) {
        this._map.add(item);
        var i = this.unshift(item) - 1;
        if (this.ItemAddedBefore != undefined) { this.ItemAddedBefore(item); };
        return i;
    }

    public insertBefore(item: T) {
        this._map.add(item);
        var i = this.unshift(item) - 1;
        if (this.ItemAddedBefore != undefined) { this.ItemAddedBefore(item); };
        return i;
    }
    public insert(start: number, item: T) {
        this._map.add(item);
        var i = this.splice(start, 0, item);
        if (this.ItemSplice != undefined) { this.ItemSplice(start, item); };
        return i;
    }

    public move(oldIndex: number, newIndex: number) {
        var item = this[oldIndex];
        this.splice(oldIndex, 1);
        var i = this.splice(newIndex, 0, item);
        return i;
    }

    public remove(item: T) {
        this._map.delete(item);
        var index = this.indexOf(item);
        this.splice(index, 1);
        this.onItemRemoved && this.onItemRemoved(item, index);
    }

    public item(key: T): T {
        return key;
    }

    public has(item: T) {
        return this._map.has(item);
    }

    public clear() {
        var index = 0;
        this.onItemRemoved && this._map.forEach((item) => {
            this.onItemRemoved && this.onItemRemoved(item, index);
            index++
        })
        this.splice(0);
        this._map.clear();
    }

    public itemIndex(index: number): T {
        return this[index];
    }
}


export class ControlCollectionList<T extends object> extends Collection<T> {
    constructor(public own: any) {
        super()
    }
    public add(item: any): number {
        if (this.own.options.settings["__loop__item__"] && (this.own.element instanceof Text || this.own.element instanceof Comment) && (item.element instanceof Text || item.element instanceof Comment)) {
            throw new Error("movi:" + "multiple fragment not supported for array list render mechanizm")
        }
        return super.add(item);
    }
    public addBefore(item: any) {
        if (this.own.options.settings["__loop__item__"] && (this.own.element instanceof Text || this.own.element instanceof Comment) && (item.element instanceof Text || item.element instanceof Comment)) {
            throw new Error("movi:" + "multiple fragment not supported for array list render mechanizm ", item)
        }
        return super.addBefore(item);
    }

    public insertBefore(item: any) {
        if (this.own.options.settings["__loop__item__"] && (this.own.element instanceof Text || this.own.element instanceof Comment) && (item.element instanceof Text || item.element instanceof Comment)) {
            throw new Error("movi:" + "multiple fragment not supported for array list render mechanizm ", item)
        }
        return super.insertBefore(item);
    }
    public insert(start: number, item: any) {
        if (this.own.options.settings["__loop__item__"] && (this.own.element instanceof Text || this.own.element instanceof Comment) && (item.element instanceof Text || item.element instanceof Comment)) {
            throw new Error("movi:" + "multiple fragment not supported for array list render mechanizm ", item)
        }
        return super.insert(start, item);
    }

    public move(oldIndex: number, newIndex: number) {
        return super.move(oldIndex, newIndex);
    }
    public remove(item: T) {
        return super.remove(item);
    }

    public item(key: T): T {
        return super.item(key);
    }

    public has(item: T) {
        return super.has(item);
    }

    public clear() {
        return super.clear();
    }

    public itemIndex(index: number): T {
        return super.itemIndex(index);
    }
}
export class KeyValueItem {
    public key: string = '';
    public value: any;
}

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

export class KeyValueItem {
    public key: string = '';
    public value: any;
}

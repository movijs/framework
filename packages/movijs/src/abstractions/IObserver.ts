export interface IObservable<T, TChange = unknown> { 
	get(): T; 
	reportChanges(): void; 
	addObserver(observer: IObserver): void; 
	removeObserver(observer: IObserver): void; 
	read(reader: IReader | undefined): T; 
	map<TNew>(fn: (value: T, reader: IReader) => TNew): IObservable<TNew>;
	map<TNew>(owner: object, fn: (value: T, reader: IReader) => TNew): IObservable<TNew>; 
	readonly debugName: string; 
	readonly TChange: TChange;
}

export interface IReader { 
	readObservable<T>(observable: IObservable<T, any>): T;
}

export interface IObserver { 
	beginUpdate<T>(observable: IObservable<T>): void; 
	endUpdate<T>(observable: IObservable<T>): void; 
	handlePossibleChange<T>(observable: IObservable<T>): void; 
	handleChange<T, TChange>(observable: IObservable<T, TChange>, change: TChange): void;
}
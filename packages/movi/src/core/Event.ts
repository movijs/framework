 import { IObservable, IObserver } from '../abstractions/IObserver';
import { CancellationToken } from './cancellation';
import { onUnexpectedError } from './Errors';
 
import { combinedDisposable, Disposable, DisposableMap, DisposableStore, IDisposable, toDisposable } from './lifecycle';
import { LinkedList } from './LinkedList'; 
import { StopWatch } from './StopWatch'; 
export const MicrotaskDelay = Symbol('MicrotaskDelay')

export function createSingleCallFunction<T extends Function>(this: unknown, fn: T): T {
	const _this = this;
	let didCall = false;
	let result: unknown;

	return function () {
		if (didCall) {
			return result;
		}

		didCall = true;
		result = fn.apply(_this, arguments);

		return result;
	} as unknown as T;
}
 
const _enableDisposeWithListenerWarning = false; 
const _enableSnapshotPotentialLeakWarning = false; 
export interface Event<T> {
	(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
}

export namespace Event {
	export const None: Event<any> = () => Disposable.None;

	function _addLeakageTraceLogic(options: EmitterOptions) {
		if (_enableSnapshotPotentialLeakWarning) {
			const { onDidAddListener: origListenerDidAdd } = options;
			const stack = Stacktrace.create();
			let count = 0;
			options.onDidAddListener = () => {
				if (++count === 2) {
					console.warn('snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here');
					stack.print();
				}
				origListenerDidAdd?.();
			};
		}
	}
 
	export function defer(event: Event<unknown>, disposable?: DisposableStore): Event<void> {
		return debounce<unknown, void>(event, () => void 0, 0, undefined, true, undefined, disposable);
	}
 
	export function once<T>(event: Event<T>): Event<T> {
		return (listener, thisArgs = null, disposables?) => {
			// we need this, in case the event fires during the listener call
			let didFire = false;
			let result: IDisposable | undefined = undefined;
			result = event(e => {
				if (didFire) {
					return;
				} else if (result) {
					result.dispose();
				} else {
					didFire = true;
				}

				return listener.call(thisArgs, e);
			}, null, disposables);

			if (didFire) {
				result.dispose();
			}

			return result;
		};
	}
 
	export function map<I, O>(event: Event<I>, map: (i: I) => O, disposable?: DisposableStore): Event<O> {
		return snapshot((listener, thisArgs = null, disposables?) => event(i => listener.call(thisArgs, map(i)), null, disposables), disposable);
	} 
	export function forEach<I>(event: Event<I>, each: (i: I) => void, disposable?: DisposableStore): Event<I> {
		return snapshot((listener, thisArgs = null, disposables?) => event(i => { each(i); listener.call(thisArgs, i); }, null, disposables), disposable);
	}
 
	export function filter<T, U>(event: Event<T | U>, filter: (e: T | U) => e is T, disposable?: DisposableStore): Event<T>;
	export function filter<T>(event: Event<T>, filter: (e: T) => boolean, disposable?: DisposableStore): Event<T>;
	export function filter<T, R>(event: Event<T | R>, filter: (e: T | R) => e is R, disposable?: DisposableStore): Event<R>;
	export function filter<T>(event: Event<T>, filter: (e: T) => boolean, disposable?: DisposableStore): Event<T> {
		return snapshot((listener, thisArgs = null, disposables?) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables), disposable);
	}
 
	export function signal<T>(event: Event<T>): Event<void> {
		return event as Event<any> as Event<void>;
	}
 
	export function any<T>(...events: Event<T>[]): Event<T>;
	export function any(...events: Event<any>[]): Event<void>;
	export function any<T>(...events: Event<T>[]): Event<T> {
		return (listener, thisArgs = null, disposables?) => {
			const disposable = combinedDisposable(...events.map(event => event(e => listener.call(thisArgs, e))));
			return addAndReturnDisposable(disposable, disposables);
		};
	}
 
	export function reduce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, initial?: O, disposable?: DisposableStore): Event<O> {
		let output: O | undefined = initial;

		return map<I, O>(event, e => {
			output = merge(output, e);
			return output;
		}, disposable);
	}

	function snapshot<T>(event: Event<T>, disposable: DisposableStore | undefined): Event<T> {
		let listener: IDisposable | undefined;

		const options: EmitterOptions | undefined = {
			onWillAddFirstListener() {
				listener = event(emitter.fire, emitter);
			},
			onDidRemoveLastListener() {
				listener?.dispose();
			}
		};

		if (!disposable) {
			_addLeakageTraceLogic(options);
		}

		const emitter = new Emitter<T>(options);

		disposable?.add(emitter);

		return emitter.event;
	}
 
	function addAndReturnDisposable<T extends IDisposable>(d: T, store: DisposableStore | IDisposable[] | undefined): T {
		if (store instanceof Array) {
			store.push(d);
		} else if (store) {
			store.add(d);
		}
		return d;
	}
 
	export function debounce<T>(event: Event<T>, merge: (last: T | undefined, event: T) => T, delay?: number | typeof MicrotaskDelay, leading?: boolean, flushOnListenerRemove?: boolean, leakWarningThreshold?: number, disposable?: DisposableStore): Event<T>;
	export function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay?: number | typeof MicrotaskDelay, leading?: boolean, flushOnListenerRemove?: boolean, leakWarningThreshold?: number, disposable?: DisposableStore): Event<O>;
	export function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay: number | typeof MicrotaskDelay = 100, leading = false, flushOnListenerRemove = false, leakWarningThreshold?: number, disposable?: DisposableStore): Event<O> {
		let subscription: IDisposable;
		let output: O | undefined = undefined;
		let handle: any = undefined;
		let numDebouncedCalls = 0;
		let doFire: (() => void) | undefined;

		const options: EmitterOptions | undefined = {
			leakWarningThreshold,
			onWillAddFirstListener() {
				subscription = event(cur => {
					numDebouncedCalls++;
					output = merge(output, cur);

					if (leading && !handle) {
						emitter.fire(output);
						output = undefined;
					}

					doFire = () => {
						const _output = output;
						output = undefined;
						handle = undefined;
						if (!leading || numDebouncedCalls > 1) {
							emitter.fire(_output!);
						}
						numDebouncedCalls = 0;
					};

					if (typeof delay === 'number') {
						clearTimeout(handle);
						handle = setTimeout(doFire, delay);
					} else {
						if (handle === undefined) {
							handle = 0;
							queueMicrotask(doFire);
						}
					}
				});
			},
			onWillRemoveListener() {
				if (flushOnListenerRemove && numDebouncedCalls > 0) {
					doFire?.();
				}
			},
			onDidRemoveLastListener() {
				doFire = undefined;
				subscription.dispose();
			}
		};

		if (!disposable) {
			_addLeakageTraceLogic(options);
		}

		const emitter = new Emitter<O>(options);

		disposable?.add(emitter);

		return emitter.event;
	}
 
	export function accumulate<T>(event: Event<T>, delay: number = 0, disposable?: DisposableStore): Event<T[]> {
		return Event.debounce<T, T[]>(event, (last, e) => {
			if (!last) {
				return [e];
			}
			last.push(e);
			return last;
		}, delay, undefined, true, undefined, disposable);
	}
 
	export function latch<T>(event: Event<T>, equals: (a: T, b: T) => boolean = (a, b) => a === b, disposable?: DisposableStore): Event<T> {
		let firstCall = true;
		let cache: T;

		return filter(event, value => {
			const shouldEmit = firstCall || !equals(value, cache);
			firstCall = false;
			cache = value;
			return shouldEmit;
		}, disposable);
	}
 
	export function split<T, U>(event: Event<T | U>, isT: (e: T | U) => e is T, disposable?: DisposableStore): [Event<T>, Event<U>] {
		return [
			Event.filter(event, isT, disposable),
			Event.filter(event, e => !isT(e), disposable) as Event<U>,
		];
	}
 
	export function buffer<T>(event: Event<T>, flushAfterTimeout = false, _buffer: T[] = [], disposable?: DisposableStore): Event<T> {
		let buffer: T[] | null = _buffer.slice();

		let listener: IDisposable | null = event(e => {
			if (buffer) {
				buffer.push(e);
			} else {
				emitter.fire(e);
			}
		});

		if (disposable) {
			disposable.add(listener);
		}

		const flush = () => {
			buffer?.forEach(e => emitter.fire(e));
			buffer = null;
		};

		const emitter = new Emitter<T>({
			onWillAddFirstListener() {
				if (!listener) {
					listener = event(e => emitter.fire(e));
					if (disposable) {
						disposable.add(listener);
					}
				}
			},

			onDidAddFirstListener() {
				if (buffer) {
					if (flushAfterTimeout) {
						setTimeout(flush);
					} else {
						flush();
					}
				}
			},

			onDidRemoveLastListener() {
				if (listener) {
					listener.dispose();
				}
				listener = null;
			}
		});

		if (disposable) {
			disposable.add(emitter);
		}

		return emitter.event;
	} 
	export function chain<T, R>(event: Event<T>, sythensize: ($: IChainableSythensis<T>) => IChainableSythensis<R>): Event<R> {
		const fn: Event<R> = (listener, thisArgs, disposables) => {
			const cs = sythensize(new ChainableSynthesis()) as ChainableSynthesis;
			return event(function (value) {
				const result = cs.evaluate(value);
				if (result !== HaltChainable) {
					listener.call(thisArgs, result);
				}
			}, undefined, disposables);
		};

		return fn;
	}

	const HaltChainable = Symbol('HaltChainable');

	class ChainableSynthesis implements IChainableSythensis<any> {
		private readonly steps: ((input: any) => any)[] = [];

		map<O>(fn: (i: any) => O): this {
			this.steps.push(fn);
			return this;
		}

		forEach(fn: (i: any) => void): this {
			this.steps.push(v => {
				fn(v);
				return v;
			});
			return this;
		}

		filter(fn: (e: any) => boolean): this {
			this.steps.push(v => fn(v) ? v : HaltChainable);
			return this;
		}

		reduce<R>(merge: (last: R | undefined, event: any) => R, initial?: R | undefined): this {
			let last = initial;
			this.steps.push(v => {
				last = merge(last, v);
				return last;
			});
			return this;
		}

		latch(equals: (a: any, b: any) => boolean = (a, b) => a === b): ChainableSynthesis {
			let firstCall = true;
			let cache: any;
			this.steps.push(value => {
				const shouldEmit = firstCall || !equals(value, cache);
				firstCall = false;
				cache = value;
				return shouldEmit ? value : HaltChainable;
			});

			return this;
		}

		public evaluate(value: any) {
			for (const step of this.steps) {
				value = step(value);
				if (value === HaltChainable) {
					break;
				}
			}

			return value;
		}
	}

	export interface IChainableSythensis<T> {
		map<O>(fn: (i: T) => O): IChainableSythensis<O>;
		forEach(fn: (i: T) => void): IChainableSythensis<T>;
		filter(fn: (e: T) => boolean): IChainableSythensis<T>;
		filter<R>(fn: (e: T | R) => e is R): IChainableSythensis<R>;
		reduce<R>(merge: (last: R, event: T) => R, initial: R): IChainableSythensis<R>;
		reduce<R>(merge: (last: R | undefined, event: T) => R): IChainableSythensis<R>;
		latch(equals?: (a: T, b: T) => boolean): IChainableSythensis<T>;
	}

	export interface NodeEventEmitter {
		on(event: string | symbol, listener: Function): unknown;
		removeListener(event: string | symbol, listener: Function): unknown;
	}
 
	export function fromNodeEventEmitter<T>(emitter: NodeEventEmitter, eventName: string, map: (...args: any[]) => T = id => id): Event<T> {
		const fn = (...args: any[]) => result.fire(map(...args));
		const onFirstListenerAdd = () => emitter.on(eventName, fn);
		const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
		const result = new Emitter<T>({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });

		return result.event;
	}

	export interface DOMEventEmitter {
		addEventListener(event: string | symbol, listener: Function): void;
		removeEventListener(event: string | symbol, listener: Function): void;
	}
 
	export function fromDOMEventEmitter<T>(emitter: DOMEventEmitter, eventName: string, map: (...args: any[]) => T = id => id): Event<T> {
		const fn = (...args: any[]) => result.fire(map(...args));
		const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
		const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
		const result = new Emitter<T>({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });

		return result.event;
	}
 
	export function toPromise<T>(event: Event<T>): Promise<T> {
		return new Promise(resolve => once(event)(resolve));
	}
 
	export function fromPromise<T>(promise: Promise<T>): Event<T | undefined> {
		const result = new Emitter<T | undefined>();

		promise.then(res => {
			result.fire(res);
		}, () => {
			result.fire(undefined);
		}).finally(() => {
			result.dispose();
		});

		return result.event;
	}
 
	export function runAndSubscribe<T>(event: Event<T>, handler: (e: T | undefined) => any): IDisposable {
		handler(undefined);
		return event(e => handler(e));
	}
 
	export function runAndSubscribeWithStore<T>(event: Event<T>, handler: (e: T | undefined, disposableStore: DisposableStore) => any): IDisposable {
		let store: DisposableStore | null = null;

		function run(e: T | undefined) {
			store?.dispose();
			store = new DisposableStore();
			handler(e, store);
		}

		run(undefined);
		const disposable = event(e => run(e));
		return toDisposable(() => {
			disposable.dispose();
			store?.dispose();
		});
	}

	class EmitterObserver<T> implements IObserver {

		readonly emitter: Emitter<T>;

		private _counter = 0;
		private _hasChanged = false;

		constructor(readonly _observable: IObservable<T, any>, store: DisposableStore | undefined) {
			const options: EmitterOptions = {
				onWillAddFirstListener: () => {
					_observable.addObserver(this);
				},
				onDidRemoveLastListener: () => {
					_observable.removeObserver(this);
				}
			};
			if (!store) {
				_addLeakageTraceLogic(options);
			}
			this.emitter = new Emitter<T>(options);
			if (store) {
				store.add(this.emitter);
			}
		}

		beginUpdate<T>(_observable: IObservable<T, void>): void {
			// assert(_observable === this.obs);
			this._counter++;
		}

		handlePossibleChange<T>(_observable: IObservable<T, unknown>): void {
			// assert(_observable === this.obs);
		}

		handleChange<T, TChange>(_observable: IObservable<T, TChange>, _change: TChange): void {
			// assert(_observable === this.obs);
			this._hasChanged = true;
		}

		endUpdate<T>(_observable: IObservable<T, void>): void {
			// assert(_observable === this.obs);
			this._counter--;
			if (this._counter === 0) {
				this._observable.reportChanges();
				if (this._hasChanged) {
					this._hasChanged = false;
					this.emitter.fire(this._observable.get());
				}
			}
		}
	}
 
	export function fromObservable<T>(obs: IObservable<T, any>, store?: DisposableStore): Event<T> {
		const observer = new EmitterObserver(obs, store);
		return observer.emitter.event;
	}
 
	export function fromObservableLight(observable: IObservable<any>): Event<void> {
		return (listener) => {
			let count = 0;
			let didChange = false;
			const observer: IObserver = {
				beginUpdate() {
					count++;
				},
				endUpdate() {
					count--;
					if (count === 0) {
						observable.reportChanges();
						if (didChange) {
							didChange = false;
							listener();
						}
					}
				},
				handlePossibleChange() {
					// noop
				},
				handleChange() {
					didChange = true;
				}
			};
			observable.addObserver(observer);
			observable.reportChanges();
			return {
				dispose() {
					observable.removeObserver(observer);
				}
			};
		};
	}
}

export interface EmitterOptions { 
	onWillAddFirstListener?: Function; 
	onDidAddFirstListener?: Function; 
	onDidAddListener?: Function; 
	onDidRemoveLastListener?: Function; 
	onWillRemoveListener?: Function; 
	onListenerError?: (e: any) => void; 
	leakWarningThreshold?: number; 
	deliveryQueue?: EventDeliveryQueue;
 
	_profName?: string;
}


export class EventProfiling {

	static readonly all = new Set<EventProfiling>();

	private static _idPool = 0;

	readonly name: string;
	public listenerCount: number = 0;
	public invocationCount = 0;
	public elapsedOverall = 0;
	public durations: number[] = [];

	private _stopWatch?: StopWatch;

	constructor(name: string) {
		this.name = `${name}_${EventProfiling._idPool++}`;
		EventProfiling.all.add(this);
	}

	start(listenerCount: number): void {
		this._stopWatch = new StopWatch();
		this.listenerCount = listenerCount;
	}

	stop(): void {
		if (this._stopWatch) {
			const elapsed = this._stopWatch.elapsed();
			this.durations.push(elapsed);
			this.elapsedOverall += elapsed;
			this.invocationCount += 1;
			this._stopWatch = undefined;
		}
	}
}

let _globalLeakWarningThreshold = -1;
export function setGlobalLeakWarningThreshold(n: number): IDisposable {
	const oldValue = _globalLeakWarningThreshold;
	_globalLeakWarningThreshold = n;
	return {
		dispose() {
			_globalLeakWarningThreshold = oldValue;
		}
	};
}

class LeakageMonitor {

	private _stacks: Map<string, number> | undefined;
	private _warnCountdown: number = 0;

	constructor(
		readonly threshold: number,
		readonly name: string = Math.random().toString(18).slice(2, 5),
	) { }

	dispose(): void {
		this._stacks?.clear();
	}

	check(stack: Stacktrace, listenerCount: number): undefined | (() => void) {

		const threshold = this.threshold;
		if (threshold <= 0 || listenerCount < threshold) {
			return undefined;
		}

		if (!this._stacks) {
			this._stacks = new Map();
		}
		const count = (this._stacks.get(stack.value) || 0);
		this._stacks.set(stack.value, count + 1);
		this._warnCountdown -= 1;

		if (this._warnCountdown <= 0) {
			// only warn on first exceed and then every time the limit
			// is exceeded by 50% again
			this._warnCountdown = threshold * 0.5;

			// find most frequent listener and print warning
			let topStack: string | undefined;
			let topCount: number = 0;
			for (const [stack, count] of this._stacks) {
				if (!topStack || topCount < count) {
					topStack = stack;
					topCount = count;
				}
			}

			console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
			console.warn(topStack!);
		}

		return () => {
			const count = (this._stacks!.get(stack.value) || 0);
			this._stacks!.set(stack.value, count - 1);
		};
	}
}

class Stacktrace {

	static create() {
		return new Stacktrace(new Error().stack ?? '');
	}

	private constructor(readonly value: string) { }

	print() {
		console.warn(this.value.split('\n').slice(2).join('\n'));
	}
}

let id = 0;
class UniqueContainer<T> {
	stack?: Stacktrace;
	public id = id++;
	constructor(public readonly value: T) { }
}
const compactionThreshold = 2;

type ListenerContainer<T> = UniqueContainer<(data: T) => void>;
type ListenerOrListeners<T> = (ListenerContainer<T> | undefined)[] | ListenerContainer<T>;

const forEachListener = <T>(listeners: ListenerOrListeners<T>, fn: (c: ListenerContainer<T>) => void) => {
	if (listeners instanceof UniqueContainer) {
		fn(listeners);
	} else {
		for (let i = 0; i < listeners.length; i++) {
			const l = listeners[i];
			if (l) {
				fn(l);
			}
		}
	}
};

/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
	class Document {

		private readonly _onDidChange = new Emitter<(value:string)=>any>();

		public onDidChange = this._onDidChange.event;

		// getter-style
		// get onDidChange(): Event<(value:string)=>any> {
		// 	return this._onDidChange.event;
		// }

		private _doIt() {
			//...
			this._onDidChange.fire(value);
		}
	}
 */
export class Emitter<T> {

	private readonly _options?: EmitterOptions;
	private readonly _leakageMon?: LeakageMonitor;
	private readonly _perfMon?: EventProfiling;
	private _disposed?: true;
	private _event?: Event<T>;
 
	protected _listeners?: ListenerOrListeners<T>;
 
	private _deliveryQueue?: EventDeliveryQueuePrivate;
	protected _size = 0;

	constructor(options?: EmitterOptions) {
		this._options = options;
		this._leakageMon = _globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold ? new LeakageMonitor(this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold) : undefined;
		this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : undefined;
		this._deliveryQueue = this._options?.deliveryQueue as EventDeliveryQueuePrivate | undefined;
	}

	dispose() {
		if (!this._disposed) {
			this._disposed = true; 

			if (this._deliveryQueue?.current === this) {
				this._deliveryQueue.reset();
			}
			if (this._listeners) {
				if (_enableDisposeWithListenerWarning) {
					const listeners = this._listeners;
					queueMicrotask(() => {
						forEachListener(listeners, l => l.stack?.print());
					});
				}

				this._listeners = undefined;
				this._size = 0;
			}
			this._options?.onDidRemoveLastListener?.();
			this._leakageMon?.dispose();
		}
	}
 
	get event(): Event<T> {
		this._event ??= (callback: (e: T) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore) => {
			if (this._leakageMon && this._size > this._leakageMon.threshold * 3) {
				console.warn(`[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far`);
				return Disposable.None;
			}

			if (this._disposed) { 
				return Disposable.None;
			}

			if (thisArgs) {
				callback = callback.bind(thisArgs);
			}

			const contained = new UniqueContainer(callback);

			let removeMonitor: Function | undefined;
			let stack: Stacktrace | undefined;
			if (this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2)) { 
				contained.stack = Stacktrace.create();
				removeMonitor = this._leakageMon.check(contained.stack, this._size + 1);
			}

			if (_enableDisposeWithListenerWarning) {
				contained.stack = stack ?? Stacktrace.create();
			}

			if (!this._listeners) {
				this._options?.onWillAddFirstListener?.(this);
				this._listeners = contained;
				this._options?.onDidAddFirstListener?.(this);
			} else if (this._listeners instanceof UniqueContainer) {
				this._deliveryQueue ??= new EventDeliveryQueuePrivate();
				this._listeners = [this._listeners, contained];
			} else {
				this._listeners.push(contained);
			}

			this._size++;

			const result = toDisposable(() => { removeMonitor?.(); this._removeListener(contained); });
			if (disposables instanceof DisposableStore) {
				disposables.add(result);
			} else if (Array.isArray(disposables)) {
				disposables.push(result);
			}

			return result;
		};

		return this._event;
	}

	private _removeListener(listener: ListenerContainer<T>) {
		this._options?.onWillRemoveListener?.(this);

		if (!this._listeners) {
			return; // expected if a listener gets disposed
		}

		if (this._size === 1) {
			this._listeners = undefined;
			this._options?.onDidRemoveLastListener?.(this);
			this._size = 0;
			return;
		}

		// size > 1 which requires that listeners be a list:
		const listeners = this._listeners as (ListenerContainer<T> | undefined)[];

		const index = listeners.indexOf(listener);
		if (index === -1) {
			console.log('disposed?', this._disposed);
			console.log('size?', this._size);
			console.log('arr?', JSON.stringify(this._listeners));
			throw new Error('Attempted to dispose unknown listener');
		}

		this._size--;
		listeners[index] = undefined;

		const adjustDeliveryQueue = this._deliveryQueue!.current === this;
		if (this._size * compactionThreshold <= listeners.length) {
			let n = 0;
			for (let i = 0; i < listeners.length; i++) {
				if (listeners[i]) {
					listeners[n++] = listeners[i];
				} else if (adjustDeliveryQueue) {
					this._deliveryQueue!.end--;
					if (n < this._deliveryQueue!.i) {
						this._deliveryQueue!.i--;
					}
				}
			}
			listeners.length = n;
		}
	}

	private _deliver(listener: undefined | UniqueContainer<(value: T) => void>, value: T) {
		if (!listener) {
			return;
		}

		const errorHandler = this._options?.onListenerError || onUnexpectedError;
		if (!errorHandler) {
			listener.value(value);
			return;
		}

		try {
			listener.value(value);
		} catch (e) {
			errorHandler(e);
		}
	}

 
	private _deliverQueue(dq: EventDeliveryQueuePrivate) {
		const listeners = dq.current!._listeners! as (ListenerContainer<T> | undefined)[];
		while (dq.i < dq.end) { 
			this._deliver(listeners[dq.i++], dq.value as T);
		}
		dq.reset();
	}
 
	fire(event: T): void {
		if (this._deliveryQueue?.current) {
			this._deliverQueue(this._deliveryQueue);
			this._perfMon?.stop();  
		}

		this._perfMon?.start(this._size);

		if (!this._listeners) {
			// no-op
		} else if (this._listeners instanceof UniqueContainer) {
			this._deliver(this._listeners, event);
		} else {
			const dq = this._deliveryQueue!;
			dq.enqueue(this, event, this._listeners.length);
			this._deliverQueue(dq);
		}

		this._perfMon?.stop();
	}

	hasListeners(): boolean {
		return this._size > 0;
	}
}

export interface EventDeliveryQueue {
	_isEventDeliveryQueue: true;
}

export const createEventDeliveryQueue = (): EventDeliveryQueue => new EventDeliveryQueuePrivate();

class EventDeliveryQueuePrivate implements EventDeliveryQueue {
	declare _isEventDeliveryQueue: true;

	/**
	 * Index in current's listener list.
	 */
	public i = -1;

	/**
	 * The last index in the listener's list to deliver.
	 */
	public end = 0;

	/**
	 * Emitter currently being dispatched on. Emitter._listeners is always an array.
	 */
	public current?: Emitter<any>;
	/**
	 * Currently emitting value. Defined whenever `current` is.
	 */
	public value?: unknown;

	public enqueue<T>(emitter: Emitter<T>, value: T, end: number) {
		this.i = 0;
		this.end = end;
		this.current = emitter;
		this.value = value;
	}

	public reset() {
		this.i = this.end; // force any current emission loop to stop, mainly for during dispose
		this.current = undefined;
		this.value = undefined;
	}
}

export interface IWaitUntil {
	token: CancellationToken;
	waitUntil(thenable: Promise<unknown>): void;
}

export type IWaitUntilData<T> = Omit<Omit<T, 'waitUntil'>, 'token'>;

export class AsyncEmitter<T extends IWaitUntil> extends Emitter<T> {

	private _asyncDeliveryQueue?: LinkedList<[(ev: T) => void, IWaitUntilData<T>]>;

	async fireAsync(data: IWaitUntilData<T>, token: CancellationToken, promiseJoin?: (p: Promise<unknown>, listener: Function) => Promise<unknown>): Promise<void> {
		if (!this._listeners) {
			return;
		}

		if (!this._asyncDeliveryQueue) {
			this._asyncDeliveryQueue = new LinkedList();
		}

		forEachListener(this._listeners, listener => this._asyncDeliveryQueue!.push([listener.value, data]));

		while (this._asyncDeliveryQueue.size > 0 && !token.isCancellationRequested) {

			const [listener, data] = this._asyncDeliveryQueue.shift()!;
			const thenables: Promise<unknown>[] = [];

			const event = <T>{
				...data,
				token,
				waitUntil: (p: Promise<unknown>): void => {
					if (Object.isFrozen(thenables)) {
						throw new Error('waitUntil can NOT be called asynchronous');
					}
					if (promiseJoin) {
						p = promiseJoin(p, listener);
					}
					thenables.push(p);
				}
			};

			try {
				listener(event);
			} catch (e) {
				onUnexpectedError(e);
				continue;
			} 
			Object.freeze(thenables);

			await Promise.allSettled(thenables).then(values => {
				for (const value of values) {
					if (value.status === 'rejected') {
						onUnexpectedError(value.reason);
					}
				}
			});
		}
	}
}


export class PauseableEmitter<T> extends Emitter<T> {

	private _isPaused = 0;
	protected _eventQueue = new LinkedList<T>();
	private _mergeFn?: (input: T[]) => T;

	public get isPaused(): boolean {
		return this._isPaused !== 0;
	}

	constructor(options?: EmitterOptions & { merge?: (input: T[]) => T }) {
		super(options);
		this._mergeFn = options?.merge;
	}

	pause(): void {
		this._isPaused++;
	}

	resume(): void {
		if (this._isPaused !== 0 && --this._isPaused === 0) {
			if (this._mergeFn) { 
				if (this._eventQueue.size > 0) {
					const events = Array.from(this._eventQueue);
					this._eventQueue.clear();
					super.fire(this._mergeFn(events));
				}

			} else { 
				while (!this._isPaused && this._eventQueue.size !== 0) {
					super.fire(this._eventQueue.shift()!);
				}
			}
		}
	}

	override fire(event: T): void {
		if (this._size) {
			if (this._isPaused !== 0) {
				this._eventQueue.push(event);
			} else {
				super.fire(event);
			}
		}
	}
}

export class DebounceEmitter<T> extends PauseableEmitter<T> {

	private readonly _delay: number;
	private _handle: any | undefined;

	constructor(options: EmitterOptions & { merge: (input: T[]) => T; delay?: number }) {
		super(options);
		this._delay = options.delay ?? 100;
	}

	override fire(event: T): void {
		if (!this._handle) {
			this.pause();
			this._handle = setTimeout(() => {
				this._handle = undefined;
				this.resume();
			}, this._delay);
		}
		super.fire(event);
	}
}
 
export class MicrotaskEmitter<T> extends Emitter<T> {
	private _queuedEvents: T[] = [];
	private _mergeFn?: (input: T[]) => T;

	constructor(options?: EmitterOptions & { merge?: (input: T[]) => T }) {
		super(options);
		this._mergeFn = options?.merge;
	}
	override fire(event: T): void {

		if (!this.hasListeners()) {
			return;
		}

		this._queuedEvents.push(event);
		if (this._queuedEvents.length === 1) {
			queueMicrotask(() => {
				if (this._mergeFn) {
					super.fire(this._mergeFn(this._queuedEvents));
				} else {
					this._queuedEvents.forEach(e => super.fire(e));
				}
				this._queuedEvents = [];
			});
		}
	}
}
 
export class EventMultiplexer<T> implements IDisposable {

	private readonly emitter: Emitter<T>;
	private hasListeners = false;
	private events: { event: Event<T>; listener: IDisposable | null }[] = [];

	constructor() {
		this.emitter = new Emitter<T>({
			onWillAddFirstListener: () => this.onFirstListenerAdd(),
			onDidRemoveLastListener: () => this.onLastListenerRemove()
		});
	}

	get event(): Event<T> {
		return this.emitter.event;
	}

	add(event: Event<T>): IDisposable {
		const e = { event: event, listener: null };
		this.events.push(e);

		if (this.hasListeners) {
			this.hook(e);
		}

		const dispose = () => {
			if (this.hasListeners) {
				this.unhook(e);
			}

			const idx = this.events.indexOf(e);
			this.events.splice(idx, 1);
		};

		return toDisposable(createSingleCallFunction(dispose));
	}

	private onFirstListenerAdd(): void {
		this.hasListeners = true;
		this.events.forEach(e => this.hook(e));
	}

	private onLastListenerRemove(): void {
		this.hasListeners = false;
		this.events.forEach(e => this.unhook(e));
	}

	private hook(e: { event: Event<T>; listener: IDisposable | null }): void {
		e.listener = e.event(r => this.emitter.fire(r));
	}

	private unhook(e: { event: Event<T>; listener: IDisposable | null }): void {
		if (e.listener) {
			e.listener.dispose();
		}
		e.listener = null;
	}

	dispose(): void {
		this.emitter.dispose();
	}
}

export interface IDynamicListEventMultiplexer<TEventType> extends IDisposable {
	readonly event: Event<TEventType>;
}
export class DynamicListEventMultiplexer<TItem, TEventType> implements IDynamicListEventMultiplexer<TEventType> {
	private readonly _store = new DisposableStore();

	readonly event: Event<TEventType>;

	constructor(
		items: TItem[],
		onAddItem: Event<TItem>,
		onRemoveItem: Event<TItem>,
		getEvent: (item: TItem) => Event<TEventType>
	) {
		const multiplexer = this._store.add(new EventMultiplexer<TEventType>());
		const itemListeners = this._store.add(new DisposableMap<TItem, IDisposable>());

		function addItem(instance: TItem) {
			itemListeners.set(instance, multiplexer.add(getEvent(instance)));
		}

		// Existing items
		for (const instance of items) {
			addItem(instance);
		}

		// Added items
		this._store.add(onAddItem(instance => {
			addItem(instance);
		}));

		// Removed items
		this._store.add(onRemoveItem(instance => {
			itemListeners.deleteAndDispose(instance);
		}));

		this.event = multiplexer.event;
	}

	dispose() {
		this._store.dispose();
	}
}
 
export class EventBufferer {

	private buffers: Function[][] = [];

	wrapEvent<T>(event: Event<T>): Event<T> {
		return (listener, thisArgs?, disposables?) => {
			return event(i => {
				const buffer = this.buffers[this.buffers.length - 1];

				if (buffer) {
					buffer.push(() => listener.call(thisArgs, i));
				} else {
					listener.call(thisArgs, i);
				}
			}, undefined, disposables);
		};
	}

	bufferEvents<R = void>(fn: () => R): R {
		const buffer: Array<() => R> = [];
		this.buffers.push(buffer);
		const r = fn();
		this.buffers.pop();
		buffer.forEach(flush => flush());
		return r;
	}
} 
export class Relay<T> implements IDisposable {

	private listening = false;
	private inputEvent: Event<T> = Event.None;
	private inputEventListener: IDisposable = Disposable.None;

	private readonly emitter = new Emitter<T>({
		onDidAddFirstListener: () => {
			this.listening = true;
			this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
		},
		onDidRemoveLastListener: () => {
			this.listening = false;
			this.inputEventListener.dispose();
		}
	});

	readonly event: Event<T> = this.emitter.event;

	set input(event: Event<T>) {
		this.inputEvent = event;

		if (this.listening) {
			this.inputEventListener.dispose();
			this.inputEventListener = event(this.emitter.fire, this.emitter);
		}
	}

	dispose() {
		this.inputEventListener.dispose();
		this.emitter.dispose();
	}
}
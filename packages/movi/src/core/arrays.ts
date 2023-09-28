
import { CancellationToken } from './cancellation';
import { CancellationError } from './Errors'; 
 
export interface ISplice<T> {
	readonly start: number;
	readonly deleteCount: number;
	readonly toInsert: readonly T[];
}

export function findFirstIdxMonotonousOrArrLen<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx = 0, endIdxEx = array.length): number {
	let i = startIdx;
	let j = endIdxEx;
	while (i < j) {
		const k = Math.floor((i + j) / 2);
		if (predicate(array[k])) {
			j = k;
		} else {
			i = k + 1;
		}
	}
	return i;
}

export function tail<T>(array: ArrayLike<T>, n: number = 0): T {
	return array[array.length - (1 + n)];
}

export function tail2<T>(arr: T[]): [T[], T] {
	if (arr.length === 0) {
		throw new Error('Invalid tail call');
	}

	return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
}

export function equals<T>(one: ReadonlyArray<T> | undefined, other: ReadonlyArray<T> | undefined, itemEquals: (a: T, b: T) => boolean = (a, b) => a === b): boolean {
	if (one === other) {
		return true;
	}

	if (!one || !other) {
		return false;
	}

	if (one.length !== other.length) {
		return false;
	}

	for (let i = 0, len = one.length; i < len; i++) {
		if (!itemEquals(one[i], other[i])) {
			return false;
		}
	}

	return true;
}
 
export function removeFastWithoutKeepingOrder<T>(array: T[], index: number) {
	const last = array.length - 1;
	if (index < last) {
		array[index] = array[last];
	}
	array.pop();
}
 
export function binarySearch<T>(array: ReadonlyArray<T>, key: T, comparator: (op1: T, op2: T) => number): number {
	return binarySearch2(array.length, i => comparator(array[i], key));
}
 
export function binarySearch2(length: number, compareToKey: (index: number) => number): number {
	let low = 0,
		high = length - 1;

	while (low <= high) {
		const mid = ((low + high) / 2) | 0;
		const comp = compareToKey(mid);
		if (comp < 0) {
			low = mid + 1;
		} else if (comp > 0) {
			high = mid - 1;
		} else {
			return mid;
		}
	}
	return -(low + 1);
}

type Compare<T> = (a: T, b: T) => number;


export function quickSelect<T>(nth: number, data: T[], compare: Compare<T>): T {

	nth = nth | 0;

	if (nth >= data.length) {
		throw new TypeError('invalid index');
	}

	const pivotValue = data[Math.floor(data.length * Math.random())];
	const lower: T[] = [];
	const higher: T[] = [];
	const pivots: T[] = [];

	for (const value of data) {
		const val = compare(value, pivotValue);
		if (val < 0) {
			lower.push(value);
		} else if (val > 0) {
			higher.push(value);
		} else {
			pivots.push(value);
		}
	}

	if (nth < lower.length) {
		return quickSelect(nth, lower, compare);
	} else if (nth < lower.length + pivots.length) {
		return pivots[0];
	} else {
		return quickSelect(nth - (lower.length + pivots.length), higher, compare);
	}
}

export function groupBy<T>(data: ReadonlyArray<T>, compare: (a: T, b: T) => number): T[][] {
	const result: T[][] = [];
	let currentGroup: T[] | undefined = undefined;
	for (const element of data.slice(0).sort(compare)) {
		if (!currentGroup || compare(currentGroup[0], element) !== 0) {
			currentGroup = [element];
			result.push(currentGroup);
		} else {
			currentGroup.push(element);
		}
	}
	return result;
}
 
export function* groupAdjacentBy<T>(items: Iterable<T>, shouldBeGrouped: (item1: T, item2: T) => boolean): Iterable<T[]> {
	let currentGroup: T[] | undefined;
	let last: T | undefined;
	for (const item of items) {
		if (last !== undefined && shouldBeGrouped(last, item)) {
			currentGroup!.push(item);
		} else {
			if (currentGroup) {
				yield currentGroup;
			}
			currentGroup = [item];
		}
		last = item;
	}
	if (currentGroup) {
		yield currentGroup;
	}
}

export function forEachAdjacent<T>(arr: T[], f: (item1: T | undefined, item2: T | undefined) => void): void {
	for (let i = 0; i <= arr.length; i++) {
		f(i === 0 ? undefined : arr[i - 1], i === arr.length ? undefined : arr[i]);
	}
}

export function forEachWithNeighbors<T>(arr: T[], f: (before: T | undefined, element: T, after: T | undefined) => void): void {
	for (let i = 0; i < arr.length; i++) {
		f(i === 0 ? undefined : arr[i - 1], arr[i], i + 1 === arr.length ? undefined : arr[i + 1]);
	}
}

interface IMutableSplice<T> extends ISplice<T> {
	readonly toInsert: T[];
    deleteCount: number;
    start: number;
}
 
export function sortedDiff<T>(before: ReadonlyArray<T>, after: ReadonlyArray<T>, compare: (a: T, b: T) => number): ISplice<T>[] {
	const result: IMutableSplice<T>[] = [];

	function pushSplice(start: number, deleteCount: number, toInsert: T[]): void {
		if (deleteCount === 0 && toInsert.length === 0) {
			return;
		}

		const latest = result[result.length - 1];
         
		if (latest && latest.start + latest.deleteCount === start) {
			latest.deleteCount += deleteCount;
			latest.toInsert.push(...toInsert);
		} else {
			result.push({ start, deleteCount, toInsert });
		}
	}

	let beforeIdx = 0;
	let afterIdx = 0;

	while (true) {
		if (beforeIdx === before.length) {
			pushSplice(beforeIdx, 0, after.slice(afterIdx));
			break;
		}
		if (afterIdx === after.length) {
			pushSplice(beforeIdx, before.length - beforeIdx, []);
			break;
		}

		const beforeElement = before[beforeIdx];
		const afterElement = after[afterIdx];
		const n = compare(beforeElement, afterElement);
		if (n === 0) {
			// equal
			beforeIdx += 1;
			afterIdx += 1;
		} else if (n < 0) {
			// beforeElement is smaller -> before element removed
			pushSplice(beforeIdx, 1, []);
			beforeIdx += 1;
		} else if (n > 0) {
			// beforeElement is greater -> after element added
			pushSplice(beforeIdx, 0, [afterElement]);
			afterIdx += 1;
		}
	}

	return result;
}
 
export function delta<T>(before: ReadonlyArray<T>, after: ReadonlyArray<T>, compare: (a: T, b: T) => number): { removed: T[]; added: T[] } {
	const splices = sortedDiff(before, after, compare);
	const removed: T[] = [];
	const added: T[] = [];

	for (const splice of splices) {
		removed.push(...before.slice(splice.start, splice.start + splice.deleteCount));
		added.push(...splice.toInsert);
	}

	return { removed, added };
}
 
export function top<T>(array: ReadonlyArray<T>, compare: (a: T, b: T) => number, n: number): T[] {
	if (n === 0) {
		return [];
	}
	const result = array.slice(0, n).sort(compare);
	topStep(array, compare, result, n, array.length);
	return result;
}
 
export function topAsync<T>(array: T[], compare: (a: T, b: T) => number, n: number, batch: number, token?: CancellationToken): Promise<T[]> {
	if (n === 0) {
		return Promise.resolve([]);
	}

	return new Promise((resolve, reject) => {
		(async () => {
			const o = array.length;
			const result = array.slice(0, n).sort(compare);
			for (let i = n, m = Math.min(n + batch, o); i < o; i = m, m = Math.min(m + batch, o)) {
				if (i > n) {
					await new Promise(resolve => setTimeout(resolve)); // any other delay function would starve I/O
				}
				if (token && token.isCancellationRequested) {
					throw new CancellationError();
				}
				topStep(array, compare, result, i, m);
			}
			return result;
		})()
			.then(resolve, reject);
	});
}

function topStep<T>(array: ReadonlyArray<T>, compare: (a: T, b: T) => number, result: T[], i: number, m: number): void {
	for (const n = result.length; i < m; i++) {
		const element = array[i];
		if (compare(element, result[n - 1]) < 0) {
			result.pop();
			const j = findFirstIdxMonotonousOrArrLen(result, e => compare(element, e) < 0);
			result.splice(j, 0, element);
		}
	}
}
 
export function coalesce<T>(array: ReadonlyArray<T | undefined | null>): T[] {
	return <T[]>array.filter(e => !!e);
}
 
export function coalesceInPlace<T>(array: Array<T | undefined | null>): void {
	let to = 0;
	for (let i = 0; i < array.length; i++) {
		if (!!array[i]) {
			array[to] = array[i];
			to += 1;
		}
	}
	array.length = to;
}
 
export function move(array: any[], from: number, to: number): void {
	array.splice(to, 0, array.splice(from, 1)[0]);
}
 
export function isFalsyOrEmpty(obj: any): boolean {
	return !Array.isArray(obj) || obj.length === 0;
}
 
export function isNonEmptyArray<T>(obj: T[] | undefined | null): obj is T[];
export function isNonEmptyArray<T>(obj: readonly T[] | undefined | null): obj is readonly T[];
export function isNonEmptyArray<T>(obj: T[] | readonly T[] | undefined | null): obj is T[] | readonly T[] {
	return Array.isArray(obj) && obj.length > 0;
}
 
export function distinct<T>(array: ReadonlyArray<T>, keyFn: (value: T) => any = value => value): T[] {
	const seen = new Set<any>();

	return array.filter(element => {
		const key = keyFn!(element);
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

export function uniqueFilter<T, R>(keyFn: (t: T) => R): (t: T) => boolean {
	const seen = new Set<R>();

	return element => {
		const key = keyFn(element);

		if (seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	};
}

export function firstOrDefault<T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue: NotFound): T | NotFound;
export function firstOrDefault<T>(array: ReadonlyArray<T>): T | undefined;
export function firstOrDefault<T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue?: NotFound): T | NotFound | undefined {
	return array.length > 0 ? array[0] : notFoundValue;
}

export function lastOrDefault<T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue: NotFound): T | NotFound;
export function lastOrDefault<T>(array: ReadonlyArray<T>): T | undefined;
export function lastOrDefault<T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue?: NotFound): T | NotFound | undefined {
	return array.length > 0 ? array[array.length - 1] : notFoundValue;
}

export function commonPrefixLength<T>(one: ReadonlyArray<T>, other: ReadonlyArray<T>, equals: (a: T, b: T) => boolean = (a, b) => a === b): number {
	let result = 0;

	for (let i = 0, len = Math.min(one.length, other.length); i < len && equals(one[i], other[i]); i++) {
		result++;
	}

	return result;
}
 
export function flatten<T>(arr: T[][]): T[] {
	return (<T[]>[]).concat(...arr);
}

export function range(to: number): number[];
export function range(from: number, to: number): number[];
export function range(arg: number, to?: number): number[] {
	let from = typeof to === 'number' ? arg : 0;

	if (typeof to === 'number') {
		from = arg;
	} else {
		from = 0;
		to = arg;
	}

	const result: number[] = [];

	if (from <= to) {
		for (let i = from; i < to; i++) {
			result.push(i);
		}
	} else {
		for (let i = from; i > to; i--) {
			result.push(i);
		}
	}

	return result;
}

export function index<T>(array: ReadonlyArray<T>, indexer: (t: T) => string): { [key: string]: T };
export function index<T, R>(array: ReadonlyArray<T>, indexer: (t: T) => string, mapper: (t: T) => R): { [key: string]: R };
export function index<T, R>(array: ReadonlyArray<T>, indexer: (t: T) => string, mapper?: (t: T) => R): { [key: string]: R } {
	return array.reduce((r, t) => {
		r[indexer(t)] = mapper ? mapper(t) : t;
		return r;
	}, Object.create(null));
}
 
export function insert<T>(array: T[], element: T): () => void {
	array.push(element);

	return () => remove(array, element);
}
 
export function remove<T>(array: T[], element: T): T | undefined {
	const index = array.indexOf(element);
	if (index > -1) {
		array.splice(index, 1);

		return element;
	}

	return undefined;
}
 
export function arrayInsert<T>(target: T[], insertIndex: number, insertArr: T[]): T[] {
	const before = target.slice(0, insertIndex);
	const after = target.slice(insertIndex);
	return before.concat(insertArr, after);
}
 
export function shuffle<T>(array: T[], _seed?: number): void {
	let rand: () => number;

	if (typeof _seed === 'number') {
		let seed = _seed; 
		rand = () => {
			const x = Math.sin(seed++) * 179426549;  
			return x - Math.floor(x);
		};
	} else {
		rand = Math.random;
	}

	for (let i = array.length - 1; i > 0; i -= 1) {
		const j = Math.floor(rand() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}
 
export function pushToStart<T>(arr: T[], value: T): void {
	const index = arr.indexOf(value);

	if (index > -1) {
		arr.splice(index, 1);
		arr.unshift(value);
	}
}
 
export function pushToEnd<T>(arr: T[], value: T): void {
	const index = arr.indexOf(value);

	if (index > -1) {
		arr.splice(index, 1);
		arr.push(value);
	}
}

export function pushMany<T>(arr: T[], items: ReadonlyArray<T>): void {
	for (const item of items) {
		arr.push(item);
	}
}

export function mapArrayOrNot<T, U>(items: T | T[], fn: (_: T) => U): U | U[] {
	return Array.isArray(items) ?
		items.map(fn) :
		fn(items);
}

export function asArray<T>(x: T | T[]): T[];
export function asArray<T>(x: T | readonly T[]): readonly T[];
export function asArray<T>(x: T | T[]): T[] {
	return Array.isArray(x) ? x : [x];
}

export function getRandomElement<T>(arr: T[]): T | undefined {
	return arr[Math.floor(Math.random() * arr.length)];
}
 
export function insertInto<T>(array: T[], start: number, newItems: T[]): void {
	const startIdx = getActualStartIndex(array, start);
	const originalLength = array.length;
	const newItemsLength = newItems.length;
	array.length = originalLength + newItemsLength;
	// Move the items after the start index, start from the end so that we don't overwrite any value.
	for (let i = originalLength - 1; i >= startIdx; i--) {
		array[i + newItemsLength] = array[i];
	}

	for (let i = 0; i < newItemsLength; i++) {
		array[i + startIdx] = newItems[i];
	}
}
 
export function splice<T>(array: T[], start: number, deleteCount: number, newItems: T[]): T[] {
	const index = getActualStartIndex(array, start);
	let result = array.splice(index, deleteCount);
	if (result === undefined) {
		// see https://bugs.webkit.org/show_bug.cgi?id=261140
		result = [];
	}
	insertInto(array, index, newItems);
	return result;
}
 
function getActualStartIndex<T>(array: T[], start: number): number {
	return start < 0 ? Math.max(start + array.length, 0) : Math.min(start, array.length);
}
 
export type CompareResult = number;

export namespace CompareResult {
	export function isLessThan(result: CompareResult): boolean {
		return result < 0;
	}

	export function isLessThanOrEqual(result: CompareResult): boolean {
		return result <= 0;
	}

	export function isGreaterThan(result: CompareResult): boolean {
		return result > 0;
	}

	export function isNeitherLessOrGreaterThan(result: CompareResult): boolean {
		return result === 0;
	}

	export const greaterThan = 1;
	export const lessThan = -1;
	export const neitherLessOrGreaterThan = 0;
} 
export type Comparator<T> = (a: T, b: T) => CompareResult;

export function compareBy<TItem, TCompareBy>(selector: (item: TItem) => TCompareBy, comparator: Comparator<TCompareBy>): Comparator<TItem> {
	return (a, b) => comparator(selector(a), selector(b));
}

export function tieBreakComparators<TItem>(...comparators: Comparator<TItem>[]): Comparator<TItem> {
	return (item1, item2) => {
		for (const comparator of comparators) {
			const result = comparator(item1, item2);
			if (!CompareResult.isNeitherLessOrGreaterThan(result)) {
				return result;
			}
		}
		return CompareResult.neitherLessOrGreaterThan;
	};
}
 
export const numberComparator: Comparator<number> = (a, b) => a - b;

export const booleanComparator: Comparator<boolean> = (a, b) => numberComparator(a ? 1 : 0, b ? 1 : 0);

export function reverseOrder<TItem>(comparator: Comparator<TItem>): Comparator<TItem> {
	return (a, b) => -comparator(a, b);
}

export class ArrayQueue<T> {
	private firstIdx = 0;
	private lastIdx = this.items.length - 1;
 
	constructor(private readonly items: readonly T[]) { }

	get length(): number {
		return this.lastIdx - this.firstIdx + 1;
	}
 
	takeWhile(predicate: (value: T) => boolean): T[] | null {
		// P(k) := k <= this.lastIdx && predicate(this.items[k])
		// Find s := min { k | k >= this.firstIdx && !P(k) } and return this.data[this.firstIdx...s)

		let startIdx = this.firstIdx;
		while (startIdx < this.items.length && predicate(this.items[startIdx])) {
			startIdx++;
		}
		const result = startIdx === this.firstIdx ? null : this.items.slice(this.firstIdx, startIdx);
		this.firstIdx = startIdx;
		return result;
	}
 
	takeFromEndWhile(predicate: (value: T) => boolean): T[] | null {
		// P(k) := this.firstIdx >= k && predicate(this.items[k])
		// Find s := max { k | k <= this.lastIdx && !P(k) } and return this.data(s...this.lastIdx]

		let endIdx = this.lastIdx;
		while (endIdx >= 0 && predicate(this.items[endIdx])) {
			endIdx--;
		}
		const result = endIdx === this.lastIdx ? null : this.items.slice(endIdx + 1, this.lastIdx + 1);
		this.lastIdx = endIdx;
		return result;
	}

	peek(): T | undefined {
		if (this.length === 0) {
			return undefined;
		}
		return this.items[this.firstIdx];
	}

	peekLast(): T | undefined {
		if (this.length === 0) {
			return undefined;
		}
		return this.items[this.lastIdx];
	}

	dequeue(): T | undefined {
		const result = this.items[this.firstIdx];
		this.firstIdx++;
		return result;
	}

	removeLast(): T | undefined {
		const result = this.items[this.lastIdx];
		this.lastIdx--;
		return result;
	}

	takeCount(count: number): T[] {
		const result = this.items.slice(this.firstIdx, this.firstIdx + count);
		this.firstIdx += count;
		return result;
	}
}
 
export class CallbackIterable<T> {
	public static readonly empty = new CallbackIterable<never>(_callback => { });

	constructor(
		/**
		 * Calls the callback for every item.
		 * Stops when the callback returns false.
		*/
		public readonly iterate: (callback: (item: T) => boolean) => void
	) {
	}

	forEach(handler: (item: T) => void) {
		this.iterate(item => { handler(item); return true; });
	}

	toArray(): T[] {
		const result: T[] = [];
		this.iterate(item => { result.push(item); return true; });
		return result;
	}

	filter(predicate: (item: T) => boolean): CallbackIterable<T> {
		return new CallbackIterable(cb => this.iterate(item => predicate(item) ? cb(item) : true));
	}

	map<TResult>(mapFn: (item: T) => TResult): CallbackIterable<TResult> {
		return new CallbackIterable<TResult>(cb => this.iterate(item => cb(mapFn(item))));
	}

	some(predicate: (item: T) => boolean): boolean {
		let result = false;
		this.iterate(item => { result = predicate(item); return !result; });
		return result;
	}

	findFirst(predicate: (item: T) => boolean): T | undefined {
		let result: T | undefined;
		this.iterate(item => {
			if (predicate(item)) {
				result = item;
				return false;
			}
			return true;
		});
		return result;
	}

	findLast(predicate: (item: T) => boolean): T | undefined {
		let result: T | undefined;
		this.iterate(item => {
			if (predicate(item)) {
				result = item;
			}
			return true;
		});
		return result;
	}

	findLastMaxBy(comparator: Comparator<T>): T | undefined {
		let result: T | undefined;
		let first = true;
		this.iterate(item => {
			if (first || CompareResult.isGreaterThan(comparator(item, result!))) {
				first = false;
				result = item;
			}
			return true;
		});
		return result;
	}
}
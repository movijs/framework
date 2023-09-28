 
export type IStringDictionary<V> = Record<string, V>; 
export type INumberDictionary<V> = Record<number, V>; 
export function groupBy<K extends string | number | symbol, V>(data: V[], groupFn: (element: V) => K): Record<K, V[]> {
	const result: Record<K, V[]> = Object.create(null);
	for (const element of data) {
		const key = groupFn(element);
		let target = result[key];
		if (!target) {
			target = result[key] = [];
		}
		target.push(element);
	}
	return result;
}

export function diffSets<T>(before: Set<T>, after: Set<T>): { removed: T[]; added: T[] } {
	const removed: T[] = [];
	const added: T[] = [];
	for (const element of before) {
		if (!after.has(element)) {
			removed.push(element);
		}
	}
	for (const element of after) {
		if (!before.has(element)) {
			added.push(element);
		}
	}
	return { removed, added };
}

export function diffMaps<K, V>(before: Map<K, V>, after: Map<K, V>): { removed: V[]; added: V[] } {
	const removed: V[] = [];
	const added: V[] = [];
	for (const [index, value] of before) {
		if (!after.has(index)) {
			removed.push(value);
		}
	}
	for (const [index, value] of after) {
		if (!before.has(index)) {
			added.push(value);
		}
	}
	return { removed, added };
} 
export function intersection<T>(setA: Set<T>, setB: Iterable<T>): Set<T> {
	const result = new Set<T>();
	for (const elem of setB) {
		if (setA.has(elem)) {
			result.add(elem);
		}
	}
	return result;
}
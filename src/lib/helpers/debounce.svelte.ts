/** Svelte 5 debounce function */
export function debouncer<T>(fn: (...args: T[]) => unknown, ms: number = 300) {

	let id: null | ReturnType<typeof setTimeout> = null;

	return (...args: T[]) => {

		console.log("debounce get", id, performance.now());

		if(id) {

			console.log("debounce clear", id, performance.now());

			clearTimeout(id);
		}

		id = setTimeout(() => fn(...args), ms);

		console.log("debounce set", id, performance.now());
	};
}

export function debounced<T>(stateGetter: () => T, ms: number = 300) {

	let state = $state(stateGetter());

	const update = debouncer<T>((v) => (state = v), ms);

	$effect(() => update(stateGetter()));

	return () => state;
}

/**
 * Debounce expensive functions with a delay
 * @param deps
 * @param action
 * @param delay
 * @returns
 */
export function debounce(deps: () => any[], action: () => void, delay: number = 300) {

	let value = $state();
	let timer: undefined | ReturnType<typeof setTimeout> = undefined;

	$effect(() => {

		deps();

		timer = setTimeout(() => value = action(), delay);

		return () => clearTimeout(timer);
	});

	return () => value;
}
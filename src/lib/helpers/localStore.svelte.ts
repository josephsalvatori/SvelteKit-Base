
export class LocalStore<T> {
	#key: string;
	#version = $state(0);
	#value: T | undefined;

	constructor(key: string, value?: T) {
		this.#key = key;
		this.#value = value;

		if(typeof localStorage !== "undefined") {
			const item = localStorage.getItem(key);
			if(item) this.#value = this.deserialize(item);
		}

		$effect(() => {
			localStorage.setItem(this.#key, this.serialize(this.#value))
		});
	}

	serialize(value: T | undefined): string {
		return JSON.stringify(value);
	}

	deserialize(value: string): T {
		return JSON.parse(value);
	}
}
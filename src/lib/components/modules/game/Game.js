class Game {

	constructor(cmd) {
		this.cmd = cmd;
		this.award = () => {};
	}

	preload(callback = () => {}) {

		this.assetLoad().then(() => {
			callback();
		});
	}

	/** our asset loader */
	async assetLoad() {

		// ... sync items

		return new Promise(async (resolve) => {

			// ... await items

			resolve();
		});
	}
}

export default Game;
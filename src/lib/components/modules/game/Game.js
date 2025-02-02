

class Game {

	/**
	 *	Game class
	 * @param {import('@battlefieldduck/xterm-svelte').Terminal} cmd The terminal instance
	 */
	constructor(cmd) {
		this.cmd = cmd;
		console.log("construct game", this);
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
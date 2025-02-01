
export class PLAYER {

	constructor(
		inventory = [],
		moves = 0,
		score = 0,
		currentRoom = "westOfHouse",
		previousRoom = null,
		gameIsSaved = false,
		verbose = false
	) {
		this.inventory = inventory;
		this.moves = moves;
		this.score = score;
		this.currentRoom = currentRoom;
		this.previousRoom = previousRoom;
		this.gameIsSaved = gameIsSaved;
		this.verbose = verbose;
	}

	getPlayer() {
		return this;
	}

	getPlayerInventory() {
		return this.inventory;
	}

	getCurrentLocation() {
		return this.currentRoom;
	}

	getPreviousLocation() {
		return this.previousRoom;
	}

	getPlayerMoves() {
		return this.moves;
	}

	getPlayerScore() {
		return this.score;
	}

	getSaveState() {
		return this.gameIsSaved;
	}

	getVerboseMode() {
		return this.verbose;
	}

	setCurrentLocation(currentRoom) {
		this.currentRoom = currentRoom;
	}

	setPreviousLocation(previousRoom) {
		this.previousRoom = previousRoom;
	}

	setSaveState(saved) {
		this.gameIsSaved = saved;
	}

	setVerboseMode(verbose) {
		this.verbose = verbose;
	}

	addMove() {
		this.moves = this.moves + 1;
	}

	addScore(score) {
		this.score += score;
	}

	addToInventory(item) {
		this.inventory.push(item);
	}

	removeFromInventory(item) {
		this.inventory = this.inventory.filter(i => i !== item);
	}

	loadPlayerState() {
		// Load the player state from local storage
		if(localStorage.getItem("zorkSave")) {

			let savedGame = JSON.parse(localStorage.getItem("zorkSave"));

			this.inventory = savedGame.inventory;
			this.moves = savedGame.moves;
			this.score = savedGame.score;
			this.currentRoom = savedGame.currentRoom;
			this.previousRoom = savedGame.previousRoom;
			this.gameIsSaved = savedGame.gameIsSaved;
			this.verbose = savedGame.verbose;

		} else {

			this.inventory = [];
			this.moves = 0;
			this.score = 0;
			this.currentRoom = "westOfHouse";
			this.previousRoom = null;
			this.gameIsSaved = false;
			this.verbose = false;
		}

		return this;
	}

	savePlayerState() {
		this.gameIsSaved = true;
		localStorage.setItem("zorkSave", JSON.stringify(this));
	}

	resetPlayerState() {
		localStorage.removeItem("zorkSave");
		this.inventory = [];
		this.moves = 0;
		this.score = 0;
		this.currentRoom = "westOfHouse";
		this.previousRoom = null;
		this.gameIsSaved = false;
		this.verbose = false;
		return this;
	}
}
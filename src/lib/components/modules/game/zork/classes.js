import { SAVE_STATE_NAME, LINE_BREAK } from "./constants";

/**
 * Player model
 */
class Player {

	/**
	 * The Constructor
	 *
	 * @param {array}    inventory Player inventory
	 * @param {integer}  moves     Player move counter
	 * @param {intenger} score Player score
	 * @param {object}   currentRoom Current room object
	 * @param {object}   previousRoom Previous room object
	 * @param {bool}     gameIsSaved Whether game has been saved
	 * @param {bool}     verbose Whether verbose mode is active
	 */
	constructor(inventory = [], moves = 0, score = 0, currentRoom = "westOfHouse", previousRoom = null, gameIsSaved = false, verbose = false) {
		this.inventory = inventory;
		this.score = score;
		this.moves = moves;
		this.currentRoom = currentRoom;
		this.previousRoom = previousRoom;
		this.gameIsSaved = gameIsSaved;
		this.verbose = verbose;

		this.state = {
			playerActions: "",
			loudRoomSolved: false,
			damWaterLow: false,
			turns: 0,
		};
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
		this.moves = this.moves+1;
	}

	addScore(score) {
		this.score += score;
	}

	addToInventory(item) {
		this.inventory.push(item);
	}

	removeFromInventory(item) {
		this.inventory = this.inventory.filter(e => e !== item);
	}

	loadPlayerState() {

		if(localStorage.getItem(SAVE_STATE_NAME)) {

			let savedGame = JSON.parse(localStorage.getItem(SAVE_STATE_NAME));

			this.inventory = savedGame.inventory;
			this.moves = savedGame.moves;
			this.score = savedGame.score;
			this.currentRoom = savedGame.currentRoom;
			this.previousRoom = savedGame.previousRoom;
			this.gameIsSaved = savedGame.gameIsSaved;
			this.verbose = savedGame.verbose;

			return this;
		}

		this.inventory = [];
		this.moves = 0;
		this.score = 0;
		this.currentRoom = "westOfHouse";
		this.previousRoom = null;
		this.gameIsSaved = false;
		this.verbose = false;

		return this;
	}

	savePlayerState() {

		this.gameIsSaved = true;

		localStorage.setItem(SAVE_STATE_NAME, JSON.stringify(this));
	}

	resetPlayerState() {

		localStorage.removeItem(SAVE_STATE_NAME);

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

/**
 * Item model
 */
class Item {

	/**
	 * The Constructor
	 *
	 * @param {string}  varString Single word identifier
	 * @param {string}  name Item name
	 * @param {string}  specialDesc Item special descriptor
	 * @param {string}  description Item simple descriptor
	 * @param {string}  contents Item contents ( If more than one )
	 * @param {boolean} taken If item has been taken
	 * @param {array}   actionArray List of actions an item can provide
	 * @param {string}  openDesc Upon opening description
	 * @param {string}  useDesc Upon usage description
	 * @param {boolean} inUse If item is currently in use
	 */
	constructor(varString, name, specialDesc, description, contents, taken = false, actionArray = [], openDesc = "", useDesc = "", inUse = false) {
		this.varString = varString;
		this.name = name;
		this.specialDesc = specialDesc;
		this.description = description;
		this.contents = contents;
		this.taken = taken;
		this.actionArray = actionArray;
		this.openDesc = openDesc;
		this.useDesc = useDesc;
		this.inUse = inUse;
	}

	getAllItems() {
		return this.items;
	}

	addItem(item) {
		this.items.push(item);
	}
}

/**
 *
 */
class Room {

	/**
	 * The Constructor
	 *
	 * @param {string}  varName The room identifier
	 * @param {string}  name The room name
	 * @param {string}  look The outward facing description of the room
	 * @param {array}   items The list of Items in the room
	 * @param {bool}    isDark Is the room dark
	 */
	constructor(varName, name, look, items, isDark = false)
	{
		this.varName = varName;
		this.name = name;
		this.look = look;
		this.items = items;
		this.visited = false;
		this.isDark = isDark;
		this.darkText = `You have moved into a dark place.${LINE_BREAK}It is pitch black. You are likely to be eaten by a grue.${LINE_BREAK}`;
	}

	/**
	 * Add exit creates an exit solution for the room object.
	 *
	 * @param {string} direction
	 * @param {string} exit
	 */
	addExit(direction, exit) {

		switch(direction){

			case "north":
				this.north = exit;
				break;

			case "northeast":
				this.northeast = exit;
				break;

			case "east":
				this.east = exit;
				break;

			case "southeast":
				this.southeast = exit;
				break;

			case "south":
				this.south = exit;
				break;

			case "southwest":
				this.southwest = exit;
				break;

			case "west":
				this.west = exit;
				break;

			case "northwest":
				this.northwest = exit;
				break;

			case "up":
				this.up = exit;
				break;

			case "down":
				this.down = exit;
				break;

			case "enter":
				this.enter = exit;
				break;

			case "exit":
				this.exit = exit;
				break;

			case "open":
				this.open = exit;
				break;

			case "climb":
				this.climb = exit;
				break;

			case "move":
				this.move = exit;
				break;

			case "rug":
				this.move = exit;
				break;
		}
	}
}

export {
	Player,
	Item,
	Room
};
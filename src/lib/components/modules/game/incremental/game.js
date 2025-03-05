import Game from "../Game";
import {
	GameObject,
	Container,
	Feature,
	Item,
	Passage,
	Room,
	Surface,
} from "./classes";
import {
	CONSTANTS,
	ACTIONS,
	ACTION_PHRASES,
	ACTION_STRINGS,
	GAME_STRINGS,
	GAME_WORDS,
	LOCATIONS,
	MAP_STRINGS,
	PREPOSITIONS
} from "./constants";
import Decimal from "./break_eternity";
import { cfg } from "$lib/helpers/terminal";

/**
 * The Tower
 *  - You wake up on the floor of a stone room and must find a way through the tower
 */
class Tower extends Game {
	constructor() {
		super();

		// necessary vars
		this.firstRun = false;

		// game objects
		this.containers = {};
		this.features = {};
		this.items = {};
		this.passages = {};
		this.rooms = {};
		this.surfaces = {};
		this.world = new Map();

		// validation objects
		this.ambiguousMap = new Map();
		this.currentObjects = new Map();
		this.currentObjectNames = [];
		this.dictionary = new Set();
		this.nouns = new Set();
		this.objects = new Map();
		this.objectNameMap = new Map();

		// player actions
		this.playerAction = ACTION_STRINGS.NULL_ACTION;
		this.playerActionType = "";
		this.completePlayerInput = "";
		this.currentPlayerInput = "";
		this.previousPlayerInput = "";
		this.previousPlayerLocation = "";

		// objects
		this.directObject = null;
		this.indirectObject = null;
		this.previousDirectObject = null;

		// state
		this.state = {
			playerLocation: LOCATIONS.COLD_STONE_ROOM,
			inventory: [], // [id, id, ...]
			time: {
				last: Date.now(),
			},
			timePaused: false,
			turns: 0,
			achievements: {
				example: [0, 0, 0] // lv1, lv2, lv3,
			},
			stationed: {

			}
		};

		// controls
		// ...

		let startingState = Object.create(this.state);

		this.startingState = Object.assign(startingState, this.state);

		this.cfg = cfg;

		console.log(this);
	}

	/** our asset loader */
	async assetLoad() {

		// ... sync functions

		// load world
		this.loadPassages();
		this.loadRooms();
		this.loadWorld();

		// our dummy object
		const dummyObject = new GameObject(this, "dummy_object", LOCATIONS.NULL_LOCATION);

		this.objects.set("dummyObject", dummyObject);

		// load others
		this.loadItems();
		this.loadFeatures();
		this.loadContainers();
		this.loadSurfaces();

		this.loadObjects();

		this.startingObjects = new Map();

		for(let srcObj of this.objects.values()) {

			let obj = Object.create(srcObj);

			obj = Object.assign(obj, srcObj);

			this.startingObjects.set(obj.name, obj);
		}

		return new Promise(async (resolve) => {

			// ... await functions

			resolve();
		});
	}

	init(loadState = {}) {

		// clear the console
		this.cmd.reset();

		console.log("init The Tower", this);

		this.loadState = JSON.parse(JSON.stringify(loadState));

		if(Object.keys(this.loadState).length > 0) {
			this.loadSaveGame();
		}

		else {

			this.cmd.write(cfg.newLine);
			this.cmd.write(GAME_STRINGS.TITLE);
			this.cmd.write(cfg.newLine);

			this.firstRun = true;

			let rm = this.world.get(this.state.playerLocation);

			rm.lookAround();
		}

		// initialize our game

		// debug
		this.debugMode();
	}

	debugMode() {

		// Need to give PC all usable items

		if(!this.smallInterval) this.smallInterval = setInterval(this.updateSmall, 150);
		if(!this.largeInterval) this.largeInterval = setInterval(this.updateLarge, 1000);
	}

	createIncrementWindow() {

	}

	updateIncrementWindow() {

	}

	createObjectNameMap() {

		// fill our name map
		this.objectNameMap.clear();

		// load from objects
		for(let [key, obj] of this.objects) {

			this.objectNameMap.set(key, obj);

			for(let name of obj.altNames) {

				this.objectNameMap.set(name, obj);
			}
		}
	}

	loadObjects() {

		this.createObjectNameMap();

		// Now let's fill our dictionary
		for(let i = 0; i < GAME_WORDS.length; i++) {

			this.dictionary.add(GAME_WORDS[i]);
		}

		for(let name of this.objectNameMap.keys()) {

			this.dictionary.add(name);
			this.nouns.add(name);

			let words = name.split(" ");

			for(let i = 0; i < words.length; i++) {
				this.dictionary.add(words[i]);
				this.nouns.add(words[i]);
			}
		}

		for(let key of Object.keys(ACTIONS)) {

			let words = key.split(" ");

			for(let i = 0; i < words.length; i++) {
				this.dictionary.add(words[i]);
			}
		}

		console.log("DICTIONARY ~", this.dictionary);
	}

	loadItems() {



		// Load items into objects
		for(let key in this.items) {
			this.objects.set(this.items[key].name, this.items[key]);
		}
	}

	loadFeatures() {

		this.features.self = new Feature(this, "you", LOCATIONS.NULL_LOCATION);
		this.features.self.altNames.add("me");
		this.features.self.altNames.add("self");
		this.features.self.altNames.add("myself");
		this.features.self.takeString = "How romantic!";

		// Load features into objects
		for(let key in this.features) {
			this.objects.set(this.features[key].name, this.features[key]);
		}
	}

	loadContainers() {


		// Load containers into objects
		for(let key in this.containers) {
			this.objects.set(this.containers[key].name, this.containers[key]);
		}
	}

	loadSurfaces() {


		// Load surfaces into objects
		for(let key in this.surfaces) {
			this.objects.set(this.surfaces[key].name, this.surfaces[key]);
		}
	}

	/**
	 * Passages link two rooms together and can be open/closed
	 */
	loadPassages() {

		// Floor 1 - Grand Hall
		this.passages.grand_hall_north = new Passage(LOCATIONS.GRAND_HALL, LOCATIONS.FIRST_FLOOR_OFFICE);
		this.passages.grand_hall_southwest = new Passage(LOCATIONS.GRAND_HALL, LOCATIONS.COLD_STONE_ROOM);
		this.passages.grand_hall_northwest = new Passage(LOCATIONS.GRAND_HALL, LOCATIONS.PUMP_ROOM);
		this.passages.grand_hall_northeast = new Passage(LOCATIONS.GRAND_HALL, LOCATIONS.SITTING_ROOM);
		this.passages.grand_hall_east = new Passage(LOCATIONS.GRAND_HALL, LOCATIONS.ENTRY_HALL);

		// Floor 1 - Grand Hall Stairs
		this.passages.grand_hall_stairs = new Passage(LOCATIONS.GRAND_HALL, LOCATIONS.STAIRCASE_LANDING);

		// Floor 1 - settings
		this.passages.grand_hall_north.setClosed();
		this.passages.grand_hall_stairs.setClosed();

		// Floor 1 - messages
		this.passages.grand_hall_north.closedFail = ``;
		this.passages.grand_hall_stairs.closedFail = ``;
	}

	/**
	 * Rooms
	 * 	- Rooms follow an ID format as: {floor-gridStart-gridEnd}
	 *  - a 1x1 room: 1-A1-A1
	 *  - a 2x2 room: 1-A1-B2
	 *  - a 3x1 room: 1-A1-C1
	 */
	loadRooms() {

		/** Floor 1 */
		// Cold Stone Room
		this.rooms.coldStoneRoom = new Room(this, "Cold Stone Room", MAP_STRINGS.DESC_COLD_STONE_ROOM, LOCATIONS.COLD_STONE_ROOM);
		this.rooms.coldStoneRoom.addExit(ACTION_STRINGS.EAST, this.passages.grand_hall_southwest);
		this.rooms.coldStoneRoom.addExit(ACTION_STRINGS.EXIT, this.passages.grand_hall_southwest);
		// Grand Hall
		this.rooms.grandHall = new Room(this, "Grand Hall", MAP_STRINGS.DESC_GRAND_HALL, LOCATIONS.GRAND_HALL);
		this.rooms.grandHall.addExit(ACTION_STRINGS.NORTH, this.passages.grand_hall_north);
		this.rooms.grandHall.addExit(ACTION_STRINGS.NORTHEAST, this.passages.grand_hall_northeast);
		this.rooms.grandHall.addExit(ACTION_STRINGS.NORTHWEST, this.passages.grand_hall_northwest);
		this.rooms.grandHall.addExit(ACTION_STRINGS.EAST, this.passages.grand_hall_east);
		this.rooms.grandHall.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.grand_hall_southwest);
		this.rooms.grandHall.addExit(ACTION_STRINGS.CLIMB, this.passages.grand_hall_stairs);
		this.rooms.grandHall.addExit(ACTION_STRINGS.UP, this.passages.grand_hall_stairs);
		// Entry Hall
		this.rooms.entryHall = new Room(this, "Entry Hall", MAP_STRINGS.DESC_ENTRY_HALL, LOCATIONS.ENTRY_HALL);
		this.rooms.entryHall.addExit(ACTION_STRINGS.WEST, this.passages.grand_hall_east);
		this.rooms.entryHall.addFailMessage(ACTION_STRINGS.EAST, "The door is fake");
		// Pump Room
		this.rooms.pumpRoom = new Room(this, "Pump Room", MAP_STRINGS.PUMP_ROOM, LOCATIONS.PUMP_ROOM);
		this.rooms.pumpRoom.addExit(ACTION_STRINGS.SOUTHEAST, this.passages.grand_hall_northwest);
		this.rooms.pumpRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.grand_hall_northwest);
		this.rooms.pumpRoom.addExit(ACTION_STRINGS.EXIT, this.passages.grand_hall_northwest);
		// Sitting Room
		this.rooms.sittingRoom = new Room(this, "Sitting Room", MAP_STRINGS.SITTING_ROOM, LOCATIONS.SITTING_ROOM);
		this.rooms.sittingRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.grand_hall_northeast);
		this.rooms.sittingRoom.addExit(ACTION_STRINGS.EXIT, this.passages.grand_hall_northeast);
		// First Floor Office
		this.rooms.firstFloorOffice = new Room(this, "First Floor Office", MAP_STRINGS.FIRST_FLOOR_OFFICE, LOCATIONS.FIRST_FLOOR_OFFICE);
		this.rooms.firstFloorOffice.addExit(ACTION_STRINGS.SOUTH, this.passages.grand_hall_north);
		this.rooms.firstFloorOffice.addExit(ACTION_STRINGS.EXIT, this.passages.grand_hall_north);

		/** Floor 2 */
	}

	loadWorld() {

		/** Floor 1 */
		this.world.set(this.rooms.coldStoneRoom.roomID, this.rooms.coldStoneRoom);
		this.world.set(this.rooms.grandHall.roomID, this.rooms.grandHall);
		this.world.set(this.rooms.entryHall.roomID, this.rooms.entryHall);
		this.world.set(this.rooms.firstFloorOffice.roomID, this.rooms.firstFloorOffice);
		this.world.set(this.rooms.pumpRoom.roomID, this.rooms.pumpRoom);
		this.world.set(this.rooms.sittingRoom.roomID, this.rooms.sittingRoom);

		/** Floor 2 */
	}

	/** Runs every 150ms */
	updateSmall() {
		if(this.timePaused) return;

		let diff = (Date.now() - this.state.time.last) / 1000;

		this.state.time.last = Date.now();

	}

	/** Runs every 1 second */
	updateLarge() {
		if(this.timePaused) return;

	}

	loadSaveGame() {

	}

	output(str, setNew = true) {

		if(this.restoringGame) return;

		if(this.directObject != null && this.indirectObject != null) {

			str = str.replace(/ENEMY/g, this.directObject.name);
			str = str.replace(/ITEM/g,  this.indirectObject.name);
			str = str.replace(/WEAPON/g,  this.indirectObject.name);
		}

		this.cmd.write(cfg.newLine);
		this.cmd.write(str);
	}

	outputLocation(str, setNew = true) {

		if(this.restoringGame) return;

		this.cmd.write(cfg.newLineFull);
		this.cmd.write(`${cfg.colors.whiteBold}${str}${cfg.colors.reset}`);
		this.cmd.write(cfg.newLine);
	}

	submitCommand(text, callback = () => {}) {

		let hackRE = /<*>/g;

		if(text.match(hackRE)) {

			this.output("You're not trying to do something tricky, are you?");

			callback();

			return;
		}

		let charRE = /[\w\s,]/g;

		text = text.match(charRE).join("");
		text = text.trim().toLowerCase();

		this.completePlayerInput = text;
		this.currentPlayerInput = text;

		let isValid = this.processInput();

		callback({
			valid: isValid,
			act: this.currentPlayerInput,
			state: this.state,
		});
	}

	setNewCommand() {
		this.cmd.write(cfg.newLine);
		this.cmd.write(cfg.lineStart);
	}

	exitInput() {

		this.updateEvents();
		this.fillCurrentObjectList(); // TODO: do we need this?
	}

	processInput() {

		let input = this.completePlayerInput;

		if(!this.preprocessInput()) {
			this.exitInput();
			return false;
		}

		if(!this.parseAction()) {
			this.output("I can't tell what you're trying to do.");
			this.exitInput();
			return false;
		}

		// fill object list
		this.fillCurrentObjectList();

		input = this.removeExtraWords(this.completePlayerInput);

		this.currentPlayerInput = input;

		switch(this.playerActionType) {
			case "DIRECT":

				if(!this.parseDirectObject()) {
					this.exitInput();
					return false;
				}

				break;
			case "INDIRECT":
			case "INDIRECT_INVERSE":

				if(!this.parseDirectObject()) {
					this.exitInput();
					return false;
				}

				if(!this.parseIndirectObject()) {
					this.exitInput();
					return false;
				}

				break;
			case "SWITCH":

				if(!this.parseDirectObject()) {
					this.exitInput();
					return false;
				}

				if(!this.isEmpty(this.completePlayerInput) && !this.parseIndirectObject()) {
					this.exitInput();
					return false;
				}

				break;
			case "REFLEXIVE":
			case "EXIT":
				this.previousDirectObject = this.items.dummyObject;
				break;
			default: {} break;
		}

		if(this.playerActionType == "INDIRECT_INVERSE") {

			let temp = this.directObject;

			this.directObject = this.indirectObject;
			this.indirectObject = temp;
		}

		console.log("THIS", this);

		if(this.validateAction()) {

			this.update();
			this.exitInput();

			return true;

		} else {

			this.printDebugInfo();
		}

		return false;
	}

	preprocessInput() {

		let input = this.completePlayerInput;

		input = input.replace(/ +/g, " ");

		if(input === "again" || input === "g") {

			this.completePlayerInput = this.previousInput;

			if(this.completePlayerInput === "") {

				this.output("Again what?");

				return false;
			}
		}

		if(this.specialInputCheck()) {
			return false;
		}

		let inputWords = input.split(" ");

		if(!this.startsWith("say", input) && !this.startsWith("speak", input)) {

			for(let i = 0; i < inputWords.length; i++) {

				if(!this.isGameWord(inputWords[i])) {
					this.output(`I don't know what "${inputWords[i]}" means.`);
					return false;
				}
			}
		}

		return true;
	}

	/** Unique input strings */
	specialInputCheck() {

		let result = false;
		let input = this.completePlayerInput;

		if(this.isEmpty(input)) {
			this.output("I beg your pardon?");
			return true;
		}

		if(input === "author" || input === "about") {
			this.output(GAME_STRINGS.ABOUT_INFO);
			return true;
		}

		if(input === "hello" || input === "hi" || input === "hey") {

			let choice = Math.floor(Math.random() * 6);

			switch(choice) {
				case 0:
					this.output("Hello.", false);
					break;
				case 1:
					this.output("Hi.", false);
					break;
				case 2:
					this.output("Hey.", false);
					break;
				case 3:
					this.output("Greetings.", false);
					break;
				case 4:
					this.output("Good day.", false);
					break;
				case 5:
					this.output("Nice weather we've been having lately.", false);
					break;
				default:
					break;

			}

			return true;
		}

		input = " " + input + " ";

		if(/\sfuck\s|\sshit\s|\sdamn\s|\shell\s|\sass\s/.test(input)) {
			this.output("Such language in a high-class establishment like this!");
			return true;
		}

		input = input.trim();

		if(input === "help") {
			this.output(GAME_STRINGS.HELP_INFO);
			return true;
		}

		return result;
	}

	/** this will find and assign the player actions, then update the string to the reamining words */
	parseAction() {

		let input = this.completePlayerInput;

		for(let token of ACTION_PHRASES) {

			if(this.startsWith(token, input)) {

				this.playerAction = ACTIONS[token].action;
				this.playerActionType = ACTIONS[token].type;
				this.actionPhrase = token;

				this.completePlayerInput = input.substring(token.length).trim();

				return true;
			}
		}

		return false;
	}

	parseDirectObject() {

		let input = this.completePlayerInput;

		if(this.isEmpty(input)) {
			this.output("What do you want to " + this.actionPhrase + "?");
			return false;
		}

		if(this.previousDirectObject !== null && this.previousDirectObject !== this.items.dummyObject) {

			input = " " + input + " ";

			if(!this.previousDirectObject.plural) {
				input = input.replace(/ it /, " " + this.previousDirectObject.name +  " ");
			}

			if(this.previousDirectObject.plural || this.previousDirectObject.name === "pile of leaves") {
				input = input.replace(/ them /, " " + this.previousDirectObject.name +  " ");
			}

			input = input.trim();
		}

		for(let token of this.currentObjectNames) {

			if(this.startsWith(token, input)) {

				this.directObject = this.currentObjects.get(token);
				this.directObjectPhrase = token;

				this.completePlayerInput = input.substring(token.length).trim();

				// check for ambiguity
				if(this.ambiguityCheck(token)) {
					return false;
				}

				return true;
			}
		}

		// didn't find the object
		for(let token of this.nouns) {

			if(this.startsWith(token, input)) {

				this.output("You can't see any " + token + " here!");

				return false;
			}
		}

		this.output("I can't tell what you are referring to.");

		return false;
	}

	parseIndirectObject() {

		let input = this.completePlayerInput;

		if(this.isEmpty(input)) {
			this.output(`What do you want to ${this.actionPhrase} this ${this.directObjectPhrase} ${PREPOSITIONS[this.playerAction]}?`);
			return false;
		}

		for(let token of this.currentObjectNames) {

			if(this.startsWith(token, input)) {

				this.indirectObject = this.currentObjects.get(token);
				this.indirectObjectPhrase = token;

				this.completePlayerInput = input.substring(token.length).trim();

				if(this.ambiguityCheck(token)) {
					return false;
				}

				return true;
			}
		}

		// didn't find the object
		for(let token of this.nouns) {

			if(this.startsWith(token, input)) {

				this.output("You can't see any " + token + " here!");

				return false;
			}
		}

		this.output("I can't tell what you are referring to.");

		return false;
	}

	validateAction() {

		let dirObj = this.directObject;
		let indObj = this.indirectObject;
		let act = this.playerAction;

		switch(this.playerAction) {
			case "DIRECT":

				if(dirObj.isItem() && dirObj.location !== LOCATIONS.PLAYER_INVENTORY) {

					switch(act) {
						// Here is the list of actions that can be performed on items
						// which are present but not in the player's inventory.
						case "ATTACK":
						case "BOARD":
						case "CLIMB":
						case "CLOSE":
						case "CUT":
						case "DEFLATE":
						case "INFLATE":
						case "KICK":
						case "LAUNCH":
						case "MOVE_OBJECT":
						case "OPEN":
						case "REPAIR":
						case "TAKE":
						case "UNTIE":
							break;

						default:
							this.output("You're not carrying the " + dirObj.name + ".");
							this.exitInput();
							return false;
					}
				}

				break;
			case "INDIRECT":
			case "INDIRECT_INVERSE":

				if(indObj.isItem() && indObj.location !== LOCATIONS.PLAYER_INVENTORY) {

					switch(act) {
						case "THROW":
							break;
						default:
							this.output("You're not carrying the " + indObj.name + ".");
							this.exitInput();
							return false;
					}
				}

				if(dirObj.isItem() && dirObj.location !== LOCATIONS.PLAYER_INVENTORY) {

					switch(act) {
						case "BREAK":
						case "BURN":
						case "CUT":
						case "INFLATE":
							break;
						default:
							this.output("You're not carrying the " + dirObj.name + ".");
							this.exitInput();
							return false;
					}
				}

				break;

			default: {} break;
		}

		return true;
	}

	printDebugInfo() {

		console.log("Debug Info", {
			action: this.playerAction,
			actionType: this.playerActionType,
			directObject: this.directObject,
			previousDirectObject: this.previousDirectObject,
			indirectObject: this.indirectObject,
			state: this.state,
		});
	}

	update() {

		let currentRoom = this.world.get(this.state.playerLocation);

		// Special cases here

		switch(this.playerAction) {
			// All actions which do NOT consume a turn should be processed here
			// before the specific update functions are called. They will return
			// before the end of the switch block is reached and the game updates
			case "INVENTORY":

				this.listInventory();

				return;

			case "LOOK":

				this.output("You inspect your surroundings.");

				currentRoom.lookAround();

				return;

			case "RESTART":

				this.restart();

				let rm = this.world.get(this.state.playerLocation);

				rm.lookAround();

				return;

			default:

				this.updateActions();

				break;
		}

		// update currentRoom if room has changed
		currentRoom = this.world.get(this.state.playerLocation);

		// TOOD: Might remove firstVisit check, this is to remove visit status from state.
		if(currentRoom.firstVisit) {
			currentRoom.firstVisit = false;
			currentRoom.lookAround();
		}

		// this.updateActors();

		++this.state.turns;

		this.updateItems();
		this.updateEvents();
		this.updateScore();
	}

	updateActions() {

		let currentRoom = this.world.get(this.state.playerLocation);

		switch(this.playerAction) {

			// Actions on an object
			case "ANSWER": { this.directObject.answer(); } break;
			case "ATTACK": { this.directObject.attack(); } break;
			case "BLOW": { this.directObject.blow(); } break;
			case "BOARD": { this.directObject.board(); } break;
			case "BREAK": { this.directObject.breakObject(); } break;
			case "BRUSH": { this.directObject.brush(); } break;
			case "BURN": { this.directObject.burn(); } break;
			case "CLIMB": { this.directObject.climb(); } break;
			case "CLOSE": { this.directObject.close(); } break;
			case "COUNT": { this.directObject.count(); } break;
			case "CROSS": { this.directObject.cross(); } break;
			case "CUT": { this.directObject.cut(); } break;
			case "DEFLATE": { this.directObject.deflate(); } break;
			case "DIG": { this.directObject.dig(); } break;
			case "DRINK": { this.directObject.drink(); } break;
			case "DROP": { this.directObject.drop(); } break;
			case "EAT": { this.directObject.eat(); } break;
			case "ENTER": { this.directObject.enter(); } break;
			case "EXAMINE": { this.directObject.examine(); } break;
			case "EXTINGUISH": { this.directObject.extinguish(); } break;
			case "FILL": { this.directObject.fill(); } break;
			case "FOLLOW": { this.directObject.follow(); } break;
			case "GIVE": { this.directObject.give(); } break;
			case "GREET": { this.directObject.greet(); } break;
			case "INFLATE": { this.directObject.inflate(); } break;
			case "KICK": { this.directObject.kick(); } break;
			case "KNOCK": { this.directObject.knock(); } break;
			case "LAUNCH": { this.directObject.launch(); } break;
			case "LIGHT": { this.directObject.light(); } break;
			case "LISTEN": { this.directObject.listen(); } break;
			case "LOCK": { this.directObject.lock(); } break;
			case "LOOK_IN": { this.directObject.lookIn(); } break;
			case "LOOK_OUT": { this.directObject.lookOut(); } break;
			case "LOOK_UNDER": { this.directObject.lookUnder(); } break;
			case "MOVE_OBJECT": { this.directObject.move(); } break;
			case "LOWER": { this.directObject.lower(); } break;
			case "OPEN": { this.directObject.open(); } break;
			case "POUR": { this.directObject.pour(); } break;
			case "PULL": { this.directObject.pull(); } break;
			case "PUT": { this.directObject.put(); } break;
			case "PUSH": { this.directObject.push(); } break;
			case "RAISE": { this.directObject.raise(); } break;
			case "READ": { this.directObject.read(); } break;
			case "REMOVE": { this.directObject.remove(); } break;
			case "REPAIR": { this.directObject.repair(); } break;
			case "RING": { this.directObject.ring(); } break;
			case "RUB": { this.directObject.touch(); } break;
			case "SEARCH": { this.directObject.search(); } break;
			case "SHAKE": { this.directObject.shake(); } break;
			case "SMELL": { this.directObject.smell(); } break;
			case "TAKE": { this.directObject.take(); } break;
			case "TALK_TO": { this.directObject.talk(); } break;
			case "THROW": { this.directObject.throwObject(); } break;
			case "TIE": { this.directObject.tie(); } break;
			case "TOUCH": { this.directObject.touch(); } break;
			case "TURN": { this.directObject.turn(); } break;
			case "UNLOCK": { this.directObject.unlock(); } break;
			case "UNTIE": { this.directObject.untie(); } break;
			case "WAKE": { this.directObject.wake(); } break;
			case "WAVE": { this.directObject.wave(); } break;
			case "WEAR": { this.directObject.wear(); } break;
			case "WIND": { this.directObject.wind(); } break;

			// Exit actions
			case "NORTH":
			case "SOUTH":
			case "EAST":
			case "WEST":
			case "NORTHEAST":
			case "NORTHWEST":
			case "SOUTHEAST":
			case "SOUTHWEST":
			case "UP":
			case "DOWN":
			case "IN":
			case "OUT":
			case "EXIT":

				if(currentRoom.exit()) {

					let nextRoom = this.world.get(this.state.playerLocation);

					if(!nextRoom.firstVisit) {
						nextRoom.lookAround();
					}
				}

				break;

			// Reflexive actions

			default: {} break;
		}
	}

	// TODO: Might not have actors.
	updateActors() {

	}

	updateEvents() {

	}

	updateItems() {

	}

	updateScore() {

	}

	// TODO: Rewrite to alt screen?
	listInventory() {

		let count = 0;

		for(let g of this.objects.values()) {

			if(g.location === LOCATIONS.PLAYER_INVENTORY) {

				++count;

				if(count === 1) {
					this.output("You are carrying:", false);
				}

				this.output(`  ${g.capArticleName}${(g.isItem() && g.activated === true) ? " (providing light)" : ""}`, false);
			}
		}
	}

	/**
	 * Relocate player
	 * @param {string} loc - Location to relocate player to
	 * @param {boolean} clearOutput - Clear output
	 */
	relocatePlayer(loc, clearOutput = true) {

		console.log(loc, clearOutput);

		if(clearOutput) {
			this.cmd.write(cfg.newLine);
		}

		this.playerPreviousLocation = this.state.playerLocation;
		this.state.playerLocation = loc;

		let room = this.world.get(loc);

		// this.darknessCheck();

		this.cmd.reset();

		room.lookAround();
		room.firstVisit = false;
	}

	isEmpty(input) {
		if(input === null) {
			return true;
		}
		return (input === "" || input.length === 0);
	}

	isGameWord(str) {

		str = str.match(/\w/gi).join("");

		return (this.dictionary.has(str));
	}

	startsWith(token, input) {

		let check = true;

		let tokenWords = token.split(" ");
		let inputWords = input.split(" ");

		if(inputWords.length < tokenWords.length) {
			check = false;
		} else {

			for(let i = 0; i < tokenWords.length; i++) {

				if(tokenWords[i] !== inputWords[i]) {
					check = false;
				}
			}
		}

		return check;
	}

	removeExtraWords(input) {

		input = " " + input + " ";
		input = input.replace(/ back /g, " ");
		input = input.replace(/ from /g, " ");
		input = input.replace(/ of /g, " ");
		input = input.replace(/ the /g, " ");
		input = input.replace(/ to /g, " ");
		input = input.replace(/ with /g, " ");
		input = input.replace(/ at /g, " ");
		input = input.replace(/ in /g, " ");
		input = input.replace(/ on /g, " ");
		input = input.replace(/ out /g, " ");

		input = input.trim();

		return input;
	}

	removeSomeExtraWords(input) {

		input = " " + input + " ";
		input = input.replace(/ back /g, " ");
		input = input.replace(/ from /g, " ");
		input = input.replace(/ of /g, " ");
		input = input.replace(/ the /g, " ");
		input = input.replace(/ to /g, " ");
		input = input.replace(/ with /g, " ");
		input = input.replace(/ at /g, " ");
		input = input.replace(/ out /g, " ");

		input = input.trim();

		return input;
	}

	fillCurrentObjectList() {

		this.currentObjects.clear();
		this.ambiguousMap.clear();

		// self object
		// this.currentObjects.set("you")

		for(let g of this.objects.values()) {

			// objects in the player's location or inventory
			if(g.location === this.state.playerLocation || g.altLocations.has(this.state.playerLocation) || g.playerHasObject()) {

				this.currentObjects.set(g.name, g);

				for(let str of g.altNames) {

					if(this.currentObjects.has(str)) {
						this.currentObjects.set(str + "_alt", g);
					}

					else {
						this.currentObjects.set(str, g);
					}
				}
			}

			// items in an open container that is present in the room
			if((g.location === this.state.playerLocation || g.playerHasObject()) && g.isContainer() && g.isOpen()) {

				for(let it of g.inventory) {

					this.currentObjects.set(it.name, it);

					for(let str of it.altNames) {
						this.currentObjects.set(str, it);
					}
				}
			}

			// items on a surface
			if(g.location === this.state.playerLocation && g.isSurface()) {

				for(let it of g.inventory) {

					this.currentObjects.set(it.name, it);

					for(let str of it.altNames) {
						this.currentObjects.set(str, it);
					}

					if(it.isContainer() && it.isOpen()) {

						for(let nestIt of it.inventory) {

							this.currentObjects.set(nestIt.name, nestIt);

							for(let str of nestIt.altNames) {
								this.currentObjects.set(str, nestIt);
							}
						}
					}
				}
			}

			if(g.intangible) {
				this.currentObjects.delete(g.name);
			}
		}

		// Special cases here

		// create the list of current object names, which can be sorted
		this.currentObjectNames = [];

		for(let name of this.currentObjects.keys()) {
			this.currentObjectNames.push(name);
		}

		// bubble sort by length
		for(let x = 0; x < this.currentObjectNames.length; ++x) {

			for(let y = x + 1; y < this.currentObjectNames.length; ++y) {

				if(this.currentObjectNames[x].length < this.currentObjectNames[y].length) {
					let temp = this.currentObjectNames[x];
					this.currentObjectNames[x] = this.currentObjectNames[y];
					this.currentObjectNames[y] = temp;
				}
			}
		}
	}

	ambiguityCheck(token) {

		let altTok = token + "_alt";

		if(this.currentObjectNames.includes(altTok)) {

			this.state.ambiguousPhrase = token;

			let tokenRE = new RegExp("^" + token);

			for(let [key, obj] of this.currentObjects) {

				if(tokenRE.test(key)) {
					this.ambiguousMap.set(key, obj);
				}
			}

			let ambigStr = "Which " + token + " do you mean: ";

			for(let ambObj of this.ambiguousMap.values()) {
				ambigStr += "the " + ambObj.name + ", ";
			}

			ambigStr = ambigStr.replace(/,\s$/, "?");
			ambigStr = ambigStr.replace(/,(.*$)/, " or $1");

			this.output(ambigStr);

			return true;
		}

		return false;
	}

	// Formatting code taken from RedShark77's games
	format(ex, acc = 2, max = 9) {

		function E(x) {
			return new Decimal(x);
		}

		ex = E(ex);
		neg = ex.lt(0) ? "-" : "";

		if(ex.mag == Infinity) return neg + 'Infinity';
		if(Number.isNaN(ex.mag)) return neg + 'NaN';
		//The bit I added, this rounds the mag if it's extremely close to an integer due to rounding errors during calculations
		if(ex.layer > 0 && (ex.mag % 1) > 0.9999) ex.mag = Math.ceil(ex.mag);
		if(ex.lt(0)) ex = ex.mul(-1);
		if(ex.eq(0)) return ex.toFixed(acc);
		let e = ex.log10().floor();
		if(ex.log10().lt(Math.min(-acc,0)) && acc > 1) {
			let e = ex.log10().ceil();
			let m = ex.div(e.eq(-1)?E(0.1):E(10).pow(e));
			let be = e.mul(-1).max(1).log10().gte(9);
			return neg+(be?'':m.toFixed(2))+'e'+format(e, 0, max);
		} else if(e.lt(max)) {
			let a = Math.max(Math.min(acc-e.toNumber(), acc), 0);
			return neg+(a>0?ex.toFixed(a):ex.toFixed(a).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		} else {
			if(ex.gte("eeee10")) {
				let slog = ex.slog();
				return (slog.gte(1e9)?'':E(10).pow(slog.sub(slog.floor())).toFixed(4)) + "F" + format(slog.floor(), 0);
			}
			let m = ex.div(E(10).pow(e));
			let be = e.gte(10000);
			return neg+(be?'':m.toFixed(2))+'e'+format(e, 0, max);
		}
	}

	// Restart
	restart() {

	}
}

export {
	Tower as default
};
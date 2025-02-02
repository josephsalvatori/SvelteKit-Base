import Game from "../Game.js";
import { Item, Player, Room } from "./classes.js";
import {
	ACTIONS,
	ACTION_PHRASES,
	ALLOWED_VERBS,
	OPENABLE_INSTANCES,
	LINE_BREAK,
	OUTPUT_LISTS,
	MAP_STRINGS,
	TEXT_BOLD,
	TEXT_NORMAL
} from "./constants";
import { cfg } from "$lib/helpers/terminal.js";

class Zork extends Game {

	constructor() {

		super();

		this.itemArray = [];
		this.itemObjects = {};
		this.roomList = {};
		this.currentInput = "";
		this.previousInput = "";

		this.cfg = cfg;
	}

	/** our asset loader */
	async assetLoad() {

		// ... sync items
		this.loadItems();
		this.loadRooms();

		this.player = new Player();

		return new Promise(async (resolve) => {

			// ... await items

			resolve();
		});
	}

	init() {

		this.cmd.write(this.cfg.newLineFull);

		this.player.loadPlayerState();

		if(this.player.gameIsSaved) {
			this.cmd.write(OUTPUT_LISTS.saveLoaded);
			this.cmd.write(cfg.newLineFull);
		}

		this.cmd.write(OUTPUT_LISTS.titleScreen);
		this.cmd.write(cfg.newLineFull);

		this.lookAction();
	}

	loadItems() {

		// TODO: Check Items copy.
		this.itemObjects = {
			sack: new Item("sack", "sack", "", "elongated brown sack, smelling of hot peppers", "hot peppers", false, ["open", "eat"], "Opening the sack reveals a lunch, and a clove of garlice.", `What the heck! You wont make friends this way, but nobody around here is too friendly anyhow. Gulp!`, false),
			bottle: new Item("bottle", "bottle", "A glass bottle is sitting on the table containing a quantity of water.", `A glass bottle is sitting on the table containing a${LINE_BREAK}quantity of water.`, "a quantity of water", false, ["open", "drink"], "opened", `Thank you very much. I was rather thirsty (from all this talking, probably).`, false),
			leaflet: new Item("leaflet", "leaflet", "", "small leaflet", `WELCOME TO ZORK!${LINE_BREAK}${LINE_BREAK}ZORK is a game of adventure, danger and low cunning.${LINE_BREAK}In it you will explore some of the most amazing territory ever seen by mortals.${LINE_BREAK}No computer should be without one!`, false, ["read"], "", "", false),
			mat: new Item("mat", "mat", "A rubber mat saying 'Welcome to Zork!' lies by the door.", "rubber mat", "", false, [], "", "", false),
			egg: new Item("egg", "egg", `In the birds nest is a large egg encrusted with precious jewels, apparently scavenged by a childless songbird.${LINE_BREAK}The egg is covered with fine gold inlay, and ornamented in lapis lazuli and mother-of-pearl.${LINE_BREAK}Unlike most eggs, this one is hinged and closed with a delicate looking clasp.${LINE_BREAK}The egg appears extremely fragile.`, "", false, ["use"], "You've opened the egg.", "The egg glimmers, blinds you, and you fall to the ground.", false),
			leaves: new Item("leaves", "grating", "On the ground is a pile of leaves.", "", "", false, ["use"], "", "You place the grating on the ground. Great...", false),
			sword: new Item("sword", "elven sword", "Above the trophy case hangs an elvish sword of great antiquity.", "", "", false, ["use", "attack"], "You pull the elven sword from you bag and hold it high in the air. It glows with a mystical aura.", "You fiercly swing the sword.", false),
			lantern: new Item("lantern", "brass lantern", "A battery-powered brass lantern is on the trophy case.", "", "", false, ["use", "on", "off"], "", "The brass lantern is now on.", false)
		};

		this.itemArray = Object.keys(this.itemObjects);
	}

	loadRooms() {

		// TODO: Check Room copy.
		this.roomList = {
			"northOfHouse": new Room("northOfHouse", "North of House", `You are facing the north side of a white house. There is no door here,${LINE_BREAK}and all the windows are boarded up. To the north a narrow path winds through the trees.`, [], false),
			"forestPath":  new Room("forestPath", "Forest Path", `This is a path winding through a dimly lit forest. The path heads north-south here.${LINE_BREAK}One particulary large tree with some low branches stands at the edge of the path.`, [], false),
			"forest_one": new Room("forest_one", "Forest", `This is a dimly lit forest, with large trees all around`, [], false),
			"forest_two": new Room("forest_two", "Forest", `This is a forest, with trees in all directions.${LINE_BREAK}To the east, there appears to be light.`, [], false),
			"forest_three": new Room("forest_three", "Forest", `This is a dimly lit forest, with large trees all around.`, [], false),
			"forest_four": new Room("forest_four", "Forest", `The forest thins out, revealing impassable mountains.`, [], false),
			"stormTossed": new Room("stormTossed", "Forest", `Storm-tossed trees block your way.`, [], false),
			"southOfHouse": new Room("southOfHouse", "South of House", `You are facing the south side of a white house.${LINE_BREAK}There is no door here, and all the windows are boarded`, [], false),
			"westOfHouse": new Room("westOfHouse", `${TEXT_BOLD}West of House${TEXT_NORMAL}`, `This is an open field west of a white house, with a boarded front door.${LINE_BREAK + LINE_BREAK}There is a small mailbox here.`, [], false),
			"behindHouse": new Room("behindHouse", "Behind House", `You are behind the white house. A path leads into the forest to the east. ${LINE_BREAK}In one corner of the house there is a small window which is slightly ajar.`, [], false),
			"windowBehindHouse": new Room("windowBehindHouse", "Behind House", `You are behind the white house. A path leads into the forest to the east. ${LINE_BREAK}In one corner of the house there is a small window which is open.`, [], false),
			"kitchen": new Room("kitchen", "Kitchen", `You are in the kitchen of a the white house. A table seems to have been used recently for the${LINE_BREAK}preparation of food. A passage leads to the west and a dark staircase can be seen leading upward.${LINE_BREAK}A dark chimney leads down and to the east is a small window which is open.`, [this.itemObjects.sack, this.itemObjects.bottle], false),
			"mailbox": new Room("mailbox", "Mailbox", `Opening the mailbox reveals a leaflet.`, [this.itemObjects.leaflet]),
			"tree": new Room("tree", "Up A Tree", `You are about 10 feet above the ground nestled among some large branches.${LINE_BREAK}The nearest branch above you is out of reach. Besides you on the branch is a small birds nest.`, [this.itemObjects.egg], false),
			"northClearing": new Room("northClearing", "Clearing", `You are in a clearing, with a forest surrounding you on all sides. A path leads south.`, [this.itemObjects.leaves], false),
			"eastClearing": new Room("eastClearing", "Clearing", `You are in a small clearing in a well marked forest path that extends to the east and west.`, [], false),
			"canyonView": new Room("canyonView", "Canyon View", `You are at the top of the Great Canyon on its west wall.${LINE_BREAK}From here there is a marvelous view of the canyon and parts of the Frigid River upstream. Across the canyon, the walls of the White Cliffs join the mighty ramparts of the Flathead Mountains to the east.${LINE_BREAK}Following the Canyon upstream to the north, Aragain Falls may be seen, complete with rainbow.${LINE_BREAK}The mighty Frigid River flows out from a great dark cavern. To the west and south can be seen an immense forest, stretching for miles around. A path leads northwest.<br > It is possible to climb down into the canyon from here.`, [], false),
			"rockyLedge": new Room("rockyLedge", "Rocky Ledge", `You are on a ledge about halfway up the wall of the river canyon.${LINE_BREAK}You can see from here that the main flow from Aragain Falls twists along a passage which it is impossible for you to enter.${LINE_BREAK}Below you is the canyon bottom. Above you is more cliff, which appears climbable.`, [], false),
			"canyonBottom": new Room("canyonBottom", "Canyon Bottom", `You are beneath the walls of the river canyon which may be climbable here.${LINE_BREAK}The lesser part of the runoff of Aragain Falls flows by below. To the north is a narrow path.`, [], false),
			"endOfRainbow": new Room("endOfRainbow", "End of Rainbow", `You are on a small, rocky beach on the continuation of the Frigid River past the Falls.${LINE_BREAK}The beach is narrow due to the presence of the White Cliffs. The river canyon opens here and sunlight shines in from above.${LINE_BREAK}A rainbow crosses over the falls to the east and a narrow path continues to the southwest.`, [], false),
			"chimney": new Room("chimney", "Chimney", `You are in a small cold chimney, on the wall reads 'Santa was here'.`, [], true),
			"livingRoom": new Room("livingRoom", "Living Room", `You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and a large oriental rug in the center of the room.`, [this.itemObjects.sword, this.itemObjects.lantern], false),
			"livingRoomRugMoved": new Room("livingRoomRugMoved", "Living Room", `With a great effort, the rug is moved to one side of the room, revealing the dusty cover of a closed trap door.`, [this.itemObjects.sword, this.itemObjects.lantern], false),
			"livingRoomTrapDoor": new Room("livingRoomTrapDoor", "Trap Door", `The door reluctantly opens to reveal a rickety staircase descending into darkness.`, [], false),
			"cellar": new Room("cellar", "Cellar", `You are in a dark and damp cellar with a narrow passageway leading north, and a crawlway to the south. On the west is the bottom of a steep metal ramp which is unclimbable.`, [], true),
		};

		// Add exits
		this.roomList.westOfHouse.visited = true;
		// Forest One
		this.roomList.forest_one.addExit("south", this.roomList.stormTossed);
		this.roomList.forest_one.addExit("north", this.roomList.southOfHouse);
		// Storm Tossed Forest
		this.roomList.stormTossed.addExit("north", this.roomList.forest_one);
		// North of House
		this.roomList.northOfHouse.addExit("east", this.roomList.behindHouse);
		this.roomList.northOfHouse.addExit("south", this.roomList.southOfHouse);
		this.roomList.northOfHouse.addExit("north", this.roomList.forestPath);
		this.roomList.northOfHouse.addExit("west", this.roomList.westOfHouse);
		// Forest Path
		this.roomList.forestPath.addExit("south", this.roomList.northOfHouse);
		this.roomList.forestPath.addExit("climb", this.roomList.tree);
		this.roomList.forestPath.addExit("up", this.roomList.tree);
		this.roomList.forestPath.addExit("north", this.roomList.northClearing);
		// North Clearing
		this.roomList.northClearing.addExit("west", this.roomList.forest_two);
		this.roomList.northClearing.addExit("east", this.roomList.forest_three);
		this.roomList.northClearing.addExit("south", this.roomList.forestPath);
		// Forest ( 2 )
		this.roomList.forest_two.addExit("east", this.roomList.forestPath);
		this.roomList.forest_two.addExit("north", this.roomList.northClearing);
		this.roomList.forest_two.addExit("south", this.roomList.westOfHouse);
		// Forest ( 3 )
		this.roomList.forest_three.addExit("west", this.roomList.forestPath);
		this.roomList.forest_three.addExit("east", this.roomList.forest_four);
		// Forest ( 4 )
		this.roomList.forest_four.addExit("west", this.roomList.forestPath);
		// Tree
		this.roomList.tree.addExit("climb", this.roomList.forestPath);
		this.roomList.tree.addExit("down", this.roomList.forestPath);
		this.roomList.tree.addExit("south", this.roomList.northOfHouse);
		// South of House
		this.roomList.southOfHouse.addExit("north", this.roomList.westOfHouse);
		this.roomList.southOfHouse.addExit("south", this.roomList.forest_one);
		this.roomList.southOfHouse.addExit("east", this.roomList.behindHouse);
		this.roomList.southOfHouse.addExit("west", this.roomList.westOfHouse);
		// West of House
		this.roomList.westOfHouse.addExit("north", this.roomList.northOfHouse);
		this.roomList.westOfHouse.addExit("south", this.roomList.southOfHouse);
		this.roomList.westOfHouse.addExit("east", this.roomList.behindHouse);
		this.roomList.westOfHouse.addExit("west", this.roomList.forest_two);
		this.roomList.westOfHouse.addExit("open", this.roomList.mailbox);
		// Mailbox
		this.roomList.mailbox.addExit("north", this.roomList.northOfHouse);
		this.roomList.mailbox.addExit("south", this.roomList.southOfHouse);
		this.roomList.mailbox.addExit("east", this.roomList.behindHouse);
		this.roomList.mailbox.addExit("west", this.roomList.forest_two);
		// Behind House
		this.roomList.behindHouse.addExit("open", this.roomList.windowBehindHouse);
		this.roomList.behindHouse.addExit("south", this.roomList.southOfHouse);
		this.roomList.behindHouse.addExit("west", this.roomList.westOfHouse);
		this.roomList.behindHouse.addExit("east", this.roomList.eastClearing);
		this.roomList.behindHouse.addExit("north", this.roomList.northOfHouse);
		// East Clearing
		this.roomList.eastClearing.addExit("west", this.roomList.behindHouse);
		this.roomList.eastClearing.addExit("east", this.roomList.canyonView);
		// Canyon View
		this.roomList.canyonView.addExit("west", this.roomList.eastClearing);
		this.roomList.canyonView.addExit("east", this.roomList.rockyLedge);
		this.roomList.canyonView.addExit("climb", this.roomList.rockyLedge);
		this.roomList.canyonView.addExit("down", this.roomList.rockyLedge);
		// Rocky Ledge
		this.roomList.rockyLedge.addExit("west", this.roomList.canyonView);
		this.roomList.rockyLedge.addExit("up", this.roomList.canyonView);
		this.roomList.rockyLedge.addExit("down", this.roomList.canyonBottom);
		this.roomList.rockyLedge.addExit("climb", this.roomList.canyonBottom);
		// Canyon Bottom
		this.roomList.canyonBottom.addExit("up", this.roomList.rockyLedge);
		this.roomList.canyonBottom.addExit("climb", this.roomList.rockyLedge);
		this.roomList.canyonBottom.addExit("north", this.roomList.endOfRainbow);
		// End of Rainbow
		this.roomList.endOfRainbow.addExit("south", this.roomList.canyonBottom);
		// Window behind House
		this.roomList.windowBehindHouse.addExit("enter", this.roomList.kitchen);
		this.roomList.windowBehindHouse.addExit("east", this.roomList.eastClearing);
		this.roomList.windowBehindHouse.addExit("west", this.roomList.westOfHouse);
		this.roomList.windowBehindHouse.addExit("north", this.roomList.northOfHouse);
		this.roomList.windowBehindHouse.addExit("south", this.roomList.southOfHouse);
		// Kitchen
		this.roomList.kitchen.addExit("exit", this.roomList.behindHouse);
		this.roomList.kitchen.addExit("up", this.roomList.chimney);
		this.roomList.kitchen.addExit("west", this.roomList.livingRoom);
		// Living Room
		this.roomList.livingRoom.addExit("east", this.roomList.kitchen);
		this.roomList.livingRoom.addExit("rug", this.roomList.livingRoomRugMoved);
		// Living Room Rug Moved
		this.roomList.livingRoomRugMoved.addExit("east", this.roomList.kitchen);
		this.roomList.livingRoomRugMoved.addExit("open", this.roomList.livingRoomTrapDoor);
		// Living Room Trap Door
		this.roomList.livingRoomTrapDoor.addExit("down", this.roomList.cellar);
		this.roomList.livingRoomTrapDoor.addExit("east", this.roomList.kitchen);
		// Cellar
		this.roomList.cellar.addExit("up", this.roomList.livingRoom);
	}

	saveGame() {
		this.player.savePlayerState();
		this.cmd.write(OUTPUT_LISTS.gameSaved);
		this.setNewCommand();
	}

	resetGame() {
		this.player.resetPlayerState();
		this.cmd.write(OUTPUT_LISTS.gameReset);
		this.setNewCommand();
	}

	submitCommand(text, callback = () => {}) {

		let hackRE = /<*>/g;

		this.cmd.write(cfg.newLineFull);

		if(text.match(hackRE)) {

			this.cmd.write("You're not trying to do something tricky, are you?");
			this.setNewCommand();
			callback();
			return;
		}

		let charRE = /[\w\s,]/g;

		text = text.match(charRE).join("");
		text = text.trim().toLowerCase();

		this.currentInput = text;

		this.parseInput();

		let cmd = text.toUpperCase();

		cmd = cmd.split(/(\s+)/).filter(e => e.trim().length > 0);

		for(var i = 0; i < cmd.length; i++) {

			if(!this.validateCommand(cmd[i])) {
				this.invalidCommand();
				callback();
				return;
			}
		}

		let executableCommand = cmd[0];
		let commandArgument = (cmd[1]) ? cmd[1] : null;

		this.executeCommand(executableCommand, commandArgument);

		callback();
	}

	parseInput() {

		let input = this.currentInput;

		if(!this.preprocessInput()) {
			return;
		}

		if(!this.parseAction(input)) {
			this.cmd.write(OUTPUT_LISTS.invalidCommand);
			this.setNewCommand();
			return;
		}

		this.fillCurrentObjectList();

		// If the player is trying to indicate multiple objects,
		// the getMultipleObjects() method is called. If the input
		// can't be parsed, we exit here. If the input CAN be parsed
		// but no objects are in the final list,
		let multRE = /,|\sand\s|\sall\s|\sall$|^all$|everything|\sexcept\s|\sbut\s|treasure/i;
		if(multRE.test(input)) {

			this.removeSomeExtraWords();

			input = input.trim();

			if(this.getMultipleObjects()) {

				this.updateMultiple();
			} else {
				this.cmd.write("I can't understand that.");
				this.setNewCommand();
				return;
			}
		}

		this.removeExtraWords();
	}

	preprocessInput() {

		this.currentInput = this.currentInput.replace(/ +/g, " ");

		if(this.loudRoomCheck(this.currentInput)) {
			return false;
		}

		if(this.currentInput === "again" || this.currentInput === "g") {

			this.currentInput = this.previousInput;

			if(this.currentInput === "") {
				this.cmd.write(OUTPUT_LISTS.noPreviousCommand);
				this.setNewCommand();
				return false;
			}
		}

		if(this.specialInputCheck()) {
			return false;
		}

		let inputWords = this.currentInput.split(" ");

		if(!this.startsWith("say", this.currentInput) && !this.startsWith("speak", this.currentInput)) {

			for(let i = 0; i < inputWords.length; i++) {

				if(!this.isGameWord(inputWords[i])) {
					this.cmd.write(`I don't know what "${inputWords[i]}" means.`);
					this.setNewCommand();
					return false;
				}
			}
		}

		return true;
	}

	/** Unique input strings */
	specialInputCheck() {

		let result = false;
		let input = this.currentInput;

		if(this.isEmpty(input)) {
			this.cmd.write(OUTPUT_LISTS.emptyCommand);
			this.setNewCommand();
			return true;
		}

		if(input === "author" || input === "about") {
			this.cmd.write(OUTPUT_LISTS.aboutGame);
			this.setNewCommand();
			return true;
		}

		if(input === "bug") {
			this.cmd.write(OUTPUT_LISTS.bugReport);
			this.setNewCommand();
			return true;
		}

		if(input === "hello" || input === "hi" || input === "hey") {

			let choice = Math.floor(Math.random() * 6);

			switch(choice) {
				case 0:
					this.cmd.write("Hello.");
					break;
				case 1:
					this.cmd.write("Hi.");
					break;
				case 2:
					this.cmd.write("Hey.");
					break;
				case 3:
					this.cmd.write("Greetings.");
					break;
				case 4:
					this.cmd.write("Good day.");
					break;
				case 5:
					this.cmd.write("Nice weather we've been having lately.");
					break;
				default:
					break;

			}

			this.setNewCommand();

			return true;
		}

		input = " " + input + " ";

		if(/\sfuck\s|\sshit\s|\sdamn\s|\shell\s|\sass\s/.test(input)) {
			this.cmd.write("Such language in a high-class establishment like this!");
			this.setNewCommand();
			return true;
		}

		input = input.trim();

		if(input === "help") {
			this.printHelp();
			return true;
		}

		if(input === "xyzzy" || input === "plugh") {
			this.cmd.write("A hollow voice says 'Fool.'");
			this.setNewCommand();
			return true;
		}

		if(input === "zork") {
			this.cmd.write("At your service!");
			this.setNewCommand();
			return true;
		}

		return result;
	}

	loudRoomCheck(input) {

		if(this.player.currentRoom === "loudRoom" && !this.player.state.loudRoomSolved && !this.player.state.damWaterLow) {

			if(input === "echo") {

				this.player.state.loudRoomSolved = true;
				++this.player.state.turns;

				this.cmd.write(MAP_STRINGS.LOUD_ROOM_CHANGE);
				this.setNewCommand();

				return true;
			}

			let words = this.currentInput.trim().split(" ");
			let lastWord = words[words.length - 1];

			this.parseAction(input);

			switch(this.player.state.playerAction) {
				case "EAST":
				case "WEST":
				case "UP":
				case "LOOK":

					return true;
				default:
					this.cmd.write(`${lastWord} ${lastWord} ...`);
					this.setNewCommand();
					break;

			}

			return true;
		}

		return false;
	}

	isEmpty(input) {
		if(input === null) {
			return true;
		}
		return (input === "" || input.length === 0);
	}

	isGameWord(str) {

		str = str.match(/\w/gi).join("");

		return true;
	}

	startsWith(token, input) {

		let check = true;

		let tokenWords = token.split(" ");
		let inputWords = input.split(" ");

		if (inputWords.length < tokenWords.length) {
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

	parseAction(input) {

		for(let token of ACTION_PHRASES) {

			if(this.startsWith(token, input)) {

				this.player.state.playerAction = ACTIONS[token].action;
				this.player.state.playerActionType = ACTIONS[token].type;
				this.player.state.actionPhrase = token;

				this.currentInput = this.currentInput.substring(token.length).trim();

				return true;
			}
		}

		return false;
	}

	removeExtraWords() {

	}

	removeSomeExtraWords() {

	}

	fillCurrentObjectList() {

	}

	getMultipleObjects() {

	}

	updateMultiple() {

	}

	validateCommand(word) {

		if(ALLOWED_VERBS.includes(word) || this.itemArray.includes(word.toLowerCase()) || OPENABLE_INSTANCES.includes(word)) {
			return true;
		}

		return false;
	}

	invalidCommand() {

		this.cmd.write("Oh no, that doesn't look right!");
		this.setNewCommand();
	}

	executeCommand(cmd, arg) {

		switch(cmd) {
			case "GO":
				this.goAction(arg);
				break;
			case "NORTH":
			case "SOUTH":
			case "EAST":
			case "WEST":
			case "BACK":
			case "CLIMB":
			case "ENTER":
			case "UP":
			case "DOWN":
			case "MOVE":
				this.goAction(cmd);
				break;
			case "LOOK":
				this.lookAction(arg);
				break;
			case "TAKE":
				this.takeAction(arg);
				break;
			case "USE":
				this.useAction(arg);
				break;
			case "DROP":
				this.dropAction(arg);
				break;
			case "OPEN":
				this.openAction(arg);
				break;
			case "READ":
				this.readAction(arg);
				break;
			case "INVENTORY":
			case "BAG":
				this.printInventory();
				break;
			case "HELP":
				this.printHelp();
				break;
			case "SAVE":
				this.saveGame();
				break;
			case "RESET":
				this.resetGame();
				break;
			case "BRIEF":
				this.setBriefOutput();
				break;
			case "VERBOSE":
				this.setVerboseOutput();
				break;
			default:
				break;
		}
	}

	setNewCommand() {
		this.cmd.write(cfg.newLineFull);
		this.cmd.write(cfg.lineStart);
	}

	printHelp() {

		this.cmd.write(OUTPUT_LISTS.acceptableCommands);

		OUTPUT_LISTS.acceptableCommandList.forEach(command => {
			this.cmd.write(LINE_BREAK);
			this.cmd.write(command);
		});

		this.setNewCommand();
	}

	printInventory() {

		let inventory = this.player.getPlayerInventory();

		if(inventory === undefined || inventory.length <= 0) {
			this.cmd.write(OUTPUT_LISTS.emptyBag);
			this.setNewCommand();
			return;
		}

		this.cmd.write(OUTPUT_LISTS.bagContains);

		inventory.forEach(item => {
			this.cmd.write(LINE_BREAK);
			this.cmd.write(item);
		});

		this.setNewCommand();
	}

	setVerboseOutput() {
		this.player.setVerboseMode(true);
		this.cmd.write(OUTPUT_LISTS.verboseMode);
		this.setNewCommand();
	}

	setBriefOutput() {
		this.player.setVerboseMode(false);
		this.cmd.write(OUTPUT_LISTS.briefMode);
		this.setNewCommand();
	}

	getCurrentRoom() {
		return this.player.getCurrentLocation();
	}

	getPreviousRoom() {
		return this.player.getPreviousLocation();
	}

	/** Directional commands */
	lookAction() {

		let currentRoom = this.getCurrentRoom();

		if(!this.roomList[currentRoom].roomIsDark) {

			this.cmd.write(this.roomList[currentRoom].name);
			this.cmd.write(cfg.newLineFull);
			this.cmd.write(this.roomList[currentRoom].look);

			this.showItems(this.roomList[currentRoom]);
		}

		this.setNewCommand();
	}

	showItems(room) {

		if(room.items.length === 0) return;

		let itemList = [];

		room.items.forEach(item => {

			if(item.specialdesc) {

				this.cmd.write(item.specialdesc);

				return;
			}

			itemList.push(item.description);
		});

		if(itemList.length === 1) {

			this.cmd.write(cfg.newLine);
			this.cmd.write(`There is a ${itemList[0]} here.`);

			return;
		}

		this.cmd.write(cfg.newLine);
		this.cmd.write(`There is a ${itemList.join(", ")} here.`);
	}

	goAction(direction) {

		this.increaseMoves();

		let currentRoom = this.getCurrentRoom();
		let lDirection = direction.toLowerCase();

		if(lDirection === "back") {

			this.player.setCurrentLocation(this.player.getPreviousLocation());
			this.player.setPreviousLocation(this.roomList[currentRoom].varName);
			currentRoom = this.getCurrentRoom();

		} else {

			if(this.roomList[currentRoom][lDirection] === undefined) {
				this.cmd.write(OUTPUT_LISTS.invalidDirection);
				this.setNewCommand();
				return;
			}

			this.player.setPreviousLocation(this.roomList[currentRoom].varName);
			this.player.setCurrentLocation(this.roomList[currentRoom][lDirection].varName);
			currentRoom = this.getCurrentRoom();
		}

		if(this.player.getVerboseMode() && currentRoom.visited) {
			this.cmd.write(this.roomList[currentRoom].name);
			this.cmd.write(LINE_BREAK);
			this.showItems(this.roomList[currentRoom]);
		}

		this.lookAction();
		this.roomList[currentRoom].visited = true;
	}

	openAction(direction) {

		if(direction === "EGG") {

			this.useAction("EGG");
			return;
		}

		let currentRoom = this.getCurrentRoom();

		if(this.roomList[currentRoom]["open"] === undefined || !this.roomList[currentRoom]["open"]) {
			this.cmd.write(OUTPUT_LISTS.notOpenable);
			this.setNewCommand();
			return;
		}

		this.player.setPreviousLocation(this.roomList[currentRoom].varName);
		this.player.setCurrentLocation(this.roomList[currentRoom]["open"].varName);

		currentRoom = this.getCurrentRoom();

		if(this.player.getVerboseMode() && currentRoom.visited) {
			this.cmd.write(this.roomList[currentRoom].name);
			this.cmd.write(LINE_BREAK);
			this.showItems(this.roomList[currentRoom]);
		}


		this.lookAction();
		this.roomList[currentRoom].visited = true;
	}

	takeAction(item) {

		let lItem = item.toLowerCase();
		let itemObject = this.itemObjects[lItem];
		let currentRoom = this.getCurrentRoom();

		if(!roomList[currentRoom].items.includes(itemObject)) {
			this.cmd.write(`A ${lItem} does not exist here.`);
			this.setNewCommand();
			return;
		}

		if(this.player.inventory[itemObject]) {
			this.cmd.write(`The ${lItem} is already in your bag.`);
			this.setNewCommand();
			return;
		}

		this.player.addToInventory(lItem);
		this.cmd.write(`You put the ${lItem} in your bag.`);
		this.setNewCommand();
	}

	readAction(item) {

		let lItem = item.toLowerCase();
		let itemObject = this.itemObjects[lItem];

		if(!this.player.inventory.includes(lItem)) {
			this.cmd.write(`You don't own a ${lItem} to read.`);
			this.setNewCommand();
			return;
		}

		if(!itemObject.actionArray.includes("read")) {
			this.cmd.write(OUTPUT_LISTS.notReadable);
			this.setNewCommand();
			return;
		}

		this.cmd.write(itemObject.contents);
		this.setNewCommand();
	}

	dropAction(item) {

		let lItem = item.toLowerCase();
		let itemObject = this.itemObjects[lItem];

		if(!this.player.inventory.includes(lItem)) {
			this.cmd.write(`You don't own a ${lItem} to drop.`);
			this.setNewCommand();
			return;
		}

		let currentRoom = this.getCurrentRoom();

		this.roomList[currentRoom].items.push(itemObject);

		this.player.removeFromInventory(lItem);
		this.cmd.write(`You have dropped the ${lItem}.`);
		this.setNewCommand();
	}

	useAction(item) {

		if(!item) {
			this.cmd.write(OUTPUT_LISTS.notUseable);
			this.setNewCommand();
			return;
		}

		let lItem = item.toLowerCase();

		if(!this.player.inventory.includes(lItem)) {
			this.cmd.write(`You don't own a ${lItem} to use!`);
			this.setNewCommand();
			return;
		}

		if(this.itemObjects[lItem].inUse) {
			this.cmd.write(OUTPUT_LISTS.alreadyInUse);
			this.itemObjects[lItem].inUse = false;
			this.lookAction();
			return;
		}

		if(lItem === "egg") {

			this.cmd.write(this.itemObjects[lItem].openDesc);

			if(this.getCurrentRoom() === "tree") {
				this.goAction("back");
				return;
			}

		} else {

			this.cmd.write(this.itemObjects[lItem].useDesc);
		}

		this.cmd.write(LINE_BREAK);
		this.itemObjects[lItem].inUse = true;
		this.lookAction();
	}
}

export {
	Zork
};
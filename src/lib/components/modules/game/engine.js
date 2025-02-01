import { PLAYER } from "./player";

const charRE = /[\w\s,]/g;
const newLine = "\r\n";

const ALLOWED_VERBS = [
	"GO", "LOOK", "TAKE", "PUSH", "BACK",
	"PULL", "DROP", "OPEN", "WAIT", "ENTER",
	"CLOSE", "INVENTORY", "BAG", "ZYZZY", "HELP",
	"USE", "NORTH", "EAST", "SOUTH", "WEST", "MAILBOX",
	"UP", "DOWN", "LEFT", "RIGHT", "SAVE", "RESET",
	"HELP", "STATE", "BRIEF", "VERBOSE", "READ",
	"CLIMB", "UP", "DOWN", "MOVE", "RUG"
];

const OPENABLE_INSTANCES = [
	"WINDOW", "DOOR", "TRAPDOOR", "TRAP", "TREE", "KITCHEN",
	"CHIMNEY",
];

const ITEM_ARRAY = [

];

const OUTPUT_LISTS = {
	saveLoaded: "Game loaded from a previous save.",
	gameSaved: "Your game state has been saved.",
	gameReset: "Your game state has been reset.",
	emptyBag: "There is nothing in your bag!",
	bagContains: "Your bag contains:",
	acceptableCommands: "Here is a list of acceptable commands:",
	acceptableCommandList: ['> go [direction]', '> north', '> east', '> south', '> west', '> up', '> down', '> look', '> open', '> enter', '> exit','> climb', '> brief [ short descriptions ]', '> verbose [ long descriptions ]', '> help', '> take', '> bag', '> save [ Save current game ]', '> reset [ Reset game including save ]'],
	verboseMode: "ZORK is now in its \"verbose\" mode, which always gives long descriptions of locations (even if you've been there before).",
	briefMode: "ZORK is now in its normal \"brief\" printing mode, which gives long descriptions of places never before visited, and short descriptions otherwise.",
	invalidDirection: "You can't go that way.",
	notOpenable: "You can't open that.",
	notUseable: "Use what?",
	alreadyInUse: "The item is already in use. Putting item away.",
	notReadable: "You can't read that."
};

// CONVERT TO CLASS
export let engine = {
	player: null,
	verb_map: null,
	init: () => {
		engine.player = new PLAYER();
		// engine.player = engine.player.loadPlayerState();

		engine.verb_map = engine.VERB_MAP;

		// Moves board?
	},
	ROOMS: {
		currentRoom: null,
		getCurrentRoom: () => {
			return engine.ROOMS.currentRoom;
		},
		setCurrentRoom: (room) => {
			engine.ROOMS.currentRoom = room;
		}
	},
	PLAYER: {
		inventory: [],
		getInventory: () => {
			return engine.PLAYER.inventory;
		},
		addToInventory: (item) => {
			engine.PLAYER.inventory.push(item);
		},
		removeFromInventory: (item) => {
			engine.PLAYER.inventory = engine.PLAYER.inventory.filter(i => i !== item);
		}
	},
	COMMAND: (input, callback = () => {}) => {

		let command = engine.INPUT.processCommand(input);

		if(!command) {

			callback("Oh no, that doesn't look right!");

			return;
		}

		let execute = command[0];
		let arguement = (command[1]) ? command[1] : null;

		let commandResponse = engine.EXECUTE(execute, arguement);

		callback(commandResponse);
	},
	EXECUTE: (cmd, arg = null) => {

		if(["NORTH", "SOUTH", "EAST", "WEST", "BACK", "CLIMB", "ENTER", "UP", "DOWN", "MOVE"].includes(cmd)) {
            return engine.verb_map[cmd](cmd);
        }

		return engine.verb_map[cmd](arg);
	},
	INPUT: {
		processCommand: (cmd) => {

			// Could add unique match strings here to handle special cases


			// uppercase the command
			cmd = cmd.toUpperCase();

			// split words into array
			cmd = cmd.split(/(\s+)/).filter(e => e.trim().length > 0);

			// validate command
			for (var i = 0; i < cmd.length; i++) {

				if(!engine.INPUT.validateCommand(cmd[i])) {
					return false;
				}
			}

			return cmd;
		},
		validateCommand: (word) => {
			if (ALLOWED_VERBS.includes(word) || ITEM_ARRAY.includes(word.toLowerCase() || OPENABLE_INSTANCES.includes(word))) {
				return true;
			}
			return false;
		}
	},
	ACTIONS: {
		goAction: (direction) => {

			let currentRoom = engine.player.getCurrentRoom();


			if(direction === "BACK") {

			}

		},
		lookAction: (arg) => {

			let currentRoom = engine.player.getCurrentRoom();
		},
		takeAction: (arg) => {

		},
		dropAction: (arg) => {

		},
		openAction: (arg) => {

		},
		readAction: (arg) => {

		},
		useAction: (arg) => {

		},
		printInventory: () => {

		},
		printHelp: () => {

			let text = OUTPUT_LISTS.acceptableCommands + newLine;

			for(var i = 0; i < OUTPUT_LISTS.acceptableCommandList.length; i++) {
				text += OUTPUT_LISTS.acceptableCommandList[i] + newLine;
			}

			return text;
		},
	},
	VERB_MAP: () => {
		return {
			"GO": engine.ACTIONS.goAction,
			"NORTH": engine.ACTIONS.goAction,
			"SOUTH": engine.ACTIONS.goAction,
			"EAST": engine.ACTIONS.goAction,
			"WEST": engine.ACTIONS.goAction,
			"BACK": engine.ACTIONS.goAction,
			"CLIMB": engine.ACTIONS.goAction,
			"UP": engine.ACTIONS.goAction,
			"DOWN": engine.ACTIONS.goAction,
			"ENTER": engine.ACTIONS.goAction,
			"MOVE": engine.ACTIONS.goAction,
			"LOOK": engine.ACTIONS.lookAction,
			"TAKE": engine.ACTIONS.takeAction,
			"USE": engine.ACTIONS.useAction,
			// "PUSH": engine.ACTIONS.pushAction,
			// "PULL": engine.ACTIONS.pullAction,
			"DROP": engine.ACTIONS.dropAction,
			"OPEN": engine.ACTIONS.openAction,
			"READ": engine.ACTIONS.readAction,
			// "WAIT": engine.ACTIONS.waitAction,
			// "CLOSE": engine.ACTIONS.closeAction,
			"INVENTORY": engine.ACTIONS.printInventory,
			"BAG": engine.ACTIONS.printInventory,
			"HELP": engine.ACTIONS.printHelp,
			// "ZYZZY": engine.ACTIONS.zyzzyAction,
		}
	}
};
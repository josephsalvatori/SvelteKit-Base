import Game from "../Game.js";
import {
	CONSTANTS
} from "./constants.js";
import { cfg } from "$lib/helpers/terminal.js";

class Planetfall extends Game {
	constructor() {

		super();

		// necessary vars
		this.firstRun = false;

		// game objects
		this.actors = {};
		this.containers = {};
		this.features = {};
		this.items = {};
		this.passages = {};
		this.rooms = {};
		this.surfaces = {};
		this.world = new Map();

		// config stores
		this.dictionary = new Set();
		this.objects = new Map(); // all interactable objects
		this.objectNameMap = new Map();

		// state validation objects
		this.ambiguousMap = new Map();
		this.currentObjects = new Map();
		this.currentObjectNames = [];
		this.nouns = new Set(); // used in direct validation

		// state stores
		this.commandLog = [];
		this.randomLog = [];
		this.restoringGame = false;

		// game state
		this.state = {
			// player action
			completePlayerInput: "",
			currentPlayerInput: "",
			playerPreviousInput: "",
			actionPhrase: "",
			directObjectPhrase: "",
			indirectObjectPhrase: "",
			speakPhrase: "",
			directObject: null,
			previousDirectObject: null,
			indirectObject: null,
			multipleObjectList: new Map(),
			ambiguousPhrase: "",
		};

		this.startingState = Object.create(this.state);
		this.startingState = Object.assign(this.startingState, this.state);

		this.cfg = cfg;
	}

	/** our asset loader */
	async assetLoad() {

		// ... sync functions



		return new Promise(async (resolve) => {

			// ... await functions

			resolve();
		});
	}

	init(loadState = { cmds: [], rnds: [] }) {

		// clear the console
		this.cmd.reset();

		console.log("init Planetfall", this);
	}

	loadSaveGame() {

	}

	output(str, setNew = true) {

		if(this.restoringGame) return;

		if(this.state.directObject != null && this.state.indirectObject != null) {

			str = str.replace(/ENEMY/g, this.state.directObject.name);
			str = str.replace(/ITEM/g,  this.state.indirectObject.name);
			str = str.replace(/WEAPON/g,  this.state.indirectObject.name);
		}

		this.cmd.write(cfg.newLine);
		this.cmd.write(str);
	}

	outputLocation(str, setNew = true) {

		if(this.restoringGame) return;

		if(this.state.playerInBoat) {
			str += ", in the magic boat";
		}

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

		this.state.completePlayerInput = text;
		this.state.currentPlayerInput = text;

		// let isValid = this.processInput();
		let isValid = true;

		callback({
			valid: isValid,
			act: this.state.currentPlayerInput,
			cmds: this.commandLog,
			rnds: this.randomLog
		});
	}
}

export {
	Planetfall as default
};
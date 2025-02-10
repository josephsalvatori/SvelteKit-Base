import Game from "../Game.js";
import { Actor } from "./actor.js";
import { Feature } from "./feature.js";
import { Item } from "./item.js";
import { GameObject, Container, Player, Room, Passage, Surface } from "./classes.js";
import {
	CONSTANTS,
	ACTION_STRINGS,
	ACTIONS,
	ACTION_PHRASES,
	ACTION_TYPE,
	LOCATION,
	ALLOWED_VERBS,
	OPENABLE_INSTANCES,
	LINE_BREAK,
	OUTPUT_LISTS,
	OVERWORLD,
	MAP_STRINGS,
	OBJECT_STRINGS,
	TEXT_BOLD,
	TEXT_NORMAL,
	GAME_STRINGS,
	GAME_WORDS,
	PREPOSITIONS,
	FOREST
} from "./constants";
import { cfg } from "$lib/helpers/terminal.js";

class Zork extends Game {

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
			// gameplay information
			turns: 0,
			darknessTurns: 0,
			playerInDarkness: false,
			lightActivated: false,
			matchCount: 5,
			playerInBoat: false,
			// player attributes
			playerCarryWeight: 0,
			playerDead: false,
			playerDeaths: 0,
			playerHitPoints: CONSTANTS.MAX_HIT_POINTS,
			playerLocation: LOCATION.NULL_LOCATION,
			playerPreviousLocation: LOCATION.NULL_LOCATION,
			playerScore: 0,
			playerScoreRank: "",
			playerStaggered: false,
			// player action
			playerAction: ACTION_STRINGS.NULL_ACTION,
			playerActionType: "",
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
			// game events
			blueButtonPushed: false,
			bottleFilled: true,
			houseWindowOpened: false,
			carpetMoved: false,
			cyclopsGone: false,
			cyclopsShutsTrapDoor: true,
			damGatesOpen: false,
			damWaterHigh: true,
			damWaterLow: false,
			waterFalling: false,
			waterRising: false,
			damWaterStage: CONSTANTS.RESERVOIR_DRAIN_TURNS,
			floodStage: 0,
			gameWon: false,
			gratingOpened: false,
			gratingUnlocked: false,
			leafPileMoved: false,
			loudRoomSolved: false,
			mirrorBroken: false,
			potOfGoldAppeared: false,
			rainbowSolid: false,
			redButtonPushed: false,
			ropeRailTied: false,
			sandStage: 0,
			scarabFound: false,
			shaftBasketLowered: false,
			shaftBasketUsed: false,
			spiritCeremonyCount: 0,
			spiritsBellRung: false,
			spiritsCandlesLit: false,
			spiritsBanished: false,
			thiefEggTurns: 0,
			thiefOpenedEgg: false,
			trapDoorOpen: false,
			winMessageDisplayed: false,
			yellowButtonPushed: false,
			// achievement flags
			firstMovement: false,
		};

		this.startingState = Object.create(this.state);
		this.startingState = Object.assign(this.startingState, this.state);

		this.cfg = cfg;
	}

	/** our asset loader */
	async assetLoad() {

		// ... sync functions
		this.loadPassages();
		this.loadRooms();
		this.loadWorld();

		// establish a dummy object
		const dummyObject = new GameObject(this, "dummy_object", LOCATION.NULL_LOCATION);

		this.objects.set("dummyObject", dummyObject);

		this.loadItems();
		this.loadFeatures();
		this.loadContainers();
		this.loadSurfaces();
		this.loadActors();

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

	init(loadState = { cmds: [], rnds: [] }) {

		// clear the console
		this.cmd.reset();

		// load our save state into object
		this.loadState = JSON.parse(JSON.stringify(loadState));

		// default start
		this.state.playerLocation = LOCATION.WEST_OF_HOUSE;

		if(this.loadState?.cmds?.length > 0 && this.loadState?.rnds?.length > this.loadState?.cmds?.length) {
			// This will handle all output
			this.loadSaveGame();
		}

		else {

			this.cmd.write(cfg.newLine);
			this.cmd.write(GAME_STRINGS.GAME_BEGIN);
			this.cmd.write(cfg.newLine);

			this.firstRun = true;

			let rm = this.world.get(this.state.playerLocation);

			rm.lookAround();
		}

		console.log("init Zork", this);
	}

	loadSaveGame() {

		if(!this.loadState.rnds || !this.loadState.cmds) return;

		this.restoringGame = true;

		this.restart();

		let rnds = [...this.loadState.rnds];

		this.randomLog = rnds;
		this.commandLog = []; // clear the command log

		let inputLog = [...this.loadState.cmds];

		for(let statement of inputLog) {
			this.resetInput();
			this.state.completePlayerInput = statement;
			this.state.currentPlayerInput = statement;
			this.processInput();
		}

		this.restoringGame = false;

		// need to restore the randomLog from save.
		this.randomLog = rnds;

		this.output("Game restored.");
		this.cmd.write(cfg.newLine);

		this.resetInput();

		this.updateEvents();
		this.updateScore();
		this.refreshInventories();
		this.fillCurrentObjectList();

		let curRoom = this.world.get(this.state.playerLocation);

		curRoom.lookAround();
	}

	resetInput() {

		let dummyObject = this.objects.get("dummyObject");

        if(this.state.completePlayerInput !== "again" && this.state.completePlayerInput !== "g")
            this.state.playerPreviousInput = this.state.currentPlayerInput;

        this.state.completePlayerInput = "";
        this.state.actionPhrase = "";
        this.state.directObjectPhrase = "";
        this.state.indirectObjectPhrase = "";
        this.state.speakPhrase = "";

        this.state.playerAction = ACTION_STRINGS.NULL_ACTION;
        this.state.playerActionType = ACTION_TYPE.NULL_TYPE;

        if(this.state.directObject !== dummyObject) {
            this.state.previousDirectObject = this.state.directObject;
        }

        this.state.directObject = dummyObject;
        this.state.indirectObject = dummyObject;
        this.state.multipleObjectList.clear();
        this.state.ambiguousPhrase = "";
    }

	checkStateLimits() {

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

		this.objectNameMap.set("lamp", this.items.lantern);
		this.objectNameMap.set("lantern", this.items.lantern);
		this.objectNameMap.set("book", this.items.blackBook);
		this.objectNameMap.set("brass bell", this.items.bell);
		this.objectNameMap.set("bell", this.items.bell);
	}

	loadObjects () {

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
	}

	loadItems() {

		// Treasure Items
		this.items.bar = new Item(this, "platinum bar", LOCATION.LOUD_ROOM);
		this.items.bar.altNames.add("bar");
		this.items.bar.altNames.add("platinum");
		this.items.bar.presenceString = OBJECT_STRINGS.PLATINUM_BAR;
		this.items.bar.acquireValue = CONSTANTS.PLATINUM_VALUE;
		this.items.bar.trophyCaseValue = CONSTANTS.PLATINUM_TROPHY_VALUE;
		this.items.bar.weight = CONSTANTS.BAR_WEIGHT;

		this.items.bauble = new Item(this, "brass bauble", LOCATION.NULL_LOCATION);
		this.items.bauble.altNames.add("brass");
		this.items.bauble.altNames.add("bauble");
		this.items.bauble.acquireValue = CONSTANTS.BAUBLE_VALUE;
		this.items.bauble.trophyCaseValue = CONSTANTS.BAUBLE_TROPHY_VALUE;
		this.items.bauble.weight = CONSTANTS.BAUBLE_WEIGHT;

		this.items.chalice = new Item(this, "silver chalice", LOCATION.TREASURE_ROOM);
		this.items.chalice.altNames.add("silver");
		this.items.chalice.altNames.add("chalice");
		this.items.chalice.acquireValue = CONSTANTS.CHALICE_VALUE;
		this.items.chalice.trophyCaseValue = CONSTANTS.CHALICE_TROPHY_VALUE;
		this.items.chalice.weight = CONSTANTS.CHALICE_WEIGHT;

		this.items.coffin = new Item(this, "gold coffin", LOCATION.EGYPTIAN_ROOM);
		this.items.coffin.altNames.add("coffin");
		this.items.coffin.presenceString = OBJECT_STRINGS.COFFIN;
		this.items.coffin.inventoryID = LOCATION.INSIDE_COFFIN;
		this.items.coffin.acquireValue = CONSTANTS.COFFIN_VALUE;
		this.items.coffin.trophyCaseValue = CONSTANTS.COFFIN_TROPHY_VALUE;
		this.items.coffin.weight = CONSTANTS.COFFIN_WEIGHT;
		this.items.coffin.capacity = 35;

		this.items.coins = new Item(this, "bag of coins", LOCATION.MAZE_5);
		this.items.coins.altNames.add("bag");
		this.items.coins.altNames.add("coins");
		this.items.coins.presenceString = OBJECT_STRINGS.INIT_COINS;
		this.items.coins.acquireValue = CONSTANTS.COINS_VALUE;
		this.items.coins.trophyCaseValue = CONSTANTS.COINS_TROPHY_VALUE;
		this.items.coins.weight = CONSTANTS.COINS_WEIGHT;
		this.items.coins.plural = true;

		this.items.canary = new Item(this, "golden clockwork canary", LOCATION.NULL_LOCATION);
		this.items.canary.altNames.add("golden canary");
		this.items.canary.altNames.add("golden clockwork");
		this.items.canary.altNames.add("clockwork canary");
		this.items.canary.altNames.add("clockwork");
		this.items.canary.altNames.add("canary");
		this.items.canary.initialPresenceString = OBJECT_STRINGS.INIT_GOLDEN_CANARY;
		this.items.canary.examineString = OBJECT_STRINGS.EXAMINE_GOLDEN_CANARY;
		this.items.canary.acquireValue = CONSTANTS.CANARY_VALUE;
		this.items.canary.trophyCaseValue = CONSTANTS.CANARY_TROPHY_VALUE;
		this.items.canary.weight = CONSTANTS.CANARY_WEIGHT;

		this.items.diamond = new Item(this, "huge diamond", LOCATION.NULL_LOCATION);
		this.items.diamond.altNames.add("diamond");
		this.items.diamond.presenceString = OBJECT_STRINGS.DIAMOND;
		this.items.diamond.acquireValue = CONSTANTS.DIAMOND_VALUE;
		this.items.diamond.trophyCaseValue = CONSTANTS.DIAMOND_TROPHY_VALUE;
		this.items.diamond.weight = CONSTANTS.DIAMOND_WEIGHT;

		this.items.egg = new Item(this, "jewel-encrusted egg", LOCATION.INSIDE_BIRDS_NEST);
		this.items.egg.altNames.add("egg");
		this.items.egg.initialPresenceString = OBJECT_STRINGS.INIT_EGG;
		this.items.egg.acquireValue = CONSTANTS.EGG_VALUE;
		this.items.egg.trophyCaseValue = CONSTANTS.EGG_TROPHY_VALUE;
		this.items.egg.weight = CONSTANTS.EGG_WEIGHT;
		this.items.egg.inventoryID = LOCATION.INSIDE_EGG;
		this.items.egg.capacity = 6;

		this.items.emerald = new Item(this, "large emerald", LOCATION.INSIDE_BUOY);
		this.items.emerald.altNames.add("emerald");
		this.items.emerald.acquireValue = CONSTANTS.EMERALD_VALUE;
		this.items.emerald.trophyCaseValue = CONSTANTS.EMERALD_TROPHY_VALUE;
		this.items.emerald.weight = CONSTANTS.EMERALD_WEIGHT;

		this.items.jade = new Item(this, "jade figurine", LOCATION.BAT_ROOM);
		this.items.jade.altNames.add("jade");
		this.items.jade.altNames.add("figurine");
		this.items.jade.presenceString = OBJECT_STRINGS.JADE;
		this.items.jade.acquireValue = CONSTANTS.JADE_VALUE;
		this.items.jade.trophyCaseValue = CONSTANTS.JADE_TROPHY_VALUE;
		this.items.jade.weight = CONSTANTS.JADE_WEIGHT;

		this.items.painting = new Item(this, "painting", LOCATION.GALLERY);
		this.items.painting.initialPresenceString = OBJECT_STRINGS.INIT_PAINTING;
		this.items.painting.presenceString = OBJECT_STRINGS.PAINTING;
		this.items.painting.acquireValue = CONSTANTS.PAINTING_VALUE;
		this.items.painting.trophyCaseValue = CONSTANTS.PAINTING_TROPHY_VALUE;
		this.items.painting.weight = CONSTANTS.PAINTING_WEIGHT;

		this.items.pot = new Item(this, "pot of gold", LOCATION.NULL_LOCATION);
		this.items.pot.altNames.add("pot");
		this.items.pot.altNames.add("gold");
		this.items.pot.initialPresenceString = OBJECT_STRINGS.INIT_POT_OF_GOLD;
		this.items.pot.acquireValue = CONSTANTS.POT_OF_GOLD_VALUE;
		this.items.pot.trophyCaseValue = CONSTANTS.POT_OF_GOLD_TROPHY_VALUE;
		this.items.pot.weight = CONSTANTS.POT_OF_GOLD_WEIGHT;

		this.items.sapphire = new Item(this, "sapphire-encrusted bracelet", LOCATION.GAS_ROOM);
		this.items.sapphire.altNames.add("sapphire");
		this.items.sapphire.altNames.add("bracelet");
		this.items.sapphire.altNames.add("sapphire bracelet");
		this.items.sapphire.acquireValue = CONSTANTS.SAPPHIRE_VALUE;
		this.items.sapphire.trophyCaseValue = CONSTANTS.SAPPHIRE_TROPHY_VALUE;
		this.items.sapphire.weight = CONSTANTS.SAPPHIRE_WEIGHT;

		this.items.scarab = new Item(this, "beautiful jeweled scarab", LOCATION.NULL_LOCATION);
		this.items.scarab.altNames.add("jeweled scarab");
		this.items.scarab.altNames.add("scarab");
		this.items.scarab.acquireValue = CONSTANTS.SCARAB_VALUE;
		this.items.scarab.trophyCaseValue = CONSTANTS.SCARAB_TROPHY_VALUE;
		this.items.scarab.weight = CONSTANTS.SCARAB_WEIGHT;

		this.items.sceptre = new Item(this, "sceptre", LOCATION.INSIDE_COFFIN);
		this.items.sceptre.altNames.add("scepter");
		this.items.sceptre.initialPresenceString = OBJECT_STRINGS.INIT_SCEPTRE;
		this.items.sceptre.presenceString = OBJECT_STRINGS.SCEPTRE;
		this.items.sceptre.waveString = OBJECT_STRINGS.SCEPTRE_WAVE;
		this.items.sceptre.acquireValue = CONSTANTS.SCEPTRE_VALUE;
		this.items.sceptre.trophyCaseValue = CONSTANTS.SCEPTRE_TROPHY_VALUE;
		this.items.sceptre.weight = CONSTANTS.SCEPTRE_WEIGHT;
		this.items.sceptre.isWeapon = true;

		this.items.skull = new Item(this, "crystal skull", LOCATION.LAND_OF_THE_DEAD);
		this.items.skull.altNames.add("skull");
		this.items.skull.altNames.add("crystal");
		this.items.skull.initialPresenceString = OBJECT_STRINGS.INIT_SKULL;
		this.items.skull.acquireValue = CONSTANTS.CRYSTAL_SKULL_VALUE;
		this.items.skull.trophyCaseValue = CONSTANTS.CRYSTAL_SKULL_TROPHY_VALUE;
		this.items.skull.weight = CONSTANTS.SKULL_WEIGHT;

		this.items.torch = new Item(this, "torch", LOCATION.TORCH_ROOM);
		this.items.torch.altNames.add("ivory");
		this.items.torch.altNames.add("ivory torch");
		this.items.torch.initialPresenceString = OBJECT_STRINGS.INIT_TORCH;
		this.items.torch.activated = true;
		this.items.torch.acquireValue = CONSTANTS.TORCH_VALUE;
		this.items.torch.trophyCaseValue = CONSTANTS.TORCH_TROPHY_VALUE;
		this.items.torch.weight = CONSTANTS.TORCH_WEIGHT;

		this.items.trident = new Item(this, "crystal trident", LOCATION.ATLANTIS_ROOM);
		this.items.trident.altNames.add("trident");
		this.items.trident.altNames.add("crystal");
		this.items.trident.initialPresenceString = OBJECT_STRINGS.INIT_TRIDENT;
		this.items.trident.acquireValue = CONSTANTS.TRIDENT_VALUE;
		this.items.trident.trophyCaseValue = CONSTANTS.TRIDENT_TROPHY_VALUE;
		this.items.trident.weight = CONSTANTS.TRIDENT_WEIGHT;

		this.items.trunk = new Item(this, "trunk of jewels", LOCATION.RESERVOIR_EMPTY);
		this.items.trunk.altNames.add("trunk");
		this.items.trunk.altNames.add("jewels");
		this.items.trunk.acquireValue = CONSTANTS.TRUNK_OF_JEWELS_VALUE;
		this.items.trunk.trophyCaseValue = CONSTANTS.TRUNK_OF_JEWELS_TROPHY_VALUE;
		this.items.trunk.weight = CONSTANTS.TRUNK_WEIGHT;

		// And another 40 (or so) items that can be taken.
		this.items.ancientMap = new Item(this, "ancient map", LOCATION.NULL_LOCATION);
		this.items.ancientMap.altNames.add("map");
		this.items.ancientMap.weight = CONSTANTS.ANCIENT_MAP_WEIGHT;
		this.items.ancientMap.initialPresenceString = OBJECT_STRINGS.INIT_ANCIENT_MAP;
		this.items.ancientMap.readString = OBJECT_STRINGS.ANCIENT_MAP;
		this.items.ancientMap.examineString = OBJECT_STRINGS.ANCIENT_MAP;

		this.items.axe = new Item(this, "bloody axe", LOCATION.TROLL_INVENTORY);
		this.items.axe.altNames.add("axe");
		this.items.axe.altNames.add("ax");
		this.items.axe.weight = CONSTANTS.AXE_WEIGHT;
		this.items.axe.isWeapon = true;

		this.items.bell = new Item(this, "brass bell", LOCATION.TEMPLE);
		this.items.bell.altNames.add("bell");
		this.items.bell.ringString = "Ding, dong.";
		this.items.bell.weight = CONSTANTS.BELL_WEIGHT;

		this.items.blackBook = new Item(this, "black book", LOCATION.ON_ALTAR);
		this.items.blackBook.altNames.add("book");
		this.items.blackBook.initialPresenceString = OBJECT_STRINGS.INIT_BLACK_BOOK;
		this.items.blackBook.weight = CONSTANTS.BLACK_BOOK_WEIGHT;

		this.items.boatLabel = new Item(this, "tan label", LOCATION.NULL_LOCATION);
		this.items.boatLabel.altNames.add("label");
		this.items.boatLabel.readString = GAME_STRINGS.BOAT_LABEL_TEXT;
		this.items.boatLabel.weight = CONSTANTS.BOAT_LABEL_WEIGHT;

		this.items.bottle = new Item(this, "glass bottle", LOCATION.ON_KITCHEN_TABLE);
		this.items.bottle.altNames.add("bottle");
		this.items.bottle.altNames.add("glass");
		this.items.bottle.initialPresenceString = OBJECT_STRINGS.INIT_BOTTLE;
		this.items.bottle.weight = CONSTANTS.BOTTLE_WEIGHT;

		this.items.brokenCanary = new Item(this, "broken clockwork canary", LOCATION.NULL_LOCATION);
		this.items.brokenCanary.altNames.add("broken canary");
		this.items.brokenCanary.altNames.add("canary");
		this.items.brokenCanary.altNames.add("broken clockwork");
		this.items.brokenCanary.altNames.add("clockwork");
		this.items.brokenCanary.initialPresenceString = OBJECT_STRINGS.INIT_BROKEN_CANARY;
		this.items.brokenCanary.examineString = OBJECT_STRINGS.EXAMINE_BROKEN_CANARY;
		this.items.brokenCanary.trophyCaseValue = CONSTANTS.BROKEN_CANARY_TROPHY_VALUE;
		this.items.brokenCanary.weight = CONSTANTS.CANARY_WEIGHT;

		this.items.brokenEgg = new Item(this, "broken jewel-encrusted egg", LOCATION.NULL_LOCATION);
		this.items.brokenEgg.presenceString = "There is a somewhat ruined egg here.";
		this.items.brokenEgg.altNames.add("broken egg");
		this.items.brokenEgg.altNames.add("jewel-encrusted egg");
		this.items.brokenEgg.altNames.add("egg");
		this.items.brokenEgg.inventoryID = LOCATION.INSIDE_BROKEN_EGG;
		this.items.brokenEgg.trophyCaseValue = CONSTANTS.BROKEN_EGG_TROPHY_VALUE;
		this.items.brokenEgg.weight = CONSTANTS.EGG_WEIGHT;
		this.items.brokenEgg.capacity = 6;

		this.items.buoy = new Item(this, "red buoy", LOCATION.FRIGID_RIVER_4);
		this.items.buoy.altNames.add("buoy");
		this.items.buoy.inventoryID = LOCATION.INSIDE_BUOY;
		this.items.buoy.weight = CONSTANTS.BUOY_WEIGHT;
		this.items.buoy.capacity = 20;
		this.items.buoy.initialPresenceString = OBJECT_STRINGS.INIT_BUOY;
		this.items.buoy.examineString = "You notice something funny about the feel of the buoy.";

		this.items.candles = new Item(this, "pair of candles", LOCATION.ALTAR);
		this.items.candles.altNames.add("candles");
		this.items.candles.altNames.add("candle");
		this.items.candles.altNames.add("pair");
		this.items.candles.initialPresenceString = OBJECT_STRINGS.INIT_CANDLES;
		this.items.candles.weight = CONSTANTS.CANDLES_WEIGHT;
		this.items.candles.activated = true;
		this.items.candles.plural = true;

		this.items.coal = new Item(this, "small pile of coal", LOCATION.DEAD_END_COAL_MINE);
		this.items.coal.altNames.add("coal");
		this.items.coal.altNames.add("pile");
		this.items.coal.altNames.add("coal pile");
		this.items.coal.altNames.add("pile of coal");
		this.items.coal.altNames.add("small pile");
		this.items.coal.weight = CONSTANTS.COAL_WEIGHT;

		this.items.deflatedBoat = new Item(this, "pile of plastic", LOCATION.DAM_BASE);
		this.items.deflatedBoat.altNames.add("boat");
		this.items.deflatedBoat.altNames.add("raft");
		this.items.deflatedBoat.altNames.add("pile");
		this.items.deflatedBoat.altNames.add("plastic");
		this.items.deflatedBoat.presenceString = OBJECT_STRINGS.INIT_BOAT;
		this.items.deflatedBoat.weight = CONSTANTS.BOAT_WEIGHT;

		this.items.garlic = new Item(this, "clove of garlic", LOCATION.INSIDE_SACK);
		this.items.garlic.altNames.add("clove");
		this.items.garlic.altNames.add("garlic");
		this.items.garlic.weight = CONSTANTS.GARLIC_WEIGHT;

		this.items.guideBook = new Item(this, "guidebook", LOCATION.DAM_LOBBY);
		this.items.guideBook.altNames.add("book");
		this.items.guideBook.initialPresenceString = OBJECT_STRINGS.INIT_GUIDEBOOK;
		this.items.guideBook.weight = CONSTANTS.GUIDEBOOK_WEIGHT;

		this.items.gunk = new Item(this, "viscous material", LOCATION.INSIDE_TUBE);
		this.items.gunk.altNames.add("gunk");
		this.items.gunk.altNames.add("material");
		this.items.gunk.weight = CONSTANTS.GUNK_WEIGHT;

		this.items.inflatedBoat = new Item(this, "magic boat", LOCATION.NULL_LOCATION);
		this.items.inflatedBoat.altNames.add("boat");
		this.items.inflatedBoat.altNames.add("raft");
		this.items.inflatedBoat.inventoryID = LOCATION.INSIDE_BOAT;
		this.items.inflatedBoat.weight = CONSTANTS.BOAT_WEIGHT;
		this.items.inflatedBoat.capacity = 100;
		this.items.inflatedBoat.itemOpen = true;

		this.items.knife = new Item(this, "nasty knife", LOCATION.ATTIC);
		this.items.knife.altNames.add("knife");
		this.items.knife.altNames.add("nasty");
		this.items.knife.initialPresenceString = OBJECT_STRINGS.INIT_NASTY_KNIFE;
		this.items.knife.weight = CONSTANTS.KNIFE_WEIGHT;
		this.items.knife.isWeapon = true;

		this.items.lantern = new Item(this, "brass lantern", LOCATION.LIVING_ROOM);
		this.items.lantern.initialPresenceString = OBJECT_STRINGS.INIT_LANTERN;
		this.items.lantern.altNames.add("lamp");
		this.items.lantern.altNames.add("lantern");
		this.items.lantern.altNames.add("brass lamp");
		this.items.lantern.lifespan = CONSTANTS.LANTERN_LIFESPAN;
		this.items.lantern.weight = CONSTANTS.LANTERN_WEIGHT;

		this.items.nest = new Item(this, "bird's nest", LOCATION.UP_TREE);
		this.items.nest.altNames.add("nest");
		this.items.nest.initialPresenceString = OBJECT_STRINGS.INIT_NEST;
		this.items.nest.inventoryID = LOCATION.INSIDE_BIRDS_NEST;
		this.items.nest.weight = CONSTANTS.NEST_WEIGHT;
		this.items.nest.itemOpen = true;
		this.items.nest.capacity = 20;

		this.items.leafPile = new Item(this, "pile of leaves", LOCATION.CLEARING_NORTH);
		this.items.leafPile.altNames.add("pile");
		this.items.leafPile.altNames.add("leaves");
		this.items.leafPile.countString = "There are 69,105 leaves here.";
		this.items.leafPile.initialPresenceString =  OBJECT_STRINGS.LEAF_PILE;
		this.items.leafPile.presenceString =  OBJECT_STRINGS.LEAF_PILE;
		this.items.leafPile.weight = CONSTANTS.LEAVES_WEIGHT;

		this.items.leaflet = new Item(this, "leaflet", LOCATION.INSIDE_MAILBOX);
		this.items.leaflet.readString = GAME_STRINGS.LEAFLET_TEXT;
		this.items.leaflet.weight = CONSTANTS.LEAFLET_WEIGHT;

		this.items.lunch = new Item(this, "lunch", LOCATION.INSIDE_SACK);
		this.items.lunch.altNames.add("peppers");
		this.items.lunch.altNames.add("hot peppers");
		this.items.lunch.weight = CONSTANTS.LUNCH_WEIGHT;

		this.items.matchbook = new Item(this, "matchbook", LOCATION.DAM_LOBBY);
		this.items.matchbook.altNames.add("matches");
		this.items.matchbook.altNames.add("match");
		this.items.matchbook.presenceString = OBJECT_STRINGS.INIT_MATCHBOOK;
		this.items.matchbook.lifespan = CONSTANTS.MATCH_LIFESPAN;
		this.items.matchbook.weight = CONSTANTS.MATCHBOOK_WEIGHT;

		this.items.pump = new Item(this, "hand-held air pump", LOCATION.RESERVOIR_NORTH);
		this.items.pump.altNames.add("air pump");
		this.items.pump.altNames.add("pump");
		this.items.pump.weight = CONSTANTS.PUMP_WEIGHT;

		this.items.puncturedBoat = new Item(this, "punctured boat", LOCATION.NULL_LOCATION);
		this.items.puncturedBoat.altNames.add("boat");
		this.items.puncturedBoat.altNames.add("ruined boat");
		this.items.puncturedBoat.weight = CONSTANTS.BOAT_WEIGHT;

		this.items.rope = new Item(this, "rope", LOCATION.ATTIC);
		this.items.rope.initialPresenceString = OBJECT_STRINGS.INIT_ROPE;
		this.items.rope.weight = CONSTANTS.ROPE_WEIGHT;

		this.items.ruinedPainting = new Item(this, "ruined painting", LOCATION.NULL_LOCATION);
		this.items.ruinedPainting.initialPresenceString = "There is a worthless piece of canvas here.";
		this.items.ruinedPainting.presenceString = "There is a worthless piece of canvas here.";
		this.items.ruinedPainting.weight = CONSTANTS.PAINTING_WEIGHT;
		this.items.ruinedPainting.altNames.add("painting");
		this.items.ruinedPainting.altNames.add("canvas");
		this.items.ruinedPainting.altNames.add("worthless canvas");
		this.items.ruinedPainting.altNames.add("worthless piece of canvas");
		this.items.ruinedPainting.altNames.add("piece of canvas");

		this.items.rustyKnife = new Item(this, "rusty knife", LOCATION.MAZE_5);
		this.items.rustyKnife.altNames.add("knife");
		this.items.rustyKnife.altNames.add("rusty");
		this.items.rustyKnife.initialPresenceString = OBJECT_STRINGS.INIT_RUSTY_KNIFE;
		this.items.rustyKnife.weight = CONSTANTS.RUSTY_KNIFE_WEIGHT;
		this.items.rustyKnife.isWeapon = true;

		this.items.sack = new Item(this, "brown sack", LOCATION.ON_KITCHEN_TABLE);
		this.items.sack.altNames.add("sack");
		this.items.sack.altNames.add("bag");
		this.items.sack.altNames.add("brown bag");
		this.items.sack.initialPresenceString = OBJECT_STRINGS.INIT_SACK;
		this.items.sack.inventoryID = LOCATION.INSIDE_SACK;
		this.items.sack.weight = CONSTANTS.SACK_WEIGHT;
		this.items.sack.capacity = 9;

		this.items.screwdriver = new Item(this, "screwdriver", LOCATION.MAINTENANCE_ROOM);
		this.items.screwdriver.altNames.add("driver");
		this.items.screwdriver.weight = CONSTANTS.SCREWDRIVER_WEIGHT;

		this.items.shovel = new Item(this, "shovel", LOCATION.SANDY_BEACH);
		this.items.shovel.weight = CONSTANTS.SHOVEL_WEIGHT;

		this.items.skeletonKey = new Item(this, "skeleton key", LOCATION.MAZE_5);
		this.items.skeletonKey.altNames.add("key");
		this.items.skeletonKey.weight = CONSTANTS.SKELETON_KEY_WEIGHT;

		this.items.stiletto = new Item(this, "stiletto", LOCATION.THIEF_INVENTORY);
		this.items.stiletto.weight = CONSTANTS.STILETTO_WEIGHT;

		this.items.studioPaper = new Item(this, "ZORK owner's manual", LOCATION.STUDIO);
		this.items.studioPaper.altNames.add("paper");
		this.items.studioPaper.altNames.add("manual");
		this.items.studioPaper.readString = GAME_STRINGS.NATE_MANUAL_TEXT;
		this.items.studioPaper.initialPresenceString = OBJECT_STRINGS.INIT_ZORK_MANUAL;
		this.items.studioPaper.weight = CONSTANTS.ZORK_MANUAL_WEIGHT;

		this.items.sword = new Item(this, "elvish sword", LOCATION.LIVING_ROOM);
		this.items.sword.initialPresenceString = OBJECT_STRINGS.INIT_SWORD;
		this.items.sword.altNames.add("sword");
		this.items.sword.weight = CONSTANTS.SWORD_WEIGHT;
		this.items.sword.isWeapon = true;

		this.items.timber = new Item(this, "broken timber", LOCATION.TIMBER_ROOM);
		this.items.timber.altNames.add("timber");
		this.items.timber.weight = CONSTANTS.TIMBER_WEIGHT;

		this.items.tube = new Item(this, "tube", LOCATION.MAINTENANCE_ROOM);
		this.items.tube.presenceString = OBJECT_STRINGS.TUBE;
		this.items.tube.examineString = OBJECT_STRINGS.DESC_TUBE;
		this.items.tube.inventoryID = LOCATION.INSIDE_TUBE;
		this.items.tube.weight = CONSTANTS.TUBE_WEIGHT;
		this.items.tube.capacity = 7;

		this.items.uselessLantern = new Item(this, "useless lantern", LOCATION.MAZE_5);
		this.items.uselessLantern.altNames.add("lantern");
		this.items.uselessLantern.altNames.add("lamp");
		this.items.uselessLantern.altNames.add("useless");
		this.items.uselessLantern.altNames.add("useless lamp");
		this.items.uselessLantern.initialPresenceString = OBJECT_STRINGS.INIT_USELESS;
		this.items.uselessLantern.weight = CONSTANTS.USELESS_LANTERN_WEIGHT;

		this.items.wrench = new Item(this, "wrench", LOCATION.MAINTENANCE_ROOM);
		this.items.wrench.weight = CONSTANTS.WRENCH_WEIGHT;

		// Arbitrary Items
		this.items.vitreousSlag = new Item(this, "small piece of vitreous slag", LOCATION.NULL_LOCATION);
		this.items.vitreousSlag.altNames.add("piece of vitreous slag");
		this.items.vitreousSlag.altNames.add("piece of slag");
		this.items.vitreousSlag.altNames.add("vitreous slag");
		this.items.vitreousSlag.altNames.add("slag");

		// Load items into objects
		for(let key in this.items) {
			this.objects.set(this.items[key].name, this.items[key]);
		}
	}

	loadFeatures() {

		this.features.air = new Feature(this, "air", LOCATION.NULL_LOCATION);
		this.features.air.altNames.add("sky");

		this.features.brokenMirror = new Feature(this, "broken mirror", LOCATION.NULL_LOCATION);
		this.features.brokenMirror.altNames.add("mirror");
		this.features.brokenMirror.examineString = "The mirror is broken into many pieces.";
		this.features.brokenMirror.takeString = "The mirror is many times your size. Give up.";
		this.features.brokenMirror.breakString = "Haven't you done enough damage already?";

		this.features.buttonBlue = new Feature(this, "blue button", LOCATION.MAINTENANCE_ROOM);
		this.features.buttonBlue.altNames.add("blue");

		this.features.buttonBrown = new Feature(this, "brown button", LOCATION.MAINTENANCE_ROOM);
		this.features.buttonBrown.altNames.add("brown");

		this.features.buttonRed = new Feature(this, "red button", LOCATION.MAINTENANCE_ROOM);
		this.features.buttonRed.altNames.add("red");

		this.features.buttonYellow = new Feature(this, "yellow button", LOCATION.MAINTENANCE_ROOM);
		this.features.buttonYellow.altNames.add("yellow");

		this.features.carpet = new Feature(this, "oriental rug", LOCATION.LIVING_ROOM);
		this.features.carpet.takeString = "The rug is extremely heavy and cannot be carried.";
		this.features.carpet.altNames.add("carpet");
		this.features.carpet.altNames.add("oriental carpet");
		this.features.carpet.altNames.add("rug");
		this.features.carpet.boardString = OBJECT_STRINGS.CARPET_SIT_1;
		this.features.carpet.lookUnderString = OBJECT_STRINGS.CARPET_LOOK_UNDER;

		this.features.chasmObj = new Feature(this, "chasm", LOCATION.CHASM);
		this.features.chasmObj.altLocations.add(LOCATION.EAST_OF_CHASM);

		this.features.coalMachineSwitch = new Feature(this, "switch", LOCATION.MACHINE_ROOM);

		this.features.damBolt = new Feature(this, "bolt", LOCATION.DAM);
		this.features.damBolt.takeString = "It is an integral part of the control panel.";

		this.features.damBubble = new Feature(this, "green bubble", LOCATION.DAM);
		this.features.damBubble.altNames.add("bubble");
		this.features.damBubble.takeString = "It is an integral part of the control panel.";
		this.features.damBubble.examineString = "The green bubble is dark and lifeless.";

		this.features.deadGate = new Feature(this, "gate", LOCATION.ENTRANCE_TO_HADES);
		this.features.deadGate.altLocations.add(LOCATION.LAND_OF_THE_DEAD);
		this.features.deadGate.takeString = OBJECT_STRINGS.DEAD_GATE;
		this.features.deadGate.touchString = OBJECT_STRINGS.DEAD_GATE;
		this.features.deadGate.openString = OBJECT_STRINGS.DEAD_GATE;
		this.features.deadGate.closeString = OBJECT_STRINGS.DEAD_GATE;

		this.features.engravings = new Feature(this, "engravings", LOCATION.ENGRAVINGS_CAVE);
		this.features.engravings.altNames.add("markings");
		this.features.engravings.altNames.add("walls");
		this.features.engravings.altNames.add("wall");
		this.features.engravings.readString = GAME_STRINGS.ENGRAVINGS_TEXT;
		this.features.engravings.examineString = GAME_STRINGS.ENGRAVINGS_TEXT;

		this.features.forest = new Feature(this, "forest", LOCATION.FOREST_PATH);
		this.features.forest.altNames.add("woods");
		this.features.forest.altNames.add("trees");
		this.features.forest.altNames.add("tree");
		this.features.forest.altLocations.add(LOCATION.FOREST_WEST);
		this.features.forest.altLocations.add(LOCATION.FOREST_EAST);
		this.features.forest.altLocations.add(LOCATION.FOREST_NORTHEAST);
		this.features.forest.altLocations.add(LOCATION.FOREST_SOUTH);
		this.features.forest.altLocations.add(LOCATION.CLEARING_NORTH);
		this.features.forest.altLocations.add(LOCATION.CLEARING_EAST);
		this.features.forest.altLocations.add(LOCATION.UP_TREE);
		this.features.forest.listenString = "The pines and the hemlocks seem to be murmuring.";

		this.features.gas = new Feature(this, "gas", LOCATION.GAS_ROOM);
		this.features.gas.blowString = "There is too much gas to blow away.";
		this.features.gas.smellString = "It smells like coal gas in here.";

		this.features.grating = new Feature(this, "grating", LOCATION.GRATING_ROOM);
		this.features.grating.altNames.add("grate");
		this.features.grating.examineString = "The grating is closed.";
		this.features.grating.lookInString = "You can see only darkness through the grating.";

		this.features.ground = new Feature(this, "ground", LOCATION.NULL_LOCATION);
		this.features.ground.altNames.add("floor");

		this.features.hotBell = new Feature(this, "red hot brass bell", LOCATION.NULL_LOCATION);
		this.features.hotBell.altNames.add("red hot bell");
		this.features.hotBell.altNames.add("hot brass bell");
		this.features.hotBell.altNames.add("hot bell");
		this.features.hotBell.altNames.add("brass bell");
		this.features.hotBell.altNames.add("bell");
		this.features.hotBell.takeString = "The bell is very hot and cannot be taken.";
		this.features.hotBell.ringString = "The bell is too hot to reach.";
		this.features.hotBell.presenceString = "On the ground is a red hot bell.";

		this.features.house = new Feature(this, "white house", LOCATION.WEST_OF_HOUSE);
		this.features.house.altNames.add("house");
		this.features.house.altLocations.add(LOCATION.NORTH_OF_HOUSE);
		this.features.house.altLocations.add(LOCATION.BEHIND_HOUSE);
		this.features.house.altLocations.add(LOCATION.SOUTH_OF_HOUSE);
		this.features.house.altLocations.add(LOCATION.KITCHEN);
		this.features.house.altLocations.add(LOCATION.LIVING_ROOM);
		this.features.house.altLocations.add(LOCATION.ATTIC);
		this.features.house.examineString = OBJECT_STRINGS.HOUSE_EXAMINE;
		this.features.house.enterString = "I can't see how to get in from here.";

		this.features.houseBoards = new Feature(this, "wooden boards", LOCATION.WEST_OF_HOUSE);
		this.features.houseBoards.altNames.add("boards");
		this.features.houseBoards.altNames.add("board");
		this.features.houseBoards.altNames.add("wood");
		this.features.houseBoards.articleName = "some wooden boards";
		this.features.houseBoards.altLocations.add(LOCATION.SOUTH_OF_HOUSE);
		this.features.houseBoards.altLocations.add(LOCATION.NORTH_OF_HOUSE);
		this.features.houseBoards.takeString = "The boards are securely fastened.";

		this.features.houseExteriorDoor = new Feature(this, "door", LOCATION.WEST_OF_HOUSE);
		this.features.houseExteriorDoor.altNames.add("wooden door");
		this.features.houseExteriorDoor.openString = "The door cannot be opened.";

		this.features.houseExteriorWindow = new Feature(this, "boarded window", LOCATION.NORTH_OF_HOUSE);
		this.features.houseExteriorWindow.altNames.add("windows");
		this.features.houseExteriorWindow.altNames.add("window");
		this.features.houseExteriorWindow.altLocations.add(LOCATION.SOUTH_OF_HOUSE);
		this.features.houseExteriorWindow.breakString = "You can't break the windows open.";
		this.features.houseExteriorWindow.openString = "The windows are boarded and can't be opened.";

		this.features.houseWindow = new Feature(this, "kitchen window", LOCATION.BEHIND_HOUSE);
		this.features.houseWindow.altNames.add("window");
		this.features.houseWindow.altLocations.add(LOCATION.KITCHEN);
		this.features.houseWindow.examineString = OBJECT_STRINGS.WINDOW_EXAMINE_AJAR;
		this.features.houseWindow.lookInString = OBJECT_STRINGS.WINDOW_LOOK_IN;

		this.features.mazeObj = new Feature(this, "maze", LOCATION.MAZE_1);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_2);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_3);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_4);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_5);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_6);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_7);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_8);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_9);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_10);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_11);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_12);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_13);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_14);
		this.features.mazeObj.altLocations.add(LOCATION.MAZE_15);
		this.features.mazeObj.examineString = "The maze consists of many twisty little passages, all alike.";

		this.features.mirror = new Feature(this, "mirror", LOCATION.MIRROR_ROOM_SOUTH);
		this.features.mirror.altLocations.add(LOCATION.MIRROR_ROOM_NORTH);
		this.features.mirror.touchString = "There is a rumble from deep within the earth and the room shakes.";
		this.features.mirror.examineString = "There is an ugly person staring back at you.";
		this.features.mirror.lookInString = "There is an ugly person staring back at you.";
		this.features.mirror.takeString = "The mirror is many times your size. Give up.";
		this.features.mirror.breakString = "You have broken the mirror. I hope you have a seven years' supply of good luck handy.";

		this.features.mountains = new Feature(this, "mountains", LOCATION.FOREST_NORTHEAST);
		this.features.mountains.altNames.add("mountain");
		this.features.mountains.articleName = "a mountain";
		this.features.mountains.climbString = "Don't you believe me? The mountains are impassable!";

		this.features.railing = new Feature(this, "wooden railing", LOCATION.DOME_ROOM);
		this.features.railing.altNames.add("railing");
		this.features.railing.altNames.add("rail");

		this.features.rainbow = new Feature(this, "rainbow", LOCATION.END_OF_RAINBOW);
		this.features.rainbow.altLocations.add(LOCATION.ON_THE_RAINBOW);
		this.features.rainbow.altLocations.add(LOCATION.ARAGAIN_FALLS);
		this.features.rainbow.crossString = "Can you walk on water vapor?";

		this.features.reservoirWater = new Feature(this, "reservoir water", LOCATION.RESERVOIR);
		this.features.reservoirWater.altNames.add("reservoir");
		this.features.reservoirWater.altNames.add("water");
		this.features.reservoirWater.altLocations.add(LOCATION.RESERVOIR_NORTH);
		this.features.reservoirWater.altLocations.add(LOCATION.RESERVOIR_SOUTH);

		this.features.riverWater = new Feature(this, "river water", LOCATION.FRIGID_RIVER_1);
		this.features.riverWater.altNames.add("water");
		this.features.riverWater.altNames.add("river");
		this.features.riverWater.altLocations.add(LOCATION.FRIGID_RIVER_2);
		this.features.riverWater.altLocations.add(LOCATION.FRIGID_RIVER_3);
		this.features.riverWater.altLocations.add(LOCATION.FRIGID_RIVER_4);
		this.features.riverWater.altLocations.add(LOCATION.FRIGID_RIVER_5);
		this.features.riverWater.altLocations.add(LOCATION.DAM_BASE);
		this.features.riverWater.altLocations.add(LOCATION.WHITE_CLIFFS_BEACH_NORTH);
		this.features.riverWater.altLocations.add(LOCATION.WHITE_CLIFFS_BEACH_SOUTH);
		this.features.riverWater.altLocations.add(LOCATION.SANDY_BEACH);
		this.features.riverWater.altLocations.add(LOCATION.SHORE);

		this.features.sand = new Feature(this, "sand", LOCATION.SANDY_CAVE);
		this.features.sand.altNames.add("ground");

		this.features.self = new Feature(this, "you", LOCATION.NULL_LOCATION);
		this.features.self.altNames.add("me");
		this.features.self.altNames.add("self");
		this.features.self.altNames.add("myself");
		this.features.self.takeString = "How romantic!";
		// this.features.self.attackString = "You don't have the you.";
		this.features.self.pushString = "You try to psych yourself up, it";
		this.features.self.eatString = "Auto-cannabalism is not the answer.";
		this.features.self.touchString = "You attempt to comfort yourself, but it";

		this.features.shaftChain = new Feature(this, "chain", LOCATION.SHAFT_ROOM);

		this.features.skeleton = new Feature(this, "skeleton", LOCATION.MAZE_5);

		this.features.streamWater = new Feature(this, "stream water", LOCATION.STREAM);
		this.features.streamWater.altNames.add("stream");
		this.features.streamWater.altNames.add("water");
		this.features.streamWater.altLocations.add(LOCATION.STREAM_VIEW);

		this.features.templeInscription = new Feature(this, "inscription", LOCATION.TEMPLE);
		this.features.templeInscription.altNames.add("prayer");
		this.features.templeInscription.altNames.add("east wall");
		this.features.templeInscription.altNames.add("wall");
		this.features.templeInscription.readString = GAME_STRINGS.TEMPLE_PRAYER;
		this.features.templeInscription.examineString = GAME_STRINGS.TEMPLE_PRAYER;

		this.features.toolChests = new Feature(this, "tool chests", LOCATION.MAINTENANCE_ROOM);
		this.features.toolChests.initialPresenceString = OBJECT_STRINGS.INIT_TOOL_CHESTS;
		this.features.toolChests.takeString = "The chests are so rusty and corroded that they crumble when you touch them.";
		this.features.toolChests.examineString = "The chests are all empty.";

		this.features.trapDoor = new Feature(this, "trap door", LOCATION.NULL_LOCATION);
		this.features.trapDoor.altNames.add("trap");
		this.features.trapDoor.altNames.add("door");

		this.features.water = new Feature(this, "quantity of water", LOCATION.NULL_LOCATION);
		this.features.water.altNames.add("quanitity");
		this.features.water.altNames.add("water");

		this.features.woodenDoor = new Feature(this, "wooden door", LOCATION.LIVING_ROOM);
		this.features.woodenDoor.altNames.add("door");
		this.features.woodenDoor.altNames.add("wooden");
		this.features.woodenDoor.altNames.add("letters");
		this.features.woodenDoor.altNames.add("lettering");
		this.features.woodenDoor.openString = "The door cannot be opened.";
		this.features.woodenDoor.readString = OBJECT_STRINGS.WOODEN_DOOR;
		this.features.woodenDoor.examineString = OBJECT_STRINGS.WOODEN_DOOR;

		// Load features into objects
		for(let key in this.features) {
			this.objects.set(this.features[key].name, this.features[key]);
		}
	}

	loadContainers() {

		this.containers.coalMachine = new Container(this, "machine", LOCATION.MACHINE_ROOM);
		this.containers.coalMachine.inventoryID = LOCATION.INSIDE_COAL_MACHINE;
		this.containers.coalMachine.altNames.add("lid");
		this.containers.coalMachine.capacity = 50;
		this.containers.coalMachine.takeString = "It is far too large to carry.";

		this.containers.mailbox = new Container(this, "small mailbox", LOCATION.WEST_OF_HOUSE);
		this.containers.mailbox.altNames.add("mailbox");
		this.containers.mailbox.altNames.add("box");
		this.containers.mailbox.takeString = "It is securely anchored.";
		this.containers.mailbox.moveString = "You can't move the small mailbox.";
		this.containers.mailbox.inventory.add(this.items.leaflet);
		this.containers.mailbox.inventoryID = LOCATION.INSIDE_MAILBOX;
		this.containers.mailbox.capacity = 10;

		this.containers.shaftBasket = new Container(this, "basket", LOCATION.SHAFT_ROOM);
		this.containers.shaftBasket.altLocations.add(LOCATION.DRAFTY_ROOM);
		this.containers.shaftBasket.containerOpen = true;
		this.containers.shaftBasket.capacity = 50;
		this.containers.shaftBasket.inventoryID = LOCATION.INSIDE_BASKET;

		this.containers.trophyCase = new Container(this, "trophy case", LOCATION.LIVING_ROOM);
		this.containers.trophyCase.altNames.add("case");
		this.containers.trophyCase.inventoryID = LOCATION.INSIDE_TROPHY_CASE;
		this.containers.trophyCase.capacity = 10000;
		this.containers.trophyCase.takeString = "The trophy case is securely fastened to the wall.";

		// Load containers into objects
		for(let key in this.containers) {
			this.objects.set(this.containers[key].name, this.containers[key]);
		}
	}

	loadSurfaces() {

		this.surfaces.altar = new Surface(this, "altar", LOCATION.ALTAR);
		this.surfaces.altar.inventoryID = LOCATION.ON_ALTAR;
		this.surfaces.altar.capacity = 50;

		this.surfaces.atticTable = new Surface(this, "attic table", LOCATION.ATTIC);
		this.surfaces.atticTable.inventoryID = LOCATION.ON_ATTIC_TABLE;
		this.surfaces.atticTable.altNames.add("table");
		this.surfaces.atticTable.capacity = 40;

		this.surfaces.kitchenTable = new Surface(this, "kitchen table", LOCATION.KITCHEN);
		this.surfaces.kitchenTable.altNames.add("table");
		this.surfaces.kitchenTable.capacity = 50;
		this.surfaces.kitchenTable.inventoryID = LOCATION.ON_KITCHEN_TABLE;

		this.surfaces.pedestal = new Surface(this, "pedestal", LOCATION.TORCH_ROOM);
		this.surfaces.pedestal.inventoryID = LOCATION.ON_PEDESTAL;
		this.surfaces.pedestal.capacity = 30;

		// Load surfaces into objects
		for(let key in this.surfaces) {
			this.objects.set(this.surfaces[key].name, this.surfaces[key]);
		}
	}

	loadActors() {

		this.actors.cyclops = new Actor(this, "cyclops", LOCATION.CYCLOPS_ROOM);
		this.actors.cyclops.examineString = OBJECT_STRINGS.CYCLOPS_EXAMINE;
		this.actors.cyclops.helloString = "The cyclops bows his head to you in greeting.";

		this.actors.damFlow = new Actor(this, "flow", LOCATION.DAM);
		this.actors.damFlow.intangible = true;

		this.actors.flood = new Actor(this, "flood", LOCATION.MAINTENANCE_ROOM);
		this.actors.flood.intangible = true;

		this.actors.gustOfWind = new Actor(this, "gust of wind", LOCATION.CAVE_SOUTH);
		this.actors.gustOfWind.intangible = true;

		this.actors.riverCurrent = new Actor(this, "current", LOCATION.FRIGID_RIVER_1);
		this.actors.riverCurrent.altLocations.add(LOCATION.FRIGID_RIVER_2);
		this.actors.riverCurrent.altLocations.add(LOCATION.FRIGID_RIVER_3);
		this.actors.riverCurrent.altLocations.add(LOCATION.FRIGID_RIVER_4);
		this.actors.riverCurrent.altLocations.add(LOCATION.FRIGID_RIVER_5);
		this.actors.riverCurrent.intangible = true;

		this.actors.songbird = new Actor(this, "song bird", this.features.forest.location);
		this.actors.songbird.altLocations.add(LOCATION.FOREST_PATH);
		this.actors.songbird.altLocations.add(LOCATION.FOREST_WEST);
		this.actors.songbird.altLocations.add(LOCATION.FOREST_EAST);
		this.actors.songbird.altLocations.add(LOCATION.FOREST_NORTHEAST);
		this.actors.songbird.altLocations.add(LOCATION.FOREST_SOUTH);
		this.actors.songbird.altLocations.add(LOCATION.CLEARING_NORTH);
		this.actors.songbird.altLocations.add(LOCATION.CLEARING_EAST);
		this.actors.songbird.altNames.add("songbird");
		this.actors.songbird.altNames.add("bird");
		this.actors.songbird.presenceString = "";
		this.actors.songbird.takeString = OBJECT_STRINGS.SONGBIRD_NEARBY;
		this.actors.songbird.examineString = OBJECT_STRINGS.SONGBIRD_NEARBY;

		this.actors.spirits = new Actor(this, "spirits", LOCATION.ENTRANCE_TO_HADES);
		this.actors.spirits.presenceString = OBJECT_STRINGS.SPIRITS;
		this.actors.spirits.talkString = "The spirits jeer loudly and ignore you.";
		this.actors.spirits.attackString = "How can you attack a spirit with material objects?";
		this.actors.spirits.takeString = "You seem unable to interact with these spirits.";

		this.actors.swordGlow = new Actor(this, "glow", LOCATION.NULL_LOCATION);
		this.actors.swordGlow.intangible = true;

		this.actors.thief = new Actor(this, "thief", LOCATION.TREASURE_ROOM);
		this.actors.thief.altNames.add("theif");
		this.actors.thief.altNames.add("bandit");
		this.actors.thief.altNames.add("robber");
		this.actors.thief.altNames.add("man");
		this.actors.thief.inventoryID = LOCATION.THIEF_INVENTORY;
		this.actors.thief.presenceString = OBJECT_STRINGS.THIEF_PRESENT_2;
		this.actors.thief.helloString = "The thief bows his head to you in greeting.";

		this.actors.troll = new Actor(this, "troll", LOCATION.TROLL_ROOM);
		this.actors.troll.presenceString = OBJECT_STRINGS.TROLL_PRESENCE;
		this.actors.troll.takeString = OBJECT_STRINGS.TROLL_TAKE;
		this.actors.troll.talkString = OBJECT_STRINGS.TROLL_TALK_1;
		this.actors.troll.inventoryID = LOCATION.TROLL_INVENTORY;
		this.actors.troll.helloString = "The troll bows his head to you in greeting.";

		this.actors.vampireBat = new Actor(this, "vampire bat", LOCATION.BAT_ROOM);
		this.actors.vampireBat.altNames.add("vampire");
		this.actors.vampireBat.altNames.add("bat");
		this.actors.vampireBat.attackString = OBJECT_STRINGS.BAT_CEILING;
		this.actors.vampireBat.enterString = OBJECT_STRINGS.BAT_CEILING;
		this.actors.vampireBat.helloString = "The bat bows his head to you in greeting.";
		this.actors.vampireBat.kickString = OBJECT_STRINGS.BAT_CEILING;
		this.actors.vampireBat.listenString = "The bat makes pained squeaking noises while holding his nose.";
		this.actors.vampireBat.takeString = OBJECT_STRINGS.BAT_CEILING;

		// Load actors into objects
		for(let key in this.actors) {
			this.objects.set(this.actors[key].name, this.actors[key]);
		}
	}

	loadPassages() {

		// Overworld passages
		this.passages.house_west_north = new Passage(LOCATION.WEST_OF_HOUSE, LOCATION.NORTH_OF_HOUSE);
		this.passages.house_west_south = new Passage(LOCATION.WEST_OF_HOUSE, LOCATION.SOUTH_OF_HOUSE);
		this.passages.house_west_barrow = new Passage(LOCATION.WEST_OF_HOUSE, LOCATION.STONE_BARROW);
		this.passages.house_west_forestW = new Passage(LOCATION.WEST_OF_HOUSE, LOCATION.FOREST_WEST);
		this.passages.house_north_forestpath = new Passage(LOCATION.NORTH_OF_HOUSE, LOCATION.FOREST_PATH);
		this.passages.house_north_behind = new Passage(LOCATION.NORTH_OF_HOUSE, LOCATION.BEHIND_HOUSE);
		this.passages.house_behind_clearingE = new Passage(LOCATION.BEHIND_HOUSE, LOCATION.CLEARING_EAST);
		this.passages.house_behind_south = new Passage(LOCATION.BEHIND_HOUSE, LOCATION.SOUTH_OF_HOUSE);
		this.passages.house_behind_kitchen = new Passage(LOCATION.BEHIND_HOUSE, LOCATION.KITCHEN);
		this.passages.house_south_forestS = new Passage(LOCATION.SOUTH_OF_HOUSE, LOCATION.FOREST_SOUTH);
		this.passages.kitchen_attic = new Passage(LOCATION.KITCHEN, LOCATION.ATTIC);
		this.passages.kitchen_livingroom = new Passage(LOCATION.KITCHEN, LOCATION.LIVING_ROOM);
		this.passages.forestpath_clearingN = new Passage(LOCATION.FOREST_PATH, LOCATION.CLEARING_NORTH);
		this.passages.forestpath_forestE = new Passage(LOCATION.FOREST_PATH, LOCATION.FOREST_EAST);
		this.passages.forestpath_forestW = new Passage(LOCATION.FOREST_PATH, LOCATION.FOREST_WEST);
		this.passages.forestpath_uptree = new Passage(LOCATION.FOREST_PATH, LOCATION.UP_TREE);
		this.passages.clearingN_forestE = new Passage(LOCATION.CLEARING_NORTH, LOCATION.FOREST_EAST);
		this.passages.clearingN_forestW = new Passage(LOCATION.CLEARING_NORTH, LOCATION.FOREST_WEST);
		this.passages.forestE_clearingE = new Passage(LOCATION.FOREST_EAST, LOCATION.CLEARING_EAST);
		this.passages.forestE_forestNE = new Passage(LOCATION.FOREST_EAST, LOCATION.FOREST_NORTHEAST);
		this.passages.clearingE_forestS = new Passage(LOCATION.CLEARING_EAST, LOCATION.FOREST_SOUTH);
		this.passages.clearingE_canyon = new Passage(LOCATION.CLEARING_EAST, LOCATION.CANYON_VIEW);
		this.passages.forestS_canyon = new Passage(LOCATION.FOREST_SOUTH, LOCATION.CANYON_VIEW);
		this.passages.forestS_forestW = new Passage(LOCATION.FOREST_SOUTH, LOCATION.FOREST_WEST);
		this.passages.canyon_ledge = new Passage(LOCATION.CANYON_VIEW, LOCATION.ROCKY_LEDGE);
		this.passages.ledge_bottom = new Passage(LOCATION.ROCKY_LEDGE, LOCATION.CANYON_BOTTOM);
		this.passages.canyon_bottom_rainbow = new Passage(LOCATION.CANYON_BOTTOM, LOCATION.END_OF_RAINBOW);
		this.passages.barrowInside = new Passage(LOCATION.STONE_BARROW, LOCATION.INSIDE_STONE_BARROW);

		// GUE southern passages
		this.passages.cellar_livingroom = new Passage(LOCATION.CELLAR, LOCATION.LIVING_ROOM);
		this.passages.cellar_troll = new Passage(LOCATION.CELLAR, LOCATION.TROLL_ROOM);
		this.passages.cellar_eastchasm = new Passage(LOCATION.CELLAR, LOCATION.EAST_OF_CHASM);
		this.passages.eastchasm_gallery = new Passage(LOCATION.EAST_OF_CHASM, LOCATION.GALLERY);
		this.passages.gallery_studio = new Passage(LOCATION.GALLERY, LOCATION.STUDIO);
		this.passages.studio_kitchen = new Passage(LOCATION.STUDIO, LOCATION.KITCHEN);
		this.passages.troll_eastwest = new Passage(LOCATION.TROLL_ROOM, LOCATION.EAST_WEST_PASSAGE);
		this.passages.eastwest_chasm  = new Passage(LOCATION.EAST_WEST_PASSAGE, LOCATION.CHASM);
		this.passages.eastwest_round = new Passage(LOCATION.EAST_WEST_PASSAGE, LOCATION.ROUND_ROOM);
		this.passages.round_northsouth = new Passage(LOCATION.ROUND_ROOM, LOCATION.NORTH_SOUTH_PASSAGE);
		this.passages.round_narrow = new Passage(LOCATION.ROUND_ROOM, LOCATION.NARROW_PASSAGE);
		this.passages.round_loud = new Passage(LOCATION.ROUND_ROOM, LOCATION.LOUD_ROOM);
		this.passages.round_engravings = new Passage(LOCATION.ROUND_ROOM, LOCATION.ENGRAVINGS_CAVE);
		this.passages.narrow_mirror = new Passage(LOCATION.NARROW_PASSAGE, LOCATION.MIRROR_ROOM_SOUTH);
		this.passages.mirror_winding = new Passage(LOCATION.MIRROR_ROOM_SOUTH, LOCATION.WINDING_PASSAGE);
		this.passages.mirrorsouth_cave = new Passage(LOCATION.MIRROR_ROOM_SOUTH, LOCATION.CAVE_SOUTH);
		this.passages.winding_cave = new Passage(LOCATION.WINDING_PASSAGE, LOCATION.CAVE_SOUTH);
		this.passages.cave_hades = new Passage(LOCATION.CAVE_SOUTH, LOCATION.ENTRANCE_TO_HADES);
		this.passages.hades_land_dead = new Passage(LOCATION.ENTRANCE_TO_HADES, LOCATION.LAND_OF_THE_DEAD);
		this.passages.engravings_dome = new Passage(LOCATION.ENGRAVINGS_CAVE, LOCATION.DOME_ROOM);
		this.passages.dome_torch = new Passage(LOCATION.DOME_ROOM, LOCATION.TORCH_ROOM);
		this.passages.torch_temple = new Passage(LOCATION.TORCH_ROOM, LOCATION.TEMPLE);
		this.passages.temple_egypt = new Passage(LOCATION.TEMPLE, LOCATION.EGYPTIAN_ROOM);
		this.passages.temple_altar = new Passage(LOCATION.TEMPLE, LOCATION.ALTAR);
		this.passages.altar_cave = new Passage(LOCATION.ALTAR, LOCATION.CAVE_SOUTH);
		this.passages.cyclops_strange = new Passage(LOCATION.CYCLOPS_ROOM, LOCATION.STRANGE_PASSAGE);
		this.passages.cyclops_treasure = new Passage(LOCATION.CYCLOPS_ROOM, LOCATION.TREASURE_ROOM);
		this.passages.strange_living_room = new Passage(LOCATION.STRANGE_PASSAGE, LOCATION.LIVING_ROOM);
		this.passages.grating_clearing = new Passage(LOCATION.GRATING_ROOM, LOCATION.CLEARING_NORTH);

		// GUE dam area passages
		this.passages.loud_damp = new Passage(LOCATION.LOUD_ROOM, LOCATION.DAMP_CAVE);
		this.passages.loud_deep_canyon = new Passage(LOCATION.LOUD_ROOM, LOCATION.DEEP_CANYON);
		this.passages.damp_white_north = new Passage(LOCATION.DAMP_CAVE, LOCATION.WHITE_CLIFFS_BEACH_NORTH);
		this.passages.white_cliffs_north_south = new Passage(LOCATION.WHITE_CLIFFS_BEACH_NORTH, LOCATION.WHITE_CLIFFS_BEACH_SOUTH);
		this.passages.white_north_river = new Passage(LOCATION.WHITE_CLIFFS_BEACH_NORTH, LOCATION.FRIGID_RIVER_3);
		this.passages.white_south_river = new Passage(LOCATION.WHITE_CLIFFS_BEACH_SOUTH, LOCATION.FRIGID_RIVER_4);
		this.passages.river_one_two = new Passage(LOCATION.FRIGID_RIVER_1, LOCATION.FRIGID_RIVER_2);
		this.passages.river_two_three = new Passage(LOCATION.FRIGID_RIVER_2, LOCATION.FRIGID_RIVER_3);
		this.passages.river_three_four = new Passage(LOCATION.FRIGID_RIVER_3, LOCATION.FRIGID_RIVER_4);
		this.passages.river_four_five = new Passage(LOCATION.FRIGID_RIVER_4, LOCATION.FRIGID_RIVER_5);
		this.passages.river_sandy_beach = new Passage(LOCATION.FRIGID_RIVER_4, LOCATION.SANDY_BEACH);
		this.passages.river_shore = new Passage(LOCATION.FRIGID_RIVER_5, LOCATION.SHORE);
		this.passages.sandy_beach_cave = new Passage(LOCATION.SANDY_BEACH, LOCATION.SANDY_CAVE);
		this.passages.sandy_beach_shore = new Passage(LOCATION.SANDY_BEACH, LOCATION.SHORE);
		this.passages.shore_falls = new Passage(LOCATION.SHORE, LOCATION.ARAGAIN_FALLS);
		this.passages.falls_rainbow = new Passage(LOCATION.ARAGAIN_FALLS, LOCATION.ON_THE_RAINBOW);
		this.passages.rainbow_end = new Passage(LOCATION.ON_THE_RAINBOW, LOCATION.END_OF_RAINBOW);
		this.passages.dam_base_river = new Passage(LOCATION.DAM_BASE, LOCATION.FRIGID_RIVER_1);
		this.passages.dam_dam_base = new Passage(LOCATION.DAM, LOCATION.DAM_BASE);
		this.passages.dam_dam_lobby = new Passage(LOCATION.DAM, LOCATION.DAM_LOBBY);
		this.passages.dam_lobby_maintenance = new Passage(LOCATION.DAM_LOBBY, LOCATION.MAINTENANCE_ROOM);
		this.passages.dam_deep_canyon = new Passage(LOCATION.DAM, LOCATION.DEEP_CANYON);
		this.passages.dam_res_south = new Passage(LOCATION.DAM, LOCATION.RESERVOIR_SOUTH);
		this.passages.northsouth_deep_canyon = new Passage(LOCATION.NORTH_SOUTH_PASSAGE, LOCATION.DEEP_CANYON);
		this.passages.northsouth_chasm = new Passage(LOCATION.NORTH_SOUTH_PASSAGE, LOCATION.CHASM);
		this.passages.res_south_chasm = new Passage(LOCATION.RESERVOIR_SOUTH, LOCATION.CHASM);
		this.passages.res_south_stream_view = new Passage(LOCATION.RESERVOIR_SOUTH, LOCATION.STREAM_VIEW);
		this.passages.res_south_res = new Passage(LOCATION.RESERVOIR_SOUTH, LOCATION.RESERVOIR);
		this.passages.res_south_deep = new Passage(LOCATION.RESERVOIR_SOUTH, LOCATION.DEEP_CANYON);
		this.passages.stream_view_stream = new Passage(LOCATION.STREAM_VIEW, LOCATION.STREAM);
		this.passages.res_south_res_empty = new Passage(LOCATION.RESERVOIR_SOUTH, LOCATION.RESERVOIR_EMPTY);
		this.passages.res_north_res_empty = new Passage(LOCATION.RESERVOIR_NORTH, LOCATION.RESERVOIR_EMPTY);
		this.passages.stream_res_empty = new Passage(LOCATION.STREAM, LOCATION.RESERVOIR_EMPTY);

		// GUE northern passages
		this.passages.reservoir_stream = new Passage(LOCATION.RESERVOIR, LOCATION.STREAM);
		this.passages.res_north_res = new Passage(LOCATION.RESERVOIR_NORTH, LOCATION.RESERVOIR);
		this.passages.res_north_atlantis = new Passage(LOCATION.RESERVOIR_NORTH, LOCATION.ATLANTIS_ROOM);
		this.passages.atlantis_cave = new Passage(LOCATION.ATLANTIS_ROOM, LOCATION.CAVE_NORTH);
		this.passages.cave_twisting = new Passage(LOCATION.CAVE_NORTH, LOCATION.TWISTING_PASSAGE);
		this.passages.cave_mirrornorth = new Passage(LOCATION.CAVE_NORTH, LOCATION.MIRROR_ROOM_NORTH);
		this.passages.twisting_mirror = new Passage(LOCATION.TWISTING_PASSAGE, LOCATION.MIRROR_ROOM_NORTH);
		this.passages.mirror_cold = new Passage(LOCATION.MIRROR_ROOM_NORTH, LOCATION.COLD_PASSAGE);
		this.passages.cold_slide = new Passage(LOCATION.COLD_PASSAGE, LOCATION.SLIDE_ROOM);
		this.passages.slide_cellar = new Passage(LOCATION.SLIDE_ROOM, LOCATION.CELLAR);
		this.passages.slide_mine_entrance = new Passage(LOCATION.SLIDE_ROOM, LOCATION.MINE_ENTRANCE);
		this.passages.mine_entrance_squeaky = new Passage(LOCATION.MINE_ENTRANCE, LOCATION.SQUEAKY_ROOM);
		this.passages.squeaky_bat = new Passage(LOCATION.SQUEAKY_ROOM, LOCATION.BAT_ROOM);
		this.passages.bat_shaft = new Passage(LOCATION.BAT_ROOM, LOCATION.SHAFT_ROOM);

		// Coal mine passages
		this.passages.shaft_smelly = new Passage(LOCATION.SHAFT_ROOM, LOCATION.SMELLY_ROOM);
		this.passages.smelly_gas = new Passage(LOCATION.SMELLY_ROOM, LOCATION.GAS_ROOM);
		this.passages.gas_coal_1 = new Passage(LOCATION.GAS_ROOM, LOCATION.COAL_MINE_1);
		this.passages.coal_1_self = new Passage(LOCATION.COAL_MINE_1, LOCATION.COAL_MINE_1);
		this.passages.coal_1_coal_2 = new Passage(LOCATION.COAL_MINE_1, LOCATION.COAL_MINE_2);
		this.passages.coal_2_self = new Passage(LOCATION.COAL_MINE_2, LOCATION.COAL_MINE_2);
		this.passages.coal_2_coal_3 = new Passage(LOCATION.COAL_MINE_2, LOCATION.COAL_MINE_3);
		this.passages.coal_3_self = new Passage(LOCATION.COAL_MINE_3, LOCATION.COAL_MINE_3);
		this.passages.coal_3_coal_4 = new Passage(LOCATION.COAL_MINE_3, LOCATION.COAL_MINE_4);
		this.passages.coal_4_self = new Passage(LOCATION.COAL_MINE_4, LOCATION.COAL_MINE_4);
		this.passages.coal_4_ladder_top = new Passage(LOCATION.COAL_MINE_4, LOCATION.LADDER_TOP);
		this.passages.ladder_top_bottom = new Passage(LOCATION.LADDER_TOP, LOCATION.LADDER_BOTTOM);
		this.passages.ladder_bottom_dead_end = new Passage(LOCATION.LADDER_BOTTOM, LOCATION.DEAD_END_COAL_MINE);
		this.passages.ladder_bottom_timber = new Passage(LOCATION.LADDER_BOTTOM, LOCATION.TIMBER_ROOM);
		this.passages.timber_drafty = new Passage(LOCATION.TIMBER_ROOM, LOCATION.DRAFTY_ROOM);
		this.passages.drafty_machine = new Passage(LOCATION.DRAFTY_ROOM, LOCATION.MACHINE_ROOM);

		// Maze passages
		this.passages.troll_maze = new Passage(LOCATION.TROLL_ROOM, LOCATION.MAZE_1);
		this.passages.maze1_maze2 = new Passage(LOCATION.MAZE_1, LOCATION.MAZE_2);
		this.passages.maze1_maze4 = new Passage(LOCATION.MAZE_1, LOCATION.MAZE_4);
		this.passages.maze1_self = new Passage(LOCATION.MAZE_1, LOCATION.MAZE_1);
		this.passages.maze2_maze3 = new Passage(LOCATION.MAZE_2, LOCATION.MAZE_3);
		this.passages.maze2_maze4 = new Passage(LOCATION.MAZE_2, LOCATION.MAZE_4);
		this.passages.maze3_maze4 = new Passage(LOCATION.MAZE_3, LOCATION.MAZE_4);
		this.passages.maze3_maze5 = new Passage(LOCATION.MAZE_3, LOCATION.MAZE_5);
		this.passages.maze4_dead_end = new Passage(LOCATION.MAZE_4, LOCATION.DEAD_END_MAZE_NORTH);
		this.passages.maze5_maze6 = new Passage(LOCATION.MAZE_5, LOCATION.MAZE_6);
		this.passages.maze5_dead_end = new Passage(LOCATION.MAZE_5, LOCATION.DEAD_END_MAZE_CENTER);
		this.passages.maze6_maze7 = new Passage(LOCATION.MAZE_6, LOCATION.MAZE_7);
		this.passages.maze6_maze9 = new Passage(LOCATION.MAZE_6, LOCATION.MAZE_9);
		this.passages.maze6_self = new Passage(LOCATION.MAZE_6, LOCATION.MAZE_6);
		this.passages.maze7_dead_end = new Passage(LOCATION.MAZE_7, LOCATION.DEAD_END_MAZE_NORTH);
		this.passages.maze7_maze8 = new Passage(LOCATION.MAZE_7, LOCATION.MAZE_8);
		this.passages.maze7_maze14 = new Passage(LOCATION.MAZE_7, LOCATION.MAZE_14);
		this.passages.maze7_maze15 = new Passage(LOCATION.MAZE_7, LOCATION.MAZE_15);
		this.passages.maze8_dead_end = new Passage(LOCATION.MAZE_8, LOCATION.DEAD_END_MAZE_SOUTHEAST);
		this.passages.maze8_self = new Passage(LOCATION.MAZE_8, LOCATION.MAZE_8);
		this.passages.maze9_maze10 = new Passage(LOCATION.MAZE_9, LOCATION.MAZE_10);
		this.passages.maze9_maze11 = new Passage(LOCATION.MAZE_9, LOCATION.MAZE_11);
		this.passages.maze9_maze12 = new Passage(LOCATION.MAZE_9, LOCATION.MAZE_12);
		this.passages.maze9_maze13 = new Passage(LOCATION.MAZE_9, LOCATION.MAZE_13);
		this.passages.maze9_self = new Passage(LOCATION.MAZE_9, LOCATION.MAZE_9);
		this.passages.maze10_maze11 = new Passage(LOCATION.MAZE_10, LOCATION.MAZE_11);
		this.passages.maze10_maze13 = new Passage(LOCATION.MAZE_10, LOCATION.MAZE_13);
		this.passages.maze11_maze12 = new Passage(LOCATION.MAZE_11, LOCATION.MAZE_12);
		this.passages.maze11_maze13 = new Passage(LOCATION.MAZE_11, LOCATION.MAZE_13);
		this.passages.maze11_grating = new Passage(LOCATION.MAZE_11, LOCATION.GRATING_ROOM);
		this.passages.maze12_maze13 = new Passage(LOCATION.MAZE_12, LOCATION.MAZE_13);
		this.passages.maze12_maze5 = new Passage(LOCATION.MAZE_12, LOCATION.MAZE_5);
		this.passages.maze12_dead_end = new Passage(LOCATION.MAZE_12, LOCATION.DEAD_END_MAZE_SOUTHEAST);
		this.passages.maze14_maze15 = new Passage(LOCATION.MAZE_14, LOCATION.MAZE_15);
		this.passages.maze14_self = new Passage(LOCATION.MAZE_14, LOCATION.MAZE_14);
		this.passages.maze15_cyclops = new Passage(LOCATION.MAZE_15, LOCATION.CYCLOPS_ROOM);

		// Set our closed passages
		this.passages.grating_clearing.setClosed();
		this.passages.house_behind_kitchen.setClosed();
		this.passages.cellar_livingroom.setClosed();
		this.passages.house_west_barrow.setClosed();
		this.passages.rainbow_end.setClosed();
		this.passages.falls_rainbow.setClosed();
		this.passages.dome_torch.setClosed();
		this.passages.hades_land_dead.setClosed();
		this.passages.cyclops_strange.setClosed();
		this.passages.cyclops_treasure.setClosed();

		this.passages.grating_clearing.closedFail = "The grating is closed!";
		this.passages.rainbow_end.closedFail = "You can't go that way.";
		this.passages.falls_rainbow.closedFail = "You can't go that way.";
		this.passages.house_behind_kitchen.closedFail = MAP_STRINGS.KITCHEN_WINDOW_CLOSED;
		this.passages.strange_living_room.closedFail = "The door is nailed shut.";
		this.passages.dome_torch.closedFail = "You cannot do gown without fracturing many bones.";
		this.passages.hades_land_dead.closedFail = "Some invisible force prevents you from passing through the gate.";
		this.passages.cyclops_strange.closedFail = "The east wall is solid rock.";
		this.passages.cyclops_treasure.closedFail = "The cyclops doesn't look like he'll let you past.";
		this.passages.maze2_maze4.message = "You won't be able to get back up to the tunnel you are going through "
			+ "when it gets to the next room.";
		this.passages.maze9_maze11.message = "You won't be able to get back up to the tunnel you are going through "
			+ "when it gets to the next room.";
		this.passages.cellar_livingroom.message = OBJECT_STRINGS.CYCLOPS_TRAP_DOOR;
		this.passages.studio_kitchen.closedFail = "Going up empty-handed is a bad idea.";
		this.passages.house_west_barrow.closedFail = "You can't go that way.";

		// Narrow passages
		this.passages.studio_kitchen.weightLimit = 35;
		this.passages.studio_kitchen.weightFail = "You can't get up there with what you're carrying.";
		this.passages.altar_cave.weightLimit = 75;
		this.passages.altar_cave.weightFail = "You can't get down there with what you're carrying.";
		this.passages.timber_drafty.weightLimit = 0;
		this.passages.timber_drafty.weightFail = "You cannot fit through this passage with that load.";
	}

	loadRooms() {

		this.rooms.westOfHouse = new Room(this, "West of House", MAP_STRINGS.DESC_WEST_OF_HOUSE, LOCATION.WEST_OF_HOUSE);
		this.rooms.westOfHouse.addExit(ACTION_STRINGS.NORTH, this.passages.house_west_north);
		this.rooms.westOfHouse.addExit(ACTION_STRINGS.SOUTH, this.passages.house_west_south);
		this.rooms.westOfHouse.addExit(ACTION_STRINGS.SOUTHEAST, this.passages.house_west_south);
		this.rooms.westOfHouse.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.house_west_barrow);
		this.rooms.westOfHouse.addExit(ACTION_STRINGS.WEST, this.passages.house_west_forestW);
		this.rooms.westOfHouse.addFailMessage(ACTION_STRINGS.EAST, "The door is boarded and you can't remove the boards.");
		this.rooms.westOfHouse.addFailMessage(ACTION_STRINGS.IN, "The door is boarded and you can't remove the boards.");

		this.rooms.northOfHouse = new Room(this, "North of House", MAP_STRINGS.DESC_NORTH_OF_HOUSE, LOCATION.NORTH_OF_HOUSE);
		this.rooms.northOfHouse.addExit(ACTION_STRINGS.NORTH, this.passages.house_north_forestpath);
		this.rooms.northOfHouse.addExit(ACTION_STRINGS.EAST, this.passages.house_north_behind);
		this.rooms.northOfHouse.addExit(ACTION_STRINGS.SOUTHEAST, this.passages.house_north_behind);
		this.rooms.northOfHouse.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.house_west_north);
		this.rooms.northOfHouse.addExit(ACTION_STRINGS.WEST, this.passages.house_west_north);
		this.rooms.northOfHouse.addFailMessage(ACTION_STRINGS.SOUTH, "The windows are all boarded.");

		this.rooms.behindHouse = new Room(this, "Behind House", MAP_STRINGS.DESC_BEHIND_HOUSE, LOCATION.BEHIND_HOUSE);
		this.rooms.behindHouse.addExit(ACTION_STRINGS.NORTH, this.passages.house_north_behind);
		this.rooms.behindHouse.addExit(ACTION_STRINGS.NORTHWEST, this.passages.house_north_behind);
		this.rooms.behindHouse.addExit(ACTION_STRINGS.EAST, this.passages.house_behind_clearingE);
		this.rooms.behindHouse.addExit(ACTION_STRINGS.SOUTH, this.passages.house_behind_south);
		this.rooms.behindHouse.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.house_behind_south);
		this.rooms.behindHouse.addExit(ACTION_STRINGS.WEST, this.passages.house_behind_kitchen);
		this.rooms.behindHouse.addExit(ACTION_STRINGS.IN, this.passages.house_behind_kitchen);

		this.rooms.southOfHouse = new Room(this, "South of House", MAP_STRINGS.DESC_SOUTH_OF_HOUSE, LOCATION.SOUTH_OF_HOUSE);
		this.rooms.southOfHouse.addExit(ACTION_STRINGS.EAST, this.passages.house_behind_south);
		this.rooms.southOfHouse.addExit(ACTION_STRINGS.NORTHEAST, this.passages.house_behind_south);
		this.rooms.southOfHouse.addExit(ACTION_STRINGS.WEST, this.passages.house_west_south);
		this.rooms.southOfHouse.addExit(ACTION_STRINGS.NORTHWEST, this.passages.house_west_south);
		this.rooms.southOfHouse.addExit(ACTION_STRINGS.SOUTH, this.passages.house_south_forestS);
		this.rooms.southOfHouse.addFailMessage(ACTION_STRINGS.NORTH, "The windows are all boarded.");

		this.rooms.kitchen = new Room(this, "Kitchen", MAP_STRINGS.DESC_KITCHEN_WINDOW_CLOSED, LOCATION.KITCHEN);
		this.rooms.kitchen.addExit(ACTION_STRINGS.EAST, this.passages.house_behind_kitchen);
		this.rooms.kitchen.addExit(ACTION_STRINGS.OUT, this.passages.house_behind_kitchen);
		this.rooms.kitchen.addExit(ACTION_STRINGS.WEST, this.passages.kitchen_livingroom);
		this.rooms.kitchen.addExit(ACTION_STRINGS.UP, this.passages.kitchen_attic);
		this.rooms.kitchen.addFailMessage(ACTION_STRINGS.DOWN, "Only Santa Claus climbs down chimneys.");
		this.rooms.kitchen.discoverValue = CONSTANTS.KITCHEN_VALUE;

		this.rooms.attic = new Room(this, "Attic", MAP_STRINGS.DESC_ATTIC, LOCATION.ATTIC);
		this.rooms.attic.addExit(ACTION_STRINGS.DOWN, this.passages.kitchen_attic);

		this.rooms.livingRoom = new Room(this, "Living Room", MAP_STRINGS.DESC_LIVING_ROOM, LOCATION.LIVING_ROOM);
		this.rooms.livingRoom.addExit(ACTION_STRINGS.EAST, this.passages.kitchen_livingroom);
		this.rooms.livingRoom.addExit(ACTION_STRINGS.DOWN, this.passages.cellar_livingroom);
		this.rooms.livingRoom.addExit(ACTION_STRINGS.WEST, this.passages.strange_living_room);

		this.rooms.forestPath = new Room(this, "Forest Path", MAP_STRINGS.DESC_FOREST_PATH, LOCATION.FOREST_PATH);
		this.rooms.forestPath.addExit(ACTION_STRINGS.NORTH, this.passages.forestpath_clearingN);
		this.rooms.forestPath.addExit(ACTION_STRINGS.EAST, this.passages.forestpath_forestE);
		this.rooms.forestPath.addExit(ACTION_STRINGS.SOUTH, this.passages.house_north_forestpath);
		this.rooms.forestPath.addExit(ACTION_STRINGS.WEST, this.passages.forestpath_forestW);
		this.rooms.forestPath.addExit(ACTION_STRINGS.UP, this.passages.forestpath_uptree);

		this.rooms.upTree = new Room(this, "Up a Tree", MAP_STRINGS.DESC_UP_TREE, LOCATION.UP_TREE);
		this.rooms.upTree.addExit(ACTION_STRINGS.DOWN, this.passages.forestpath_uptree);
		this.rooms.upTree.addFailMessage(ACTION_STRINGS.UP, "You cannot climb any higher.");
		this.rooms.upTree.jumpString = "In a feat of unaccustomed daring, you manage to land on your feet "
			+ "without killing yourself.";

		this.rooms.forestWest = new Room(this, "Forest", MAP_STRINGS.DESC_FOREST_WEST, LOCATION.FOREST_WEST);
		this.rooms.forestWest.addExit(ACTION_STRINGS.NORTH, this.passages.clearingN_forestW);
		this.rooms.forestWest.addExit(ACTION_STRINGS.EAST, this.passages.forestpath_forestW);
		this.rooms.forestWest.addExit(ACTION_STRINGS.SOUTH, this.passages.forestS_forestW);
		this.rooms.forestWest.addFailMessage(ACTION_STRINGS.WEST, "You would need a machete to go further west.");
		this.rooms.forestWest.addFailMessage(ACTION_STRINGS.UP, "There is no tree here suitable for climbing.");

		this.rooms.forestEast = new Room(this, "Forest", MAP_STRINGS.DESC_FOREST_EAST, LOCATION.FOREST_EAST);
		this.rooms.forestEast.addExit(ACTION_STRINGS.EAST, this.passages.forestE_forestNE);
		this.rooms.forestEast.addExit(ACTION_STRINGS.SOUTH, this.passages.forestE_clearingE);
		this.rooms.forestEast.addExit(ACTION_STRINGS.WEST, this.passages.forestpath_forestE);
		this.rooms.forestEast.addFailMessage(ACTION_STRINGS.NORTH, "The forest becomes impenetrable to the north.");
		this.rooms.forestEast.addFailMessage(ACTION_STRINGS.UP, "There is no tree here suitable for climbing.");

		this.rooms.forestNortheast = new Room(this, "Forest", MAP_STRINGS.DESC_FOREST_NORTHEAST, LOCATION.FOREST_NORTHEAST);
		this.rooms.forestNortheast.addExit(ACTION_STRINGS.NORTH, this.passages.forestE_forestNE);
		this.rooms.forestNortheast.addExit(ACTION_STRINGS.SOUTH, this.passages.forestE_forestNE);
		this.rooms.forestNortheast.addExit(ACTION_STRINGS.WEST, this.passages.forestE_forestNE);
		this.rooms.forestNortheast.addFailMessage(ACTION_STRINGS.EAST, MAP_STRINGS.FOREST_NE_FAIL_1);
		this.rooms.forestNortheast.addFailMessage(ACTION_STRINGS.UP, MAP_STRINGS.FOREST_NE_FAIL_1);

		this.rooms.forestSouth = new Room(this, "Forest", MAP_STRINGS.DESC_FOREST_SOUTH, LOCATION.FOREST_SOUTH);
		this.rooms.forestSouth.addExit(ACTION_STRINGS.NORTH, this.passages.clearingE_forestS);
		this.rooms.forestSouth.addExit(ACTION_STRINGS.WEST, this.passages.forestS_forestW);
		this.rooms.forestSouth.addExit(ACTION_STRINGS.NORTHWEST, this.passages.house_south_forestS);
		this.rooms.forestSouth.addFailMessage(ACTION_STRINGS.UP, "There is no tree here suitable for climbing.");
		this.rooms.forestSouth.addFailMessage(ACTION_STRINGS.EAST, "The rank undergrowth prevents eastward movement.");
		this.rooms.forestSouth.addFailMessage(ACTION_STRINGS.SOUTH, "Storm-tossed trees block your way.");

		this.rooms.clearingNorth = new Room(this, "Clearing", MAP_STRINGS.DESC_CLEARING_NORTH, LOCATION.CLEARING_NORTH);
		this.rooms.clearingNorth.addExit(ACTION_STRINGS.EAST, this.passages.clearingN_forestE);
		this.rooms.clearingNorth.addExit(ACTION_STRINGS.SOUTH, this.passages.forestpath_clearingN);
		this.rooms.clearingNorth.addExit(ACTION_STRINGS.WEST, this.passages.clearingN_forestW);
		this.rooms.clearingNorth.addFailMessage(ACTION_STRINGS.UP, "There is no tree here suitable for climbing.");
		this.rooms.clearingNorth.addFailMessage(ACTION_STRINGS.NORTH, "The forest becomes impenetrable to the north.");

		this.rooms.clearingEast = new Room(this, "Clearing", MAP_STRINGS.DESC_CLEARING_EAST, LOCATION.CLEARING_EAST);
		this.rooms.clearingEast.addExit(ACTION_STRINGS.NORTH, this.passages.forestE_clearingE);
		this.rooms.clearingEast.addExit(ACTION_STRINGS.EAST, this.passages.clearingE_canyon);
		this.rooms.clearingEast.addExit(ACTION_STRINGS.SOUTH, this.passages.clearingE_forestS);
		this.rooms.clearingEast.addExit(ACTION_STRINGS.WEST, this.passages.house_behind_clearingE);
		this.rooms.clearingEast.addFailMessage(ACTION_STRINGS.UP, "There is no tree here suitable for climbing.");

		this.rooms.canyonView = new Room(this, "Canyon View", MAP_STRINGS.DESC_CANYON_VIEW, LOCATION.CANYON_VIEW);
		this.rooms.canyonView.addExit(ACTION_STRINGS.NORTHWEST, this.passages.clearingE_canyon);
		this.rooms.canyonView.addExit(ACTION_STRINGS.WEST, this.passages.forestS_canyon);
		this.rooms.canyonView.addExit(ACTION_STRINGS.DOWN, this.passages.canyon_ledge);
		this.rooms.canyonView.addExit(ACTION_STRINGS.EAST, this.passages.canyon_ledge);
		this.rooms.canyonView.addFailMessage(ACTION_STRINGS.SOUTH, "Storm-tossed trees block your way.");
		this.rooms.canyonView.jumpString = "Nice view, lousy place to jump.\n";

		this.rooms.rockyLedge = new Room(this, "Rocky Ledge", MAP_STRINGS.DESC_ROCKY_LEDGE, LOCATION.ROCKY_LEDGE);
		this.rooms.rockyLedge.addExit(ACTION_STRINGS.UP, this.passages.canyon_ledge);
		this.rooms.rockyLedge.addExit(ACTION_STRINGS.DOWN, this.passages.ledge_bottom);

		this.rooms.canyonBottom = new Room(this, "Canyon Bottom", MAP_STRINGS.DESC_CANYON_BOTTOM, LOCATION.CANYON_BOTTOM);
		this.rooms.canyonBottom.addExit(ACTION_STRINGS.UP, this.passages.ledge_bottom);
		this.rooms.canyonBottom.addExit(ACTION_STRINGS.NORTH, this.passages.canyon_bottom_rainbow);

		this.rooms.endOfRainbow = new Room(this, "End of Rainbow", MAP_STRINGS.DESC_END_OF_RAINBOW, LOCATION.END_OF_RAINBOW);
		this.rooms.endOfRainbow.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.canyon_bottom_rainbow);
		this.rooms.endOfRainbow.addExit(ACTION_STRINGS.EAST, this.passages.rainbow_end);

		this.rooms.stoneBarrow = new Room(this, "Stone Barrow", MAP_STRINGS.DESC_STONE_BARROW, LOCATION.STONE_BARROW);
		this.rooms.stoneBarrow.addExit(ACTION_STRINGS.NORTHEAST, this.passages.house_west_barrow);
		this.rooms.stoneBarrow.addExit(ACTION_STRINGS.WEST, this.passages.barrowInside);

		this.rooms.insideStoneBarrow = new Room(this, "Inside the Barrow", MAP_STRINGS.DESC_INSIDE_STONE_BARROW, LOCATION.INSIDE_STONE_BARROW);
		this.rooms.insideStoneBarrow.addExit(ACTION_STRINGS.EAST, this.passages.barrowInside);

		this.rooms.cellar = new Room(this, "Cellar", MAP_STRINGS.DESC_CELLAR, LOCATION.CELLAR);
		this.rooms.cellar.addExit(ACTION_STRINGS.NORTH, this.passages.cellar_troll);
		this.rooms.cellar.addExit(ACTION_STRINGS.SOUTH, this.passages.cellar_eastchasm);
		this.rooms.cellar.addExit(ACTION_STRINGS.UP, this.passages.cellar_livingroom);
		this.rooms.cellar.addFailMessage(ACTION_STRINGS.WEST, "You try to ascend the ramp, but it is impossible, and you slide back down.");
		this.rooms.cellar.discoverValue = CONSTANTS.CELLAR_VALUE;

		this.rooms.eastOfChasm = new Room(this, "East of Chasm", MAP_STRINGS.DESC_EAST_OF_CHASM, LOCATION.EAST_OF_CHASM);
		this.rooms.eastOfChasm.addExit(ACTION_STRINGS.NORTH, this.passages.cellar_eastchasm);
		this.rooms.eastOfChasm.addExit(ACTION_STRINGS.DOWN, this.passages.cellar_eastchasm);
		this.rooms.eastOfChasm.addExit(ACTION_STRINGS.EAST, this.passages.eastchasm_gallery);
		this.rooms.eastOfChasm.addFailMessage(ACTION_STRINGS.DOWN, "The chasm probably leads straight to the infernal regions.");
		this.rooms.eastOfChasm.jumpString = "This was not a very safe place to try jumping.\nIn the movies, your life "
			+ "would be passing before your eyes.";

		this.rooms.gallery = new Room(this, "Gallery", MAP_STRINGS.DESC_GALLERY, LOCATION.GALLERY);
		this.rooms.gallery.addExit(ACTION_STRINGS.WEST, this.passages.eastchasm_gallery);
		this.rooms.gallery.addExit(ACTION_STRINGS.NORTH, this.passages.gallery_studio);

		this.rooms.studio = new Room(this, "Studio", MAP_STRINGS.DESC_STUDIO, LOCATION.STUDIO);
		this.rooms.studio.addExit(ACTION_STRINGS.SOUTH, this.passages.gallery_studio);
		this.rooms.studio.addExit(ACTION_STRINGS.UP, this.passages.studio_kitchen);

		this.rooms.trollRoom = new Room(this, "Troll Room", MAP_STRINGS.DESC_TROLL_ROOM, LOCATION.TROLL_ROOM);
		this.rooms.trollRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.cellar_troll);
		this.rooms.trollRoom.addExit(ACTION_STRINGS.WEST, this.passages.troll_maze);
		this.rooms.trollRoom.addExit(ACTION_STRINGS.EAST, this.passages.troll_eastwest);

		this.rooms.eastWestPassage = new Room(this, "East-West Passage", MAP_STRINGS.DESC_EAST_WEST_PASSAGE , LOCATION.EAST_WEST_PASSAGE);
		this.rooms.eastWestPassage.addExit(ACTION_STRINGS.WEST, this.passages.troll_eastwest);
		this.rooms.eastWestPassage.addExit(ACTION_STRINGS.NORTH, this.passages.eastwest_chasm);
		this.rooms.eastWestPassage.addExit(ACTION_STRINGS.DOWN, this.passages.eastwest_chasm);
		this.rooms.eastWestPassage.addExit(ACTION_STRINGS.EAST, this.passages.eastwest_round);
		this.rooms.eastWestPassage.discoverValue = CONSTANTS.EAST_WEST_VALUE;

		this.rooms.roundRoom = new Room(this, "Round Room", MAP_STRINGS.DESC_ROUND_ROOM, LOCATION.ROUND_ROOM);
		this.rooms.roundRoom.addExit(ACTION_STRINGS.WEST, this.passages.eastwest_round);
		this.rooms.roundRoom.addExit(ACTION_STRINGS.NORTH, this.passages.round_northsouth);
		this.rooms.roundRoom.addExit(ACTION_STRINGS.EAST, this.passages.round_loud);
		this.rooms.roundRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.round_narrow);
		this.rooms.roundRoom.addExit(ACTION_STRINGS.SOUTHEAST, this.passages.round_engravings);

		this.rooms.narrowPassage = new Room(this, "Narrow Passage", MAP_STRINGS.DESC_NARROW_PASSAGE, LOCATION.NARROW_PASSAGE);
		this.rooms.narrowPassage.addExit(ACTION_STRINGS.NORTH, this.passages.round_narrow);
		this.rooms.narrowPassage.addExit(ACTION_STRINGS.SOUTH, this.passages.narrow_mirror);

		this.rooms.mirrorRoomSouth = new Room(this, "Mirror Room", MAP_STRINGS.DESC_MIRROR_ROOM_SOUTH, LOCATION.MIRROR_ROOM_SOUTH);
		this.rooms.mirrorRoomSouth.addExit(ACTION_STRINGS.NORTH, this.passages.narrow_mirror);
		this.rooms.mirrorRoomSouth.addExit(ACTION_STRINGS.WEST, this.passages.mirror_winding);
		this.rooms.mirrorRoomSouth.addExit(ACTION_STRINGS.EAST, this.passages.mirrorsouth_cave);

		this.rooms.windingPassage = new Room(this, "Winding Passage", MAP_STRINGS.DESC_WINDING_PASSAGE, LOCATION.WINDING_PASSAGE);
		this.rooms.windingPassage.addExit(ACTION_STRINGS.NORTH, this.passages.mirror_winding);
		this.rooms.windingPassage.addExit(ACTION_STRINGS.EAST, this.passages.winding_cave);

		this.rooms.caveSouth = new Room(this, "Cave", MAP_STRINGS.DESC_CAVE_SOUTH, LOCATION.CAVE_SOUTH);
		this.rooms.caveSouth.addExit(ACTION_STRINGS.NORTH, this.passages.mirrorsouth_cave);
		this.rooms.caveSouth.addExit(ACTION_STRINGS.WEST, this.passages.winding_cave);
		this.rooms.caveSouth.addExit(ACTION_STRINGS.DOWN, this.passages.cave_hades);
		this.rooms.caveSouth.addExit(ACTION_STRINGS.DOWN, this.passages.cave_hades);

		this.rooms.entranceToHades = new Room(this, "Entrance to Hades", MAP_STRINGS.DESC_ENTRANCE_TO_HADES, LOCATION.ENTRANCE_TO_HADES);
		this.rooms.entranceToHades.addExit(ACTION_STRINGS.UP, this.passages.cave_hades);
		this.rooms.entranceToHades.addExit(ACTION_STRINGS.SOUTH, this.passages.hades_land_dead);

		this.rooms.landOfTheDead = new Room(this, "Land of the Dead", MAP_STRINGS.DESC_LAND_OF_THE_DEAD, LOCATION.LAND_OF_THE_DEAD);
		this.rooms.landOfTheDead.addExit(ACTION_STRINGS.NORTH, this.passages.hades_land_dead);

		this.rooms.engravingsCave = new Room(this, "Engravings Cave", MAP_STRINGS.DESC_ENGRAVINGS_CAVE, LOCATION.ENGRAVINGS_CAVE);
		this.rooms.engravingsCave.addExit(ACTION_STRINGS.NORTHWEST, this.passages.round_engravings);
		this.rooms.engravingsCave.addExit(ACTION_STRINGS.EAST, this.passages.engravings_dome);

		this.rooms.domeRoom = new Room(this, "Dome Room", MAP_STRINGS.DESC_DOME_ROOM, LOCATION.DOME_ROOM);
		this.rooms.domeRoom.addExit(ACTION_STRINGS.WEST, this.passages.engravings_dome);
		this.rooms.domeRoom.addExit(ACTION_STRINGS.DOWN, this.passages.dome_torch);

		this.rooms.torchRoom = new Room(this, "Torch Room", MAP_STRINGS.DESC_TORCH_ROOM, LOCATION.TORCH_ROOM);
		this.rooms.torchRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.torch_temple);
		this.rooms.torchRoom.addExit(ACTION_STRINGS.DOWN, this.passages.torch_temple);

		this.rooms.temple = new Room(this, "Temple", MAP_STRINGS.DESC_TEMPLE, LOCATION.TEMPLE);
		this.rooms.temple.addExit(ACTION_STRINGS.NORTH, this.passages.torch_temple);
		this.rooms.temple.addExit(ACTION_STRINGS.UP, this.passages.torch_temple);
		this.rooms.temple.addExit(ACTION_STRINGS.EAST, this.passages.temple_egypt);
		this.rooms.temple.addExit(ACTION_STRINGS.DOWN, this.passages.temple_egypt);
		this.rooms.temple.addExit(ACTION_STRINGS.SOUTH, this.passages.temple_altar);

		this.rooms.egyptianRoom = new Room(this, "Egyptian Room", MAP_STRINGS.DESC_EGYPTIAN_ROOM, LOCATION.EGYPTIAN_ROOM);
		this.rooms.egyptianRoom.addExit(ACTION_STRINGS.WEST, this.passages.temple_egypt);

		this.rooms.altarRoom = new Room(this, "Altar", MAP_STRINGS.DESC_ALTAR, LOCATION.ALTAR);
		this.rooms.altarRoom.addExit(ACTION_STRINGS.NORTH, this.passages.temple_altar);
		this.rooms.altarRoom.addExit(ACTION_STRINGS.DOWN, this.passages.altar_cave);

		this.rooms.loudRoom = new Room(this, "Loud Room", MAP_STRINGS.DESC_LOUD_ROOM, LOCATION.LOUD_ROOM);
		this.rooms.loudRoom.addExit(ACTION_STRINGS.WEST, this.passages.round_loud);
		this.rooms.loudRoom.addExit(ACTION_STRINGS.UP, this.passages.loud_deep_canyon);
		this.rooms.loudRoom.addExit(ACTION_STRINGS.EAST, this.passages.loud_damp);

		this.rooms.dampCave = new Room(this, "Damp Cave", MAP_STRINGS.DESC_DAMP_CAVE, LOCATION.DAMP_CAVE);
		this.rooms.dampCave.addExit(ACTION_STRINGS.WEST, this.passages.loud_damp);
		this.rooms.dampCave.addExit(ACTION_STRINGS.EAST, this.passages.damp_white_north);
		this.rooms.dampCave.addFailMessage(ACTION_STRINGS.SOUTH, "It is too narrow for most insects.");

		this.rooms.whiteCliffsBeachNorth = new Room(this, "White Cliffs Beach North", MAP_STRINGS.DESC_WHITE_CLIFFS_BEACH_NORTH, LOCATION.WHITE_CLIFFS_BEACH_NORTH);
		this.rooms.whiteCliffsBeachNorth.addExit(ACTION_STRINGS.WEST, this.passages.damp_white_north);
		this.rooms.whiteCliffsBeachNorth.addExit(ACTION_STRINGS.SOUTH, this.passages.white_cliffs_north_south);
		this.rooms.whiteCliffsBeachNorth.addExit(ACTION_STRINGS.LAUNCH, this.passages.white_north_river);

		this.rooms.whiteCliffsBeachSouth = new Room(this, "White Cliffs Beach South", MAP_STRINGS.DESC_WHITE_CLIFFS_BEACH_SOUTH, LOCATION.WHITE_CLIFFS_BEACH_SOUTH);
		this.rooms.whiteCliffsBeachSouth.addExit(ACTION_STRINGS.NORTH, this.passages.white_cliffs_north_south);
		this.rooms.whiteCliffsBeachSouth.addExit(ACTION_STRINGS.LAUNCH, this.passages.white_south_river);

		this.rooms.frigidRiver1 = new Room(this, "Frigid River", MAP_STRINGS.DESC_FRIGID_RIVER_1, LOCATION.FRIGID_RIVER_1);
		this.rooms.frigidRiver1.addExit(ACTION_STRINGS.WEST, this.passages.dam_base_river);
		this.rooms.frigidRiver1.addExit(ACTION_STRINGS.LAND, this.passages.dam_base_river);

		this.rooms.frigidRiver2 = new Room(this, "Frigid River", MAP_STRINGS.DESC_FRIGID_RIVER_2, LOCATION.FRIGID_RIVER_2);

		this.rooms.frigidRiver3 = new Room(this, "Frigid River", MAP_STRINGS.DESC_FRIGID_RIVER_3, LOCATION.FRIGID_RIVER_3);
		this.rooms.frigidRiver3.addExit(ACTION_STRINGS.WEST, this.passages.white_north_river);
		this.rooms.frigidRiver3.addExit(ACTION_STRINGS.LAND, this.passages.white_north_river);

		this.rooms.frigidRiver4 = new Room(this, "Frigid River", MAP_STRINGS.DESC_FRIGID_RIVER_4, LOCATION.FRIGID_RIVER_4);
		this.rooms.frigidRiver4.addExit(ACTION_STRINGS.WEST, this.passages.white_south_river);
		this.rooms.frigidRiver4.addExit(ACTION_STRINGS.EAST, this.passages.river_sandy_beach);
		this.rooms.frigidRiver4.addExit(ACTION_STRINGS.LAND, this.passages.river_sandy_beach);

		this.rooms.frigidRiver5 = new Room(this, "Frigid River", MAP_STRINGS.DESC_FRIGID_RIVER_5, LOCATION.FRIGID_RIVER_5);
		this.rooms.frigidRiver5.addExit(ACTION_STRINGS.EAST, this.passages.river_shore);
		this.rooms.frigidRiver5.addExit(ACTION_STRINGS.LAND, this.passages.river_shore);

		this.rooms.sandyCave = new Room(this, "Sandy Cave", MAP_STRINGS.DESC_SANDY_CAVE, LOCATION.SANDY_CAVE);
		this.rooms.sandyCave.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.sandy_beach_cave);

		this.rooms.sandyBeach = new Room(this, "Sandy Beach", MAP_STRINGS.DESC_SANDY_BEACH, LOCATION.SANDY_BEACH);
		this.rooms.sandyBeach.addExit(ACTION_STRINGS.NORTHEAST, this.passages.sandy_beach_cave);
		this.rooms.sandyBeach.addExit(ACTION_STRINGS.SOUTH, this.passages.sandy_beach_shore);
		this.rooms.sandyBeach.addExit(ACTION_STRINGS.LAUNCH, this.passages.river_sandy_beach);

		this.rooms.shore = new Room(this, "Shore", MAP_STRINGS.DESC_SHORE, LOCATION.SHORE);
		this.rooms.shore.addExit(ACTION_STRINGS.NORTH, this.passages.sandy_beach_shore);
		this.rooms.shore.addExit(ACTION_STRINGS.LAUNCH, this.passages.river_shore);
		this.rooms.shore.addExit(ACTION_STRINGS.SOUTH, this.passages.shore_falls);

		this.rooms.aragainFalls = new Room(this, "Aragain Falls", MAP_STRINGS.DESC_ARAGAIN_FALLS, LOCATION.ARAGAIN_FALLS);
		this.rooms.aragainFalls.addExit(ACTION_STRINGS.NORTH, this.passages.shore_falls);
		this.rooms.aragainFalls.addExit(ACTION_STRINGS.WEST, this.passages.falls_rainbow);

		this.rooms.onTheRainbow = new Room(this, "On the Rainbow", MAP_STRINGS.DESC_ON_THE_RAINBOW, LOCATION.ON_THE_RAINBOW);
		this.rooms.onTheRainbow.addExit(ACTION_STRINGS.EAST, this.passages.falls_rainbow);
		this.rooms.onTheRainbow.addExit(ACTION_STRINGS.WEST, this.passages.rainbow_end);

		this.rooms.dam = new Room(this, "Dam", MAP_STRINGS.DESC_DAM, LOCATION.DAM);
		this.rooms.dam.addExit(ACTION_STRINGS.WEST, this.passages.dam_res_south);
		this.rooms.dam.addExit(ACTION_STRINGS.NORTH, this.passages.dam_dam_lobby);
		this.rooms.dam.addExit(ACTION_STRINGS.SOUTH, this.passages.dam_deep_canyon);
		this.rooms.dam.addExit(ACTION_STRINGS.EAST, this.passages.dam_dam_base);
		this.rooms.dam.addExit(ACTION_STRINGS.DOWN, this.passages.dam_dam_base);

		this.rooms.damBase = new Room(this, "Dam Base", MAP_STRINGS.DESC_DAM_BASE, LOCATION.DAM_BASE);
		this.rooms.damBase.addExit(ACTION_STRINGS.NORTH, this.passages.dam_dam_base);
		this.rooms.damBase.addExit(ACTION_STRINGS.LAUNCH, this.passages.dam_base_river);

		this.rooms.damLobby = new Room(this, "Dam Lobby", MAP_STRINGS.DESC_DAM_LOBBY, LOCATION.DAM_LOBBY);
		this.rooms.damLobby.addExit(ACTION_STRINGS.NORTH, this.passages.dam_lobby_maintenance);
		this.rooms.damLobby.addExit(ACTION_STRINGS.EAST, this.passages.dam_lobby_maintenance);
		this.rooms.damLobby.addExit(ACTION_STRINGS.SOUTH, this.passages.dam_dam_lobby);

		this.rooms.maintenanceRoom = new Room(this, "Maintenance Room", MAP_STRINGS.DESC_MAINTENANCE_ROOM, LOCATION.MAINTENANCE_ROOM);
		this.rooms.maintenanceRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.dam_lobby_maintenance);
		this.rooms.maintenanceRoom.addExit(ACTION_STRINGS.WEST, this.passages.dam_lobby_maintenance);

		this.rooms.northSouthPassage = new Room(this, "North-South Passage", MAP_STRINGS.DESC_NORTH_SOUTH_PASSAGE, LOCATION.NORTH_SOUTH_PASSAGE);
		this.rooms.northSouthPassage.addExit(ACTION_STRINGS.NORTH, this.passages.northsouth_chasm);
		this.rooms.northSouthPassage.addExit(ACTION_STRINGS.NORTHEAST, this.passages.northsouth_deep_canyon);
		this.rooms.northSouthPassage.addExit(ACTION_STRINGS.SOUTH, this.passages.round_northsouth);

		this.rooms.deepCanyon = new Room(this, "Deep Canyon", MAP_STRINGS.DESC_DEEP_CANYON_WATER, LOCATION.DEEP_CANYON);
		this.rooms.deepCanyon.addExit(ACTION_STRINGS.EAST, this.passages.dam_deep_canyon);
		this.rooms.deepCanyon.addExit(ACTION_STRINGS.NORTHWEST, this.passages.res_south_deep);
		this.rooms.deepCanyon.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.northsouth_deep_canyon);
		this.rooms.deepCanyon.addExit(ACTION_STRINGS.DOWN, this.passages.loud_deep_canyon);

		this.rooms.chasm = new Room(this, "Chasm", MAP_STRINGS.DESC_CHASM, LOCATION.CHASM);
		this.rooms.chasm.addExit(ACTION_STRINGS.NORTHEAST, this.passages.res_south_chasm);
		this.rooms.chasm.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.eastwest_chasm);
		this.rooms.chasm.addExit(ACTION_STRINGS.UP, this.passages.eastwest_chasm);
		this.rooms.chasm.addExit(ACTION_STRINGS.SOUTH, this.passages.northsouth_chasm);
		this.rooms.chasm.addFailMessage(ACTION_STRINGS.DOWN, "Are you out of your mind?");
		this.rooms.chasm.jumpString = "You look before leaping, and realize that you would never survive.";

		this.rooms.streamView = new Room(this, "Stream View", MAP_STRINGS.DESC_STREAM_VIEW, LOCATION.STREAM_VIEW);
		this.rooms.streamView.addExit(ACTION_STRINGS.EAST, this.passages.res_south_stream_view);
		this.rooms.streamView.addExit(ACTION_STRINGS.LAUNCH, this.passages.stream_view_stream);

		this.rooms.stream = new Room(this, "Stream", MAP_STRINGS.DESC_STREAM, LOCATION.STREAM);
		this.rooms.stream.addExit(ACTION_STRINGS.SOUTH, this.passages.stream_view_stream);
		this.rooms.stream.addExit(ACTION_STRINGS.LAND, this.passages.stream_view_stream);
		this.rooms.stream.addExit(ACTION_STRINGS.EAST, this.passages.reservoir_stream);

		this.rooms.reservoirSouth = new Room(this, "Reservoir South", MAP_STRINGS.DESC_RESERVOIR_SOUTH, LOCATION.RESERVOIR_SOUTH);
		this.rooms.reservoirSouth.addExit(ACTION_STRINGS.LAUNCH, this.passages.res_south_res);
		this.rooms.reservoirSouth.addExit(ACTION_STRINGS.WEST, this.passages.res_south_stream_view);
		this.rooms.reservoirSouth.addExit(ACTION_STRINGS.SOUTHEAST, this.passages.res_south_deep);
		this.rooms.reservoirSouth.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.res_south_chasm);
		this.rooms.reservoirSouth.addExit(ACTION_STRINGS.EAST, this.passages.dam_res_south);
		this.rooms.reservoirSouth.addFailMessage(ACTION_STRINGS.NORTH, "You would drown.");

		this.rooms.reservoir = new Room(this, "Reservoir", MAP_STRINGS.DESC_RESERVOIR, LOCATION.RESERVOIR);
		this.rooms.reservoir.addExit(ACTION_STRINGS.NORTH, this.passages.res_north_res);
		this.rooms.reservoir.addExit(ACTION_STRINGS.SOUTH, this.passages.res_south_res);
		this.rooms.reservoir.addExit(ACTION_STRINGS.LAND, this.passages.res_south_res);
		this.rooms.reservoir.addExit(ACTION_STRINGS.WEST, this.passages.reservoir_stream);
		this.rooms.reservoir.addFailMessage(ACTION_STRINGS.EAST, "The dam blocks your way.");

		this.rooms.reservoirEmpty = new Room(this, "Reservoir", MAP_STRINGS.DESC_RESERVOIR_EMPTY, LOCATION.RESERVOIR_EMPTY);
		this.rooms.reservoirEmpty.addExit(ACTION_STRINGS.NORTH, this.passages.res_north_res_empty);
		this.rooms.reservoirEmpty.addExit(ACTION_STRINGS.SOUTH, this.passages.res_south_res_empty);
		this.rooms.reservoirEmpty.addExit(ACTION_STRINGS.LAUNCH, this.passages.stream_res_empty);
		this.rooms.reservoirEmpty.addFailMessage(ACTION_STRINGS.WEST, "You cannot wade into the flowing stream.");

		this.rooms.reservoirNorth = new Room(this, "Reservoir North", MAP_STRINGS.DESC_RESERVOIR_NORTH, LOCATION.RESERVOIR_NORTH);
		this.rooms.reservoirNorth.addExit(ACTION_STRINGS.NORTH, this.passages.res_north_atlantis);
		this.rooms.reservoirNorth.addExit(ACTION_STRINGS.LAUNCH, this.passages.res_north_res);
		this.rooms.reservoirNorth.addFailMessage(ACTION_STRINGS.SOUTH, "You would drown.");

		this.rooms.atlantisRoom = new Room(this, "Atlantis Room", MAP_STRINGS.DESC_ATLANTIS_ROOM, LOCATION.ATLANTIS_ROOM);
		this.rooms.atlantisRoom.addExit(ACTION_STRINGS.UP, this.passages.atlantis_cave);
		this.rooms.atlantisRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.res_north_atlantis);

		this.rooms.caveNorth = new Room(this, "Cave", MAP_STRINGS.DESC_CAVE_NORTH, LOCATION.CAVE_NORTH);
		// Is this exit down or south??? Both.
		this.rooms.caveNorth.addExit(ACTION_STRINGS.SOUTH, this.passages.atlantis_cave);
		this.rooms.caveNorth.addExit(ACTION_STRINGS.DOWN, this.passages.atlantis_cave);
		this.rooms.caveNorth.addExit(ACTION_STRINGS.NORTH, this.passages.cave_mirrornorth);
		this.rooms.caveNorth.addExit(ACTION_STRINGS.WEST, this.passages.cave_twisting);

		this.rooms.twistingPassage = new Room(this, "Twisting Passage", MAP_STRINGS.DESC_TWISTING_PASSAGE, LOCATION.TWISTING_PASSAGE);
		this.rooms.twistingPassage.addExit(ACTION_STRINGS.EAST, this.passages.cave_twisting);
		this.rooms.twistingPassage.addExit(ACTION_STRINGS.NORTH, this.passages.twisting_mirror);

		this.rooms.mirrorRoomNorth = new Room(this, "Mirror Room", MAP_STRINGS.DESC_MIRROR_ROOM_NORTH, LOCATION.MIRROR_ROOM_NORTH);
		this.rooms.mirrorRoomNorth.addExit(ACTION_STRINGS.EAST, this.passages.cave_mirrornorth);
		this.rooms.mirrorRoomNorth.addExit(ACTION_STRINGS.WEST, this.passages.twisting_mirror);
		this.rooms.mirrorRoomNorth.addExit(ACTION_STRINGS.NORTH, this.passages.mirror_cold);

		this.rooms.coldPassage = new Room(this, "Cold Passage", MAP_STRINGS.DESC_COLD_PASSAGE, LOCATION.COLD_PASSAGE);
		this.rooms.coldPassage.addExit(ACTION_STRINGS.SOUTH, this.passages.mirror_cold);
		this.rooms.coldPassage.addExit(ACTION_STRINGS.WEST, this.passages.cold_slide);

		this.rooms.slideRoom = new Room(this, "Slide Room", MAP_STRINGS.DESC_SLIDE_ROOM, LOCATION.SLIDE_ROOM);
		this.rooms.slideRoom.addExit(ACTION_STRINGS.EAST, this.passages.cold_slide);
		this.rooms.slideRoom.addExit(ACTION_STRINGS.DOWN, this.passages.slide_cellar);
		this.rooms.slideRoom.addExit(ACTION_STRINGS.NORTH, this.passages.slide_mine_entrance);

		this.rooms.mineEntrance = new Room(this, "Mine Entrance", MAP_STRINGS.DESC_MINE_ENTRANCE, LOCATION.MINE_ENTRANCE);
		this.rooms.mineEntrance.addExit(ACTION_STRINGS.SOUTH, this.passages.slide_mine_entrance);
		this.rooms.mineEntrance.addExit(ACTION_STRINGS.WEST, this.passages.mine_entrance_squeaky);

		this.rooms.squeakyRoom = new Room(this, "Squeaky Room", MAP_STRINGS.DESC_SQUEAKY_ROOM, LOCATION.SQUEAKY_ROOM);
		this.rooms.squeakyRoom.addExit(ACTION_STRINGS.EAST, this.passages.mine_entrance_squeaky);
		this.rooms.squeakyRoom.addExit(ACTION_STRINGS.NORTH, this.passages.squeaky_bat);

		this.rooms.batRoom = new Room(this, "Bat Room", MAP_STRINGS.DESC_BAT_ROOM, LOCATION.BAT_ROOM);
		this.rooms.batRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.squeaky_bat);
		this.rooms.batRoom.addExit(ACTION_STRINGS.EAST, this.passages.bat_shaft);

		this.rooms.shaftRoom = new Room(this, "Shaft Room", MAP_STRINGS.DESC_SHAFT_ROOM, LOCATION.SHAFT_ROOM);
		this.rooms.shaftRoom.addExit(ACTION_STRINGS.WEST, this.passages.bat_shaft);
		this.rooms.shaftRoom.addExit(ACTION_STRINGS.NORTH, this.passages.shaft_smelly);

		this.rooms.smellyRoom = new Room(this, "Smelly Room", MAP_STRINGS.DESC_SMELLY_ROOM, LOCATION.SMELLY_ROOM);
		this.rooms.smellyRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.shaft_smelly);
		this.rooms.smellyRoom.addExit(ACTION_STRINGS.DOWN, this.passages.smelly_gas);

		this.rooms.gasRoom = new Room(this, "Gas Room", MAP_STRINGS.DESC_GAS_ROOM, LOCATION.GAS_ROOM);
		this.rooms.gasRoom.addExit(ACTION_STRINGS.UP, this.passages.smelly_gas);
		this.rooms.gasRoom.addExit(ACTION_STRINGS.EAST, this.passages.gas_coal_1);

		this.rooms.coalMine1 = new Room(this, "Coal Mine", MAP_STRINGS.DESC_COAL_MINE_1, LOCATION.COAL_MINE_1);
		this.rooms.coalMine1.addExit(ACTION_STRINGS.NORTH, this.passages.gas_coal_1);
		this.rooms.coalMine1.addExit(ACTION_STRINGS.NORTHEAST, this.passages.coal_1_coal_2);
		this.rooms.coalMine1.addExit(ACTION_STRINGS.EAST, this.passages.coal_1_self);

		this.rooms.coalMine2 = new Room(this, "Coal Mine", MAP_STRINGS.DESC_COAL_MINE_2, LOCATION.COAL_MINE_2);
		this.rooms.coalMine2.addExit(ACTION_STRINGS.SOUTH, this.passages.coal_1_coal_2);
		this.rooms.coalMine2.addExit(ACTION_STRINGS.NORTH, this.passages.coal_2_self);
		this.rooms.coalMine2.addExit(ACTION_STRINGS.SOUTHEAST, this.passages.coal_2_coal_3);

		this.rooms.coalMine3 = new Room(this, "Coal Mine", MAP_STRINGS.DESC_COAL_MINE_3, LOCATION.COAL_MINE_3);
		this.rooms.coalMine3.addExit(ACTION_STRINGS.EAST, this.passages.coal_2_coal_3);
		this.rooms.coalMine3.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.coal_3_coal_4);
		this.rooms.coalMine3.addExit(ACTION_STRINGS.SOUTH, this.passages.coal_3_self);

		this.rooms.coalMine4 = new Room(this, "Coal Mine", MAP_STRINGS.DESC_COAL_MINE_4, LOCATION.COAL_MINE_4);
		this.rooms.coalMine4.addExit(ACTION_STRINGS.NORTH, this.passages.coal_3_coal_4);
		this.rooms.coalMine4.addExit(ACTION_STRINGS.DOWN, this.passages.coal_4_ladder_top);
		this.rooms.coalMine4.addExit(ACTION_STRINGS.WEST, this.passages.coal_4_self);

		this.rooms.ladderTop = new Room(this, "Ladder Top", MAP_STRINGS.DESC_LADDER_TOP, LOCATION.LADDER_TOP);
		this.rooms.ladderTop.addExit(ACTION_STRINGS.UP, this.passages.coal_4_ladder_top);
		this.rooms.ladderTop.addExit(ACTION_STRINGS.DOWN, this.passages.ladder_top_bottom);

		this.rooms.ladderBottom = new Room(this, "Ladder Bottom", MAP_STRINGS.DESC_LADDER_BOTTOM, LOCATION.LADDER_BOTTOM);
		this.rooms.ladderBottom.addExit(ACTION_STRINGS.UP, this.passages.ladder_top_bottom);
		this.rooms.ladderBottom.addExit(ACTION_STRINGS.WEST, this.passages.ladder_bottom_timber);
		this.rooms.ladderBottom.addExit(ACTION_STRINGS.SOUTH, this.passages.ladder_bottom_dead_end);

		this.rooms.deadEndCoalMine = new Room(this, "Dead End", MAP_STRINGS.DESC_DEAD_END_COAL_MINE, LOCATION.DEAD_END_COAL_MINE);
		this.rooms.deadEndCoalMine.addExit(ACTION_STRINGS.NORTH, this.passages.ladder_bottom_dead_end);

		this.rooms.timberRoom = new Room(this, "Timber Room", MAP_STRINGS.DESC_TIMBER_ROOM, LOCATION.TIMBER_ROOM);
		this.rooms.timberRoom.addExit(ACTION_STRINGS.EAST, this.passages.ladder_bottom_timber);
		this.rooms.timberRoom.addExit(ACTION_STRINGS.WEST, this.passages.timber_drafty);

		this.rooms.draftyRoom = new Room(this, "Drafty Room", MAP_STRINGS.DESC_DRAFTY_ROOM, LOCATION.DRAFTY_ROOM);
		this.rooms.draftyRoom.addExit(ACTION_STRINGS.EAST, this.passages.timber_drafty);
		this.rooms.draftyRoom.addExit(ACTION_STRINGS.SOUTH, this.passages.drafty_machine);

		this.rooms.machineRoom = new Room(this, "Machine Room", MAP_STRINGS.DESC_MACHINE_ROOM, LOCATION.MACHINE_ROOM);
		this.rooms.machineRoom.addExit(ACTION_STRINGS.NORTH, this.passages.drafty_machine);

		this.rooms.gratingRoom = new Room(this, "Grating Room", MAP_STRINGS.DESC_GRATING_ROOM, LOCATION.GRATING_ROOM);
		this.rooms.gratingRoom.addExit(ACTION_STRINGS.UP, this.passages.grating_clearing);
		this.rooms.gratingRoom.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.maze11_grating);

		this.rooms.cyclopsRoom = new Room(this, "Cyclops Room", MAP_STRINGS.DESC_CYCLOPS_ROOM, LOCATION.CYCLOPS_ROOM);
		this.rooms.cyclopsRoom.addExit(ACTION_STRINGS.NORTHWEST, this.passages.maze15_cyclops);
		this.rooms.cyclopsRoom.addExit(ACTION_STRINGS.EAST, this.passages.cyclops_strange);
		this.rooms.cyclopsRoom.addExit(ACTION_STRINGS.UP, this.passages.cyclops_treasure);

		this.rooms.strangePassage = new Room(this, "Strange Passage", MAP_STRINGS.DESC_STRANGE_PASSAGE, LOCATION.STRANGE_PASSAGE);
		this.rooms.strangePassage.addExit(ACTION_STRINGS.WEST, this.passages.cyclops_strange);
		this.rooms.strangePassage.addExit(ACTION_STRINGS.EAST, this.passages.strange_living_room);

		this.rooms.treasureRoom = new Room(this, "Treasure Room", MAP_STRINGS.DESC_TREASURE_ROOM, LOCATION.TREASURE_ROOM);
		this.rooms.treasureRoom.addExit(ACTION_STRINGS.DOWN, this.passages.cyclops_treasure);
		this.rooms.treasureRoom.discoverValue = CONSTANTS.TREASURE_VALUE;

		this.rooms.maze1 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_1, LOCATION.MAZE_1);
		this.rooms.maze1.addExit(ACTION_STRINGS.EAST, this.passages.troll_maze);
		this.rooms.maze1.addExit(ACTION_STRINGS.NORTH, this.passages.maze1_self);
		this.rooms.maze1.addExit(ACTION_STRINGS.SOUTH, this.passages.maze1_maze2);
		this.rooms.maze1.addExit(ACTION_STRINGS.WEST, this.passages.maze1_maze4);

		this.rooms.maze2 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_2, LOCATION.MAZE_2);
		this.rooms.maze2.addExit(ACTION_STRINGS.SOUTH, this.passages.maze1_maze2);
		this.rooms.maze2.addExit(ACTION_STRINGS.EAST, this.passages.maze2_maze3);
		this.rooms.maze2.addExit(ACTION_STRINGS.DOWN, this.passages.maze2_maze4);

		this.rooms.maze3 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_3, LOCATION.MAZE_3);
		this.rooms.maze3.addExit(ACTION_STRINGS.WEST, this.passages.maze2_maze3);
		this.rooms.maze3.addExit(ACTION_STRINGS.NORTH, this.passages.maze3_maze4);
		this.rooms.maze3.addExit(ACTION_STRINGS.UP, this.passages.maze3_maze5);

		this.rooms.maze4 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_4, LOCATION.MAZE_4);
		this.rooms.maze4.addExit(ACTION_STRINGS.WEST, this.passages.maze3_maze4);
		this.rooms.maze4.addExit(ACTION_STRINGS.NORTH, this.passages.maze1_maze4);
		this.rooms.maze4.addExit(ACTION_STRINGS.EAST, this.passages.maze4_dead_end);

		this.rooms.maze5 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_5, LOCATION.MAZE_5);
		this.rooms.maze5.addExit(ACTION_STRINGS.NORTH, this.passages.maze3_maze5);
		this.rooms.maze5.addExit(ACTION_STRINGS.EAST, this.passages.maze5_dead_end);
		this.rooms.maze5.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.maze5_maze6);

		this.rooms.maze6 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_6, LOCATION.MAZE_6);
		this.rooms.maze6.addExit(ACTION_STRINGS.DOWN, this.passages.maze5_maze6);
		this.rooms.maze6.addExit(ACTION_STRINGS.EAST, this.passages.maze6_maze7);
		this.rooms.maze6.addExit(ACTION_STRINGS.WEST, this.passages.maze6_self);
		this.rooms.maze6.addExit(ACTION_STRINGS.UP, this.passages.maze6_maze9);

		this.rooms.maze7 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_7, LOCATION.MAZE_7);
		this.rooms.maze7.addExit(ACTION_STRINGS.DOWN, this.passages.maze7_dead_end);
		this.rooms.maze7.addExit(ACTION_STRINGS.WEST, this.passages.maze6_maze7);
		this.rooms.maze7.addExit(ACTION_STRINGS.EAST, this.passages.maze7_maze8);
		this.rooms.maze7.addExit(ACTION_STRINGS.SOUTH, this.passages.maze7_maze15);
		this.rooms.maze7.addExit(ACTION_STRINGS.UP, this.passages.maze7_maze14);

		this.rooms.maze8 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_8, LOCATION.MAZE_8);
		this.rooms.maze8.addExit(ACTION_STRINGS.NORTHEAST, this.passages.maze7_maze8);
		this.rooms.maze8.addExit(ACTION_STRINGS.SOUTHEAST, this.passages.maze8_dead_end);
		this.rooms.maze8.addExit(ACTION_STRINGS.WEST, this.passages.maze8_self);

		this.rooms.maze9 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_9, LOCATION.MAZE_9);
		this.rooms.maze9.addExit(ACTION_STRINGS.NORTH, this.passages.maze6_maze9);
		this.rooms.maze9.addExit(ACTION_STRINGS.DOWN, this.passages.maze9_maze11);
		this.rooms.maze9.addExit(ACTION_STRINGS.EAST, this.passages.maze9_maze10);
		this.rooms.maze9.addExit(ACTION_STRINGS.SOUTH, this.passages.maze9_maze13);
		this.rooms.maze9.addExit(ACTION_STRINGS.WEST, this.passages.maze9_maze12);
		this.rooms.maze9.addExit(ACTION_STRINGS.NORTHWEST, this.passages.maze9_self);

		this.rooms.maze10 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_10, LOCATION.MAZE_10);
		this.rooms.maze10.addExit(ACTION_STRINGS.EAST, this.passages.maze9_maze10);
		this.rooms.maze10.addExit(ACTION_STRINGS.UP, this.passages.maze10_maze11);
		this.rooms.maze10.addExit(ACTION_STRINGS.WEST, this.passages.maze10_maze13);

		this.rooms.maze11 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_11, LOCATION.MAZE_11);
		this.rooms.maze11.addExit(ACTION_STRINGS.DOWN, this.passages.maze10_maze11);
		this.rooms.maze11.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.maze11_maze12);
		this.rooms.maze11.addExit(ACTION_STRINGS.NORTHWEST, this.passages.maze11_maze13);
		this.rooms.maze11.addExit(ACTION_STRINGS.NORTHEAST, this.passages.maze11_grating);

		this.rooms.maze12 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_12, LOCATION.MAZE_12);
		this.rooms.maze12.addExit(ACTION_STRINGS.EAST, this.passages.maze12_maze13);
		this.rooms.maze12.addExit(ACTION_STRINGS.UP, this.passages.maze9_maze12);
		this.rooms.maze12.addExit(ACTION_STRINGS.NORTH, this.passages.maze12_dead_end);
		this.rooms.maze12.addExit(ACTION_STRINGS.DOWN, this.passages.maze12_maze5);
		this.rooms.maze12.addExit(ACTION_STRINGS.SOUTHWEST, this.passages.maze11_maze12);

		this.rooms.maze13 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_13, LOCATION.MAZE_13);
		this.rooms.maze13.addExit(ACTION_STRINGS.EAST, this.passages.maze9_maze13);
		this.rooms.maze13.addExit(ACTION_STRINGS.DOWN, this.passages.maze12_maze13);
		this.rooms.maze13.addExit(ACTION_STRINGS.WEST, this.passages.maze11_maze13);
		this.rooms.maze13.addExit(ACTION_STRINGS.SOUTH, this.passages.maze10_maze13);

		this.rooms.maze14 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_14, LOCATION.MAZE_14);
		this.rooms.maze14.addExit(ACTION_STRINGS.NORTHWEST, this.passages.maze14_self);
		this.rooms.maze14.addExit(ACTION_STRINGS.WEST, this.passages.maze14_maze15);
		this.rooms.maze14.addExit(ACTION_STRINGS.NORTHEAST, this.passages.maze7_maze14);
		this.rooms.maze14.addExit(ACTION_STRINGS.SOUTH, this.passages.maze7_maze14);

		this.rooms.maze15 = new Room(this, "Maze", MAP_STRINGS.DESC_MAZE_15, LOCATION.MAZE_15);
		this.rooms.maze15.addExit(ACTION_STRINGS.WEST, this.passages.maze14_maze15);
		this.rooms.maze15.addExit(ACTION_STRINGS.SOUTH, this.passages.maze7_maze15);
		this.rooms.maze15.addExit(ACTION_STRINGS.SOUTHEAST, this.passages.maze15_cyclops);

		this.rooms.mazeDeadEndNorth = new Room(this, "Dead End", MAP_STRINGS.DESC_DEAD_END_MAZE_NORTH, LOCATION.DEAD_END_MAZE_NORTH);
		this.rooms.mazeDeadEndNorth.addExit(ACTION_STRINGS.SOUTH, this.passages.maze4_dead_end);

		this.rooms.mazeDeadEndCenter = new Room(this, "Dead End", MAP_STRINGS.DESC_DEAD_END_MAZE_CENTER, LOCATION.DEAD_END_MAZE_CENTER);
		this.rooms.mazeDeadEndCenter.addExit(ACTION_STRINGS.WEST, this.passages.maze5_dead_end);

		this.rooms.mazeDeadEndSouthEast = new Room(this, "Dead End", MAP_STRINGS.DESC_DEAD_END_MAZE_SOUTHEAST, LOCATION.DEAD_END_MAZE_SOUTHEAST);
		this.rooms.mazeDeadEndSouthEast.addExit(ACTION_STRINGS.NORTH, this.passages.maze8_dead_end);

		this.rooms.mazeDeadEndSouthWest = new Room(this, "Dead End", MAP_STRINGS.DESC_DEAD_END_MAZE_SOUTHWEST, LOCATION.DEAD_END_MAZE_SOUTHWEST);
		this.rooms.mazeDeadEndSouthWest.addExit(ACTION_STRINGS.SOUTH, this.passages.maze12_dead_end);

		// set our dark rooms
		this.rooms.attic.setDark();
		this.rooms.cellar.setDark();
		this.rooms.eastOfChasm.setDark();
		this.rooms.gallery.setDark();
		this.rooms.studio.setDark();
		this.rooms.eastWestPassage.setDark();
		this.rooms.roundRoom.setDark()
		this.rooms.narrowPassage.setDark();
		this.rooms.mirrorRoomSouth.setDark();
		this.rooms.windingPassage.setDark();
		this.rooms.caveSouth.setDark();
		this.rooms.entranceToHades.setDark()
		this.rooms.landOfTheDead.setDark();
		this.rooms.engravingsCave.setDark();
		this.rooms.domeRoom.setDark();
		this.rooms.torchRoom.setDark();;
		this.rooms.temple.setDark()
		this.rooms.egyptianRoom.setDark();
		this.rooms.altarRoom.setDark();
		this.rooms.loudRoom.setDark();
		this.rooms.dampCave.setDark();
		this.rooms.northSouthPassage.setDark();
		this.rooms.chasm.setDark()
		this.rooms.deepCanyon.setDark();
		this.rooms.damLobby.setDark();
		this.rooms.maintenanceRoom.setDark();
		this.rooms.atlantisRoom.setDark();
		this.rooms.caveNorth.setDark();
		this.rooms.twistingPassage.setDark()
		this.rooms.mirrorRoomNorth.setDark();
		this.rooms.coldPassage.setDark();
		this.rooms.slideRoom.setDark();
		this.rooms.mineEntrance.setDark();
		this.rooms.squeakyRoom.setDark()
		this.rooms.batRoom.setDark();
		this.rooms.shaftRoom.setDark();
		this.rooms.gasRoom.setDark();
		this.rooms.coalMine1.setDark();
		this.rooms.coalMine2.setDark();
		this.rooms.coalMine3.setDark()
		this.rooms.coalMine4.setDark();
		this.rooms.ladderTop.setDark();
		this.rooms.ladderBottom.setDark();
		this.rooms.deadEndCoalMine.setDark();
		this.rooms.timberRoom.setDark();
		this.rooms.draftyRoom.setDark()
		this.rooms.machineRoom.setDark();
		this.rooms.maze1.setDark();
		this.rooms.maze2.setDark();
		this.rooms.maze3.setDark();
		this.rooms.maze4.setDark();
		this.rooms.maze5.setDark();
		this.rooms.maze6.setDark()
		this.rooms.maze7.setDark();
		this.rooms.maze8.setDark();
		this.rooms.maze8.setDark();
		this.rooms.maze10.setDark();
		this.rooms.maze11.setDark();
		this.rooms.maze12.setDark();
		this.rooms.maze13.setDark();
		this.rooms.maze14.setDark()
		this.rooms.maze15.setDark();
		this.rooms.mazeDeadEndCenter.setDark();
		this.rooms.mazeDeadEndNorth.setDark();
		this.rooms.mazeDeadEndSouthWest.setDark();
		this.rooms.mazeDeadEndSouthEast.setDark()
		this.rooms.gratingRoom.setDark();
		this.rooms.cyclopsRoom.setDark();
		this.rooms.strangePassage.setDark();
		this.rooms.treasureRoom.setDark();

		// Set dangerous heights
		this.rooms.eastOfChasm.height = true;
		this.rooms.canyonView.height = true;

		// Rooms that are bodies of water
		this.bodiesOfWater = [
			this.rooms.reservoir,
			this.rooms.stream,
			this.rooms.frigidRiver1,
			this.rooms.frigidRiver2,
			this.rooms.frigidRiver3,
			this.rooms.frigidRiver4,
			this.rooms.frigidRiver5
		];

		for(let i = 0; i < this.bodiesOfWater.length; i++) {

			this.bodiesOfWater[i].bodyOfWater = true;
			this.bodiesOfWater[i].removeFailMessage(ACTION_STRINGS.LAUNCH);
			this.bodiesOfWater[i].addFailMessage(ACTION_STRINGS.LAUNCH, "You are already on the water!");
		}
	}

	loadWorld() {

		this.world.set(this.rooms.westOfHouse.roomID, this.rooms.westOfHouse);
		this.world.set(this.rooms.northOfHouse.roomID, this.rooms.northOfHouse);
		this.world.set(this.rooms.behindHouse.roomID, this.rooms.behindHouse);
		this.world.set(this.rooms.southOfHouse.roomID, this.rooms.southOfHouse);
		this.world.set(this.rooms.kitchen.roomID, this.rooms.kitchen);
		this.world.set(this.rooms.attic.roomID, this.rooms.attic);
		this.world.set(this.rooms.livingRoom.roomID, this.rooms.livingRoom);
		this.world.set(this.rooms.forestPath.roomID, this.rooms.forestPath);
		this.world.set(this.rooms.forestWest.roomID, this.rooms.forestWest);
		this.world.set(this.rooms.forestEast.roomID, this.rooms.forestEast);
		this.world.set(this.rooms.forestNortheast.roomID, this.rooms.forestNortheast);
		this.world.set(this.rooms.forestSouth.roomID, this.rooms.forestSouth);
		this.world.set(this.rooms.clearingNorth.roomID, this.rooms.clearingNorth);
		this.world.set(this.rooms.clearingEast.roomID, this.rooms.clearingEast);
		this.world.set(this.rooms.upTree.roomID, this.rooms.upTree);
		this.world.set(this.rooms.canyonView.roomID, this.rooms.canyonView);
		this.world.set(this.rooms.rockyLedge.roomID, this.rooms.rockyLedge);
		this.world.set(this.rooms.canyonBottom.roomID, this.rooms.canyonBottom);
		this.world.set(this.rooms.endOfRainbow.roomID, this.rooms.endOfRainbow);
		this.world.set(this.rooms.stoneBarrow.roomID, this.rooms.stoneBarrow);
		this.world.set(this.rooms.insideStoneBarrow.roomID, this.rooms.insideStoneBarrow);
		this.world.set(this.rooms.cellar.roomID, this.rooms.cellar);
		this.world.set(this.rooms.eastOfChasm.roomID, this.rooms.eastOfChasm);
		this.world.set(this.rooms.gallery.roomID, this.rooms.gallery);
		this.world.set(this.rooms.studio.roomID, this.rooms.studio);
		this.world.set(this.rooms.trollRoom.roomID, this.rooms.trollRoom);
		this.world.set(this.rooms.eastWestPassage.roomID, this.rooms.eastWestPassage);
		this.world.set(this.rooms.roundRoom.roomID, this.rooms.roundRoom);
		this.world.set(this.rooms.narrowPassage.roomID, this.rooms.narrowPassage);
		this.world.set(this.rooms.mirrorRoomSouth.roomID, this.rooms.mirrorRoomSouth);
		this.world.set(this.rooms.windingPassage.roomID, this.rooms.windingPassage);
		this.world.set(this.rooms.caveSouth.roomID, this.rooms.caveSouth);
		this.world.set(this.rooms.entranceToHades.roomID, this.rooms.entranceToHades);
		this.world.set(this.rooms.landOfTheDead.roomID, this.rooms.landOfTheDead);
		this.world.set(this.rooms.engravingsCave.roomID, this.rooms.engravingsCave);
		this.world.set(this.rooms.domeRoom.roomID, this.rooms.domeRoom);
		this.world.set(this.rooms.torchRoom.roomID, this.rooms.torchRoom);
		this.world.set(this.rooms.temple.roomID, this.rooms.temple);
		this.world.set(this.rooms.egyptianRoom.roomID, this.rooms.egyptianRoom);
		this.world.set(this.rooms.altarRoom.roomID, this.rooms.altarRoom);
		this.world.set(this.rooms.loudRoom.roomID, this.rooms.loudRoom);
		this.world.set(this.rooms.dampCave.roomID, this.rooms.dampCave);
		this.world.set(this.rooms.whiteCliffsBeachNorth.roomID, this.rooms.whiteCliffsBeachNorth);
		this.world.set(this.rooms.whiteCliffsBeachSouth.roomID, this.rooms.whiteCliffsBeachSouth);
		this.world.set(this.rooms.frigidRiver1.roomID, this.rooms.frigidRiver1);
		this.world.set(this.rooms.frigidRiver2.roomID, this.rooms.frigidRiver2);
		this.world.set(this.rooms.frigidRiver3.roomID, this.rooms.frigidRiver3);
		this.world.set(this.rooms.frigidRiver4.roomID, this.rooms.frigidRiver4);
		this.world.set(this.rooms.frigidRiver5.roomID, this.rooms.frigidRiver5);
		this.world.set(this.rooms.sandyCave.roomID, this.rooms.sandyCave);
		this.world.set(this.rooms.sandyBeach.roomID, this.rooms.sandyBeach);
		this.world.set(this.rooms.shore.roomID, this.rooms.shore);
		this.world.set(this.rooms.aragainFalls.roomID, this.rooms.aragainFalls);
		this.world.set(this.rooms.onTheRainbow.roomID, this.rooms.onTheRainbow);
		this.world.set(this.rooms.dam.roomID, this.rooms.dam);
		this.world.set(this.rooms.damBase.roomID, this.rooms.damBase);
		this.world.set(this.rooms.damLobby.roomID, this.rooms.damLobby);
		this.world.set(this.rooms.maintenanceRoom.roomID, this.rooms.maintenanceRoom);
		this.world.set(this.rooms.northSouthPassage.roomID, this.rooms.northSouthPassage);
		this.world.set(this.rooms.chasm.roomID, this.rooms.chasm);
		this.world.set(this.rooms.deepCanyon.roomID, this.rooms.deepCanyon);
		this.world.set(this.rooms.reservoirSouth.roomID, this.rooms.reservoirSouth);
		this.world.set(this.rooms.reservoir.roomID, this.rooms.reservoir);
		this.world.set(this.rooms.reservoirEmpty.roomID, this.rooms.reservoirEmpty);
		this.world.set(this.rooms.reservoirNorth.roomID, this.rooms.reservoirNorth);
		this.world.set(this.rooms.streamView.roomID, this.rooms.streamView);
		this.world.set(this.rooms.stream.roomID, this.rooms.stream);
		this.world.set(this.rooms.atlantisRoom.roomID, this.rooms.atlantisRoom);
		this.world.set(this.rooms.caveNorth.roomID, this.rooms.caveNorth);
		this.world.set(this.rooms.twistingPassage.roomID, this.rooms.twistingPassage);
		this.world.set(this.rooms.mirrorRoomNorth.roomID, this.rooms.mirrorRoomNorth);
		this.world.set(this.rooms.coldPassage.roomID, this.rooms.coldPassage);
		this.world.set(this.rooms.slideRoom.roomID, this.rooms.slideRoom);
		this.world.set(this.rooms.mineEntrance.roomID, this.rooms.mineEntrance);
		this.world.set(this.rooms.squeakyRoom.roomID, this.rooms.squeakyRoom);
		this.world.set(this.rooms.batRoom.roomID, this.rooms.batRoom);
		this.world.set(this.rooms.shaftRoom.roomID, this.rooms.shaftRoom);
		this.world.set(this.rooms.smellyRoom.roomID, this.rooms.smellyRoom);
		this.world.set(this.rooms.gasRoom.roomID, this.rooms.gasRoom);
		this.world.set(this.rooms.coalMine1.roomID, this.rooms.coalMine1);
		this.world.set(this.rooms.coalMine2.roomID, this.rooms.coalMine2);
		this.world.set(this.rooms.coalMine3.roomID, this.rooms.coalMine3);
		this.world.set(this.rooms.coalMine4.roomID, this.rooms.coalMine4);
		this.world.set(this.rooms.ladderTop.roomID, this.rooms.ladderTop);
		this.world.set(this.rooms.ladderBottom.roomID, this.rooms.ladderBottom);
		this.world.set(this.rooms.deadEndCoalMine.roomID, this.rooms.deadEndCoalMine);
		this.world.set(this.rooms.timberRoom.roomID, this.rooms.timberRoom);
		this.world.set(this.rooms.draftyRoom.roomID, this.rooms.draftyRoom);
		this.world.set(this.rooms.machineRoom.roomID, this.rooms.machineRoom);
		this.world.set(this.rooms.maze1.roomID, this.rooms.maze1);
		this.world.set(this.rooms.maze2.roomID, this.rooms.maze2);
		this.world.set(this.rooms.maze3.roomID, this.rooms.maze3);
		this.world.set(this.rooms.maze4.roomID, this.rooms.maze4);
		this.world.set(this.rooms.maze5.roomID, this.rooms.maze5);
		this.world.set(this.rooms.maze6.roomID, this.rooms.maze6);
		this.world.set(this.rooms.maze7.roomID, this.rooms.maze7);
		this.world.set(this.rooms.maze8.roomID, this.rooms.maze8);
		this.world.set(this.rooms.maze9.roomID, this.rooms.maze9);
		this.world.set(this.rooms.maze10.roomID, this.rooms.maze10);
		this.world.set(this.rooms.maze11.roomID, this.rooms.maze11);
		this.world.set(this.rooms.maze12.roomID, this.rooms.maze12);
		this.world.set(this.rooms.maze13.roomID, this.rooms.maze13);
		this.world.set(this.rooms.maze14.roomID, this.rooms.maze14);
		this.world.set(this.rooms.maze15.roomID, this.rooms.maze15);
		this.world.set(this.rooms.mazeDeadEndNorth.roomID, this.rooms.mazeDeadEndNorth);
		this.world.set(this.rooms.mazeDeadEndCenter.roomID, this.rooms.mazeDeadEndCenter);
		this.world.set(this.rooms.mazeDeadEndSouthWest.roomID, this.rooms.mazeDeadEndSouthWest);
		this.world.set(this.rooms.mazeDeadEndSouthEast.roomID, this.rooms.mazeDeadEndSouthEast);
		this.world.set(this.rooms.gratingRoom.roomID, this.rooms.gratingRoom);
		this.world.set(this.rooms.cyclopsRoom.roomID, this.rooms.cyclopsRoom);
		this.world.set(this.rooms.treasureRoom.roomID, this.rooms.treasureRoom);
		this.world.set(this.rooms.strangePassage.roomID, this.rooms.strangePassage);
	}

	storageAvailable(type) {

		var storage = false;

		try {

			localStorage.setItem("__storage_test__", "test");
			localStorage.removeItem("__storage_test__");

			storage = true;

		} catch(err) {
			console.err(err);
		}

		this.usingLocalStorage = (storage) ? true : false;
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

		let isValid = this.processInput();

		callback({
			valid: isValid,
			act: this.state.currentPlayerInput,
			cmds: this.commandLog,
			rnds: this.randomLog
		});
	}

	setNewCommand() {
		this.cmd.write(cfg.newLine);
		this.cmd.write(cfg.lineStart);
	}

	/**
	 * Exit Input
	 *  - Refresh inventories
	 *  - Updates game flags
	 *  - Fills current object list
	 */
	exitInput() {

		// this.printDebugInfo();

		this.updateEvents();
		this.refreshInventories();
		this.fillCurrentObjectList();

		// clear screen?
	}

	processInput() {

		let input = this.state.completePlayerInput;

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

		// If the player is trying to indicate multiple objects,
		// the getMultipleObjects() method is called. If the input
		// can't be parsed, we exit here. If the input CAN be parsed
		// but no objects are in the final list,
		let multRE = /,|\sand\s|\sall\s|\sall$|^all$|everything|\sexcept\s|\sbut\s|treasure/i;
		if(multRE.test(input)) {

			input = this.removeSomeExtraWords(this.state.completePlayerInput);
			input = input.trim();

			// update current input
			this.state.completePlayerInput = input;

			if(this.getMultipleObjects()) {
				this.updateMultiple();
			}

			else {
				this.output("I can't understand that.");
			}

			this.exitInput();

			return;
		}

		input = this.removeExtraWords(this.state.completePlayerInput);

		// update current input
		this.state.completePlayerInput = input;

		switch(this.state.playerActionType) {
			case "DIRECT":

				if(this.state.playerAction === ACTION_STRINGS.LAUNCH) {

					if(input === "" && this.state.playerInBoat) {

						this.state.directObject = this.items.inflatedBoat;

						break;
					}
				}

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

				if(!this.isEmpty(this.state.completePlayerInput) && !this.parseIndirectObject()) {
					this.exitInput();
					return false;
				}

				break;
			case "SPEAK":
				this.state.speakPhrase = this.state.completePlayerInput;
				this.state.completePlayerInput = "";
				// no break, we continue
			case "REFLEXIVE":
			case "EXIT":
				this.state.previousDirectObject = this.items.dummyObject;
				break;
			default: {} break;
		}

		if(this.state.playerActionType == "INDIRECT_INVERSE") {

			let temp = this.state.directObject;

			this.state.directObject = this.state.indirectObject;
			this.state.indirectObject = temp;
		}

		// if(!this.isEmpty(input)) {
		// 	this.output("I don't understand what that means.");
		// 	this.exitInput();
		// 	return false;
		// }

		if(this.validateAction()) {

			this.updateGame();
			this.exitInput();

			return true;

		} else {

			this.printDebugInfo();
		}

		return false;
	}

	preprocessInput() {

		let input = this.state.completePlayerInput;

		input = input.replace(/ +/g, " ");

		if(this.loudRoomCheck(input)) {
			return false;
		}

		if(input === "again" || input === "g") {

			this.state.completePlayerInput = this.state.previousInput;

			if(this.state.completePlayerInput === "") {

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
		let input = this.state.completePlayerInput;

		if(this.isEmpty(input)) {
			this.output("I beg your pardon?");
			return true;
		}

		if(input === "author" || input === "about") {
			this.output(GAME_STRINGS.ABOUT_INFO);
			return true;
		}

		if(input === "bug") {
			this.output("Bug? Maybe in the original program, but not in a flawless remake like this! (Cough, cough.)");
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

		if(input === "hello sailor" || input === "hello, sailor!" || input === "hello sailor!" || input === "hello sailor") {
			this.output("Nothing happens here.");
			return true;
		}

		if(input === "xyzzy" || input === "plugh") {
			this.output("A hollow voice says 'Fool.'");
			return true;
		}

		if(input === "zork") {
			this.output("At your service!");
			return true;
		}

		return result;
	}

	/** this will find and assign the player actions, then update the string to the reamining words */
	parseAction() {

		let input = this.state.completePlayerInput;

		for(let token of ACTION_PHRASES) {

			if(this.startsWith(token, input)) {

				this.state.playerAction = ACTIONS[token].action;
				this.state.playerActionType = ACTIONS[token].type;
				this.state.actionPhrase = token;

				this.state.completePlayerInput = input.substring(token.length).trim();

				return true;
			}
		}

		return false;
	}

	parseDirectObject() {

		let input = this.state.completePlayerInput;

		if(this.isEmpty(input)) {
			this.output("What do you want to " + this.state.actionPhrase + "?");
			return false;
		}

		if(this.state.previousDirectObject !== null && this.state.previousDirectObject !== this.items.dummyObject) {

			input = " " + input + " ";

			if(!this.state.previousDirectObject.plural) {
				input = input.replace(/ it /, " " + this.state.previousDirectObject.name +  " ");
			}

			if(this.state.previousDirectObject.plural || this.state.previousDirectObject.name === "pile of leaves") {
				input = input.replace(/ them /, " " + this.state.previousDirectObject.name +  " ");
			}

			input = input.trim();
		}

		for(let token of this.currentObjectNames) {

			if(this.startsWith(token, input)) {

				this.state.directObject = this.currentObjects.get(token);
				this.state.directObjectPhrase = token;

				this.state.completePlayerInput = input.substring(token.length).trim();

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

		let input = this.state.completePlayerInput;

		if(this.isEmpty(input)) {
			this.output(`What do you want to ${this.state.actionPhrase} this ${this.state.directObjectPhrase} ${PREPOSITIONS[this.state.playerAction]}?`);
			return false;
		}

		for(let token of this.currentObjectNames) {

			if(this.startsWith(token, input)) {

				this.state.indirectObject = this.currentObjects.get(token);
				this.state.indirectObjectPhrase = token;

				this.state.completePlayerInput = input.substring(token.length).trim();

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

		let dirObj = this.state.directObject;
		let indObj = this.state.indirectObject;
		let act = this.state.playerAction;

		if(act === ACTION_STRINGS.ENTER && dirObj.name === "magic boat" && dirObj.location === this.state.playerLocation) {
			return true;
		}

		switch(this.state.playerAction) {
			case "DIRECT":

				if(dirObj.isItem() && dirObj.location !== LOCATION.PLAYER_INVENTORY) {

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

				if(indObj.isItem() && indObj.location !== LOCATION.PLAYER_INVENTORY) {

					switch(act) {
						case "THROW":
							break;
						default:
							this.output("You're not carrying the " + indObj.name + ".");
							this.exitInput();
							return false;
					}
				}

				if(dirObj.isItem() && dirObj.location !== LOCATION.PLAYER_INVENTORY) {

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

	updateGame() {

		let currentRoom = this.world.get(this.state.playerLocation);

		// Special cases: being in the boat and messing with the shaft basket
		if(this.state.playerInBoat && !this.boatCheck()) {
			this.output("You need to get out of the boat first.");
			return;
		}

		if(this.state.directObject?.name === "basket") {

			if(this.state.playerAction === "RAISE" || this.state.playerAction === "LOWER") {
				// don't do anything
			}

			else if((this.state.playerLocation === LOCATION.SHAFT_ROOM && this.state.shaftBasketLowered) || (this.state.playerLocation === LOCATION.DRAFTY_ROOM && !this.state.shaftBasketLowered)) {
				this.output("The basket is at the other end of the chain.");
				return;
			}
		}

		switch(this.state.playerAction) {
			// All actions which do NOT consume a turn should be processed here
			// before the specific update functions are called. They will return
			// before the end of the switch block is reached and the game updates
			// the actors, etc.
			case "BRIEF":
			case "SUPERBRIEF":
			case "VERBOSE":

				this.output("\"brief\", \"superbrief\", and \"verbose\" are not used in this version of the game.");

				return;

			case "DELETE":

				this.output("Enter save file name to delete: ");

				// inputTextArea.addEventListener("change", deleteInterface);
				// inputTextArea.removeEventListener("change", getPlayerInput);

				return;

			case "DIAGNOSE":

				if(this.state.playerDead)
					this.output(GAME_STRINGS.DEAD_DIAGNOSE);
				else
					this.output("You have " + this.state.playerHitPoints + "/" + CONSTANTS.MAX_HIT_POINTS + " hit points.");

				return;

			case "INVENTORY":

				if(this.state.playerDead)
					this.output(GAME_STRINGS.DEAD_INVENTORY);
				else
					this.listInventory();

				return;

			case "LOOK":

				this.output("You inspect your surroundings.");

				currentRoom.lookAround();

				return;

			case "QUIT":
				this.output("To quit, simply leave the page. To restart, enter \"restart\" or click the Restart button.");
				return;

			case "RESTART":
				this.restart();
				let rm = this.world.get(this.state.playerLocation);
				rm.lookAround();
				return;

			case "SCORE":

				if(this.state.playerDead) {
					this.output(GAME_STRINGS.DEAD_SCORE);
				}

				else {
					this.updateScore();
					this.output("Your score is " + this.state.playerScore + ".", false);
					this.output("This gives you the rank of " + this.state.playerScoreRank + ".");
				}

				return;

			case "SAVE":

				// TODO: WHAT????
				if(this.state.turns > CONSTANTS.MAX_TURNS) {
					this.output("Your game file is too large. It's time to start a new game.");
					return;
				}

				return;

			case "UNDO":

				if(this.state.turns === 0) {
					this.output("There is nothing to undo.");
					return;
				}

				else if(this.state.playerPreviousInput === "undo") {
					this.output("You cannot undo more than one move at a time.");
					return;
				}

				else {


					// TODO: let's write an undo fn
				}

				return;

			default:

				if(this.state.playerDead) {
					this.updateDeath();
					break;
				}

				this.darknessCheck();

				if(this.state.playerInDarkness) {
					this.updateDarkness();
					break;
				}

				this.updateStandard();

				break;
		}

		currentRoom = this.world.get(this.state.playerLocation);

		if(currentRoom.firstVisit) {
			currentRoom.firstVisit = false;
			currentRoom.lookAround();
		}

		if(this.state.currentPlayerInput !== "") this.commandLog.push(this.state.currentPlayerInput);

		// console.log("gameUpdate turn", {
		// 	cur: this.state.currentPlayerInput,
		// 	act: this.state.playerAction,
		// 	actType: this.state.playerActionType,
		// 	cmds: this.commandLog,
		// 	rnds: this.randomLog
		// });

		this.updateActors();

		++this.state.turns;

		this.updateItems();
		this.updateEvents();
		this.updateScore();
	}

	updateStandard() {

		let currentRoom = this.world.get(this.state.playerLocation);

		switch(this.state.playerAction) {

			// Actions on an object
			case "ANSWER": { this.state.directObject.answer(); } break;
			case "ATTACK": { this.state.directObject.attack(); } break;
			case "BLOW": { this.state.directObject.blow(); } break;
			case "BOARD": { this.state.directObject.board(); } break;
			case "BREAK": { this.state.directObject.breakObject(); } break;
			case "BRUSH": { this.state.directObject.brush(); } break;
			case "BURN": { this.state.directObject.burn(); } break;
			case "CLIMB": { this.state.directObject.climb(); } break;
			case "CLOSE": { this.state.directObject.close(); } break;
			case "COUNT": { this.state.directObject.count(); } break;
			case "CROSS": { this.state.directObject.cross(); } break;
			case "CUT": { this.state.directObject.cut(); } break;
			case "DEFLATE": { this.state.directObject.deflate(); } break;
			case "DIG": { this.state.directObject.dig(); } break;
			case "DRINK": { this.state.directObject.drink(); } break;
			case "DROP": { this.state.directObject.drop(); } break;
			case "EAT": { this.state.directObject.eat(); } break;
			case "ENTER": { this.state.directObject.enter(); } break;
			case "EXAMINE": { this.state.directObject.examine(); } break;
			case "EXTINGUISH": { this.state.directObject.extinguish(); } break;
			case "FILL": { this.state.directObject.fill(); } break;
			case "FOLLOW": { this.state.directObject.follow(); } break;
			case "GIVE": { this.state.directObject.give(); } break;
			case "GREET": { this.state.directObject.greet(); } break;
			case "INFLATE": { this.state.directObject.inflate(); } break;
			case "KICK": { this.state.directObject.kick(); } break;
			case "KNOCK": { this.state.directObject.knock(); } break;
			case "LAUNCH": { this.state.directObject.launch(); } break;
			case "LIGHT": { this.state.directObject.light(); } break;
			case "LISTEN": { this.state.directObject.listen(); } break;
			case "LOCK": { this.state.directObject.lock(); } break;
			case "LOOK_IN": { this.state.directObject.lookIn(); } break;
			case "LOOK_OUT": { this.state.directObject.lookOut(); } break;
			case "LOOK_UNDER": { this.state.directObject.lookUnder(); } break;
			case "MOVE_OBJECT": { this.state.directObject.move(); } break;
			case "LOWER": { this.state.directObject.lower(); } break;
			case "OPEN": { this.state.directObject.open(); } break;
			case "POUR": { this.state.directObject.pour(); } break;
			case "PULL": { this.state.directObject.pull(); } break;
			case "PUT": { this.state.directObject.put(); } break;
			case "PUSH": { this.state.directObject.push(); } break;
			case "RAISE": { this.state.directObject.raise(); } break;
			case "READ": { this.state.directObject.read(); } break;
			case "REMOVE": { this.state.directObject.remove(); } break;
			case "REPAIR": { this.state.directObject.repair(); } break;
			case "RING": { this.state.directObject.ring(); } break;
			case "RUB": { this.state.directObject.touch(); } break;
			case "SEARCH": { this.state.directObject.search(); } break;
			case "SHAKE": { this.state.directObject.shake(); } break;
			case "SMELL": { this.state.directObject.smell(); } break;
			case "TAKE": { this.state.directObject.take(); } break;
			case "TALK_TO": { this.state.directObject.talk(); } break;
			case "THROW": { this.state.directObject.throwObject(); } break;
			case "TIE": { this.state.directObject.tie(); } break;
			case "TOUCH": { this.state.directObject.touch(); } break;
			case "TURN": { this.state.directObject.turn(); } break;
			case "UNLOCK": { this.state.directObject.unlock(); } break;
			case "UNTIE": { this.state.directObject.untie(); } break;
			case "WAKE": { this.state.directObject.wake(); } break;
			case "WAVE": { this.state.directObject.wave(); } break;
			case "WEAR": { this.state.directObject.wear(); } break;
			case "WIND": { this.state.directObject.wind(); } break;

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
			case "LAND":

				if(currentRoom.exit()) {

					let nextRoom = this.world.get(this.state.playerLocation);

					// this.outputLocation(nextRoom.name);

					this.darknessCheck();

					if(nextRoom.isDark() && !this.state.lightActivated) {
						this.output(GAME_STRINGS.ENTER_DARKNESS);
					}

					if(nextRoom.roomID === "LOUD_ROOM" && this.state.waterFalling) {

						let rand = this.getRandom(3);

						nextRoom.getRoomObjects();

						this.output(MAP_STRINGS.DESC_LOUD_ROOM_WATER);

						if(rand === 0) this.relocatePlayer(LOCATION.DAMP_CAVE, false);
						if(rand === 1) this.relocatePlayer(LOCATION.ROUND_ROOM, false);
						if(rand === 2) this.relocatePlayer(LOCATION.DEEP_CANYON, false);

						this.updateActors();
						this.updateItems();
						this.updateScore();
						this.updateEvents();

						++this.state.turns;

						return;
					}

					if(!nextRoom.firstVisit) {
						nextRoom.lookAround();
					}

					// Triggered the first time a player moves
					if(this.state.firstMovement === false) {
						this.state.firstMovement = true;
						this.award("game-zork-start");
					}

					if(nextRoom.roomID === "GAS_ROOM"){

						let flameCheck = false;

						if(this.items.torch.location === LOCATION.PLAYER_INVENTORY && this.items.torch.activated) {
							flameCheck = true;
						}

						if(this.items.candles.location === LOCATION.PLAYER_INVENTORY && this.items.candles.activated) {
							flameCheck = true;
						}

						if(this.items.matchbook.location === LOCATION.PLAYER_INVENTORY && this.items.matchbook.activated) {
							flameCheck = true;
						}

						if(flameCheck) {
							this.output(GAME_STRINGS.GAS_EXPLOSION);
							this.playerDies();
						}
					}
				}

				break;

			// Reflexive actions
			case "DEBOARD":

				if(this.state.playerInBoat) {

					if(currentRoom.bodyOfWater) {
						this.output("You realize that getting out here would be fatal.");
					}

					else {
						this.output("You are on your own feet again.");
						this.state.playerInBoat = false;
					}
				}

				else if(this.items.boat.location === LOCATION.PLAYER_INVENTORY || this.items.boat.location === this.state.playerLocation) {
					this.output("You're already not in the boat.");
				}

				else {
					this.output("There is nothing to get out of.");
				}

				break;

			case "JUMP":

				if(this.state.playerLocation === "UP_TREE") {
					this.relocatePlayer(LOCATION.FOREST_PATH);
					this.output(this.rooms.upTree.jumpString);
					break;
				}

				if(currentRoom.jumpString !== "") {
					this.output(currentRoom.jumpString);
				}

				if(currentRoom.height) {
					this.playerDies();
				} else {
					this.output(GAME_STRINGS.getJumpSarcasm());
				}

				break;

			case "PRAY":

				if(this.state.playerLocation === LOCATION.ALTAR) {
					this.state.cyclopsShutsTrapDoor = false;
					this.relocatePlayer(LOCATION.FOREST_WEST, false);
				} else {
					this.output("If you pray enough, your prayers may be answered.");
				}

				break;

			case "SAY":

				let clops = this.objects.get("cyclops");

				if(this.state.speakPhrase === "ulysses" || this.state.speakPhrase === "odysseus") {

					if(this.state.playerLocation === LOCATION.CYCLOPS_ROOM && clops.location === LOCATION.CYCLOPS_ROOM) {

						this.output(OBJECT_STRINGS.CYCLOPS_FLEES);
						clops.alive = false;
						this.state.cyclopsGone = true;
						this.updateEvents();

					} else {
						this.output("Wasn't he a sailor?");
					}

				} else {
					this.output("\"" + this.state.speakPhrase + "\" yourself.");
				}

				break;

			case "SHOUT": { this.output("Yaaaaarrrrggghhh!"); } break;

			case "SWIM":
				this.output("You need to wait an hour after eating first.");
				break;

			case "WAIT":
				if(this.state.playerHitPoints < CONSTANTS.MAX_HIT_POINTS) ++this.state.playerHitPoints;
				this.output("Time passes...");
				break;

			default:

				break;
		}
	}

	updateMultiple() {

		// Are we clearing the console?
		// document.getElementById("gameArea").innerText = "";

		if(this.state.multipleObjectList.size === 0) {

			switch(this.state.playerAction) {
				case "DROP":
				case "PUT":
				case "TAKE":
					this.output("There is nothing to " + this.state.actionPhrase + ".");
					break;

				default:
					this.output("You can't use multiple objects with \"" + this.state.actionPhrase + "\".");
					break;
			}

			return;
		}

		switch(this.state.playerAction) {
			case "DROP":

				for(let [token, obj] of this.state.multipleObjectList) {

					let line = token + ": ";

					if(!this.currentObjects.has(obj.name)) {
						line += "You can't see any " + token + " here!";
					}

					else if(obj.isItem() && obj.location !== "PLAYER_INVENTORY") {
						line += "You don't have the " + token + ".";
					}

					// Copied code from item.drop() and breakEgg()
					else if(obj.isItem() && obj.location === "PLAYER_INVENTORY") {

						if(this.state.playerLocation === LOCATION.UP_TREE) {

							this.state.playerCarryWeight -= obj.weight;

							if(obj.name === "jewel-encrusted egg") {
								line += ("The egg falls to the ground and springs open, seriously damaged.");
								line += OBJECT_STRINGS.INIT_BROKEN_CANARY;
								this.items.egg.location = LOCATION.NULL_LOCATION;
								this.items.brokenCanary.location = LOCATION.INSIDE_BROKEN_EGG;
								this.items.brokenEgg.location = LOCATION.FOREST_PATH;
								this.items.brokenEgg.itemOpen = true;
							}

							else if(obj.name === "bird's nest") {

								if(this.items.egg.location == LOCATION.INSIDE_BIRDS_NEST) {

									line += ("The nest falls to the ground, and the egg spills out of it, seriously damaged.");
									line += OBJECT_STRINGS.INIT_BROKEN_CANARY;
									this.items.egg.location = LOCATION.NULL_LOCATION;
									this.items.brokenCanary.location = LOCATION.INSIDE_BROKEN_EGG;
									this.items.brokenEgg.location = LOCATION.FOREST_PATH;
									this.items.brokenEgg.itemOpen = true;
								}

								else {
									line += ("The bird's nest falls to the ground.");
								}

								obj.location = LOCATION.FOREST_PATH;
							}

							else {
								line += ("The " + obj.name + " falls to the ground.");
								obj.location = LOCATION.FOREST_PATH;
							}
						}

						else {
							this.state.playerCarryWeight -= obj.weight;
							obj.location = this.state.playerLocation;
							line += ("Dropped.");
						}
					}

					else {
						line += "You can't drop that.";
					}

					this.output(line);
				}

				break;

			case "PUT":

				let cObj = this.state.indirectObject;

				if((cObj.isContainer && cObj.isOpen()) || cObj.isSurface()) {

					for (let [token, obj] of this.state.multipleObjectList) {

						let line = token + ": ";

						if(!this.currentObjects.has(obj.name)) {
							line += "You can't see any " + token + " here!";
						}

						else if(obj.isItem() && obj.location !== LOCATION.PLAYER_INVENTORY) {
							line += "You don't have the " + token + ".";
						}

						else {

							if(cObj.name === "machine" && cObj.inventory.size > 0) {
								line += "There's no more room.";
								this.output(line);
								continue;
							}

							let currentWeight = 0;

							for (let it of cObj.inventory) {
								currentWeight += it.weight;
							}

							if(currentWeight + obj.weight <= cObj.capacity) {
								cObj.inventory.add(obj);
								obj.location = cObj.inventoryID;
								line += "Done.";
							}

							else {
								line += "There's no more room.";
							}
						}

						this.output(line);
					}
				}

				if(cObj.isContainer() && !cObj.isOpen()) {
					this.output("The " + cObj.name + " is closed.");
				}

				break;

			case "TAKE":

				for(let [token, obj] of this.state.multipleObjectList) {

					let line = token + ": ";

					if(!this.currentObjects.has(obj.name)) {
						line += "You can't see any " + token + " here!";
					}

					else if(!obj.isItem() && !obj.isFeature()) {
						if(obj.takeString === "")
							line += GAME_STRINGS.getSarcasticResponse();
						else
							line += obj.takeString;
					}

					else if(obj.isFeature()) {

						switch (obj.name) {
							case "quantity of water":

								let bottle = this.objects.get("glass bottle");

								if(bottle.location !== LOCATION.PLAYER_INVENTORY)
									line += "It's in the bottle. Perhaps you should take that first.";
								else if(!bottle.isOpen())
									line += "The bottle is closed.";
								else
									line += "The water slips through your fingers.";

								break;

							case "skeleton":

								line += OBJECT_STRINGS.SKELTON_DISTURBED;

								for (let treasure of this.objects.values()) {
									if(treasure.location === LOCATION.PLAYER_INVENTORY && treasure.trophyCaseValue > 0) {
										treasure.location = LOCATION.LAND_OF_THE_DEAD;
									}
								}

								break;

							default:
								if(obj.takeString === "")
									line += GAME_STRINGS.getSarcasticResponse();
								else
									line += obj.takeString;
								break;
						}
					}

					else if(obj.location === LOCATION.PLAYER_INVENTORY) {
						line += "You're already carrying the " + obj.name + "!";
					}

					// Object is an available item not in the player's inventory
					else {

						if(obj.location === LOCATION.INSIDE_BASKET && this.state.playerLocation === LOCATION.DRAFTY_ROOM && !this.state.shaftBasketUsed) {
							this.state.shaftBasketUsed = true;
						}

						if(obj.name === "pile of leaves" && !this.state.leafPileMoved) {
							this.state.leafPileMoved = true;
							this.features.grating.altLocations.add(LOCATION.CLEARING_NORTH);
							line += "\nIn disturbing the pile of leaves, a grating is revealed.";
							this.rooms.clearingNorth.addExit(ACTION_STRINGS.DOWN, this.passages.grating_clearing);
							this.rooms.gratingRoom.setLight();
						}

						if(obj.name === "rope" && this.state.ropeRailTied) {

							if(this.state.playerLocation === LOCATION.TORCH_ROOM) {
								line += "\nYou cannot reach the rope.";
							}

							else if(state.playerLocation === LOCATION.DOME_ROOM) {
								this.state.ropeRailTied = false;
								line += "\nThe rope is now untied.";
							}
						}

						if(obj.name === "rusty knife") {

							if(sword.location === LOCATION.PLAYER_INVENTORY) {
								line += "\n" + OBJECT_STRINGS.RUSTY_KNIFE_TAKE;
							}
						}

						if(obj.name === "small piece of vitreous slag") {
							line += "\n" + OBJECT_STRINGS.SLAG_CRUMBLE;
							obj.location = LOCATION.NULL_LOCATION;
							this.output(line);
							continue;
						}

						if((this.state.playerCarryWeight + this.weight) >= CARRY_WEIGHT_LIMIT) {
							line += (GAME_STRINGS.OVERBURDENED);
							this.output(line);
							continue;
						}

						// Item taken successfully
						this.state.playerCarryWeight += obj.weight;
						obj.location = LOCATION.PLAYER_INVENTORY;
						obj.acquired = true;
						obj.movedFromStart = true;
						line += "Taken.";
					}

					this.output(line);
				}

				break;

			default:
				this.output("You can't use multiple objects with \"" + this.state.actionPhrase + "\".");
				return;
		}
	}

	updateDarkness() {

		let currentRoom = this.world.get(this.state.playerLocation);

		if(this.state.darknessTurns > CONSTANTS.MAX_DARKNESS_TURNS) {
			this.output(GAME_STRINGS.GRUE_DEATH_2);
			this.playerDies();
			return;
		}

		switch(this.state.playerAction) {
			case "DROP":
				this.state.directObject.drop();
				++this.state.darknessTurns;
				break;

			case "JUMP":
				this.output(GAME_STRINGS.getJumpSarcasm());
				++this.state.darknessTurns;
				break;

			case "LIGHT":
				this.state.directObject.light();
				++this.state.darknessTurns;
				break;

			case "LISTEN":
				this.output(GAME_STRINGS.DARKNESS_LISTEN);
				++state.darknessTurns;
				break;

			case "SHOUT":
				this.output("Yaaaaarrrrggghhh!");
				++this.state.darknessTurns;
				break;

			case "WAIT":
				this.output("Time passes...");
				++this.state.darknessTurns;
				break;

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

				if(currentRoom.exit(this.state.playerAction)) {

					let nextRoom = this.world.get(this.state.playerLocation);

					this.output(nextRoom.name);

					this.darknessCheck();

					if(this.state.playerInDarkness) {
						this.output(GAME_STRINGS.ENTER_DARKNESS);
						// return;
					}

					nextRoom.lookAround();
				}

				break;

			default:
				this.output("It's too dark to see!");
				++this.state.darknessTurns;
				break;
		}
	}

	updateDeath() {

		let currentRoom = this.world.get(this.state.playerLocation);

		switch(this.state.playerAction) {
			case "ATTACK":
				this.output("All such attacks are vain in your condition.");
				break;

			case "GREET":
				this.output("The dead may not greet the living.");
				break;

			case "LIGHT":
				this.output("You need no light to guide you.");
				break;

			case "PRAY":

				if(this.state.playerLocation === LOCATION.ALTAR) {
					this.output(GAME_STRINGS.DEAD_PRAY_ALTAR);
					this.state.playerDead = false;
					this.state.playerHitPoints = 1;
					this.state.cyclopsShutsTrapDoor = false;
					this.relocatePlayer(LOCATION.FOREST_WEST, false);
				}

				else {
					this.output(GAME_STRINGS.DEAD_PRAY_FAIL);
				}

				break;

			case "TAKE":
				this.output(GAME_STRINGS.DEAD_TAKE_OBJECT);
				break;

			case "TOUCH":
				this.output(GAME_STRINGS.DEAD_TOUCH);
				break;

			case "WAIT":
				this.output(GAME_STRINGS.DEAD_WAIT);
				break;

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

				if(this.state.playerLocation === Location.TIMBER_ROOM && this.state.playerAction === Action.WEST) {
					this.output(GAME_STRINGS.DEAD_CANNOT_ENTER);
					return;
				}

				if(this.state.playerLocation === Location.STUDIO && this.state.playerAction === Action.UP) {
					this.output(GAME_STRINGS.DEAD_CANNOT_ENTER);
					return;
				}

				if(this.state.playerLocation === Location.SLIDE_ROOM && this.state.playerAction === Action.DOWN) {
					this.output(GAME_STRINGS.DEAD_CANNOT_ENTER);
					return;
				}

				if(currentRoom.exit(this.state.playerAction)) {

					let nextRoom = this.world.get(this.state.playerLocation);

					this.output(nextRoom.name, false);

					if(this.state.playerLocation === Location.DOME_ROOM) {
						this.output(GAME_STRINGS.DEAD_DOME_PASSAGE, false);
						this.state.playerLocation = Location.TORCH_ROOM;
						this.rooms.torchRoom.lookAround();

						return;
					}

					nextRoom.lookAround();
				}

				break;

			default:
				this.output(GAME_STRINGS.DEAD_ACTION_FAIL);
				break;
		}
	}

	updateActors() {

		this.actors.cyclops.cyclopsTurn();
		this.actors.flood.floodTurn();
		this.actors.damFlow.damFlowTurn();
		this.actors.gustOfWind.gustOfWindTurn();
		this.actors.riverCurrent.riverCurrentTurn();
		this.actors.songbird.songbirdTurn();
		this.actors.spirits.spiritsTurn();
		this.actors.thief.thiefTurn();
		this.actors.troll.trollTurn();
		this.actors.vampireBat.vampireBatTurn();
		this.actors.swordGlow.swordGlowTurn();

		if(this.state.playerHitPoints <= 0)
			this.playerDies();
	}

	updateEvents() {

		let carpet = this.features.carpet;
		let trapDoor = this.objects.get("trap door");
		let cellar_livingroom = this.passages.cellar_livingroom;

		// CARPET MOVED
		if(this.state.carpetMoved) {

			carpet.boardString = OBJECT_STRINGS.CARPET_SIT_2;
			carpet.lookUnderString = "There is nothing but dust here.";

			trapDoor.location = LOCATION.LIVING_ROOM;
			if(!trapDoor.altLocations.has(LOCATION.CELLAR)) {
				trapDoor.altLocations.add(LOCATION.CELLAR);
			}

			cellar_livingroom.closedFail = "The trap door is closed.";
		}

		else {

			carpet.boardString = OBJECT_STRINGS.CARPET_SIT_1;
			carpet.lookUnderString = OBJECT_STRINGS.CARPET_LOOK_UNDER;

			trapDoor.location = LOCATION.NULL_LOCATION;
			trapDoor.altLocations.clear();

			cellar_livingroom.closedFail = "You can't go that way.";
		}

		// CYCLOPS STATUS
		let cyclops = this.objects.get("cyclops");
		let cyclops_strange = this.passages.cyclops_strange;
		let cyclops_treasure = this.passages.cyclops_treasure;
		let strange_living_room = this.passages.strange_living_room;

		if(cyclops.unconcious) {

			this.state.cyclopsShutsTrapDoor = false;
			cyclops.presenceString = OBJECT_STRINGS.CYCLOPS_SLEEP_1;
			cyclops_treasure.setOpen();
		}

		else {

			this.state.cyclopsShutsTrapDoor = true;
			cyclops.presenceString = OBJECT_STRINGS.CYCLOPS_2;
			cyclops_treasure.setClosed();
		}

		if(!cyclops.alive) {

			cyclops.presenceString = "";
			cyclops_treasure.location = LOCATION.NULL_LOCATION;
		}

		if(this.state.cyclopsGone) {

			this.state.cyclopsShutsTrapDoor = false;
			cyclops.location = LOCATION.NULL_LOCATION;
			cyclops_strange.setOpen();
			cyclops_treasure.setOpen();
			strange_living_room.setOpen();
		}

		else {

			cyclops_strange.setClosed();
			cyclops_treasure.setClosed();
			strange_living_room.setClosed();
		}

		if(this.state.cyclopsShutsTrapDoor) {

			cellar_livingroom.message = "The trap door crashes shut, and you hear someone barring it.";
		}

		else {

			cellar_livingroom.message = "";
		}

		let house_west_barrow = this.passages.house_west_barrow;

		// GAME WON
		if(this.state.gameWon) {
			house_west_barrow.setOpen();
		}

		else {

			house_west_barrow.setClosed();
		}

		// GRATING OPEN
		let grating = this.objects.get("grating");
		let grating_clearing = this.passages.grating_clearing;
		let gratingRoom = this.rooms.gratingRoom;
		let clearingNorth = this.rooms.clearingNorth;

		if(this.state.gratingOpen) {

			if(!grating.altLocations.has(LOCATION.CLEARING_NORTH)) {
				grating.altLocations.add(LOCATION.CLEARING_NORTH);
			}

			gratingRoom.setLight();
			grating_clearing.setOpen();

			if(!this.state.leafPileMoved) {

				this.state.leafPileMoved = true;
				this.items.leafPile.location = LOCATION.GRATING_ROOM;
			}
		}

		else {
			grating_clearing.setClosed();
			grating.examineString = "The grating is closed.";
		}

		// HOUSE WINDOW OPEN
		let house_behind_kitchen = this.passages.house_behind_kitchen;

		if(this.state.houseWindowOpened) {

			house_behind_kitchen.setOpen();
			this.features.houseWindow.examineString = OBJECT_STRINGS.WINDOW_EXAMINE_OPEN;
		}

		else {
			house_behind_kitchen.setClosed();
			this.features.houseWindow.examineString = OBJECT_STRINGS.WINDOW_EXAMINE_CLOSED;
		}

		// LEAF PILE MOVED
		if(this.state.leafPileMoved) {
			gratingRoom.setLight();
		}

		else {

			gratingRoom.setDark();
		}

		// RAINBOW SOLID
		let rainbow_end = this.passages.rainbow_end;
		let falls_rainbow = this.passages.falls_rainbow;

		if(this.state.rainbowSolid) {

			rainbow_end.setOpen();
			falls_rainbow.setOpen();
		}

		else {

			rainbow_end.setClosed();
			falls_rainbow.setClosed();
		}

		// ROPE TIED TO RAIL
		let dome_torch = this.passages.dome_torch;

		if(this.items.rope.location === LOCATION.NULL_LOCATION) {

			this.state.ropeRailTied = false;
		}

		if(this.state.ropeRailTied) {

			this.items.rope.location = LOCATION.ON_RAILING;

			this.rooms.domeRoom.description = MAP_STRINGS.DESC_DOME_ROOM_ROPE;
			this.rooms.torchRoom.description = MAP_STRINGS.DESC_TORCH_ROOM_ROPE;
			this.rooms.torchRoom.addFailMessage(ACTION_STRINGS.UP, "You cannot reach the rope.");
			dome_torch.setOpen();
		}

		else {

			this.rooms.domeRoom.description = MAP_STRINGS.DESC_DOME_ROOM;
			this.rooms.torchRoom.description = MAP_STRINGS.DESC_TORCH_ROOM;
			this.rooms.torchRoom.removeFailMessage(ACTION_STRINGS.UP);
			dome_torch.setClosed();
		}

		// TRAP DOOR OPEN
		if(this.state.trapDoorOpen) {
			cellar_livingroom.setOpen();
		}

		else {

			cellar_livingroom.setClosed();
		}

		// THIEF STATUS
		let thief = this.objects.get("thief");
		if(thief.unconscious) {
			thief.presenceString = OBJECT_STRINGS.THIEF_PRESENT_UNCONSCIOUS;
		}

		// TROLL STATUS
		let troll = this.objects.get("troll");
		if(troll.alive && !troll.unconscious) {
			this.passages.troll_eastwest.setClosed();
			this.passages.troll_maze.setClosed();
			this.passages.troll_eastwest.closedFail = OBJECT_STRINGS.TROLL_FEND;
			this.passages.troll_maze.closedFail = OBJECT_STRINGS.TROLL_FEND;
		}

		else if (troll.unconscious) {
			troll.presenceString = OBJECT_STRINGS.TROLL_PRESENCE_UNCONSCIOUS;
			this.passages.troll_eastwest.setOpen();
			this.passages.troll_maze.setOpen();
		}

		if(troll.disarmed) {
			troll.presenceString = OBJECT_STRINGS.TROLL_PRESENCE_DISARMED;
		}

		else if(!troll.alive) {
			troll.location = LOCATION.NULL_LOCATION;
			this.passages.troll_eastwest.setOpen();
			this.passages.troll_maze.setOpen();
		}

		else {
			this.actors.troll.presenceString = OBJECT_STRINGS.TROLL_PRESENCE;
		}

		// YELLOW BUTTON
		if (this.state.yellowButtonPushed) {
			this.features.damBubble.examineString = "The bubble is lit with a serene green glow.";
		}

		else {
			this.features.damBubble.examineString = "The green bubble is dark and lifeless.";
		}
	}

	updateItems() {

		for(let g of this.objects.values()) {

			if(g.isItem() && g.activated && g.lifespan > 0) {

				g.tick();

				if(g.lifespan <= 0) {
					g.activated = false;
				}
			}
		}

		if(this.state.playerInBoat) {

			this.items.inflatedBoat.location = this.state.playerLocation;
			this.items.inflatedBoat.presenceString = "";
			let str = "Refer to the boat label for instructions.";
			this.rooms.damBase.addFailMessage(ACTION_STRINGS.EAST, str);
			this.rooms.whiteCliffsBeachNorth.addFailMessage(ACTION_STRINGS.EAST, str);
			this.rooms.whiteCliffsBeachSouth.addFailMessage(ACTION_STRINGS.EAST, str);
			this.rooms.sandyBeach.addFailMessage(ACTION_STRINGS.WEST, str);
			this.rooms.shore.addFailMessage(ACTION_STRINGS.WEST, str);
			this.rooms.reservoirSouth.removeFailMessage(ACTION_STRINGS.NORTH);
			this.rooms.reservoirNorth.removeFailMessage(ACTION_STRINGS.SOUTH);
			this.rooms.reservoirSouth.addFailMessage(ACTION_STRINGS.NORTH, str);
			this.rooms.reservoirNorth.addFailMessage(ACTION_STRINGS.SOUTH, str);
			this.rooms.streamView.addFailMessage(ACTION_STRINGS.NORTH, str);
		}

		else {
			this.items.inflatedBoat.presenceString = "There is a magic boat here.";
			this.rooms.damBase.removeFailMessage(ACTION_STRINGS.EAST);
			this.rooms.whiteCliffsBeachNorth.removeFailMessage(ACTION_STRINGS.EAST);
			this.rooms.whiteCliffsBeachSouth.removeFailMessage(ACTION_STRINGS.EAST);
			this.rooms.sandyBeach.removeFailMessage(ACTION_STRINGS.WEST);
			this.rooms.shore.removeFailMessage(ACTION_STRINGS.WEST);
			this.rooms.reservoirSouth.removeFailMessage(ACTION_STRINGS.NORTH);
			this.rooms.reservoirNorth.removeFailMessage(ACTION_STRINGS.SOUTH);
			this.rooms.reservoirSouth.addFailMessage(ACTION_STRINGS.NORTH, "You would drown.");
			this.rooms.reservoirNorth.addFailMessage(ACTION_STRINGS.SOUTH, "You would drown.");
			this.rooms.streamView.removeFailMessage(ACTION_STRINGS.NORTH);
		}
	}

	updateScore() {

		let score = 0;

		// add treasure & item score
		for(let g of this.objects.values()) {

			if(g.isItem()) {

				if(g.location === LOCATION.INSIDE_TROPHY_CASE) {
					score += g.trophyCaseValue;
				}

				if(g.acquired) {
					score += g.acquireValue;
				}
			}
		}

		// add location score
		for(let r of this.world.values()) {

			if(r.firstVisit === false) {
				score += r.discoverValue;
			}
		}

		if(this.state.shaftBasketUsed) {
			score += CONSTANTS.SHAFT_BASKET_POINTS;
		}

		score -= this.state.playerDeaths * CONSTANTS.DEATH_POINTS;

		if(score >= 350) this.state.playerScoreRank = "Master Adventurer";
		else if(score >= 330) this.state.playerScoreRank = "Wizard";
		else if(score >= 300) this.state.playerScoreRank = "Master";
		else if(score >= 250) this.state.playerScoreRank = "Seasoned Adventurer";
		else if(score >= 200) this.state.playerScoreRank = "Adventurer";
		else if(score >= 150) this.state.playerScoreRank = "Amateur Adventurer";
		else if(score >= 100) this.state.playerScoreRank = "Junior Adventurer";
		else if(score >= 50) this.state.playerScoreRank = "Novice Adventurer";
		else if(score >= 25) this.state.playerScoreRank = "Rookie Adventurer";
		else this.state.playerScoreRank = "Beginner";

		if(score >= CONSTANTS.WINNING_SCORE) {

			this.state.gameWon = true;

			if(!this.state.winMessageDisplayed) {

				this.output(GAME_STRINGS.ALL_TREASURES_IN_CASE);

				this.state.winMessageDisplayed = true;

				this.items.ancientMap.location = LOCATION.INSIDE_TROPHY_CASE;

				this.passages.house_west_barrow.setOpen();
			}
		}

		this.state.playerScore = score;
	}

	listInventory() {

		let count = 0;
		let weight = 0;

		for(let g of this.objects.values()) {

			if(g.location === LOCATION.PLAYER_INVENTORY) {

				++count;

				weight = weight + g.weight;

				if(count === 1) {
					this.output("You are carrying:", false);
				}

				this.output(`  ${g.capArticleName}${(g.isItem() && g.activated === true) ? " (providing light)" : ""}`, false);
			}

			if(g.location === LOCATION.PLAYER_INVENTORY && g.isContainer() && (g.isOpen() || g.name === "glass bottle")) {

				if(g.inventory.size > 0) {

					let check = false;

					for(let it of g.inventory) {

						if(it.initialPresenceString !== "" && !it.movedFromStart) {

							this.output(it.initialPresenceString, false);
							check = true;
						}

						if(!check) {

							this.output("The " + g.name + " contains:", false);

							for(let it of g.inventory) {

								this.output(it.capArticleName, false);
							}
						}
					}
				}
			}
		}

		if(count === 0) {
			this.output("You are empty-handed.");
		}
	}

	refreshInventories() {

		// refreshing containers
		for(let cont of this.objects.values()) {

			if(cont.inventoryID !== LOCATION.NULL_INVENTORY) {

				cont.inventory.clear();

				for(let item of this.objects.values()) {

					if(item.location === cont.inventoryID) {

						cont.inventory.add(item);
					}
				}
			}
		}

		this.state.playerCarryWeight = 0;

		for(let item of this.objects.values()) {

			if(item.isItem() && item.location === LOCATION.PLAYER_INVENTORY) {

				this.state.playerCarryWeight += item.weight;
			}
		}

		let coffin = this.objects.get("gold coffin");
		let altar = this.world.get(LOCATION.ALTAR);
		let psg = altar.exits.get(ACTION_STRINGS.DOWN);
		if(coffin.location === LOCATION.PLAYER_INVENTORY)
			psg.weightFail = "You haven't a prayer of getting the coffin down there.";
		else
			psg.weightFail = "You can't get down there with what you're carrying.";

	}

	revealGrating() {

		this.state.leafPileMoved = true;
		this.features.grating.altLocations.add(LOCATION.CLEARING_NORTH);
		this.output("In disturbing the pile of leaves, a grating is revealed.");

		this.rooms.clearingNorth.addExit(ACTION_STRINGS.DOWN, this.passages.grating_clearing);
		this.rooms.gratingRoom.setLight();
	}

	skeletonIsDisturbed() {

		this.output(OBJECT_STRINGS.SKELTON_DISTURBED);

		for(let treasure of this.objects.values()) {

			if(treasure.location === LOCATION.PLAYER_INVENTORY && treasure.trophyCaseValue > 0) {

				treasure.location = LOCATION.LAND_OF_THE_DEAD;
			}
		}
	}

	boatCheck() {

		let result = true;

		switch(state.playerAction) {
			case "ATTACK":
			case "CLIMB":
			case "DEFLATE":
			case "TIE":
			case "KICK":
			case "DIG":
			{
				result = false;
			} break;

			case "TAKE":
			{
				if (this.state.directObject.name === "magic boat")
				{
					this.output("You can't take the boat while you're inside it!");
					result = false;
				}
			} break;

			default: {} break;
		}

		if ((this.state.playerActionType === "DIRECT" || this.state.playerActionType === "INDIRECT") && this.state.directObject.location === this.state.playerLocation) {
			result = true;
		}

		if (this.world.get(this.state.playerLocation).bodyOfWater) {
			result = true;
		}

		return result;
	}

	breakEgg() {

		this.items.brokenEgg.location = this.items.egg.location;
		this.items.egg.location = LOCATION.NULL_LOCATION;
		this.items.brokenCanary.location = LOCATION.INSIDE_BROKEN_EGG;
		this.items.brokenEgg.itemOpen = true;

		this.output(OBJECT_STRINGS.INIT_BROKEN_CANARY);
	}

	darknessCheck() {

		this.state.lightActivated = false;
		this.state.playerInDarkness = false;

		let currentRoom = this.world.get(this.state.playerLocation);

		if(!currentRoom.isDark()) return;

		let lightSource1 = this.objects.get("brass lantern");
		let lightSource2 = this.objects.get("torch");
		let lightSource3 = this.objects.get("pair of candles");
		let lightSource4 = this.objects.get("matchbook");

		let lightSources = [lightSource1, lightSource2, lightSource3, lightSource4];

		for(let i = 0; i < lightSources.length; i++) {

			let source = lightSources[i];

			if(!source.activated) continue;

			if(source.location === LOCATION.PLAYER_INVENTORY || source.location === this.state.playerLocation) {

				this.state.lightActivated = true;
			}

			for(let g of this.objects.values()) {

				if(g.isContainer() && g.isOpen() && source.location === g.location) {
					this.state.lightActivated = true;
				}

				if(g.isSurface() && source.location === g.inventoryID) {
					this.state.lightActivated = true;
				}
			}
		}

		this.state.playerInDarkness = !this.state.lightActivated;

		if(!this.state.playerInDarkness) {
			this.state.darknessTurns = 0;
		}
	}

	playerDies() {

		++this.state.playerDeaths;

		for(let g of this.objects.values()) {

			if(g.location === LOCATION.PLAYER_INVENTORY) {
				g.location = OVERWORLD[this.getRandom(OVERWORLD.length)];
			}

			if(g.name === "brass lantern") {
				g.location = LOCATION.LIVING_ROOM;
			}
		}

		if(this.state.playerDeaths % CONSTANTS.MAX_PLAYER_DEATHS === 0 && !this.rooms.alterRoom.firstVisit) {
			this.playerDiesForReal();
		} else {
			this.output(GAME_STRINGS.PLAYER_DIES, false);

			this.state.playerHitPoints = CONSTANTS.MAX_HIT_POINTS;

			let landingSpot = FOREST[this.getRandom(FOREST.length)];

			this.relocatePlayer(landingSpot, false);
		}

		// setup new line
		this.setNewCommand();
	}

	playerDiesForReal() {

		this.state.playerDead = true;

		this.output(GAME_STRINGS.PLAYER_DIES_FOR_REAL, false);
		this.output(GAME_STRINGS.DEAD_LOOK, false);

		this.relocatePlayer(LOCATION.ENTRANCE_TO_HADES, false);

		// setup new line
		this.setNewCommand();
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

		this.state.playerPreviousLocation = this.state.playerLocation;
		this.state.playerLocation = loc;

		let room = this.world.get(loc);

		this.darknessCheck();

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

	loudRoomCheck(input) {

		if(this.state.currentRoom === "loudRoom" && !this.state.loudRoomSolved && !this.state.damWaterLow) {

			if(input === "echo") {

				this.output(MAP_STRINGS.LOUD_ROOM_CHANGE);

				this.state.loudRoomSolved = true;
				++this.state.turns;

				return true;
			}

			let words = this.state.completePlayerInput.trim().split(" ");
			let lastWord = words[words.length - 1];

			this.parseAction();

			switch(this.state.playerAction) {
				case "EAST":
				case "WEST":
				case "UP":
				case "LOOK":

					this.updateGame();
					this.updateScore();

					return true;

				default:

					this.output(`${lastWord} ${lastWord} ...`);

					break;
			}

			return true;
		}

		return false;
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

		// Self object should go here
		this.currentObjects.set("you", this.features.self);
		this.currentObjects.set("me", this.features.self);
		this.currentObjects.set("myself", this.features.self);
		this.currentObjects.set("self", this.features.self);
		this.currentObjects.set("ground", this.features.ground);
		this.currentObjects.set("floor", this.features.ground);
		this.currentObjects.set("air", this.features.air);
		this.currentObjects.set("sky", this.features.air);

		switch(this.state.playerLocation) {
			case "FRIGID_RIVER_1":
			case "FRIGID_RIVER_2":
			case "FRIGID_RIVER_3":
			case "FRIGID_RIVER_4":
			case "FRIGID_RIVER_5":
			case "ON_THE_RAINBOW":
			case "RESERVOIR":
			case "STREAM":
			case "UP_TREE":
			{
				this.currentObjects.delete("ground");
				this.currentObjects.delete("floor");
			} break;

			default: {} break;
		}

		for(let g of this.objects.values()) {

			// Objects i nthe player's location or inventory
			if(g.location === this.state.playerLocation || g.altLocations.has(this.state.playerLocation) || g.playerHasObject()) {

				this.currentObjects.set(g.name, g);

				for(let str of g.altNames) {

					if(this.currentObjects.has(str))
						this.currentObjects.set(str + "_alt", g);
					else
						this.currentObjects.set(str, g);
				}

				this.bottleCheck(g);
			}

			// Items in an open container that is present in the room
			if((g.location === this.state.playerLocation || g.playerHasObject()) && g.isContainer() && g.isOpen()) {

				for(let it of g.inventory) {

					this.currentObjects.set(it.name, it);

					for(let str of it.altNames)
						this.currentObjects.set(str, it);

					this.bottleCheck(it);
				}
			}

			// Items on a surface
			if(g.location === this.state.playerLocation && g.isSurface()) {

				for(let it of g.inventory) {

					this.currentObjects.set(it.name, it);

					for(let str of it.altNames)
						this.currentObjects.set(str, it);

					if(it.isContainer() && it.isOpen()) {

						for(let nestIt of it.inventory) {

							this.currentObjects.set(nestIt.name, nestIt);

							for(let str of nestIt.altNames)
								this.currentObjects.set(str, nestIt);
						}
					}

					this.bottleCheck(it);
				}
			}

			if(g.intangible)
				this.currentObjects.delete(g.name);
		}

		// Special cases

		// This rope tied to the railing
		if(this.state.ropeRailTied && (this.state.playerLocation === "DOME_ROOM" || this.state.playerLocation === "TORCH_ROOM"))
			this.currentObjects.set("rope", this.objects.get("rope"));

		// Items in the shaft basket
		let basket = this.objects.get("basket");

		if((this.state.playerLocation === "SHAFT_ROOM" && !this.state.shaftBasketLowered) || this.state.playerLocation === "DRAFTY_ROOM" && this.state.shaftBasketLowered) {

			for(let it of basket.inventory) {

				this.currentObjects.set(it.name, it);

				for(let str of it.altNames)
					this.currentObjects.set(str, it);

				this.bottleCheck(it);
			}

		} else {

			for(let it of basket.inventory) {

				this.currentObjects.delete(it.name);

				for(let str of it.altNames)
					this.currentObjects.delete(str);
			}
		}

		// Create the list of current object names, which can be sorted
		this.currentObjectNames = [];

		for(let name of this.currentObjects.keys()) {
			this.currentObjectNames.push(name);
		}

		// Bubble sort by length
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

	bottleCheck(obj) {

		if(obj.name === "glass bottle" && this.state.bottleFilled) {

			let water = this.objects.get("quantity of water");

			this.currentObjects.set("water", water);
			this.currentObjects.set("quantity of water", water);
		}
	}

	printDebugInfo() {

		console.log("Debug Info", {
			action: this.state.playerAction,
			actionType: this.state.playerActionType,
			directObject: this.state.directObject,
			previousDirectObject: this.state.previousDirectObject,
			indirectObject: this.state.indirectObject,
			commandLog: this.commandLog,
			randomLog: this.randomLog,
		});
	}

	getMultipleObjects() {

		this.createObjectNameMap();

		if(this.features.hotBell.location === this.state.playerLocation) {
			this.objectNameMap.set("bell", this.features.hotBell);
			this.objectNameMap.set("brass bell", this.features.hotBell);
		}

		if(this.currentObjectNames.includes("useless lantern") && !this.currentObjectNames.includes("brass lantern")) {
			this.objectNameMap.set("lamp", this.items.uselessLantern);
			this.objectNameMap.set("lantern", this.items.uselessLantern);
		}

		if(this.currentObjectNames.includes("guidebook") && !this.currentObjectNames.includes("black book")) {
			this.objectNameMap.set("book", this.items.guidebook);
		}

		let input = this.state.completePlayerInput;
		let checkComma = input.match(/,/);
		let checkAnd = input.match(/\sand\s/);

		let cObj = null;

		if(this.state.playerAction === ACTION_STRINGS.PUT && input.match(/(in|on)\s\w+/)) {

			let res = input.split(/in\s|on\s/)[1];

			for(let [token, obj] of this.objects) {

				if(this.startsWith(token, res)) {
					cObj = obj;
				}

				for(let name of obj.altNames) {
					if(this.startsWith(name, res)) {
						cObj = obj;
					}
				}
			}

			if(cObj === null) {
				this.output("I can't tell what you want to put the objects in or on.");
				return false;
			}

			if(cObj.location !== LOCATION.PLAYER_INVENTORY && cObj.location !== this.state.playerLocation) {
				this.output(`There's no ${cObj.name} here!`);
				return false;
			}

			if(!cObj.isContainer()) {
				this.output("You can't put things in that.");
            	return false;
			}

			this.state.indirectObject = cObj;
			this.state.indirectObjectPhrase = cObj.name;
		}

		// Player is selecting "all", etc.
		if(input.match(/^all|everything/)) {

			if(this.state.playerAction === ACTION_STRINGS.TAKE) {

				for(let obj of this.currentObjects.values()) {
					if(obj.location !== LOCATION.PLAYER_INVENTORY) {
						this.state.multipleObjectList.set(obj.name, obj);
					}
				}
			}

			else if(this.state.playerAction === ACTION_STRINGS.PUT || this.state.playerAction === ACTION_STRINGS.DROP) {

				this.state.multipleObjectList.clear();

				for(let item of this.objects.values()) {

					if(item.location === LOCATION.PLAYER_INVENTORY) {
						this.state.multipleObjectList.set(item.name, item);
					}
				}
			}

			if(input.match(/^all treasures?|treasures?/)) {

				for(let [key, obj] of this.state.multipleObjectList) {

					if(!obj.isItem() || obj.trophyCaseValue === 0) {
						this.state.multipleObjectList.delete(key);
					}
				}
			}

			if(input.match(/except|but/)) {

				let spl = input.split(/\sexcept\s|\sbut\s/)[1];

				spl = spl.replace(/,\s?/g, " ");
				spl = spl.replace(/\sand\s/g, " ");
				spl = spl.replace(/\sor\s/g, " ");

				let foundObject = false;

				while(!this.isEmpty(spl)) {

					foundObject = false;

					for(let [name, obj] of this.objectNameMap) {

						if(this.startsWith(name, spl)) {

							foundObject = true;

							spl = spl.substring(name.length).trim();

							for(let [mKey, mObj] of this.state.multipleObjectList) {

								if(mObj == obj) {
									this.state.multipleObjectList.delete(mKey);
								}

								else {
									this.output("There is no " + name + " here.");
								}
							}
						}
					}

					if(!foundObject) {
						spl = spl.substring(spl.split(" ")[0].length).trim();
					}
				}
			}
		}

		this.removeUnwantedMutiples();

		return true;
	}

	removeUnwantedMutiples() {

		let names = ["air", "altar", "attic table", "basket", "blue button", "boarded window", "broken mirror", "brown button", "current", "door", "engravings", "flood", "floor", "flow", "forest", "gas", "glow", "grating", "ground", "green bubble", "kitchen table", "kitchen window", "machine", "mirror", "mountains", "pedestal", "quantity of water", "rainbow", "red button", "reservoir water", "river water", "sand", "sky", "song bird", "spirits", "stream water", "trap door", "white house", "wooden boards", "wooden door", "wooden railing", "yellow button", "you"];

		for(let name of names) {
			this.state.multipleObjectList.delete(name);
		}
	}

	deleteSaveFromLocalStorage(filename) {

		let strName = filename + "_strings";
		let randName = filename + "_randoms";

		let check1 = localStorage.removeItem(strName);
		let check2 = localStorage.removeItem(randName);

		if(check1 !== null || check2 !== null) {
			localStorage.removeItem(strName);
			localStorage.removeItem(randName);
		}
	}

	restart() {

		this.commandLog = [];
		this.randomLog = [];

		this.state = Object.assign(this.state, this.startingState);
		this.state.playerLocation = LOCATION.WEST_OF_HOUSE;

		this.firstRun = false;

		for(let targetObj of this.objects.values()) {

			let srcObj = this.startingObjects.get(targetObj.name);

			targetObj = Object.assign(targetObj, srcObj);
		}

		for(let room of this.world.values()) {

			room.firstVisit = true;
		}

		this.cmd.reset();

		if(this.firstRun === false) {
			this.cmd.write(cfg.newLine);
			this.cmd.write(GAME_STRINGS.GAME_BEGIN);
			this.cmd.write(cfg.newLine);
			this.firstRun = true;
		}

		this.resetInput();
		this.updateEvents();
		this.updateScore();
		this.refreshInventories();
		this.fillCurrentObjectList();
	}

	getRandom(int) {

		if(this.restoringGame) {

			if(this.randomLog.length < 1) {

				return 0;
			}

			let result = this.randomLog.shift();

			// add back to the end
			this.randomLog.push(result);

			return result;
		}

		else {

			let result = Math.floor(Math.random() * int);

			this.randomLog.push(result);

			return result;
		}
	}
}

export {
	Zork as default
};
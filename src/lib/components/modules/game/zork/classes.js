import {
	CONSTANTS,
	LOCATION,
	SAVE_STATE_NAME,
	LINE_BREAK,
	GAME_STRINGS,
	OBJECT_STRINGS,
	MAP_STRINGS,
	ACTIONS,
	ACTION_STRINGS
} from "./constants";

const noEffect1 = " doesn't seem to work.";
const noEffect2 = " has no effect.";
const noEffect3 = " isn't notably helpful.";
const noEffect = [noEffect1, noEffect2, noEffect3];

class GameObject {

	constructor(game, name, loc) {

		this.game = game;

		this.name = name;
		this.location = loc;
		this.startLocation = loc;
		this.articleName = (this.vowelStart() ? "an " : "a ") + this.name;
		this.capArticleName = (this.vowelStart() ? "An " : "A ") + this.name;
		this.objectType = "";
		this.isWeapon = false;
		this.intangible = false;
		this.inventoryID = LOCATION.NULL_INVENTORY;
		this.movedFromStart = false;
		this.plural = false;

		this.inventory = new Set();
		this.altLocations = new Set();
		this.altNames = new Set();

		this.initialPresenceString = "";
		this.presenceString = "There is " + this.articleName + " here.";

		this.setStrings();
	}

	setStrings() {

		this.answerString = "It is hardly likely that the " + this.name + " is interested.";
		this.blowString = "You can't blow that out.";
		this.boardString = "You have a theory on how to board " + this.articleName + ", perhaps?";
		this.brushString = "If you wish, but heaven only knows why.";
		this.climbString = "You can't do that!";
		this.closeString = "You must tell me how to do that to " + this.articleName + ".";
		this.countString = "You have lost your mind.";
		this.crossString = "You can't cross that!";
		this.deflateString = "Come on, now!";
		this.drinkString = "I don't think that the " + this.name + " would agree with you.";
		this.eatString = "I don't think that the " + this.name + " would agree with you.";
		this.enterString = "You hit your head against the " + this.name + " as you attempt this feat.";
		this.examineString = "There's nothing special about the " + this.name + ".";
		this.extinguishString = "You can't turn that off.";
		this.followString = "You're nuts!";
		this.helloString = "It's a well known fact that only schizophrenics say \"Hello\" to " + this.articleName + ".";
		this.inflateString = "How can you inflate that?";
		this.knockString = "Why knock on " + this.articleName + "?";
		this.launchString = "How exactly do you imagine trying to launch " + this.articleName + "?";
		this.lightString = "You can't turn that on.";
		this.listenString = "The " + this.name + " makes no sound.";
		this.lookInString = "You can't look inside " + this.articleName + ".";
		this.lookOutString = "You can't look out of " + this.articleName + ".";
		this.lookUnderString = "There is nothing but dust there.";
		this.moveString = "Moving the " + this.name + " reveals nothing.";
		this.openString = "You must tell me how to do that to " + this.articleName + ".";
		this.pourString = "How were you planning to pour something which is not a liquid?";
		this.pullString = "";  // game treats this as "move"
		this.readString = "You can't read that!";
		this.removeString = "You can't read that!";
		this.repairString = "This has no effect.";
		this.ringString = "How, exactly, can you ring that?";
		this.searchString = "You find nothing unusual.";
		this.shakeString = "Shaken.";
		this.smellString = "It smells like " + this.articleName + ".";
		this.takeString = "";
		this.talkString = "You can't talk to the " + this.name + "!";
		this.touchString = "";
		this.untieString = "The " + this.name + " cannot be tied, so it cannot be untied!";
		this.wakeString = "The " + this.name + " isn't sleeping.";
		this.wearString = "You can't wear the " + this.name + ".";
		this.windString = "You cannot wind up " + this.articleName + ".";

		// These strings are used for items in the player's inventory.
		this.enterItemString = "That would involve quite a contortion!";
		this.moveItemString = "You aren't an accomplished enough juggler.";

		// These strings have one of three endings randomly added.
		this.kickString = "Kicking the " + this.name;
		this.lowerString = "Playing in this way with the " + this.name;
		this.raiseString = "Playing in this way with the " + this.name;
		this.pushString = "Pushing the " + this.name;
		this.touchString = "Fiddling with the " + this.name;
		this.waveString = "Waving the " + this.name;

		// indirect action objects
		this.attackString = "I've known strange people, but fighting " + this.articleName + "?";
		this.breakString = "";
		this.burnString = "";
		this.cutString = "Strange concept, cutting the " + this.name + "...";
		this.digString = "";
		this.digStringInd = "Digging with " + this.articleName + " is silly.";
		this.fillString = "You may know how to do that, but I don't.";
		this.giveString = "";
		this.lockString = "";
		this.putString = "There's no good surface on the " + this.name + ".";
		this.throwString = "Thrown.";
		this.tieString = "";
		this.turnString = "";
		this.unlockString = "It doesn't seem to work.";

		// Modifications
		switch(this.name) {
			case "small mailbox":
			case "house":
				this.readString = "How does one read " + this.articleName + "?";
				break;
			default:
				break;
		}
	}

	answer() { this.game.output(this.answerString); }
	attack() { this.game.output(this.attackString); }
	blow() { this.game.output(this.blowString); }
	board() { this.game.output(this.boardString); }
	brush() { this.game.output(this.brushString); }
	burn() {

		if(this.game.state.indirectObject.name === "dummy_object") {
			this.game.output("You should say what you want to use.");
		} else {

			switch(this.game.state.indirectObject.name) {
				case "torch":
					this.game.output("You can't burn " + this.articleName + ".");
					break;
				case "matchbook":
					if(!this.game.items.matchbook.activated) {
						this.game.output("With an unlit match?!??");
					} else {
						this.game.output("You can't burn " + this.articleName + ".");
					}
					break;
				case "pair of candles":
					if(!this.game.items.candles.activated) {
						this.game.output("With an unlit pair of candles?!??");
					} else {
						this.game.output("You can't burn " + this.articleName + ".");
					}
					break;
				default:
					this.game.output("With " + this.game.state.indirectObject.articleName + "??!?");
					break;

			}
		}
	}
	breakObject() {
		if(this.game.state.indirectObject.isWeapon) {
			this.game.output("Nice try.");
		} else {
			this.game.output("Trying to destroy the " + this.name + " with " + this.game.state.indirectObject.name + " is futile.");
		}
	}
	climb() { this.game.output(this.climbString); }
	close() { this.game.output(this.closeString); }
	count() { this.game.output(this.countString); }
	cross() { this.game.output(this.crossString); }
	cut() {

		let word = "";
		let weapon = this.game.state.indirectObject.name;

		if(weapon == "elvish sword") word = "swordsmanship";
		else if(weapon == "bloody axe") word = "axesmanship";
		else if(weapon == "stiletto") word = "stilettosmanship";
		else word = "knifesmanship";

		switch(this.game.state.indirectObject.name) {
			case "elvish sword":
			case "nasty knife":
			case "rusty knife":
			case "stiletto":
			case "bloody axe":

				switch(this.name) {
					case "ancient map":
					case "guidebook":
					case "leaflet":
					case "matchbook":
					case "rope":
					case "tan label":
					case "ZORK owner's manual":

						this.game.output("Your skillful " + word + " slices the " + this.name
							+ " into innumerable slivers which blow away.");

						this.location = LOCATION.NULL_LOCATION;

						break;

					case "black book":

						this.game.output(OBJECT_STRINGS.BLACK_BOOK_CUT);
						this.game.playerDies();

						break;

					case "brown sack":

						if(this.items.sack.inventory.length !== 0) {

							this.game.output("The sack is cut open and its contents spill onto the floor.");

							for(let g of this.items.sack.inventory) {
								g.location = this.game.state.playerLocation;
							}
						} else {
							this.game.output("The sack has been cut open and now rendered useless.");
						}

						this.items.sack.location = LOCATION.NULL_LOCATION;

						break;

					case "magic boat":

						if(this.game.state.playerInBoat) {
							this.game.output("Not a bright idea, since you're in it.");
						} else {
							this.game.output("The boat deflates to the sound of hissing, sputtering, and cursing.");
							this.items.puncturedBoat.location = this.items.inflatedBoat.location;
							this.items.inflatedBoat.location = LOCATION.NULL_LOCATION;
							this.items.deflatedBoat.location = LOCATION.NULL_LOCATION;
						}

						break;

					case "painting":

						this.game.output("Congratulations! Unlike the other vandals, who merely stole the artist's masterpieces, "
							+ "you have destroyed one.");
						this.items.painting.location = LOCATION.NULL_LOCATION;
						this.items.ruinedPainting.location = this.game.state.playerLocation;

						break;

					default:

						this.game.output("Strange concept, cutting the " + this.name + "...");

						break;
				}

				break;

			default:

				this.game.output("The \"cutting edge\" of " + this.game.state.indirectObject.articleName + " is hardly adequate.");

				break;
		}
	}
	deflate() { this.game.output(this.deflateString); }
	dig() {
		if(this.game.state.indirectObject.name === "shovel") {
			this.game.output("You can't dig in that!");
		} else {
			this.game.output("Digging with " + this.game.state.indirectObject.articleName + " is silly.");
		}
	}
	drink() { this.game.output(this.drinkString); }
	drop() { this.game.output("You can't drop that."); }
	eat() { this.game.output(this.eatString); }
	enter() {

		if(this.game.state.directObject.name == ("magic boat")) {
			this.board();
		}

		else {

			if(this.isItem()) {
				this.game.output(this.enterItemString);
			}

			else {
				this.game.output(this.enterString);
			}
		}
	}
	examine() { this.game.output(this.examineString); }
	extinguish() { this.game.output(this.extinguishString); }
	fill() { this.game.output(this.fillString); }
	follow() { this.game.output(this.followString); }
	give() {
		this.game.output("You can't give " + this.game.state.indirectObject.articleName + " to "
			+ this.game.state.directObject.articleName + "!");
	}
	greet() { this.game.output(this.helloString); }
	inflate() { this.game.output(this.inflateString); }
	kick() { this.game.output(this.kickString + this.randPhrase()); }
	knock() { this.game.output(this.knockString); }
	launch() { this.game.output(this.launchString); }
	light() { this.game.output(this.lightString); }
	listen() { this.game.output(this.listenString); }
	lock() { this.game.output("You can't lock that."); }
	lookIn() {
		if(this.isContainer()) {
			this.examine();
		} else {
			this.game.output(this.lookInString);
		}
	}
	lookOut() { this.game.output(this.lookOutString); }
	lookUnder() { this.game.output(this.lookUnderString); }
	lower() { this.game.output(this.lowerString + this.randPhrase()); }
	move() { this.game.output(this.moveString); }
	open() { this.game.output(this.openString); }
	pour() { this.game.output(this.pourString); }
	pull() { this.game.output(this.pullString); }
	push() { this.game.output(this.pushString + this.randPhrase()); }
	raise() { this.game.output(this.raiseString + this.randPhrase()); }
	read() { this.game.output(this.readString); }
	remove() { this.game.output(this.removeString); }
	repair() { this.game.output(this.repairString); }
	ring() { this.game.output(this.ringString); }
	search() { this.game.output(this.searchString); }
	shake() { this.game.output(this.shakeString); }
	smell() { this.game.output(this.smellString); }
	take() {
		if(this.takeString === "") {
			this.game.output(GAME_STRINGS.getSarcasticResponse());
		} else {
			this.game.output(this.takeString);
		}
	}
	talk() { this.game.output(this.talkString); }
	throwObject() {

		if(!this.isItem()) {
			this.game.output("You'd have a hard time picking that up, much less throwing it.");
		}

		switch(this.name) {
			default:

				break;
		}
	}
	tie() { this.game.output("You can't tie this " + this.game.state.indirectObject.name + " to that.")}
	touch() { this.game.output(this.touchString + this.randPhrase()); }
	turn() { this.game.output(this.turnString); }
	untie() { this.game.output(this.untieString); }
	wake() { this.game.output(this.wakeString); }
	wave() { this.game.output(this.waveString + this.randPhrase()); }
	wear() { this.game.output(this.wearString); }
	wind() { this.game.output(this.windString); }
	unlock() { this.game.output(this.unlockString); }
	getDescription() {
		if(this.initialPresenceString === "" || this.movedFromStart) {
			this.game.output(this.presenceString);
		} else {
			this.game.output(this.initialPresenceString);
		}
	}
	isActor() { return this.objectType === "ACTOR"; }
	isAlive() { return false; }
	isContainer() { return false; }
	isItem() { return this.objectType === "ITEM"; }
	isFeature() { return this.objectType === "FEATURE"; }
	isOpen() { return false; }
	isSurface() { return this.objectType === "SURFACE"; }
	outputInventory() {}
	playerHasObject() { return this.location === LOCATION.PLAYER_INVENTORY; }
	randPhrase() {

		let i = this.game.getRandom(noEffect.length);

		return noEffect[i];
	}
	tick() {}
	toString() { return this.name; }
	vowelStart() {
		let c = this.name.toLowerCase().charAt(0);

		switch(c) {
			case "a":
			case "e":
			case "i":
			case "o":
			case "u":
				return true;
			default:
				return false;
		}
	}
}

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
	constructor(game, inventory = [], moves = 0, score = 0, currentRoom = "westOfHouse", previousRoom = null, gameIsSaved = false, verbose = false) {

		this.game = game;

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
 *
 */
class Room {

	/**
	 * Room
	 * @param {string}  name The room name
	 * @param {string}  desc The room description
	 * @param {string}  loc	The room location
	 */
	constructor(game, name, desc, loc) {

		this.game = game;

		this.name = name;
		this.description = desc;
		this.roomID = loc;

		this.bodyOfWater = false;
		this.dark = false;
		this.discoverValue = 0;
		this.firstVisit = true;
		this.height = false;
		this.jumpString = "";

		this.exits = new Map();
		this.failMessages = new Map();
		this.failMessages.set(ACTION_STRINGS.LAND, "Can you land if you are already on the land?");
		this.failMessages.set(ACTION_STRINGS.LAUNCH, GAME_STRINGS.LAUNCH_FAIL);
	}

	addExit(act, psg) {
		if(!act || !psg) {
			console.log("AddExit Missing Object", act, psg);
		}
		this.exits.set(act, psg);
	}
	addFailMessage(act, str) { this.failMessages.set(act, str); }
	removeFailMessage(act) { this.failMessages.delete(act); }
	setDark() { this.dark = true; }
	setLight() { this.dark = false; }
	isDark() { return this.dark; }

	exit() {

		// The room has an exit in the player's attempted direction
		if(this.exits.has(this.game.state.playerAction)) {

			let psg = this.exits.get(this.game.state.playerAction);
			let dest = psg.locationA;

			if(this.roomID == psg.locationA) dest = psg.locationB;

			// Passage is open
			if(psg.isOpen()) {

				// Baggage limit check
				if(this.game.state.playerCarryWeight > psg.weightLimit) {

					this.game.output(psg.weightFail);

					return false;
				}

				// Boat checks
				if(this.game.state.playerInBoat && !this.bodyOfWater) {

					if(this.game.world.get(dest).bodyOfWater && this.game.state.playerAction != ACTION_STRINGS.LAUNCH) {

						this.game.output(GAME_STRINGS.LAUNCH_FAIL_2);

						return false;

					} else if(!this.game.world.get(dest).bodyOfWater) {

						this.game.output(GAME_STRINGS.LAUNCH_FAIL_3);

						return false;
					}
				}

				// If the room is dark, and the destination is not the previous room, player dies by grue
				if(this.game.state.playerInDarkness && !this.game.state.playerDead && (dest != this.game.state.playerPreviousLocation)) {

					this.game.output(GAME_STRINGS.GRUE_DEATH_1);
					this.game.state.playerDead = true;

					return false;
				}

				// success
				if(psg.message !== "") {
					this.game.output(psg.message);
				}

				this.game.state.playerPreviousLocation = this.game.state.playerLocation;
				this.game.state.playerLocation = dest;

				return true;
			}

			// Passage exists, but is closed
			else {
				this.game.output(psg.closedFail);
				return false;
			}
		}

		// There is no exit in the direction the player is trying to go.
		else {

			if (this.game.state.playerInDarkness && !this.game.state.playerDead) {
				this.game.output(GAME_STRINGS.GRUE_DEATH_1);
				this.game.playerDies();
			}

			else if (this.failMessages.has(this.game.state.playerAction)) {
				this.game.output(this.failMessages.get(this.game.state.playerAction));
			}

			else {
				this.game.output("You can't go that way.");
			}
		}

		return false;
	}

	getDescription() {

		if (this.game.state.playerDead) {

			if (this.dark) {
				this.game.output(GAME_STRINGS.DEAD_LOOK, false);
			}

			this.game.output(this.description);
			return;
		}

		if (this.game.state.playerInDarkness) {
			this.game.output(GAME_STRINGS.DARKNESS);
			return;
		}

		let result = this.description;

		switch(this.roomID) {
			case "ARAGAIN_FALLS":
			{
				if (this.game.state.rainbowSolid)
					result += "\nA solid rainbow spans the falls.";
			} break;

			case "BEHIND_HOUSE":
			{
				if (this.game.state.houseWindowOpened)
					result = MAP_STRINGS.DESC_BEHIND_HOUSE_WINDOW_OPEN;
			} break;

			case "CLEARING_NORTH":
			{
				if (this.game.state.leafPileMoved && !this.game.state.gratingOpened)
					result += "\nThere is a grating securely fastened into the ground.";

				else if (this.game.state.leafPileMoved && this.game.state.gratingOpened)
					result += "\nThere is an open grating, descending into darkness.";
			} break;

			case "CYCLOPS_ROOM":
			{
				if (this.game.state.cyclopsGone)
					result += "[The east wall, previously solid, now has a cyclops-sized opening in it.]";
			} break;

			case "DAM":
			{
				if (this.game.state.damGatesOpen && this.game.state.damWaterHigh)
					result += MAP_STRINGS.DAM_GATES_OPEN_HIGH;

				if (this.game.state.damGatesOpen && !this.game.state.damWaterHigh)
					result += MAP_STRINGS.DAM_GATES_OPEN_LOW;

				if (!this.game.state.damGatesOpen && this.game.state.damWaterHigh)
					result += MAP_STRINGS.DAM_GATES_CLOSED_HIGH;

				if (!this.game.state.damGatesOpen && !this.game.state.damWaterHigh)
					result += MAP_STRINGS.DAM_GATES_CLOSED_LOW;

				if (this.game.state.yellowButtonPushed)
					result += MAP_STRINGS.DAM_BUBBLE_ON;

				else
					result += MAP_STRINGS.DAM_BUBBLE_OFF;
			} break;

			case "DEEP_CANYON":
			{
				if (this.game.state.waterFalling)
					result = MAP_STRINGS.DESC_DEEP_CANYON_RUSH;

				else if (this.game.state.loudRoomSolved || this.game.state.damWaterLow)
					result = MAP_STRINGS.DESC_DEEP_CANYON_QUIET;

				else
					result = MAP_STRINGS.DESC_DEEP_CANYON_WATER;
			} break;

			case "KITCHEN":
			{
				if (this.game.state.houseWindowOpened)
					result = MAP_STRINGS.DESC_KITCHEN_WINDOW_OPEN;
			} break;

			case "LIVING_ROOM":
			{
				if (this.game.state.cyclopsGone)
					result += ". To the west is a cyclops-shaped opening in an old wooden door, "
						+ "above which is some strange gothic lettering, ";
				else
					result += ", a wooden door with strange gothic lettering to the west, "
						+ "which appears to be nailed shut, ";

				result += "a trophy case, and ";

				if (!this.game.state.carpetMoved)
					result += "a large oriental rug in the center of the room.";

				else if (this.game.state.carpetMoved && this.game.state.trapDoorOpen)
					result += "a rug lying beside an open trap door.";

				else if (this.game.state.carpetMoved && !this.game.state.trapDoorOpen)
					result += "a closed trap door at your feet.";
			} break;

			case "LOUD_ROOM":
			{
				if (this.game.state.waterFalling)
					result = MAP_STRINGS.DESC_LOUD_ROOM_WATER;

				else if (this.game.state.loudRoomSolved || this.game.state.damWaterLow)
					result = MAP_STRINGS.DESC_LOUD_ROOM_QUIET;

				else
					result = MAP_STRINGS.DESC_LOUD_ROOM;
			} break;

			case "MACHINE_ROOM":
			{
				let machine = this.game.objectNameMap.get("machine");
				if (machine.isOpen())
					result += " On the front of the machine is a large lid, which is open.";
				else
					result += " On the front of the machine is a large lid, which is closed.";
			} break;

			case "MIRROR_ROOM_NORTH":
			case "MIRROR_ROOM_SOUTH":
			{
				if (this.game.state.mirrorBroken)
					result += "\nUnfortunately, the mirror has been destroyed by your recklessness.";
			} break;

			case "SHAFT_ROOM":
			case "DRAFTY_ROOM":
			{
				if (this.game.state.shaftBasketLowered)
					result += "\nFrom the chain is suspended a basket.";
				else
					result += "\nAt the end of the chain is a basket.";
			} break;

			default: {} break;
		}

		this.game.output(result);
	}

	getRoomObjects() {

		// refresh inventories
		this.game.refreshInventories();

		if(this.game.state.playerInDarkness && !this.game.state.playerDead) {

			return;
		}

		for(let g of this.game.objects.values()) {

			if(g.location !== this.roomID) continue;

			if(g.isFeature() && g.presenceString !== "") {
				this.game.output(g.presenceString, false);
			}

			if(g.isActor() && g.presenceString !== "" && this.game.state.playerAction === ACTION_STRINGS.LOOK) {
				this.game.output(g.presenceString, false);
			}

			if(g.isItem()) {
				this.game.output(g.getItemDescription(), false);
			}

			g.outputInventory();
		}
	}

	lookAround() {
		this.game.outputLocation(this.name, false);
		this.getDescription();
		this.getRoomObjects();
	}
}

/**
 * Passage
 *  -
 */
class Passage {

	constructor(locA, locB) {

		this.locationA = locA;
		this.locationB = locB;

		this.closedFail = "";
		this.message = "";
		this.passageOpen = true;
		this.weightFail = "";
		this.weightLimit = 1000;
	}

	setOpen() { this.passageOpen = true; }
	setClosed() { this.passageOpen = false; }
	isOpen() { return this.passageOpen; }
}

/**
 * Surface
 */
class Surface extends GameObject {

	constructor(game, name, loc) {

		super(game, name, loc);

		this.objectType = "SURFACE";
		this.capacity = 0;

		// Only for non-moveable objects
		this.altLocations.add(this.location);
	}

	examine() {

		if(this.inventory.size === 0) {
			this.game.output("There's nothing on the " + this.name);
		} else {
			this.game.output("On the " + this.name + " is:");

			for(let it of this.inventory) {
				this.game.output("  " + it.capArticleName);
			}
		}
	}

	outputInventory() {

		if(this.inventory.size > 0) {

			// If none of the items in the container have been moved, print their
			// initial presence strings.

			let initCheck = true;

			for(let item of this.inventory) {
				if(item.movedFromStart) initCheck = false;
			}

			if(!initCheck) this.game.output("Sitting on the " + this.name + " is:", false);

			for(let item of this.inventory) {
				if(initCheck) {
					this.game.output(item.initialPresenceString, false);
				} else {
					this.game.output("\t" + item.capArticleName, false);
				}

				if(item.isContainer()) {
					item.outputInventory();
				}
			}
		}
	}

	put() {

		let it = this.game.state.indirectObject;

		if(this.inventory.size < this.capacity) {

			this.game.output("Done.");

			it.location = this.inventoryID;
		}

		else {
			this.game.output("There's no more room.");
		}
	}

	remove() {

		let it = this.game.state.indirectObject;

		if(this.inventory.has(it)) {

			this.inventory.delete(it);

			it.location = LOCATION.PLAYER_INVENTORY;

			this.game.output("Taken.");
		}

		else {
			this.game.output("There's no " + it.name + " on the " + this.name + ".");
		}
	}
}

/**
 * Container
 */
class Container extends GameObject {

	constructor(game, name, loc) {

		super(game, name, loc);

		this.capacity = 0;
		this.containerOpen = false;
		this.locked = false;
		this.objectType = "CONTAINER";

		// Only for non-moveable objects
		this.altLocations.add(this.location);
	}

	isContainer() { return true; }
	isOpen() { return this.containerOpen; }

	outputInventory() {

		if(this.isOpen() && this.inventory.size > 0) {

			// If none of the items in the container have been moved, print their
			// initial presence strings.

			let initCheck = true;

			for(let item of this.inventory) {
				if(item.movedFromStart || item.initialPresenceString === "") initCheck = false;
			}

			if(!initCheck) this.game.output("The " + this.name + " contains:", false);

			for(let item of this.inventory) {

				if(initCheck && item.initialPresenceString !== "") {
					this.game.output(item.initialPresenceString, false);
				} else {
					this.game.output("\t" + item.capArticleName, false);
				}

				if(item.isContainer()) {
					item.outputInventory();
				}
			}
		}
	}

	close() {

		switch(this.name) {
			case "basket":

				this.game.output("There is no way to close the basket.");

				break;

			case "machine":

				if(this.containerOpen) {
					this.containerOpen = false;
					this.game.output("The lid closes.");
				} else {
					this.game.output("The lid is already closed.");
				}

				break;

			default:

				if(this.containerOpen) {
					this.containerOpen = false;
					this.game.output("Closed.");
				} else {
					this.game.output("It is already closed.");
				}

				break;
		}
	}

	examine() {

		if (this.containerOpen) {
			if (this.inventory.size === 0)
				this.game.output("The " + this.name + " is empty.", false);
			else {
				this.game.output("The " + this.name + " contains:", false);

				for (let it of this.inventory) {
					this.game.output("  " + it.capArticleName);
				}
			}
		}

		else {
			this.game.output("The " + this.name + " is closed.", false);
		}
	}

	lower() {

		switch (this.name) {
			case "basket":
			{
				if (!this.game.state.shaftBasketLowered)
				{
					this.game.state.shaftBasketLowered = true;
					this.location = LOCATION.DRAFTY_ROOM;
					this.altLocations.clear();
					this.altLocations.add(LOCATION.SHAFT_ROOM);
					this.game.output("The basket is lowered to the bottom of the shaft.", false);
				}

				else
					this.game.output(GAME_STRINGS.getHardSarcasm());

			} break;

			default:
			{
				super.lower();
			} break;
		}
	}

	open() {

		switch(this.name) {
			case "machine":

				if(!this.containerOpen) {
					this.containerOpen = true;

					if(this.inventory.size === 1) {
						for(let item of this.inventory) {
							this.game.output("The lid opens, revealing " + this.articleName + ".");
						}
					}

					else {
						this.game.output("The lid opens.");
					}
				}

				else {
					this.game.output("The lid is already open.");
				}

				break;

			default:

				if(this.containerOpen) {
					this.game.output("It is already open.");
				} else {
					this.containerOpen = true;
					if (this.inventory.size === 0)
						this.game.output("Opened.");
					else {
						let str = "Opening the " + this.name + " reveals";

						let i = 0;

						for (let it of this.inventory) {

							let word = it.vowelStart() ? " an " : " a ";
							if (this.inventory.size > 1 && i == this.inventory.size - 1) word = " and" + word;
							str += word;
							str += it.name;
							if (this.inventory.size > 2 && i < this.inventory.size - 1)
								str += ",";
							++i;
						}

						str += ".";

						this.game.output(str);
					}
				}

				break;
		}
	}

	put() {

		if (this.name === "machine" && this.inventory.size > 0) {
			this.game.output("There's no more room.");
			return;
		}

		if (this.containerOpen) {
			let currentWeight = 0;
			for (let it of this.inventory) {
				currentWeight += it.weight;
			}

			let obj = this.game.state.indirectObject;

			if (currentWeight + obj.weight <= this.capacity) {
				this.inventory.add(obj);
				obj.location = this.inventoryID;
				this.game.output("Done.");
			}

			else
				this.game.output("There's no more room.");
		}

		else {
			this.game.output("The " + this.name + " isn't open.");
		}
	}

	raise() {

		switch (this.name) {
			case "basket":
			{
				if (this.game.state.shaftBasketLowered) {
					this.game.state.shaftBasketLowered = false;
					this.location = LOCATION.SHAFT_ROOM;
					this.altLocations.clear();
					this.altLocations.add(LOCATION.DRAFTY_ROOM);
					this.game.output("The basket is raised to the top of the shaft.");
				}

				else
					this.game.output(GAME_STRINGS.getHardSarcasm());

			} break;

			default:
			{
				super.raise();
			} break;
		}
	}

	remove() {

		let it = this.game.state.indirectObject;
		if (this.containerOpen)
		{
			if (this.inventory.has(it))
			{
				this.inventory.delete(it);
				it.location = LOCATION.PLAYER_INVENTORY;
				this.game.output("Taken.");
			}

			else
			{
				this.game.output("There's no " + it.name + " in the " + this.name);
			}
		}

		else
		{
			this.game.output("The " + this.name + " is closed.");
		}
	}
}

export {
	GameObject,
	Player,
	Room,
	Passage,
	Surface,
	Container
};
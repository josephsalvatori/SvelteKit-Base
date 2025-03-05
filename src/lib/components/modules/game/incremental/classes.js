import {
	CONSTANTS,
	ACTION_STRINGS,
	GAME_STRINGS,
	LOCATIONS,
} from "./constants";

class GameObject {

	constructor(game, name, loc) {

		this.game = game;
		this.name = name;
		this.roomID = loc;

		this.startLocation = loc;

		this.articleName;
		this.objectType = "";
		this.inventoryID = LOCATIONS.NULL_INVENTORY;
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

	blow() { this.game.output(this.blowString); }
	burn() {

		if(this.game.state.indirectObject.name === "dummy_object") {
			this.game.output("You should say what you want to use.");
		}

		else {

			switch(this.game.indirectObject.name) {

				default:
					this.game.output("With " + this.game.indirectObject.articleName + "??!?");
					break;
			}
		}
	}
	breakObject() {
		if(this.game.indirectObject.isWeapon) {
			this.game.output("Nice try.");
		} else {
			this.game.output("Trying to destroy the " + this.name + " with " + this.game.indirectObject.name + " is futile.");
		}
	}
	climb() { this.game.output(this.climbString); }
	close() { this.game.output(this.closeString); }
	cross() { this.game.output(this.crossString); }
	cut() { this.game.output(this.cutString); }
	deflate() { this.game.output(this.deflateString); }
	drink() { this.game.output(this.drinkString); }
	eat() { this.game.output(this.eatString); }
	enter() {
		if(this.isItem()) {
			this.game.output(this.enterItemString);
		}

		else {
			this.game.output(this.enterString);
		}
	}
	examine() { this.game.output(this.examineString); }
	extinguish() { this.game.output(this.extinguishString); }
	fill() { this.game.output(this.fillString); }
	inflate() { this.game.output(this.inflateString); }
	kick() { this.game.output(this.kickString); }
	knock() { this.game.output(this.knockString); }
	listen() { this.game.output(this.listenString); }
	lock() { this.game.output(this.lockString); }
	lookIn() {
		if(this.isContainer()) {
			this.examine();
		} else {
			this.game.output(this.lookInString);
		}
	}
	lookOut() { this.game.output(this.lookOutString); }
	lookUnder() { this.game.output(this.lookUnderString); }
	move() { this.game.output(this.moveString); }
	open() { this.game.output(this.openString); }
	pour() { this.game.output(this.pourString); }
	pull() { this.game.output(this.pullString); }
	push() { this.game.output(this.pushString); }
	read() { this.game.output(this.readString); }
	remove() { this.game.output(this.removeString); }
	repair() { this.game.output(this.repairString); }
	ring() { this.game.output(this.ringString); }
	search() { this.game.output(this.searchString); }
	shake() { this.game.output(this.shakeString); }
	smell() { this.game.output(this.smellString); }
	take() { this.game.output(this.takeString); }
	touch() { this.game.output(this.touchString); }
	turn() { this.game.output(this.turnString); }
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
	playerHasObject() { return this.location === LOCATIONS.PLAYER_INVENTORY; }
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

class Room {

	constructor(game, name, desc, loc) {

		this.game = game;
		this.name = name;
		this.description = desc;
		this.roomID = loc;

		this.dark = false;

		this.exits = new Map();
		this.failMessages = new Map();
	}

	addExit(act, psg) {
		if(!act || !psg) return;
		this.exits.set(act, psg);
	}

	addFailMessage(act, str) { this.failMessages.set(act, str); }
	removeFailMessage(act) { this.failMessages.delete(act); }
	setDark() { this.dark = true; }
	setLight() { this.dark = false; }
	isDark() { return this.dark; }

	exit() {

		// The room has an exit in the player's intended direction
		if(this.exits.has(this.game.playerAction)) {

			let psg = this.exits.get(this.game.playerAction);
			let dest = psg.locationA;

			if(this.roomID === psg.locationA) dest = psg.locationB;

			// passage is open
			if(psg.isOpen()) {

				// other checks here?

				// success
				if(psg.message !== "") {
					this.game.output(psg.message);
				}

				this.game.playerPreviousLocation = this.game.state.playerLocation;
				this.game.state.playerLocation = dest;

				return true;
			}

			// passage exists, but is closed
			else {
				this.game.output(psg.closedFail);
				return false;
			}
		}

		// There is no exit in the direction the player is trying to go.
		else {

			if(this.failMessages.has(this.game.playerAction)) {
				this.game.output(this.failMessages.get(this.game.playerAction));
			}

			else {
				this.game.output("You can't go that way.");
			}
		}

		return false;
	}

	getDescription() {

		let result = this.description;

		switch(this.roomID) {

			default: {} break;
		}

		this.game.output(result);
	}

	getRoomObjects() {


	}

	lookAround() {
		this.game.outputLocation(this.name, false);
		this.getDescription();
		this.getRoomObjects();
	}
}

// These are the openings between rooms, and allow for closed/open states
class Passage {

	constructor(locA, locB) {

		this.locationA = locA;
		this.locationB = locB;

		this.closedFail = "";
		this.message = "";
		this.passageOpen = true;
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

		let it = this.game.indirectObject;

		if(this.inventory.size < this.capacity) {

			this.game.output("Done.");

			it.location = this.inventoryID;
		}

		else {
			this.game.output("There's no more room.");
		}
	}

	remove() {

		let it = this.game.indirectObject;

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

	open() {

		switch(this.name) {
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

		if (this.containerOpen) {

			let obj = this.game.indirectObject;

			this.inventory.add(obj);
			obj.location = this.inventoryID;
			this.game.output("Done.");
		}

		else {
			this.game.output("The " + this.name + " isn't open.");
		}
	}

	remove() {

		let it = this.game.indirectObject;
		if (this.containerOpen) {

			if (this.inventory.has(it)) {
				this.inventory.delete(it);
				it.location = LOCATION.PLAYER_INVENTORY;
				this.game.output("Taken.");
			}

			else {
				this.game.output("There's no " + it.name + " in the " + this.name);
			}
		}

		else {
			this.game.output("The " + this.name + " is closed.");
		}
	}
}

class Item extends GameObject {

	constructor(game, name, loc) {

		super(game, name, loc);

		this.objectType = "ITEM";

		this.acquired = false;
		this.activated = false;
		this.locked = false;
		this.itemOpen = false;
	}

	blow() {
		switch(this.name) {
			default:
				super.blow();
				break;
		}
	}

	breakObject() {
		switch(this.name) {
			default:
				super.breakObject();
				break;
		}
	}

	burn() {
		switch(this.name) {
			default:
				super.burn();
				break;
		}
	}

	close() {

		if(!this.isContainer()) {
			this.game.output(this.closeString);
			return;
		}

		if(this.itemOpen) {
			this.itemOpen = false;
			this.game.output("Closed.");
			return;
		}

		this.game.output("It is already closed.");
	}

	deflate() {
		switch(this.name) {
			default:
				super.deflate();
				break;
		}
	}

	drink() {
		switch(this.name) {
			default:
				super.drink();
				break;
		}
	}

	eat() {
		switch(this.name) {
			default:
				super.eat();
				break;
		}
	}

	examine() {
		switch(this.name) {
			default:
				super.examine();
				break;
		}
	}

	extinguish() {
		switch(this.name) {
			default:
				super.extinguish();
				break;
		}
	}

	fill() {
		switch(this.name) {
			default:
				super.fill();
				break;
		}
	}

	inflate() {
		switch(this.name) {
			default:
				super.inflate();
				break;
		}
	}

	light() {
		switch(this.name) {
			default:
				super.light();
				break;
		}
	}

	move() {
		switch(this.name) {
			default:
				super.move();
				break;
		}
	}

	open() {
		switch(this.name) {
			default:
				super.open();
				break;
		}
	}
}

class Feature extends GameObject {

	constructor(game, name, loc) {

		super(game, name, loc);

		this.objectType = "FEATURE";
		this.presenceString = "";

		// Only for non-moveable objects
		this.altLocations.add(this.location);
	}

	attack() {

		switch(this.name) {
			default: { super.attack(); } break;
		}
	}

	breakObject() {

		switch(this.name) {
			default: { super.breakObject(); } break;
		}
	}

	climb() {

		switch(this.name) {
			default: { super.climb(); } break;
		}
	}

	close() {

		switch(this.name) {
			default: { super.close(); } break;
		}
	}

	drink() {

		switch(this.name) {
			default: { super.drink(); } break;
		}
	}

	enter() {

		switch(this.name) {
			default: { super.enter(); } break;
		}
	}

	kick() {

		switch(this.name) {
			default: { super.kick(); } break;
		}
	}

	lookIn() {

		switch(this.name) {
			default: { super.lookIn(); } break;
		}
	}

	lookOut() {

		switch(this.name) {
			default: { super.lookOut(); } break;
		}
	}

	move() {

		switch(this.name) {
			default: { super.move(); } break;
		}
	}

	open() {

		switch(this.name) {
			default: { super.open(); } break;
		}
	}

	pour() {

		switch(this.name) {
			default: { super.pour(); } break;
		}
	}

	put() {

		switch(this.name) {
			default: { super.put(); } break;
		}
	}

	shake() {

		switch(this.name) {
			default: { super.shake(); } break;
		}
	}

	take() {

		switch(this.name) {
			default: { super.take(); } break;
		}
	}

	touch() {

		switch(this.name) {
			default: { super.touch(); } break;
		}
	}

	turn() {

		switch(this.name) {
			default: { super.turn(); } break;
		}
	}

	unlock() {

		switch(this.name) {
			default: { super.unlock(); } break;
		}
	}

	pour() {
		switch(this.name) {
			default:
				super.pour();
				break;
		}
	}

	put() {

		if(!this.isContainer()) {

			this.game.output(this.putString);

			return;
		}

		if(this.itemOpen) {

			let obj = this.game.indirectObject;

			this.inventory.add(obj);
			obj.location = this.inventoryID;
			this.game.output("Done.");
		}

		else {
			this.game.output("The " + this.name + "isn't open.");
		}
	}

	read() {
		switch(this.name) {
			default:
				super.read();
				break;
		}
	}

	remove() {
		switch(this.name) {
			default:
				super.remove();
				break;
		}
	}

	repair() {
		switch(this.name) {
			default:
				super.repair();
				break;
		}
	}

	take() {

		if(this.location === LOCATIONS.PLAYER_INVENTORY) {
			this.game.output("You're already carrying the " + this.name + "!");
			return;
		}

		switch(this.name) {
			default:
				break;
		}

		this.location = LOCATIONS.PLAYER_INVENTORY;
		this.acquired = true;
		this.movedFromStart = true;

		this.game.output("Taken.");
	}

	wind() {
		switch(this.name) {
			default:
				super.wind();
				break;
		}
	}

	getItemDescription() {

		if(this.movedFromStart || this.initialPresenceString === "") {
			return this.presenceString;
		}

		return this.initialPresenceString;
	}

	isContainer() { return this.inventoryID !== LOCATIONS.NULL_INVENTORY; }

	outputInventory() {

		if(this.isContainer() && this.isOpen() && this.inventory.size > 0) {

			let initCheck = true;

			for(let item of this.inventory) {
				if(item.movedFromStart || item.initialPresenceString === "") {
					initCheck = false;
				}
			}

			if(!initCheck) {
				this.game.output("The " + this.name + " contains:");
			}

			for(let item of this.inventory) {

				if(initCheck) {
					this.game.output(item.initialPresenceString);
				}

				else {
					this.game.output(cfg.tab + item.capArticleName);
				}

				if(item.isContainer()) {
					item.outputInventory();
				}
			}
		}
	}

	isOpen() { return this.itemOpen; }
	tick() { --this.lifespan; }
}

export {
	GameObject,
	Container,
	Item,
	Feature,
	Room,
	Passage,
	Surface,
};
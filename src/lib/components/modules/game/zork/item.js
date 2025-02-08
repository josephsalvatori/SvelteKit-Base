import { GameObject } from "./classes";
import {
	ACTIONS,
	CONSTANTS,
	ACTION_STRINGS,
	GAME_STRINGS,
	OBJECT_STRINGS,
	MAP_STRINGS,
	LOCATION,
	COAL_MINE
} from "./constants";
import { cfg } from "$lib/helpers/terminal";

/**
 * Item model
 */
class Item extends GameObject {

	constructor(game, name, loc) {

		super(game, name, loc);

		this.objectType = "ITEM";

		this.acquired = false;
		this.acquireValue = 0;
		this.activated = false;
		this.capacity = 0;
		this.lifespan = 0;
		this.locked = false;
		this.itemOpen = false;
		this.trophyCaseValue = 0;
		this.weight = 0;
	}

	blow() {
		switch(this.name) {
			case "matchbook":
			case "pair of candles":
				this.extinguish();
				break;
			default:
				super.blow();
				break;
		}
	}

	board() {
		switch(this.name) {
			case "magic boat":
				let weapon1 = this.game.objects.get("elvish sword");
				let weapon2 = this.game.objects.get("nasty knife");
				let weapon3 = this.game.objects.get("rusty knife");
				let weapon4 = this.game.objects.get("stiletto");
				let weapon5 = this.game.objects.get("sceptre");
				let weapon6 = this.game.objects.get("bloody axe");

				let sharpies = [weapon1, weapon2, weapon3, weapon4, weapon5, weapon6];

				for(let i = 0; i < sharpies.length; ++i) {

					if(sharpies[i].location === LOCATION.PLAYER_INVENTORY) {
						this.game.output(OBJECT_STRINGS.BOAT_PUNCTURE);
						this.location = LOCATION.NULL_LOCATION;
						let badBoat = this.game.objects.get("punctured boat");
						let label = this.game.objects.get("tan label");
						label.location = LOCATION.NULL_LOCATION;
						badBoat.location = this.game.state.playerLocation;
					}
				}

				if(this.game.state.playerInBoat && this.location === this.game.state.playerLocation) {

					this.game.output("You are now inside the boat.");
					this.game.state.playerInBoat = true;
				}

				else if(!this.game.state.playerInBoat && this.location === LOCATION.PLAYER_INVENTORY) {
					this.game.output("You should put the boat down first.");
				}

				else if(this.game.state.playerInBoat) {
					this.game.output("You are already in the boat.");
				}

				break;
			default:
				super.board();
				break;
		}
	}

	breakObject() {
		switch(this.name) {
			case "golden clockwork canary":
				this.game.output(
					`You briefly consider breaking the canary, but then remember${cfg.newLine}` +
					`all the trouble you went through to acquire it, and changed your mind.`
				);
				break;
			case "glass bottle":
				if(this.game.state.indirectObject.name === "elvish sword") {

					this.game.output("A brilliant maneuver destroys the bottle.");

					if(this.game.state.bottleFilled) {
						this.game.output("The water spills to the floor and evaporates");
					}

					this.location = LOCATION.NULL_LOCATION;
				}

				else {
					super.breakObject();
				}

				break;
			case "jewel-encrusted egg":

				switch(this.game.state.indirectObject.name) {
					case "altar":
					case "bloody axe":
					case "brass bell":
					case "brass lantern":
					case "broken timber":
					case "crystal skull":
					case "crystal trident":
					case "elvish sword":
					case "glass bottle":
					case "gold coffin":
					case "ground":
					case "jade figurine":
					case "nasty knife":
					case "pedestal":
					case "platinum bar":
					case "rusty knife":
					case "sceptre":
					case "screwdriver":
					case "shovel":
					case "stiletto":
					case "trunk of jewels":
					case "useless lantern":
					case "white house":
					case "wrench":
						this.game.output(
							`Your rather indelicate handling of the egg has caused it some damage,${cfg.newLine}` +
							`although you have succeeded in opening it.`
						);
						this.game.breakEgg();
						break;
					default:
						super.breakObject();
						break;
				}

				break;
			case "painting":
				switch(this.game.state.indirectObject.name) {
					case "elvish sword":
					case "bloody axe":
					case "nasty knife":
					case "rusty knife":
					case "stiletto":
					case "sceptre":
						this.game.output(
							`Congratulations! Unlike the other vandals, who merely stole the artist's masterpiece${cfg.newLine}` +
							`you have destroyed one.`
						);
						this.game.items.painting.location = LOCATION.NULL_LOCATION;
						this.game.items.ruinedPainting.location = this.game.state.playerLocation;
						break;
					default:
						super.breakObject();
						break;
				}

				break;
			default:
				super.breakObject();
				break;
		}
	}

	burn() {
		switch(this.game.state.indirectObject.name) {
			case "torch":
			case "pair of candles":
			case "matchbook":
				if(!this.game.state.indirectObject.activated) {
					super.burn();
					return;
				}
				break;
			default:
				super.burn();
				return;
		}

		switch(this.name) {
			case "leaflet":
			case "painting":
			case "ruined painting":
			case "ancient map":
			case "tan label":
			case "guidebook":
			case "bird's nest":
			case "pile of leaves":
			case "lunch":
			case "matchbook":
			case "brown sack":
			case "ZORK owner's manual":

				if(this.location === LOCATION.PLAYER_INVENTORY) {
					this.game.output("The " + this.name + " catches fire. Unfortunately, you were holding it at the time.");
					this.game.playerDies();
				}

				else {
					this.game.output("THe " + this.name + " catches fire and is consumed.");
				}

				this.location = LOCATION.NULL_LOCATION;

				break;
			case "black book":
				this.game.output(
					`A booming void says "${cfg.formats.italic}Wrong, cretin!${cfg.formats.reset}" and you notice that you have been turned${cfg.newLine}` +
					`into a pile of dust. How, I can't imagine.`
				);
				this.location = LOCATION.ON_ALTAR;
				this.game.playerDies();
				break;
			case "small pile of coal":
				this.game.output(
					`The small pile of coal catches fire and is consumed, dramatically${cfg.newLine}` +
					`and unnecessarily increasing your carbon footprint. Well done.`
				);
				this.location = LOCATION.NULL_LOCATION;
				break;
			case "clove of garlic":
				this.game.output("A pleasent aroma briefly fills the air before the garlic catches fire and is consumed.");
				this.location = LOCATION.NULL_LOCATION;
				break;
			case "pair of candles":
				if(this.game.items.candles.activated) {
					this.game.output("You realize, just in time, that the candles are already lit.");
					break;
				}

				this.game.output("The heat from the torch is so intense taht the candles are vaporized.");
				this.location = NULL_LOCATION;
				break;
			default:
				super.burn();
				break;
		}
	}

	close() {
		if(this.name === "magic boat") {
			this.game.output("You cannot close the boat.");
			return;
		}

		if(!this.isContainer() && this.name !== "glass bottle") {
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
			case "magic boat":
				if(this.game.state.playerInBoat) {
					this.game.output("You can't deflate the boat while you're inside it!");
					break;
				}

				let downBoat = this.game.objects.get("pile of plastic");
				downBoat.location = this.location;
				this.location = LOCATION.NULL_LOCATION;
				this.game.output("The boat deflates.");
				break;
			case "pile of plastic":
				this.game.output(GAME_STRINGS.getHardSarcasm());
				break;
			case "punctured boat":
				this.game.output("Too late. Some moron punctured it.");
				break;
			default:
				super.deflate();
				break;
		}
	}

	drink() {
		if(this.name === "quantity of water") {
			let bottle = this.game.objects.get("glass bottle");

			if(!bottle.isOpen) {
				this.game.output("The bottle is closed.");
				return;
			}

			this.game.output("Thank you very much. I was rather thirsty (from all this talking, probably.)");
			this.location = LOCATION.NULL_LOCATION;
			this.game.state.bottleFilled = false;
			return;
		}

		super.drink();
	}

	drop() {

		if(this.game.state.playerLocation === LOCATION.UP_TREE) {

			this.game.state.playerCarryWeight -= this.weight;

			if(this.name === "jewel-encrusted egg") {
				this.game.output("The egg falls to the ground and springs open, seriously damaged.");
				this.game.breakEgg();
				this.game.items.brokenEgg.location = LOCATION.FOREST_PATH;
			}

			else if(this.name === "bird's nest") {

				if(this.game.items.egg.location === LOCATION.INSIDE_BIRDS_NEST) {
					this.game.output("The nest falls to the ground, and the egg spills out of it, seriously damaged.");
					this.game.breakEgg();
					this.game.items.brokenEgg.location = LOCATION.FOREST_PATH;
				}

				else {
					this.game.output("The bird's nest falls to the ground.");
				}

				this.location = LOCATION.FOREST_PATH;
			}

			else {
				this.game.output("The " + this.name + " falls to the ground.");
				this.location = LOCATION.FOREST_PATH;
			}
		}

		else {
			this.game.state.playerCarryWeight -= this.weight;
			this.location = this.game.state.playerLocation;
			this.game.output("Dropped.");
		}
	}

	eat() {
		switch(this.name) {
			case "clove of garlic":
				this.location = LOCATION.NULL_LOCATION;
				this.game.output(OBJECT_STRINGS.GARLIC_EAT);

				if(this.game.playerLocation === LOCATION.BAT_ROOM) {
					this.game.output(
						`The bat, no longer deterred, swoops down at you!${cfg.newLine}` +
						`${cfg.tab}${cfg.formats.italic}Fweep!${cfg.newLine}${cfg.tab + cfg.tab}Fweep!${cfg.tab + cfg.tab + cfg.tab}Fweep!${cfg.formats.reset}${cfg.newLine}` +
						`The bat grabs you by the scruff of your neck and lifts you away...`
					);
					let dieRoll = this.game.getRandom(COAL_MINE.length);
					this.game.relocatePlayer(COAL_MINE[dieRoll]);
				}

				break;
			case "lunch":
				this.location = LOCATION.NULL_LOCATION;
				this.game.output(OBJECT_STRINGS.LUNCH_EAT);
				break;
			default:
				super.eat();
				break;
		}
	}

	examine() {

		if(!this.isContainer()) {
			this.game.output(this.examineString);
			return;
		}

		if(this.itemOpen) {

			if(this.inventory.size == 0) {
				this.game.output("The " + this.name + " is empty.");
			}

			else {
				this.game.output("The " + this.name + " contains:");

				for(let it of this.inventory) {
					this.game.output("  " + it.capArticleName);
				}
			}
		}

		else {
			this.game.output("The " + this.name + " is closed");
		}
	}

	extinguish() {
		switch(this.name) {
			case "brass lantern":

				if(this.activated) {
					this.activated = false;
					this.game.output("The brass lantern is now off.")
					this.examineString = "The lamp is off";
					this.game.darknessCheck();

					if(this.game.state.playerInDarkness) {
						this.game.output("It is now pitch black.");
					}
				}

				else {
					this.game.output("It is already off.");
				}

				break;
			case "matchbook":

				this.game.items.matchbook.activated = false;
				this.game.output("The match is out.");

				break;
			case "pair of candles":

				if(this.activated) {
					this.activated = false;
					this.game.output("The candles have been put out.");
					this.examineString = "The candles are unlit.";
					this.game.darknessCheck();

					if(this.game.state.playerInDarkness) {
						this.game.output("It is now pitch black.");
					}
				}

				break;
			default:
				this.game.output(this.extinguishString);
				break;
		}
	}

	fill() {
		switch(this.name) {
			case "glass bottle":

				if(this.game.state.bottleFilled) {
					this.game.output("It is already full of water.");
				}

				else if(this.game.state.indirectObject.name === "river water" || this.game.state.indirectObject.name === "reservoir water" || this.game.state.indirectObject.name === "stream water") {

					if(this.itemOpen) {
						this.game.state.bottleFilled = true;
						this.game.output("The bottle is now filled with water.");
					}

					else {
						this.game.output("The bottle is closed.");
					}
				}

				else {
					this.game.output("You can't put that in the glass bottle!");
				}

				break;
			default:
				super.fill();
				break;
		}
	}

	inflate() {
		switch(this.name) {
			case "pile of plastic":

				if(this.game.state.indirectObject.name === "hand-held air pump") {
					this.game.output("The boat inflates and appears seaworthy. [A tan label is lying inside the boat.]");
					this.location = LOCATION.NULL_LOCATION;
					let goodBoat = this.game.objects.get("magic boat");
					goodBoat.location = this.game.state.playerLocation;
					let label = this.game.objects.get("tan label");
					label.location = LOCATION.INSIDE_BOAT;
				}

				else {
					this.game.output("With " + this.game.state.indirectObject.articleName + "? Surely you jest!");
				}

				break;
			case "magic boat":
				this.game.output("Inflating it further would probably burst it.");
				break;
			case "punctured boat":
				this.game.output("Too late. Some moron punctured it.");
				break;
			default:
				super.inflate();
				break;
		}
	}

	launch() {
		switch(this.name) {
			case "magic boat":

				if(this.game.state.playerInBoat) {

					let room = this.game.world.get(this.game.state.playerLocation);

					if(room.exit(ACTION_STRINGS.LAUNCH)) {

						let newRoom = this.game.world.get(this.game.state.playerLocation);

						this.game.outputLocation(newRoom.name);

						newRoom.lookAround();
					}
				}

				else {
					this.game.output("You have to be inside the boat before you can launch it.");
				}

				break;
			default:
				super.launch();
				break;
		}
	}

	light() {
		switch(this.name) {
			case "brass lantern":

				if(!this.activated && this.lifespan > 0) {
					this.activated = true;
					this.game.state.lightActivated = true;
					this.game.output("The brass lantern is now on.");

					let rm = this.game.world.get(this.game.state.playerLocation);
					if(rm.isDark()) {
						this.game.darknessCheck();
						rm.lookAround();
					}

					this.examineString = "The lamp is on.";
				}

				else if(!this.activated && this.lifespan < 0) {
					this.game.output("A burned-out lamp won't light.");
				}

				else {
					this.game.output("It is already on.");
				}

				break;
			case "matchbook":

				if(!this.activated && this.game.state.matchCount > 0) {

					if(this.game.state.playerLocation === LOCATION.DRAFTY_ROOM) {

						this.game.output("The room is drafty, and the match goes out instantly.");
						--this.game.state.matchCount;
					}

					else if(this.game.state.playerLocation === LOCATION.GAS_ROOM) {

						this.game.output(
							`How sad for an aspiring adventurer to light a match in a room${cfg.newLine}` +
							`which reeks of gas. Fortunately, there is justice in the world.${cfg.newLine}` +
							`${cfg.tab}${cfg.colors.redBold}${cfg.formats.italic}**BOOOOOOOOOOOM**${cfg.colors.reset}`
						);
					}

					else {

						this.game.output("One of the matches begins to burn.");
						this.activated = true;
						--this.game.state.matchCount;
						this.lifespan = CONSTANTS.MATCH_LIFESPAN;
					}
				}

				else if(this.game.state.matchCount <= 0) {
					this.game.output("There are no matches left in the matchbook.");
				}

				else if(this.activated) {
					this.game.output("You already have a lit match.");
				}

				break;
			case "pair of candles":

				if(this.game.state.indirectObject.name === "dummy_object") {
					this.game.output("You should say what to light them with.");
					return;
				}

				if(this.game.state.indirectObject.name === "matchbook") {

					let match = this.game.state.indirectObject;

					if(match.activated) {

						if(!this.activated) {

							this.game.output("The candles are lit.");
							this.activated = true;
						}

						else {
							this.game.output("The candles are already lit.");
						}
					}
				}

				else {
					output("With an unlit match??!?");
				}

				break;
			default:
				this.game.output(this.lightString);
				break;
		}
	}

	move() {
		switch(this.name) {
			case "pile of leaves":

				this.game.output("Done.");

				if(!this.game.state.leafPileMoved) {
					this.game.revealGrating();
				}

				else {
					this.game.output("Moving the pile of leaves reveals nothing.");
				}

				break;
			default:
				super.move();
				break;
		}
	}

	open() {
		switch(this.name) {
			case "glass bottle":

				if(this.itemOpen) {
					this.game.output("The bottle is already open.");
				}

				else {
					this.itemOpen = true;
					this.game.output("Opened.");
				}

				break;
			case "jewel-encrusted egg":

				if(!this.game.state.thiefOpenedEgg) {
					this.game.output("You have neither the tools nor the expertise.");
				}

				break;
			default:

				if(!this.isContainer()) {
					this.game.output(this.openString);
					return;
				}

				else if(this.itemOpen) {
					this.game.output("It is already open.");
					return;
				}

				else {

					this.itemOpen = true;

					if(this.inventory.size === 0) {
						this.game.output("Opened.");
					}

					else {

						let str = "Opening the " + this.name + " reveals ";

						let i = 0;

						for(let it of this.inventory) {

							if(this.inventory.size > 1 && i === this.inventory.size - 1) str += " and ";

							str += it.articleName;

							if(this.inventory.size > 2 && i < this.inventory.size - 1) str += ", ";

							++i;
						}

						str += ".";

						this.game.output(str);
					}
				}

				break;
		}
	}

	pour() {
		switch(this.name) {
			// TODO: Should there be pourable items?
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

			let currentWeight = 0;

			for(let it of this.inventory) {
				this.currentWeight += it.weight;
			}

			let obj = this.game.state.indirectObject;

			if(currentWeight + obj.weight <= this.capacity) {

				this.inventory.add(obj);
				obj.location = this.inventoryID;
				this.game.output("Done.");
			}

			else {
				this.game.output("There's no more room.");
			}
		}

		else {
			this.game.output("The " + this.name + "isn't open.");
		}
	}

	read() {
		switch(this.name) {
			case "black book":

				if(this.game.state.playerLocation === LOCATION.ENTRANCE_TO_HADES && !this.game.state.spiritsBanished && this.game.state.spiritsBellRung && this.game.state.spiritsCandlesLit) {

					this.game.output(OBJECT_STRINGS.BLACK_BOOK_READ_SPIRITS);
					this.game.state.spiritsBanished = true;

					let hades = this.game.world.get(LOCATION.ENTRANCE_TO_HADES);
					let psg = hades.exits.get(ACTION_STRINGS.SOUTH);

					psg.setOpen();

					let spirits = this.game.objects.get("spirits");

					spirits.location = LOCATION.NULL_LOCATION;
					spirits.alive = false;
				}

				else {
					this.game.output(GAME_STRINGS.BLACK_BOOK_TEXT);
				}

				break;
			default:
				super.read();
				break;
		}
	}

	remove() {

		let it = this.game.state.indirectObject;

		if(!this.isContainer()) {
			this.game.output("You can't remove that from the " + this.name);
			return;
		}

		if(this.itemOpen) {

			if(this.inventory.has(it)) {
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

	repair() {
		switch(this.name) {
			case "punctured boat":

				if(this.game.state.indirectObject.name === "viscous material") {

					let goodBoat = this.game.objects.get("magic boat");
					let gunk = this.game.state.indirectObject;

					goodBoat.location = this.location;

					this.location = LOCATION.NULL_LOCATION;
					gunk.location = LOCATION.NULL_LOCATION;

					this.game.output("Well done. The boat is repaired.");
				}

				else {
					this.game.output("The isn't going to work.");
				}

				break;
			default:
				super.repair();
				break;
		}
	}

	ring() {
		switch(this.name) {
			case "brass bell":

				if(this.game.state.playerLocation === LOCATION.ENTRANCE_TO_HADES && !this.game.state.spiritsBanished) {

					this.game.output(OBJECT_STRINGS.BELL_RING_SPIRITS);
					this.game.state.spiritsBellRung = true;
					this.location = LOCATION.NULL_LOCATION;

					let hotbell = this.game.objects.get("red hot brass bell");
					hotbell.location = LOCATION.ENTRANCE_TO_HADES;
					this.game.state.spiritCeremonyCount = CONSTANTS.SPIRIT_CEREMONY_LENGTH;

					let candles = this.game.objects.get("pair of candles");

					if(candles.location === LOCATION.PLAYER_INVENTORY) {
						candles.activated = false;
						candles.loation = LOCATION.ENTRANCE_TO_HADES;
						this.game.output(OBJECT_STRINGS.CANDLES_FALL_SPIRITS);
					}
				}

				else {
					this.game.output(this.ringString);
				}

				break;
			default:
				super.ring();
				break;
		}
	}

	take() {

		if(this.location === LOCATION.PLAYER_INVENTORY) {
			this.game.output("You're already carrying the " + this.name + "!");
			return;
		}

		if(this.location === LOCATION.INSIDE_BASKET && this.game.state.playerLocation === LOCATION.DRAFTY_ROOM && !this.game.state.shaftBasketUsed) {
			this.game.state.shaftBasketUsed = true;
		}

		switch(this.name) {
			case "pile of leaves":

				if(!this.game.state.leafPileMoved) {
					this.game.revealGrating();
				}

				break;
			case "rope":

				if(this.game.state.ropeRailTied) {
					this.untie();
					return;
				}

				break;
			case "rusty knife":

				if(this.game.items.sword.location === LOCATION.PLAYER_INVENTORY) {
					this.game.output(OBJECT_STRINGS.RUSTY_KNIFE_TAKE);
				}

				break;
			case "small piece of vitreous slag":

				this.game.output(OBJECT_STRINGS.SLAG_CRUMBLE);
				this.location = LOCATION.NULL_LOCATION;
				return;
			default:
				break;
		}

		if((this.game.state.playerCarryWeight + this.weight) >= CONSTANTS.CARRY_WEIGHT_LIMIT) {
			this.game.output(GAME_STRINGS.OVERBURDENED);
			return;
		}

		this.game.state.playerCarryWeight += this.weight;
		this.location = LOCATION.PLAYER_INVENTORY;
		this.acquired = true;
		this.movedFromStart = true;

		this.game.output("Taken.");
	}

	throwObject() {

		switch(this.game.state.indirectObject.name) {
			case "river water":

				switch(this.name) {
					case "ancient map":
					case "bird's nest":
					case "black book":
					case "brown sack":
					case "clove of garlic":
					case "glass bottle":
					case "guidebook":
					case "leaflet":
					case "matchbook":
					case "tan label":
					case "ZORK owner's manual":
						this.game.output("The " + this.name + " floats for a moment, then sinks.");
						this.location = LOCATION.NULL_LOCATION;
						break;
					case "pile of leaves":
						this.game.output("The leaves float along the water and disperse.");
						this.location = LOCATION.NULL_LOCATION;
						break;
					case "red bouy":
						this.game.output("The bouy bobbles out onto the water.");
						this.location = this.game.state.playerLocation;
						break;
					default:
						this.game.output("The " + this.name + " splashes into the water and is gone forever.");
						this.location = LOCATION.NULL_LOCATION;
						break;
				}

				break;
			case "reservoir water":
			case "stream water":

				switch(this.name) {
					case "ancient map":
					case "bird's nest":
					case "black book":
					case "brown sack":
					case "clove of garlic":
					case "glass bottle":
					case "guidebook":
					case "leaflet":
					case "matchbook":
					case "tan label":
					case "ZORK owner's manual":
						this.game.output("The " + this.name + " floats for a moment, then sinks.");
						this.location = LOCATION.RESERVOIR_EMPTY;
						break;
					case "pile of leaves":
						this.game.output("The leaves float along the water and disperse.");
						this.location = LOCATION.NULL_LOCATION;
						break;
					case "red bouy":
						this.game.output("The bouy bobbles out onto the water.");
						this.location = this.game.state.playerLocation;
						break;
					default:
						this.game.output("The " + this.name + " splashes into the water and is gone forever.");
						this.location = LOCATION.RESERVOIR_EMPTY;
						break;
				}

				break;
			case "chasm":
				this.game.output("The " + this.name + " drops out of sight into the chasm.");
				this.location = LOCATION.NULL_LOCATION;
				break;
			default:

				switch(this.name) {
					case "gold coffin":
						this.game.output("You heave the coffin as far as you can manage, which is not very far.");
						this.location = this.game.state.playerLocation;
						break;
					case "glass bottle":
						this.game.output("The bottle hits the far wall and shatters.");
						if(this.game.state.bottleFilled) {
							this.game.output("The water splashes on the walls and evaporates immediately.");
						}
						this.location = LOCATION.NULL_LOCATION;
						break;
					case "jewel-encrusted egg":
						this.game.output(
							`Your rather indelicate handling of the egg has caued it some damange,${cfg.newLine}` +
							`although you have succeeded in opening it.`
						);
						this.game.breakEgg();
						break;
					case "bloody axe":
					case "elvish sword":
					case "nasty knife":
					case "rusty knife":
					case "stiletto":

						switch(this.game.state.indirectObject.name) {
							case "troll":
								this.game.output(
									`The troll, who is remarkably coordinated, catches the${cfg.newLine}` +
									`and eats it hungrily. Poor troll, he dies from an internal hemmorhage${cfg.newLine}` +
									`and his carcass disappears in a sinister black fog.`
								);
								this.location = this.game.state.playerLocation;
								this.game.actors.troll.alive = false;
								this.game.actors.troll.trollDies();
								break;
							case "thief":
								this.game.output(
									`You missed. The thief makes no attempt to take the ${this.name}, though it${cfg.newLine}` +
									`would be a fine addition to the collection in his bag. He does${cfg.newLine}` +
									`seem angered by your attempt.`
								);
								this.game.actors.thief.thiefAggro = true;
								this.location = this.game.state.playerLocation;
								break;
							case "cyclops":
								this.game.output(
									`The cyclops grabs your ${this.name}, tastes it, and throws it${cfg.newLine}` +
									`to the ground in disgust.`
								);
								this.location = this.game.state.playerLocation;
								break;
							case "vampire bat":
								this.game.output(
									`The bat ducks as the ${this.name} flies by and crashes to the ground.`
								);
								this.location = this.game.state.playerLocation;
								break;
							default:
								this.game.output("Throwing a sharp object would be highly disappointing to your first-grade teacher.")
								break;
						}

						break;
					default:

						if(this.game.state.indirectObject.location === LOCATION.PLAYER_INVENTORY) {
							this.game.output("You aren't an accomplished enough juggler.");
							break;
						}

						switch(this.game.state.indirectObject.name) {
							case "air":

								let airString = `The ${this.name} arcs through the air, and `;

								switch(this.game.state.playerLocation) {
									case "FRIDIGE_RIVER_1":
									case "FRIDIGE_RIVER_2":
									case "FRIDIGE_RIVER_3":
									case "FRIDIGE_RIVER_4":
									case "FRIDIGE_RIVER_5":

										airString += "disappears under the flowing water.";
										this.location = LOCATION.NULL_LOCATION;

										break;
									case "RESERVOIR":
									case "STREAM":

										airString += "slips under the water's surface.";
										this.location = LOCATION.RESERVOIR_EMPTY;

										break;
									default:

										airString += "lands unceremoniously on the ground.";
										this.location = this.game.state.playerLocation;

										break;
								}

								this.game.output(airString);

								break;
							case "magic boat":
								this.game.output("Thrown.");
								this.location = LOCATION.INSIDE_BOAT;
								break;
							case "troll":
								this.game.output(
									`The troll, who is remarkably coordinated, catches the ${this.name}${cfg.newLine}` +
									`and not having the most discriminating tastes, gleefully eats it.`
								);
								this.location = LOCATION.NULL_LOCATION;
								break;
							case "thief":
								this.game.output(
									`The thief deftly snatches your ${this.name}${cfg.newLine}` +
									`out of the air and calmly places it in his bag.`
								);
								this.location = LOCATION.THIEF_INVENTORY;
								break;
							case "cyclops":
								this.game.output(
									`The cyclops grabs your ${this.name}, tastes it, and throws it${cfg.newLine}` +
									`to the ground in disgust.`
								);
								this.location = this.game.state.playerLocation;
								break;
							case "vampire bat":
								this.game.output("The bat ducks as the " + this.name + " flies by and crashes to the ground.");
								this.location = this.game.state.playerLocation;
								break;
							default:
								this.game.output("Thrown.");
								this.location = this.game.state.playerLocation;
								break;
						}

						break;
				}

				break;
		}
	}

	untie() {
		switch(this.name) {
			case "rope":

				if(this.game.state.ropeRailTied) {

					if(this.game.state.playerLocation === LOCATION.TORCH_ROOM) {

						this.game.output("You cannot reach the rope.");
					}

					else if(this.game.state.playerLocation === LOCATION.DOME_ROOM) {

						this.game.state.ropeRailTied = false;
						this.game.output("The rope is now untied.");
						this.location = LOCATION.PLAYER_INVENTORY;
					}
				}

				else {
					this.game.output("It is not tied to anything.");
				}

				break;
			default:
				super.untie();
				break;
		}
	}

	wave() {
		switch(this.name) {
			case "sceptre":
				switch(this.game.state.playerLocation) {
					case "END_OF_RAINBOW":
					case "ARAGAIN_FALLS":
					case "ON_THE_RAINBOW":

						if(!this.game.state.rainbowSolid) {
							this.game.state.rainbowSolid = true;
							this.game.state.cyclopsShutsTrapDoor = false;
							this.game.output(OBJECT_STRINGS.SCEPTRE_RAINBOW);
							this.game.passages.rainbow_end.setOpen();
							this.game.passages.falls_rainbow.setOpen();

							if(!this.game.state.potOfGoldAppeared) {
								this.game.state.potOfGoldAppeared = true;
								this.game.output("A shimmering pot of gold appears at the end of the rainbow.");
								this.game.items.pot.location = LOCATION.END_OF_RAINBOW;
							}
						}

						else {
							this.game.state.rainbowSolid = false;
							this.game.passages.rainbow_end.setClosed();
							this.game.passages.falls_rainbow.setClosed();

							if(this.game.state.playerLocation === LOCATION.END_OF_RAINBOW) {
								this.game.output(OBJECT_STRINGS.SCEPTRE_RAINBOW_2);
								this.game.playerDies();
							}

							else {
								this.game.output(OBJECT_STRINGS.SCEPTRE_RAINBOW_1);
							}
						}

						break;
					default:
						this.game.output(this.waveString);
						break;
				}

				break;
			default:
				super.wave();
				break;
		}
	}

	wind() {
		switch(this.name) {
			case "golden clockwork canary":

				if(this.game.actors.songbird.altLocations.has(this.game.state.playerLocation) && this.game.items.bauble.location === LOCATION.NULL_LOCATION) {
					this.game.output(OBJECT_STRINGS.CANARY_WIND_BAUBLE);
					this.game.items.bauble.location = this.game.state.playerLocation;
				}

				else {
					this.game.outupt(OBJECT_STRINGS.CANARY_WIND_GOOD);
				}

				break;
			case "broken clockwork canary":
				this.game.output(OBJECT_STRINGS.CANARY_WIND_BAD);
				break;
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

	isAlive() { return this.lifespan > 0; }
	isContainer() { return this.inventoryID !== LOCATION.NULL_INVENTORY; }

	outputInventory() {

		if(this.name === "glass bottle" && this.game.state.bottleFilled) {

			this.game.output("The glass bottle contains:");
			this.game.output(cfg.tab + "A quantity of water");
		}

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
	Item
};
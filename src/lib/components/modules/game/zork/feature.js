import { GameObject } from "./classes";
import {
	CONSTANTS,
	ACTION_STRINGS,
	GAME_STRINGS,
	OBJECT_STRINGS,
	MAP_STRINGS,
	LOCATION
} from "./constants";

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
			case "you":
			{
				if (this.game.state.indirectObject.name === "you")
					this.game.output("You don't have the you.");

				else if (this.game.state.indirectObject.isWeapon)
				{
					this.game.output("If you insist... Poof, you're dead!");
					this.game.playerDies();
				}

				else
				{
					this.game.output("Suicide is not the answer.");
				}

			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.attack();
			} break;
		}
	}

	breakObject() {

		switch (this.name)
		{
			case "broken mirror":
			{
				this.game.output(this.breakString);
			} break;

			case "mirror":
			{
				if (this.game.state.indirectObject.isWeapon)
				{
					this.game.output(this.breakString);
					this.location = LOCATION.NULL_LOCATION;
					this.altLocations.clear();

					let brokeMirror = this.game.objects.get("broken mirror");
					brokeMirror.location = LOCATION.MIRROR_ROOM_SOUTH;
					brokeMirror.altLocations.add(LOCATION.MIRROR_ROOM_NORTH);
					this.game.state.mirrorBroken = true;
				}
			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.breakObject();
			}
		}
	}

	climb() {

		switch (this.name)
		{
			case "forest":
			{
				if (this.game.state.playerLocation === LOCATION.FOREST_PATH)
				{
					this.game.relocatePlayer(LOCATION.UP_TREE);
				}

				else if (this.game.state.playerLocation === LOCATION.UP_TREE)
				{
					this.game.output("You cannot climb any higher.");
				}

				else
				{
					this.game.output("There is no tree here suitable for climbing.");
				}
			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.climb();
			} break;
		}
	}

	close() {

		switch (this.name)
		{

			case "grating":
			{
				if (!this.game.state.gratingOpened)
				{
					this.game.output(GAME_STRINGS.getHardSarcasm());
				}

				else
				{
					this.game.output("Done.");
					this.game.state.gratingOpened = false;
				}
			} break;

			case "kitchen window":
			{
				if (this.game.state.houseWindowOpened) {
					this.game.output(GAME_STRINGS.WINDOW_CLOSES);
					this.game.state.houseWindowOpened = false;
				}
				else
					this.game.output("The window is already closed.");
			} break;

			case "trap door":
			{
				let r = this.game.world.get(LOCATION.LIVING_ROOM);
				let p = r.exits.get(ACTION_STRINGS.DOWN);
				if (this.game.state.trapDoorOpen)
				{
					this.game.state.trapDoorOpen = false;
					this.game.output("Done.");
					p.setClosed();
				}
				else
				{
					this.game.output(GAME_STRINGS.getHardSarcasm());
				}
			} break;

			default:
			{
				this.game.output(this.closeString);
			} break;
		}
	}

	dig() {

		switch (this.name)
		{
			case "sand":
			{
				if (this.game.state.indirectObject.name === "shovel")
				{
					++this.game.state.sandStage;

					if (this.game.state.sandStage === 1)
					{
						this.game.output("You seem to be digging a hole here.");
					}

					else if (this.game.state.sandStage === 2)
					{
						this.game.output("The hole is getting deeper, but that's about it.");
					}

					else if (this.game.state.sandStage === 3)
					{
						this.game.output("You are surrounded by a wall of sand on all sides.");
					}

					else if (this.game.state.sandStage === 4)
					{
						if (!this.game.state.scarabFound)
						{
							let scarab = this.game.objects.get("beautiful jeweled scarab");
							scarab.location = LOCATION.SANDY_CAVE;
							this.game.output("You can see a scarab here in the sand.");
							this.game.state.scarabFound = true;
						}

						else
							this.game.output("There's no reason to be digging here!");
					}

					else if (this.game.state.sandStage === 5)
					{
						this.game.output("The hole collapses, smothering you.");
						this.game.playerDies();
						this.game.state.sandStage = 0;
						let scarab = this.game.objects.get("beautiful jeweled scarab");
						if (scarab.location === LOCATION.SANDY_CAVE)
						{
							scarab.location = LOCATION.NULL_LOCATION;
							this.game.state.scarabFound = false;
						}

					}
				}

				else
					this.game.output("Digging with " + this.game.state.indirectObject.articleName + " is silly.");
			} break;

			default:
			{
				super.dig();
			} break;
		}
	}

	drink() {

		switch (this.name)
		{
			case "quantity of water":
			{
				let bottle = this.game.objects.get("glass bottle");
				if (bottle.location === LOCATION.PLAYER_INVENTORY && bottle.isOpen())
				{
					this.game.output(OBJECT_STRINGS.WATER_DRINK);
					this.game.state.bottleFilled = false;
				}

				else if (bottle.location === LOCATION.PLAYER_INVENTORY && !bottle.isOpen())
				{
					this.game.output("The bottle is closed.");
				}

				else if (bottle.location !== LOCATION.PLAYER_INVENTORY)
				{
					this.game.output("It's in the bottle. Perhaps you should take that first.");
				}
			} break;

			default:
			{
				super.drink();
			} break;
		}
	}

	enter() {

		switch (this.name) {
			case "white house":
			case "kitchen window":
			{
				if (this.game.state.playerLocation === LOCATION.BEHIND_HOUSE) {
					this.game.state.playerAction = ACTION_STRINGS.WEST;
					this.game.rooms.behindHouse.exit();
				}

				else if (this.game.state.playerLocation === LOCATION.WEST_OF_HOUSE) {
					this.game.state.playerAction = ACTION_STRINGS.EAST;
					this.game.rooms.westOfHouse.exit();
				}

				else {
					super.enter();
				}

			} break;

			default:
			{
				super.enter();
			} break;
		}
	}

	kick() {

		switch (this.name)
		{
			case "gate":
			{
				this.game.output(OBJECT_STRINGS.DEAD_GATE);
			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.kick();
			} break;
		}
	}

	lock() {

		switch (this.name)
		{
			case "grating":
			{
				if (this.game.state.indirectObject.name === "skeleton key")
				{
					if (this.game.state.playerLocation === LOCATION.GRATING_ROOM)
					{
						this.game.output("The grate is locked.");
						this.game.state.gratingUnlocked = false;
					}

					else if (this.game.state.playerLocation === LOCATION.CLEARING_NORTH)
					{
						this.game.output("You can't reach the lock from here.");
					}
				}

				else
				{
					this.game.output("Can you lock a grating with " + this.game.state.indirectObject.articleName + "?");
				}
			} break;

			default:
			{
				super.lock();
			} break;
		}
	}

	lookIn() {

		switch (this.name)
		{
			case "kitchen window":
			{
				if (this.game.state.playerLocation === LOCATION.BEHIND_HOUSE)
					this.game.output(OBJECT_STRINGS.WINDOW_LOOK_IN);
				else
				this.game.output("You are inside.");
			} break;

			default: { super.lookIn(); } break;
		}
	}

	lookOut() {

		switch (this.name)
		{
			case "kitchen window":
			{
				if (this.game.state.playerLocation === LOCATION.KITCHEN)
					this.game.output(OBJECT_STRINGS.WINDOW_LOOK_OUT);
				else
					this.game.output("You are outside.");
			} break;

			default: { super.lookOut(); } break;
		}
	}

	lower() {

		switch (this.name)
		{
			case "gate":
			{
				this.game.output(OBJECT_STRINGS.DEAD_GATE);
			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.lower();
			} break;
		}
	}

	move() {

		switch (this.name)
		{
			case "oriental rug":
			{
				if (!this.game.state.carpetMoved)
				{
					this.game.state.carpetMoved = true;
					this.boardString = OBJECT_STRINGS.CARPET_SIT_2;
					this.lookUnderString = "There is nothing but dust there.";
					let trap = this.game.objects.get("trap door");
					trap.location = LOCATION.LIVING_ROOM;
					trap.altLocations.add(LOCATION.CELLAR);
					this.game.output(GAME_STRINGS.MOVE_RUG);
					let rm = this.game.world.get(LOCATION.LIVING_ROOM);
					let p = rm.exits.get(ACTION_STRINGS.DOWN);
					p.closedFail = "The trap door is closed.";
				}

				else
				{
					this.game.output(GAME_STRINGS.RUG_ALREADY_MOVED);
				}
			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.move();
			} break;
		}
	}

	open() {

		switch (this.name) {
			case "grating":
			{
				if (this.game.state.gratingOpened)
				{
					this.game.output(GAME_STRINGS.getHardSarcasm());
				}

				else
				{
					if (this.game.state.gratingUnlocked)
					{
						this.game.state.gratingOpened = true;

						if (this.game.state.playerLocation === LOCATION.GRATING_ROOM)
						{
							if (!this.game.state.leafPileMoved) {
								this.game.state.leafPileMoved = true;
								this.game.items.leafPile.location = LOCATION.GRATING_ROOM;
								this.game.output("A pile of leaves falls onto your head and to the ground.");
							}

							else
							{
								this.game.output("The grating opens to reveal trees above you.");
							}
						}

						else if (this.game.state.playerLocation === LOCATION.CLEARING_NORTH)
						{
							this.game.output("The grating opens to reveal darkness below.");
						}

						this.examineString = "The grating is open, but I can't tell what's beyond it.";
					}

					else
					{
						this.game.output("The grating is locked.");
					}
				}

			} break;

			case "kitchen window":
			{
				if (!this.game.state.houseWindowOpened) {
					this.game.output(GAME_STRINGS.WINDOW_OPENS);
					this.game.state.houseWindowOpened = true;
				}
				else
					this.game.output(GAME_STRINGS.getHardSarcasm());
			} break;

			case "trap door":
			{
				if (this.game.state.playerLocation === LOCATION.CELLAR)
				{
					this.game.output("The door is locked from above.");
				}

				else if (this.game.state.playerLocation === LOCATION.LIVING_ROOM)
				{
					let r = this.game.world.get(LOCATION.LIVING_ROOM);
					let p = r.exits.get(ACTION_STRINGS.DOWN);
					if (!this.game.state.trapDoorOpen)
					{
						this.game.state.trapDoorOpen = true;
						this.game.output(GAME_STRINGS.TRAP_DOOR_OPENS);
						p.setOpen();
					}
					else
					{
						this.game.output(GAME_STRINGS.getHardSarcasm());
					}
				}

			} break;


			default:
			{
				super.open();
			} break;
		}
	}

	pour() {

		switch (this.name)
		{
			case "quantity of water":
			{
				let bottle = this.game.objects.get("glass bottle");

				if (bottle.location !== LOCATION.PLAYER_INVENTORY)
					this.game.output("It's in the bottle. Perhaps you should take that first.");

				else if (!bottle.isOpen())
					this.game.output("The bottle is closed.");

				else
				{
					switch (this.game.state.indirectObject.name)
					{
						case "red hot brass bell":
						{
							this.game.output("The water cools the bell and is evaporated.");
							this.game.state.indirectObject.location = LOCATION.NULL_LOCATION;
							let bell = this.game.objects.get("brass bell");
							bell.location = this.game.state.playerLocation;
							this.game.state.bottleFilled = false;

						} break;

						default:
						{
							this.game.output("The water spills onto the " + this.game.state.indirectObject.name + " and dissipates.");
							this.game.state.bottleFilled = false;
						} break;
					}
				}


			} break;

			default:
			{
				super.pour();
			} break;
		}
	}

	push() {

		console.log("WE PUSH", this.name);

		switch(this.name) {
			case "blue button":
			{
				if (!this.game.state.blueButtonPushed)
				{
					this.game.output(OBJECT_STRINGS.BLUE_BUTTON);
					this.game.state.blueButtonPushed = true;
				}

				else
					this.game.output(OBJECT_STRINGS.BLUE_BUTTON_JAMMED);

			} break;

			case "brown button":
			{
				this.game.output("Click.");
				this.game.state.yellowButtonPushed = false;
				let dam = this.game.world.get(LOCATION.DAM);
				dam.firstVisit = true;

			} break;

			case "red button":
			{
				let rm = this.game.world.get(LOCATION.MAINTENANCE_ROOM);

				if (!this.game.state.redButtonPushed)
				{
					this.game.output("The lights within the room come on.");
					rm.setLight();
					this.game.state.darknessCheck();
					this.game.state.redButtonPushed = true;
				}

				else
				{
					this.game.output("The lights within the room shut off.");
					rm.setDark();
					this.game.state.darknessCheck();
					this.game.state.redButtonPushed = false;

				}

			} break;

			case "yellow button":
			{
				this.game.output("Click.");
				this.game.state.yellowButtonPushed = true;
				let dam = this.game.world.get(LOCATION.DAM);
				dam.firstVisit = true;

			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;


			default:
			{
				super.push();
			} break;
		}
	}

	put() {

		switch(this.name)
		{
			case "grating":
			{
				if (this.game.state.playerLocation === LOCATION.CLEARING_NORTH)
				{
					let it = this.game.state.indirectObject;
					if (it.weight < 10)
					{
						this.game.output("The " + this.game.state.indirectObject.name + " goes through the grating into the darkness below.");
						this.game.state.indirectObject.location = LOCATION.GRATING_ROOM;
					}
					else
						this.game.output("It won't fit through the grating.");
				}

				else if (this.game.state.playerLocation === LOCATION.GRATING_ROOM)
				{
					this.game.output("You can't get anything through the grating from here.");
				}

			} break;

			default:
			{
				super.put();
			} break;
		}
	}

	raise() {

		switch (this.name)
		{
			case "gate":
			{
				this.game.output(OBJECT_STRINGS.DEAD_GATE);
			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.raise();
			} break;
		}
	}

	shake() {

		switch(this.name)
		{
			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.shake();
			} break;
		}
	}

	take() {

		switch (this.name)
		{
			case "you":
			{
				if (this.game.state.completePlayerInput === "take me")
					this.game.output("How romantic!");

				else if (state.completePlayerInput === "take you")
					this.game.output("How romantic?");

				else
					this.game.output("You seem confused.");

			} break;

			case "quantity of water":
			{
				let bottle = this.game.objects.get("glass bottle");

				if (bottle.location !== LOCATION.PLAYER_INVENTORY)
					this.game.output("It's in the bottle. Perhaps you should take that first.");

				else if (!bottle.isOpen())
					this.game.output("The bottle is closed.");

				else
					this.game.output("The water slips through your fingers.");

			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.take();
			} break;
		}
	}

	tie() {

		switch (this.name)
		{
			case "wooden railing":
			{
				if (this.game.state.indirectObject.name === "rope")
				{
					if (!this.game.state.ropeRailTied)
					{
						this.game.state.ropeRailTied = true;
						this.game.output("The rope drops over the side and comes within ten feet of the floor.");
					}

					else
					{
						this.game.output("The rope is already tied to it.");
					}
				}

				else
				{
					this.game.output("You can't tie the " + this.game.state.indirectObject.name + " to that.");
				}
			} break;

			default:
			{
				super.tie();
			} break;
		}
	}

	touch() {

		switch (this.name)
		{
			case "gate":
			{
				this.game.output(OBJECT_STRINGS.DEAD_GATE);
			} break;

			case "mirror":
			{
				this.game.output(this.touchString);
				if (this.game.state.playerLocation === LOCATION.MIRROR_ROOM_SOUTH)
				{
					this.game.state.playerPreviousLocation = LOCATION.MIRROR_ROOM_SOUTH;
					this.game.state.playerLocation = LOCATION.MIRROR_ROOM_NORTH;
				}
				else
				{
					this.game.state.playerPreviousLocation = LOCATION.MIRROR_ROOM_NORTH;
					this.game.state.playerLocation = LOCATION.MIRROR_ROOM_SOUTH;
				}

				for (let g of this.game.objects.values())
				{
					if (g.isItem() && g.location === this.game.state.playerPreviousLocation)
						g.location = this.game.state.playerLocation;
				}
			} break;

			case "skeleton":
			{
				this.game.skeletonIsDisturbed();
			} break;

			default:
			{
				super.touch();
			}
		}
	}

	turn() {

		switch (this.name)
		{
			case "bolt":
			{
				if (this.game.state.indirectObject.name === "wrench")
				{
					if (!this.game.state.yellowButtonPushed)
					{
						this.game.output("The bolt won't turn with your best effort.");
					}

					else
					{
						if (this.game.state.damGatesOpen)
						{
							this.game.state.damGatesOpen = false;
							this.game.output("The sluice gates close and water starts to collect behind the dam.");
						}

						else
						{
							this.game.state.damGatesOpen = true;
							this.game.output("The sluice gates open and water pours through the dam.");
						}
					}
				}

				else
				{
					this.game.output("The bolt won't turn using the " + this.game.state.indirectObject.name);
				}
			} break;

			case "switch":
			{
				switch (this.game.state.indirectObject.name)
				{
					case "screwdriver":
					{
						if (!this.game.features.coalMachine.isOpen() && this.game.features.coalMachine.inventory.size > 0)
						{
							this.game.output(OBJECT_STRINGS.MACHINE_SUCCESS);

							for (let subject of this.game.features.coalMachine.inventory)
							{
								this.game.features.coalMachine.inventory.clear();

								if (subject.name === "small pile of coal")
								{
									subject.location = LOCATION.NULL_LOCATION;
									let diamond = this.game.objects.get("huge diamond");
									diamond.location = LOCATION.INSIDE_COAL_MACHINE;
									break;
								}

								else
								{
									subject.location = LOCATION.NULL_LOCATION;
									let slag = this.game.objects.get("small piece of vitreous slag");
									slag.location = LOCATION.INSIDE_COAL_MACHINE;
									break;
								}
							}

							this.game.refreshInventories();
						}

						else
							this.game.output("The machine doesn't seem to want to do anything.");
					} break;

					case "dummy_object":
					{
						this.game.output("You can't turn it with your bare hands...");
					} break;

					default:
					{
						this.game.output("It seems that " + this.game.state.indirectObject.articleName + " won't do.");
					} break;
				}
			} break;

			default:
			{
				super.turn();
			} break;
		}
	}

	unlock() {

		switch (this.name)
		{
			case "grating":
			{
				if (this.game.state.indirectObject.name === "skeleton key")
				{
					if (this.game.state.playerLocation === LOCATION.GRATING_ROOM)
					{
						this.game.output("The grate is unlocked.");
						this.game.state.gratingUnlocked = true;
						this.game.state.cyclopsShutsTrapDoor = false;
					}

					else if (this.game.state.playerLocation === LOCATION.CLEARING_NORTH)
					{
						this.game.output("You can't reach the lock from here.");
					}
				}

				else
				{
					this.game.output("Can you unlock a grating with " + this.game.state.indirectObject.articleName + "?");
				}
			} break;

			default:
			{
				super.unlock();
			} break;
		}
	}
}

export {
	Feature
}
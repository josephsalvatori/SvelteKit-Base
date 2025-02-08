import { GameObject } from "./classes";
import {
	CONSTANTS,
	ACTION_STRINGS,
	GAME_STRINGS,
	OBJECT_STRINGS,
	MAP_STRINGS,
	LOCATION,
	COAL_MINE,
	THIEF_LOCATIONS
} from "./constants";

/**
 * Actor model
 */
class Actor extends GameObject {

	constructor(game, name, loc) {

		super(game, name, loc);

		this.objectType = "ACTOR";

		this.alive = true;
		this.cyclopsAggro = false;
		this.cyclopsCycle = 0;
		this.cyclopsFirstTurn = true;
		this.cyclopsThirsty = false;
		this.disarmed = false;
		this.firstCombatTurn = true;
		this.hitPoints = CONSTANTS.MAX_ENEMY_HIT_POINTS;
		this.riverTurns = 0
		this.staggered = false;
		this.swordGlowLevel = 0;
		this.thiefAggro = false;
		this.thiefFirstTurn = true;
		this.thiefItemsHidden = false;
		this.unconscious = false;

		this.presenceString = "";
	}

	attack() {

		let weapon = this.game.state.indirectObject;

		switch(this.name) {
			case "cyclops":
			case "thief":
			case "troll":

				if(weapon.name === "dummy_object") {
					this.game.output("Trying to attack the " + this.name + " with your bare hands is suicidal.");
					return;
				}

				if(!weapon.isWeapon || weapon.name === "sceptre") {
					this.game.output("Attacking the " + this.name + " with " + weapon.articleName + " is suicide.");
					return;
				}

				if(weapon.name === "rusty knife") {
					this.game.output(OBJECT_STRINGS.RUSTY_KNIFE_CURSE);
					this.items.rustyKnife.location = LOCATION.MAZE_5;
					this.items.rustyKnife.movedFromStart = false;
					this.game.playerDies();
					return;
				}

				if(this.game.state.playerStaggered) {
					this.game.output(GAME_STRINGS.COMBAT_STAGGERED);
					this.game.state.playerStaggered = false;
					return;
				}

				if(this.unconscious) {
					this.game.output(GAME_STRINGS.COMBAT_FINISH_UNCONSCIOUS);
					this.alive = false;
				} else if(this.disarmed) {
					this.game.output(GAME_STRINGS.COMBAT_FINISH_DISARMED);
					this.alive = false;
				} else {
					if(this.name === "troll") this.trollCombat();
					if(this.name === "thief") this.thiefCombat();
					if(this.name === "cyclops") this.cyclopsCombat();
				}

				break;
			default:

				super.attack();

				break;
		}

		if(this.hitPoints <= 0) this.alive = false;

		if(!this.alive) {
			if(this.name === "thief") this.thiefDies();
			if(this.name === "troll") this.trollDies();
		}
	}

	give() {

		switch(this.name) {

			case "cyclops":

				switch(this.game.state.indirectObject.name) {
					case "lunch":
						this.game.output(OBJECT_STRINGS.CYCLOPS_LUNCH_1);
						this.game.state.indirectObject.location = LOCATION.NULL_LOCATION;
						this.cyclopsThirsty = true;

						break;
					case "glass bottle":

						if(this.game.state.bottleFilled && this.cyclopsThirsty) {
							this.game.output(OBJECT_STRINGS.CYCLOPS_DRINK_2);
							this.unconscious = true;
							this.cyclopsThirsty = false;
							this.game.state.bottleFilled = false;
							this.game.state.indirectObject.location = this.game.state.playerLocation;
							this.game.updateEvents();
						} else if(!this.cyclopsThirsty) {
							this.game.output(OBJECT_STRINGS.CYCLOPS_DRINK_1);
						} else {
							this.game.output(OBJECT_STRINGS.CYCLOPS_GIVE_REJECT_1);
						}

						break;

					default:
						this.game.output(OBJECT_STRINGS.CYCLOPS_GIVE_REJECT_2);
						break;
				}

				break;

			case "thief":

				this.game.state.indirectObject.location = LOCATION.THIEF_INVENTORY;

				if(this.game.state.indirectObject.trophyCaseValue > 0) {
					this.game.output(OBJECT_STRINGS.THIEF_GIVE_TREASURE);
					this.staggered = true;
				} else {
					this.game.output(OBJECT_STRINGS.THIEF_GIVE_ITEM);
				}

				break;

			case "troll":

				this.trollGive();

				break;

			default:

				super.give();

				break;
		}
	}

	kick() {

		switch(this.name) {
			case "vampire bat":

				this.game.output(OBJECT_STRINGS.BAT_CEILING);

				break;
			default:
				super.kick();
				break;
		}
	}

	cyclopsCombat() {

		if(this.unconscious) {
			this.game.output(OBJECT_STRINGS.CYCLOPS_WAKE);
			this.unconscious = false;
			this.game.items.cyclops_treasure.setClosed();
			return;
		}

		this.cyclopsAggro = true;
		this.game.output(OBJECT_STRINGS.CYCLOPS_SHRUG);
	}

	cyclopsTurn() {

		if(!this.alive) return;

		if(this.game.state.playerLocation === LOCATION.CELLAR && this.game.state.playerPreviousLocation === LOCATION.LIVING_ROOM && this.game.state.cyclopsShutsTrapDoor) {
			this.game.passages.cellar_livingroom.setClosed();
			this.game.state.trapDoorOpen = false;
		}

		if(this.game.state.playerLocation !== LOCATION.CYCLOPS_ROOM) {
			this.cyclopsFirstTurn = true;
			this.presenceString = "";
			return;
		}

		if(this.cyclopsFirstTurn) {
			this.game.output(OBJECT_STRINGS.CYCLOPS_1);
			this.presenceString = OBJECT_STRINGS.CYCLOPS_2;
			this.cyclopsFirstTurn = false;
			this.cyclopsCycle = 0;
		}

		if(this.cyclopsThirsty) {
			this.game.output(OBJECT_STRINGS.CYCLOPS_LUNCH_2);
			++this.cyclopsCycle;
			if(this.cyclopsCycle === CYCLOPS_CYCLE_MAX - 1) {
				this.game.output(OBJECT_STRINGS.CYCLOPS_WAIT_7);
				this.game.playerDies();
			}
		} else if(this.unconscious) {
			this.presenceString = OBJECT_STRINGS.CYCLOPS_SLEEP_1;

			this.game.items.cyclops_treasure.setOpen();

			let option = this.game.getRandom(5);
			if(option === 0 || option === 1) this.game.output(OBJECT_STRINGS.CYCLOPS_SLEEP_1);
			if(option === 2 || option === 3) this.game.output(OBJECT_STRINGS.CYCLOPS_SLEEP_2);
			if(option === 4) {
				this.game.output(OBJECT_STRINGS.CYCLOPS_WAKE);
				this.unconscious = false;
				this.game.items.cyclops_treasure.setClosed();
			}
		} else if(this.cyclopsAggro) {

			let dieRoll = this.game.getRandom(100);

			if(0 <= dieRoll && dieRoll < 10) {
				let option = this.game.getRandom(2);
				if(option === 0) this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_MISS_1);
				if(option === 1) this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_MISS_2);
			} else if(10 <= dieRoll && dieRoll < 20) {
				let option = this.game.getRandom(2);
				if(option === 0) this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_LIGHT_1);
				if(option === 1) this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_LIGHT_2);
				this.game.state.playerHitPoints -= 3;
			} else if(20 <= dieRoll && dieRoll < 45) {
				let option = this.game.getRandom(2);
				if(option === 0) this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_SEVERE_1);
				if(option === 1) this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_SEVERE_2);
				this.game.state.playerHitPoints -= 9;
				this.game.state.playerStaggered = true;
			} else if(45 <= dieRoll && dieRoll < 65) {
				let option = this.game.getRandom(2);
				if(option === 0) this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_STAGGER_1);
				if(option === 1) this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_STAGGER_2);
				this.game.state.playerHitPoints -= 7;
				this.game.state.playerStaggered = true;
			} else if(65 <= dieRoll && dieRoll < 75) {
				let option = this.game.getRandom(2);
				if(option === 0) this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_DISARM_1);
				if(option === 1) {
					this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_DISARM_2);
					this.game.state.playerHitPoints -= 2;
				}

				this.game.state.indirectObject.location = this.game.state.playerLocation;
			} else if(75 <= dieRoll && dieRoll < 85) {
				this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_KNOCKOUT);
				this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_HESITATE);
				this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_FINISH);
				this.game.playerDies();
			} else if(85 <= dieRoll && dieRoll < 100) {
				this.game.output(OBJECT_STRINGS.CYCLOPS_FIGHT_FATAL);
				this.game.playerDies();
			}
		} else {

			let saltAndPepper = ["", OBJECT_STRINGS.CYCLOPS_WAIT_1, OBJECT_STRINGS.CYCLOPS_WAIT_2,
				OBJECT_STRINGS.CYCLOPS_WAIT_3, OBJECT_STRINGS.CYCLOPS_WAIT_4, OBJECT_STRINGS.CYCLOPS_WAIT_5,
				OBJECT_STRINGS.CYCLOPS_WAIT_6, OBJECT_STRINGS.CYCLOPS_WAIT_7 ];

			if(this.cyclopsCycle > 0) {
				this.game.output(saltAndPepper[this.cyclopsCycle]);
			}

			if(this.cyclopsCycle == 7)
				this.game.playerDies();

			++this.cyclopsCycle;

			this.cyclopsCycle %= CYCLOPS_CYCLE_MAX;
		}
	}

	damFlowTurn() {

		if(this.game.state.damGatesOpen && this.game.state.damWaterHigh && this.game.state.damWaterStage > 0) {

			--this.game.state.damWaterStage;
			this.game.state.waterFalling = true;
			this.game.state.waterRising = false;
			this.game.rooms.reservoirNorth.description = MAP_STRINGS.DESC_RESERVOIR_NORTH_FALLING;
			this.game.rooms.reservoirSouth.description = MAP_STRINGS.DESC_RESERVOIR_SOUTH_FALLING;

			// console.log("Dam water stage is " + this.game.state.damWaterStage);

			// Water finishes falling
			if(this.game.state.damWaterStage === 0){

				if(this.game.state.playerLocation === LOCATION.RESERVOIR_SOUTH ||
					this.game.state.playerLocation === LOCATION.RESERVOIR_NORTH) {
					this.game.output(MAP_STRINGS.RESERVOIR_EMPTIES);
				}

				if(this.game.state.playerLocation === LOCATION.RESERVOIR) {
					this.game.output(MAP_STRINGS.RESERVOIR_EMPTIES_BOAT);
					this.game.output("\n");
					this.game.relocatePlayerNoClear(LOCATION.RESERVOIR_EMPTY);
				}

				if(this.game.state.playerLocation === LOCATION.DEEP_CANYON)
					this.game.output("The roar of rushing water is quieter now.");
			}
		}

		// Water is running
		if(!this.game.state.damGateOpen && this.game.state.damWaterLow && this.game.state.damWaterStage < CONSTANTS.RESERVOIR_DRAIN_TURNS) {

			++this.game.state.damWaterStage;
			this.game.state.waterRising = true;
			this.game.state.waterFalling = false;
			this.game.rooms.reservoirNorth.description = MAP_STRINGS.DESC_RESERVOIR_NORTH_RISING;
			this.game.rooms.reservoirSouth.description = MAP_STRINGS.DESC_RESERVOIR_SOUTH_RISING;
			this.game.rooms.reservoirEmpty.description = MAP_STRINGS.RESERVOIR_RISING;

			let boat = this.game.objects.get("magic boat");
			// Game.output("Dam water stage is " + this.game.state.damWaterStage);

			if(this.game.state.playerLocation === LOCATION.RESERVOIR_EMPTY) {
				if(this.game.state.damWaterStage === 3 || this.game.state.damWaterStage === 6)
					this.game.output(MAP_STRINGS.RESERVOIR_RISING);

				if(this.game.state.damWaterStage === 4 && this.game.state.playerInBoat)
					this.game.output(MAP_STRINGS.RESERVOIR_RISING_BOAT);
			}

			// Water finishes rising and goes over the dam
			if(this.game.state.damWaterStage === CONSTANTS.RESERVOIR_DRAIN_TURNS) {

				if(this.game.state.playerLocation === LOCATION.RESERVOIR_SOUTH || this.game.state.playerLocation === LOCATION.RESERVOIR_NORTH) {
					this.game.output(MAP_STRINGS.RESERVOIR_FILLS);
				}

				if(this.game.state.playerLocation === LOCATION.RESERVOIR_EMPTY) {
					if(this.game.state.playerInBoat) {
						this.game.output(MAP_STRINGS.RESERVOIR_FILLS_BOAT);
						this.game.state.playerInBoat = false;
						boat.location = LOCATION.RESERVOIR_SOUTH;
					} else {
						this.game.output(MAP_STRINGS.RESERVOIR_FILLS_SWIM);
					}

					this.game.playerDies();
				}

				if(this.game.state.playerLocation === LOCATION.LOUD_ROOM) {

					let choice = this.game.getRandom(3);

					this.game.output(MAP_STRINGS.LOUD_ROOM_RUSH);
					this.game.output("\n");

					if(choice === 0) this.game.relocatePlayer(LOCATION.DAMP_CAVE, false);
					if(choice === 1) this.game.relocatePlayer(LOCATION.ROUND_ROOM, false);
					if(choice === 2) this.game.relocatePlayer(LOCATION.DEEP_CANYON, false);
				}

				if(this.game.state.playerLocation === LOCATION.DEEP_CANYON)
					this.game.output("A sound, like that of flowing water, starts to come from below.");

				if(boat.location === LOCATION.RESERVOIR_EMPTY && !this.game.state.playerInBoat)
					boat.location = LOCATION.DAM;
			}
		}

		// Reservoir is empty
		if(this.game.state.damWaterStage === 0) {

			this.game.state.damWaterHigh = false;
			this.game.state.damWaterLow = true;
			this.game.state.waterFalling = false;
			this.game.state.waterRising = false;
			this.game.rooms.reservoirNorth.description = MAP_STRINGS.DESC_RESERVOIR_NORTH_EMPTY;
			this.game.rooms.reservoirSouth.description = MAP_STRINGS.DESC_RESERVOIR_SOUTH_EMPTY;
			this.game.rooms.reservoirEmpty.description = MAP_STRINGS.DESC_RESERVOIR_EMPTY;

			this.game.rooms.stream.exits.delete(ACTION_STRINGS.EAST);
			this.game.rooms.stream.addExit(ACTION_STRINGS.EAST, this.game.passages.stream_res_empty);

			this.game.rooms.reservoirNorth.exits.delete(ACTION_STRINGS.LAUNCH);
			this.game.rooms.reservoirNorth.addExit(ACTION_STRINGS.SOUTH, this.game.passages.res_north_res_empty);

			this.game.rooms.reservoirSouth.exits.delete(ACTION_STRINGS.LAUNCH);
			this.game.rooms.reservoirSouth.addExit(ACTION_STRINGS.NORTH, this.game.passages.res_south_res_empty);
		}

		// Reservoir is full
		if(this.game.state.damWaterStage == CONSTANTS.RESERVOIR_DRAIN_TURNS) {

			this.game.state.damWaterLow = false;
			this.game.state.damWaterHigh = true;
			this.game.state.waterFalling = false;
			this.game.state.waterRising = false;
			this.game.rooms.reservoirNorth.description = MAP_STRINGS.DESC_RESERVOIR_NORTH;
			this.game.rooms.reservoirSouth.description = MAP_STRINGS.DESC_RESERVOIR_SOUTH;
			this.game.rooms.reservoir.description = MAP_STRINGS.DESC_RESERVOIR;

			this.game.rooms.stream.exits.delete(ACTION_STRINGS.EAST);
			this.game.rooms.stream.addExit(ACTION_STRINGS.EAST, this.game.passages.reservoir_stream);

			this.game.rooms.reservoirNorth.exits.delete(ACTION_STRINGS.SOUTH);
			this.game.rooms.reservoirNorth.addExit(ACTION_STRINGS.LAUNCH, this.game.passages.res_north_res);

			this.game.rooms.reservoirSouth.exits.delete(ACTION_STRINGS.NORTH);
			this.game.rooms.reservoirSouth.addExit(ACTION_STRINGS.LAUNCH, this.game.passages.res_south_res);
		}
	}

	floodTurn() {

		if(!this.game.state.blueButtonPushed) return;

		let maxFloodStage = 15;

		if(this.game.state.floodStage < maxFloodStage) {
			let step = this.game.getRandom(2);
			this.game.state.floodStage += step;
		}

		if(this.game.state.floodStage >= maxFloodStage) {
			this.passages.dam_lobby_maintenance.setClosed();
			this.passages.dam_lobby_maintenance.closedFail = "The room is full of water and cannot be entered.";
		}

		if(this.game.state.playerLocation !== LOCATION.MAINTENANCE_ROOM) return;

		let check = this.game.state.floodStage / 2;
		let floodString = "The water level here is now up to your ";

		// ankles, shin, knees, hips, waist, chest, neck
		switch(check) {
			case 1: { this.game.output(floodString += "ankles."); } break;
			case 2: { this.game.output(floodString += "shin."); } break;
			case 3: { this.game.output(floodString += "knees."); } break;
			case 4: { this.game.output(floodString += "hips."); } break;
			case 5: { this.game.output(floodString += "waist."); } break;
			case 6: { this.game.output(floodString += "chest."); } break;
			case 7: { this.game.output(floodString += "neck."); } break;

			default: {} break;
		}

		if(this.game.state.floodStage >= maxFloodStage) {
			this.game.output("I'm afraid you have done drowned yourself.");
			this.game.playerDies();
		}
	}

	gustOfWindTurn() {

		let chance = this.game.getRandom(2);

		if(chance === 0) return;

		if(this.game.state.playerLocation === LOCATION.CAVE_SOUTH) {

			if(this.game.items.candles.activated && this.game.items.candles.location === LOCATION.PLAYER_INVENTORY && this.game.items.matchbook.activated && this.game.items.matchbook.location === LOCATION.PLAYER_INVENTORY) {
				this.game.output("A gust of wind blows out your candles AND your match!");
				this.game.items.candles.activated = false;
				this.game.items.matchbook.activated = false;
			} else if(this.game.items.candles.activated && this.game.items.candles.location === LOCATION.PLAYER_INVENTORY) {
				this.game.output("A gust of wind blows out your candles!");
				this.game.items.candles.activated = false;
			} else if(this.game.items.matchbook.activated && this.game.items.matchbook.location === LOCATION.PLAYER_INVENTORY) {
				this.game.output("A gust of wind blows out your match!");
				this.game.items.matchbook.activated = false;
			}

			this.game.darknessCheck();
		}

		if(this.game.state.playerLocation === LOCATION.DRAFTY_ROOM) {
			if(this.game.items.candles.activated && this.game.items.candles.location === LOCATION.PLAYER_INVENTORY) {
				this.game.output("A gust of wind blows out your candles!");
				this.game.items.candles.activated = false;
			}
		}
	}

	riverCurrentTurn() {

		let room = this.game.world.get(this.game.state.playerLocation);

		if(room.bodyOfWater) {
			++this.riverTurns;
		}

		if(this.riverTurns === 2) {
			switch (this.game.state.playerLocation) {
				case "FRIGID_RIVER_1":
				{
					this.game.output("\nThe flow of the river carries you downstream.\n");
					this.game.relocatePlayer(LOCATION.FRIGID_RIVER_2, false);
				} break;

				case "FRIGID_RIVER_2":
				{
					this.game.output("\nThe flow of the river carries you downstream.\n");
					this.game.relocatePlayer(LOCATION.FRIGID_RIVER_3, false);
				} break;

				case "FRIGID_RIVER_3":
				{
					this.game.output("\nThe flow of the river carries you downstream.\n");
					this.game.relocatePlayer(LOCATION.FRIGID_RIVER_4, false);
				} break;

				case "FRIGID_RIVER_4":
				{
					this.game.output("\nThe flow of the river carries you downstream.\n");
					this.game.relocatePlayer(LOCATION.FRIGID_RIVER_5, false);
				} break;

				case "FRIGID_RIVER_5":
				{
					this.game.output(GAME_STRINGS.WATERFALL_DEATH_BOAT);
					this.game.output("\n");
					this.game.state.playerInBoat = false;
					this.game.playerDies();
					let boat = this.game.items.get("magic boat");
					boat.location = LOCATION.SHORE;
				} break;

				default: {} break;
			}

			this.riverTurns = 0;
		}
	}

	songbirdTurn() {

		if(this.game.state.baubleFell) {
			this.game.state.baubleFell = false;
			return;
		}

		if(this.altLocations.has(this.game.state.playerLocation)) {
			let rand = this.game.getRandom(100);

			if(rand < CONSTANTS.SONGBIRD_CHIRP_PERCENT)
				this.game.output(OBJECT_STRINGS.SONGBIRD);
		}
	}

	spiritsTurn() {

		if(this.game.state.spiritsBanished) return;
		if(this.game.state.playerLocation !== LOCATION.ENTRANCE_TO_HADES) {
			this.game.state.spiritCeremonyCount = 0;
			return;
		}

		if(this.game.state.spiritCeremonyCount > 0) {
			--this.game.state.spiritCeremonyCount;
			if(this.game.state.spiritCeremonyCount == 0) {
				this.game.output(OBJECT_STRINGS.SPIRITS_REVERT);
				this.game.state.spiritsBellRung = false;
				this.game.state.spiritsCandlesLit = false;
			}
		}

		if(this.game.items.candles.location === LOCATION.PLAYER_INVENTORY && this.game.items.candles.activated && this.game.state.spiritsBellRung && !this.game.state.spiritsCandlesLit) {
			this.game.state.spiritsCandlesLit = true;
			this.game.output(OBJECT_STRINGS.CANDLES_LIT_SPIRITS);
		}
	}

	swordGlowTurn() {

		if(this.game.items.sword.location !== LOCATION.PLAYER_INVENTORY) {
			this.swordGlowLevel = 0;
			return;
		}

		let newGlowLevel = 0;

		let enemies = [ this.game.actors.vampireBat, this.game.actors.cyclops, this.game.actors.spirits, this.game.actors.thief, this.game.actors.troll ];

		for (let i = 0; i < enemies.length; ++i) {

			if(!enemies[i].alive) continue;
			if(enemies[i].location === LOCATION.NULL_LOCATION) continue;

			// Game.output("Checking sword glow for (Actor): " + enemies[i].name);
			// Game.output("Checking sword glow for (Location): " + enemies[i].location);

			if(this.game.state.playerLocation === enemies[i].location) {
				newGlowLevel = 2;
			} else {
				let enemyRoom = this.game.world.get(enemies[i].location);
				for (let psg of enemyRoom.exits.values()) {
					if(psg.isOpen()) {
						if(psg.locationA === enemies[i].location && psg.locationB === this.game.state.playerLocation)
							newGlowLevel = 1;
						if(psg.locationB === enemies[i].location && psg.locationA === this.game.state.playerLocation)
							newGlowLevel = 1;

					}
				}
			}

			if(!enemies[i].alive)
				newGlowLevel = 0;
		}

		let check = (newGlowLevel !== this.swordGlowLevel);

		switch(newGlowLevel) {
			case 0:

				if(check)
					this.game.output("Your sword is no longer glowing.");
				this.game.items.sword.examineString = "There's nothing special about the elvish sword.";

				break;

			case 1:

				if(check)
					this.game.output("Your sword is glowing with a faint blue glow.");
				this.game.items.sword.examineString = "Your sword is glowing with a faint blue glow.";

				break;

			case 2:

				if(check)
					this.game.output("Your sword has begun to glow very brightly.");
				this.game.items.sword.examineString = "Your sword is glowing very brightly.";

				break;

			default: {} break;
		}

		this.swordGlowLevel = newGlowLevel;
	}

	thiefAttacks() {

		let misses = [ OBJECT_STRINGS.THIEF_FIGHT_MISS_1, OBJECT_STRINGS.THIEF_FIGHT_MISS_2, OBJECT_STRINGS.THIEF_FIGHT_MISS_3,
				OBJECT_STRINGS.THIEF_FIGHT_MISS_4 ];
		let lightBlows = [ OBJECT_STRINGS.THIEF_FIGHT_LIGHT_1, OBJECT_STRINGS.THIEF_FIGHT_LIGHT_2, OBJECT_STRINGS.THIEF_FIGHT_LIGHT_3,
				OBJECT_STRINGS.THIEF_FIGHT_LIGHT_4 ];
		let severeBlows = [ OBJECT_STRINGS.THIEF_FIGHT_SEVERE_1, OBJECT_STRINGS.THIEF_FIGHT_SEVERE_2, OBJECT_STRINGS.THIEF_FIGHT_SEVERE_3,
			OBJECT_STRINGS.THIEF_FIGHT_SEVERE_4 ];
		let staggerBlows = [ OBJECT_STRINGS.THIEF_FIGHT_STAGGER_1, OBJECT_STRINGS.THIEF_FIGHT_STAGGER_2, OBJECT_STRINGS.THIEF_FIGHT_STAGGER_3 ];
		let disarmingBlows = [ OBJECT_STRINGS.THIEF_FIGHT_DISARM_1, OBJECT_STRINGS.THIEF_FIGHT_DISARM_2, OBJECT_STRINGS.THIEF_FIGHT_DISARM_3 ];
		let knockoutBlows = [ OBJECT_STRINGS.THIEF_FIGHT_KNOCKOUT_1, OBJECT_STRINGS.THIEF_FIGHT_KNOCKOUT_2 ];
		let fatalBlows = [ OBJECT_STRINGS.THIEF_FIGHT_FATAL_1, OBJECT_STRINGS.THIEF_FIGHT_FATAL_2, OBJECT_STRINGS.THIEF_FIGHT_FATAL_3 ];
		let hesitations = [ OBJECT_STRINGS.THIEF_FIGHT_HESITATE_1, OBJECT_STRINGS.THIEF_FIGHT_HESITATE_2, OBJECT_STRINGS.THIEF_FIGHT_HESITATE_3];
		let finishes = [ OBJECT_STRINGS.THIEF_FIGHT_FINISH_1, OBJECT_STRINGS.THIEF_FIGHT_FINISH_2 ];

		let missCutoff = 15;
		let lightCutoff = 35;
		let severeCutoff = 50;
		let staggerCutoff = 60;
		let disarmCutoff = 75;
		let knockoutCutoff = 90;

		if(this.disarmed && !this.unconscious)
		{
			this.game.output(OBJECT_STRINGS.THIEF_RECOVER_STILETTO);
			this.game.items.stiletto.location = LOCATION.THIEF_INVENTORY;
			this.disarmed = false;
			return;
		}

		if(this.staggered)
		{
			this.staggered = false;
			return;
		}

		if(this.unconscious)
		{
			// 50% chance to recover
			let check = this.game.getRandom(2);

			if(check === 0)
			{
				this.game.output(OBJECT_STRINGS.THIEF_WAKES);
				this.unconscious = false;
				this.presenceString = OBJECT_STRINGS.THIEF_PRESENT_2;
			}

			return;
		}

		let dieRoll = this.game.getRandom(100);
		// console.log("Thief die roll = " + dieRoll);

		if(0 <= dieRoll && dieRoll < missCutoff)
		{
			let phrase = this.game.getRandom(misses.length);
			this.game.output(misses[phrase]);
		}

		else if(missCutoff <= dieRoll && dieRoll < lightCutoff)
		{
			let phrase = this.game.getRandom(lightBlows.length);
			this.game.output(lightBlows[phrase]);
			this.game.state.playerHitPoints -= 1;
		}

		else if(lightCutoff <= dieRoll && dieRoll < severeCutoff)
		{
			let phrase = this.game.getRandom(severeBlows.length);
			this.game.output(severeBlows[phrase]);
			this.game.state.playerHitPoints -= 5;
		}

		else if(severeCutoff <= dieRoll && dieRoll < staggerCutoff)
		{
			let phrase = this.game.getRandom(staggerBlows.length);
			this.game.output(staggerBlows[phrase]);
			this.game.state.playerStaggered = true;
		}

		else if(staggerCutoff <= dieRoll && dieRoll < disarmCutoff)
		{
			// If the player hasn't attacked with a weapon, stagger instead.

			if(!this.game.state.indirectObject.isWeapon)
			{
				let phrase = this.game.getRandom(staggerBlows.length);
				this.game.output(staggerBlows[phrase]);
				this.game.state.playerStaggered = true;
				return;
			}

			let phrase = this.game.getRandom(disarmingBlows.length);
			this.game.output(disarmingBlows[phrase]);
			this.game.state.indirectObject.location = this.game.state.playerLocation;
			for (let g of this.game.objects.values())
			{
				if(g.isWeapon && !g.name === "sceptre" && g.location === LOCATION.PLAYER_INVENTORY)
				{
					this.game.output("Fortunately, you still have " + g.articleName + ".");
					break;
				}
			}
		}

		else if(disarmCutoff <= dieRoll && dieRoll < knockoutCutoff)
		{
			let phrase = this.game.getRandom(knockoutBlows.length);
			this.game.output(knockoutBlows[phrase]);

			phrase = this.game.getRandom(hesitations.length);
			this.game.output(hesitations[phrase]);

			phrase = this.game.getRandom(finishes.length);
			this.game.output(finishes[phrase]);

			this.game.playerDies();
		}

		else if(knockoutCutoff <= dieRoll && dieRoll < 100)
		{
			let phrase = this.game.getRandom(fatalBlows.length);
			this.game.output(fatalBlows[phrase]);
			this.game.output(GAME_STRINGS.COMBAT_HP_ZERO);
			this.game.playerDies();
		}

		if(this.game.state.playerHitPoints <= 0)
		{
			this.game.output(GAME_STRINGS.COMBAT_HP_ZERO);
			this.game.playerDies();
		}
	}

	thiefCombat() {
		this.firstCombatTurn = false;
		this.thiefAggro = true;

		let misses = [ GAME_STRINGS.COMBAT_MISS_1, GAME_STRINGS.COMBAT_MISS_2, GAME_STRINGS.COMBAT_MISS_3,
			GAME_STRINGS.COMBAT_PARRY_1, GAME_STRINGS.COMBAT_PARRY_2, GAME_STRINGS.COMBAT_PARRY_3 ];
		let lightBlows = [ GAME_STRINGS.COMBAT_LIGHT_1, GAME_STRINGS.COMBAT_LIGHT_2, GAME_STRINGS.COMBAT_LIGHT_3,
			GAME_STRINGS.COMBAT_LIGHT_4 ];
		let severeBlows = [ GAME_STRINGS.COMBAT_SEVERE_1, GAME_STRINGS.COMBAT_SEVERE_2, GAME_STRINGS.COMBAT_SEVERE_3,
			GAME_STRINGS.COMBAT_SEVERE_4 ];
		let staggerBlows = [ GAME_STRINGS.COMBAT_STAGGER_1, GAME_STRINGS.COMBAT_STAGGER_2, GAME_STRINGS.COMBAT_STAGGER_3,
			GAME_STRINGS.COMBAT_STAGGER_4 ];
		let disarmingBlows = [ GAME_STRINGS.COMBAT_DISARM_1, GAME_STRINGS.COMBAT_DISARM_2 ];
		let knockoutBlows = [ GAME_STRINGS.COMBAT_KNOCKOUT_1, GAME_STRINGS.COMBAT_KNOCKOUT_2, GAME_STRINGS.COMBAT_KNOCKOUT_3,
			GAME_STRINGS.COMBAT_KNOCKOUT_4 ];
		let fatalBlows = [ GAME_STRINGS.COMBAT_FATAL_1, GAME_STRINGS.COMBAT_FATAL_2, GAME_STRINGS.COMBAT_FATAL_3 ];

		// values for the sword - not very useful against the thief
		let missCutoff = 40;
		let lightCutoff = 80;
		let severeCutoff = 85;
		let staggerCutoff = 90;
		let disarmCutoff = 93;
		let knockoutCutoff = 97;

		// Fighting the thief with the knife is a lot more effective.
		if(this.game.state.indirectObject.name === "nasty knife") {
			// remove the decapitation string. These arrays have strange rules...
			let fatals = [ GAME_STRINGS.COMBAT_FATAL_2, GAME_STRINGS.COMBAT_FATAL_3 ];
			fatalBlows = fatals;

			missCutoff = 20;
			lightCutoff = 50;
			severeCutoff = 60;
			staggerCutoff = 70;
			disarmCutoff = 80;
			knockoutCutoff = 90;

		}

		// Fighting the thief with the axe is almost completely ineffective.
		if(this.game.state.indirectObject.name === "bloody axe") {
			missCutoff = 60;
			lightCutoff = 90;
			severeCutoff = 92;
			staggerCutoff = 94;
			disarmCutoff = 96;
			knockoutCutoff = 99;
		}

		let dieRoll = this.game.getRandom(100);

		// Score modification
		let mod = Math.floor((100 * this.game.state.playerScore) / WINNING_SCORE);
		dieRoll += mod;
		if(dieRoll > 99) dieRoll = 99;

		if(0 <= dieRoll && dieRoll < missCutoff) {
			let phrase = this.game.getRandom(misses.length);
			this.game.output(misses[phrase]);
		} else if(missCutoff <= dieRoll && dieRoll < lightCutoff) {
			this.hitPoints -= 1;

			if(this.hitPoints <= 0) {
				let phrase = this.game.getRandom(fatalBlows.length);
				this.game.output(fatalBlows[phrase]);
			} else {
				let phrase = this.game.getRandom(lightBlows.length);
				this.game.output(lightBlows[phrase]);
			}
		} else if(lightCutoff <= dieRoll && dieRoll < severeCutoff) {
			this.hitPoints -= 5;

			if(this.hitPoints <= 0) {
				let phrase = this.game.getRandom(fatalBlows.length);
				this.game.output(fatalBlows[phrase]);
			} else {
				let phrase = this.game.getRandom(severeBlows.length);
				this.game.output(severeBlows[phrase]);
			}
		} else if(severeCutoff <= dieRoll && dieRoll < staggerCutoff) {
			let phrase = this.game.getRandom(staggerBlows.length);
			this.game.output(staggerBlows[phrase]);
			this.staggered = true;
		} else if(staggerCutoff <= dieRoll && dieRoll < disarmCutoff) {
			let phrase = this.game.getRandom(disarmingBlows.length);
			this.game.output(disarmingBlows[phrase]);
			this.game.items.stiletto.location = this.game.state.playerLocation;
			this.disarmed = true;
		} else if(disarmCutoff <= dieRoll && dieRoll < knockoutCutoff) {
			let phrase = this.game.getRandom(knockoutBlows.length);
			this.game.output(knockoutBlows[phrase]);
			this.presenceString = OBJECT_STRINGS.THIEF_PRESENT_UNCONSCIOUS;
			this.unconscious = true;
		} else if(knockoutCutoff <= dieRoll && dieRoll < 100) {
			let phrase = this.game.getRandom(fatalBlows.length);
			this.game.output(fatalBlows[phrase]);
			this.alive = false;
		}
	}

	thiefDies() {

		for (let it of this.inventory) {
			it.location = this.location;
		}

		this.alive = false;
		this.location = LOCATION.NULL_LOCATION;

		if(this.game.state.playerLocation === LOCATION.TREASURE_ROOM)
			this.game.output(OBJECT_STRINGS.THIEF_MAGIC_2);

		for(let g of this.game.objects.values()) {
			if(g.location === LOCATION.TREASURE_ROOM_INVISIBLE) {
				g.location = LOCATION.TREASURE_ROOM;
				if(this.game.state.playerLocation === LOCATION.TREASURE_ROOM)
					this.game.output("The " + g.name + " is now safe to take.");
			}
		}
	}

	thiefLootsRoom() {
		for(let g of this.game.objects.values()) {
			if(g.isItem() && g.location === this.location) {
				if(g.trophyCaseValue > 0)
					g.location = LOCATION.THIEF_INVENTORY;
			}
		}
	}

	thiefMoves() {

		let nextThiefLocation = this.game.getRandom(THIEF_LOCATIONS.length);
		// console.log("Thief location random number: " + nextThiefLocation);
		this.location = THIEF_LOCATIONS[nextThiefLocation];
		this.thiefFirstTurn = true;
	}

	thiefRobsPlayer() {

		for (let g of this.game.objects.values()) {
			if(g.isItem() && g.location === LOCATION.PLAYER_INVENTORY) {
				if(g.trophyCaseValue > 0)
					g.location = LOCATION.THIEF_INVENTORY;
			}
		}
	}

	thiefTurn() {

		if(!this.alive) return;

		let playerHasTreasure = false;
		let roomHasTreasure = false;

		for(let g of this.game.objects.values()) {
			if(g.isItem()) {
				if(g.trophyCaseValue > 0 && g.location === this.location)
					roomHasTreasure = true;

				if(g.trophyCaseValue > 0 && g.location === LOCATION.PLAYER_INVENTORY)
					playerHasTreasure = true;
			}
		}

		// Has the player found my secret hideout?
		if(this.game.state.playerLocation === LOCATION.TREASURE_ROOM) {
			// Did the player just get here?
			if(this.thiefFirstTurn) {
				this.game.output(OBJECT_STRINGS.THIEF_HIDEOUT);
				this.location = LOCATION.TREASURE_ROOM;
				this.thiefFirstTurn = false;
			}

			// Have I already hidden the treasures?
			if(!this.thiefItemsHidden) {
				this.game.output(OBJECT_STRINGS.THIEF_MAGIC_1);

				for (let g of this.game.objects.values()) {
					if(g.isItem()) {
						if(g.location === LOCATION.TREASURE_ROOM && g.trophyCaseValue > 0)
							g.location = LOCATION.TREASURE_ROOM_INVISIBLE;
					}
				}

				this.thiefItemsHidden = true;
			}

			this.game.rooms.treasureRoom.lookAround();

			// Attack without pity!
			this.thiefAttacks();

			// If the player is still here, check sword glow.
			if(this.game.state.playerLocation === LOCATION.TREASURE_ROOM)
				this.swordGlowTurn();

			return;
		}

		// Am I in the same room as the player?
		if(this.location === this.game.state.playerLocation) {
			// Is the player attacking me?
			if(this.thiefAggro) {
				// Retreat, dropping my bag
				if(this.itPoints == 1) {
					this.game.output(OBJECT_STRINGS.THIEF_FIGHT_RETREAT_2);
					for (let it of this.inventory)
						it.location = this.location;
					this.thiefMoves();
				}

				// Retreat, holding my bag
				else if(2 <= this.hitPoints && this.hitPoints <= 4) {
					this.game.output(OBJECT_STRINGS.THIEF_FIGHT_RETREAT_1);
					this.thiefMoves();
				}

				// Attack the player...
				else {
					this.thiefAttacks();
				}

				return;
			}

			// Did the player just get here?
			if(this.thiefFirstTurn) {
				this.thiefFirstTurn = false;
				return;
			}

			// The player has been here at least one turn and we're not fighting.
			else {

				let option = this.game.getRandom(5);

				// Wait...
				if(option === 0) return;

				// Rob the player and leave...
				else if(option > 2 && playerHasTreasure) {
					this.game.output(OBJECT_STRINGS.THIEF_LEAVES_ROBS);
					this.thiefRobsPlayer();
					this.thiefMoves();
				}

				// Loot the room and leave...
				else if(option <= 2 && roomHasTreasure) {
					this.game.output(OBJECT_STRINGS.THIEF_LEAVES_LOOTS);
					this.thiefLootsRoom();
					this.thiefMoves();
				}

				// Leave without taking anything.
				else {
					if(option > 2) this.game.output(OBJECT_STRINGS.THIEF_LEAVES_1);
					if(option <= 2) this.game.output(OBJECT_STRINGS.THIEF_LEAVES_2);
					this.thiefMoves();
				}

				return;
			}
		}

		// I'm not in the same room as the player. Let's move!
		if(this.location !== this.game.state.playerLocation) {

			this.thiefMoves();

			// Check if the player is in a possible thief location
			let playerInThiefArea = false;
			for (let i = 0; i < THIEF_LOCATIONS.length; ++i) {
				if(THIEF_LOCATIONS[i] === this.game.state.playerLocation)
					playerInThiefArea = true;
			}

			// Move the thief to the player if we roll an encounter.
			let encounterCheck = this.game.getRandom(100);
			// console.log("Thief encounter check number: " + encounterCheck);
			if(encounterCheck < CONSTANTS.THIEF_ENCOUNTER_PERCENT && playerInThiefArea) {
				this.location = this.game.state.playerLocation;
				let option = this.game.getRandom(3);
				if(option === 0) {
					this.game.output(OBJECT_STRINGS.THIEF_ARRIVES_GRIN);
				}

				if(option === 1) {
					this.game.output(OBJECT_STRINGS.THIEF_COMES_AND_ROBS);
					while (this.location === this.game.state.playerLocation) {
						this.thiefRobsPlayer();
						this.thiefLootsRoom();
						this.thiefMoves();
					}
				}

				if(option === 2) {
					this.game.output(OBJECT_STRINGS.THIEF_COMES_AND_GOES);
					while (this.location === this.game.state.playerLocation) {
						this.thiefMoves();
					}
				}
			}
		}

		// Update egg
		if(this.game.items.egg.location === LOCATION.THIEF_INVENTORY && !this.thiefAggro && this.game.state.thiefEggTurns < CONSTANTS.THIEF_OPENS_EGG) {
			++this.game.state.thiefEggTurns;

			if(this.game.state.thiefEggTurns === CONSTANTS.THIEF_OPENS_EGG) {
				this.game.items.canary.location = LOCATION.INSIDE_EGG;
				this.game.items.egg.itemOpen = true;
				this.game.state.thiefOpenedEgg = true;
			}
		}
	}

	trollCombat() {

		let misses = [ GAME_STRINGS.COMBAT_MISS_1, GAME_STRINGS.COMBAT_MISS_2, GAME_STRINGS.COMBAT_MISS_3,
			GAME_STRINGS.COMBAT_PARRY_1, GAME_STRINGS.COMBAT_PARRY_2, GAME_STRINGS.COMBAT_PARRY_3 ];
		let lightBlows = [ GAME_STRINGS.COMBAT_LIGHT_1, GAME_STRINGS.COMBAT_LIGHT_2, GAME_STRINGS.COMBAT_LIGHT_3,
			GAME_STRINGS.COMBAT_LIGHT_4 ];
		let severeBlows = [ GAME_STRINGS.COMBAT_SEVERE_1, GAME_STRINGS.COMBAT_SEVERE_2, GAME_STRINGS.COMBAT_SEVERE_3,
			GAME_STRINGS.COMBAT_SEVERE_4 ];
		let staggerBlows = [ GAME_STRINGS.COMBAT_STAGGER_1, GAME_STRINGS.COMBAT_STAGGER_2, GAME_STRINGS.COMBAT_STAGGER_3,
			GAME_STRINGS.COMBAT_STAGGER_4 ];
		let disarmingBlows = [ GAME_STRINGS.COMBAT_DISARM_1, GAME_STRINGS.COMBAT_DISARM_2 ];
		let knockoutBlows = [ GAME_STRINGS.COMBAT_KNOCKOUT_1, GAME_STRINGS.COMBAT_KNOCKOUT_2, GAME_STRINGS.COMBAT_KNOCKOUT_3,
			GAME_STRINGS.COMBAT_KNOCKOUT_4 ];
		let fatalBlows = [ GAME_STRINGS.COMBAT_FATAL_1, GAME_STRINGS.COMBAT_FATAL_2, GAME_STRINGS.COMBAT_FATAL_3 ];

		// values for the sword
		let missCutoff = 10;
		let lightCutoff = 25;
		let severeCutoff = 40;
		let staggerCutoff = 55;
		let disarmCutoff = 70;
		let knockoutCutoff = 85;

		// Fighting the troll with the knife is a little harder.
		if(this.game.state.indirectObject.name === "nasty knife") {
			// remove the decapitation string. These arrays have strange rules...
			let fatals = [ GAME_STRINGS.COMBAT_FATAL_2, GAME_STRINGS.COMBAT_FATAL_3 ];

			fatalBlows = fatals;

			missCutoff = 20;
			lightCutoff = 50;
			severeCutoff = 60;
			staggerCutoff = 70;
			disarmCutoff = 80;
			knockoutCutoff = 90;
		}

		let dieRoll = this.game.getRandom(100);

		// Score modification
		let mod = ((100 * this.game.state.playerScore) / CONSTANTS.WINNING_SCORE);

		dieRoll += mod;

		if(dieRoll > 99) dieRoll = 99;

		if(0 <= dieRoll && dieRoll < missCutoff) {
			let phrase = this.game.getRandom(misses.length);
			this.game.output(misses[phrase]);
		}

		else if (missCutoff <= dieRoll && dieRoll < lightCutoff) {
			this.hitPoints -= 1;

			if (this.hitPoints <= 0) {
				let phrase = this.game.getRandom(fatalBlows.length);
				this.game.output(fatalBlows[phrase]);
			} else {
				let phrase = this.game.getRandom(lightBlows.length);
				this.game.output(lightBlows[phrase]);
			}
		}

		else if (lightCutoff <= dieRoll && dieRoll < severeCutoff) {
			this.hitPoints -= 5;

			if (this.hitPoints <= 0) {
				let phrase = this.game.getRandom(fatalBlows.length);
				this.game.output(fatalBlows[phrase]);
			} else {
				let phrase = this.game.getRandom(severeBlows.length);
				this.game.output(severeBlows[phrase]);
			}
		}

		else if (severeCutoff <= dieRoll && dieRoll < staggerCutoff) {
			let phrase = this.game.getRandom(staggerBlows.length);
			this.game.output(staggerBlows[phrase]);
			this.staggered = true;
		}

		else if (staggerCutoff <= dieRoll && dieRoll < disarmCutoff) {
			let phrase = this.game.getRandom(disarmingBlows.length);
			this.game.output(disarmingBlows[phrase]);
			this.game.items.axe.location = this.game.state.playerLocation;
			this.disarmed = true;
		}

		else if (disarmCutoff <= dieRoll && dieRoll < knockoutCutoff) {
			let phrase = this.game.getRandom(knockoutBlows.length);
			this.game.output(knockoutBlows[phrase]);
			this.unconscious = true;
			this.game.items.axe.location = this.game.state.playerLocation;
			this.disarmed = true;
		}

		else if (knockoutCutoff <= dieRoll && dieRoll < 100) {
			let phrase = this.game.getRandom(fatalBlows.length);
			this.game.output(fatalBlows[phrase]);
			this.alive = false;
		}
	}

	trollDies() {
		// console.log("trollDies() called");
		this.alive = false;

		for (let it of this.inventory) {
			it.location = this.location;
		}

		this.location = LOCATION.NULL_LOCATION;
		this.game.passages.troll_eastwest.setOpen();
		this.game.passages.troll_maze.setOpen();

		if (this.game.state.playerLocation === LOCATION.TROLL_ROOM && this.game.state.directObject.name === "troll") {
			this.game.output(GAME_STRINGS.COMBAT_ENEMY_DIES);
		}
	}

	trollGive() {

		let item = this.game.state.indirectObject.name;
		switch (item) {
			case "axe":
			{
				this.game.output(OBJECT_STRINGS.TROLL_GIVE_AXE);
				this.game.state.indirectObject.location = LOCATION.TROLL_INVENTORY;
			} break;

			default:
			{
				this.game.output("The troll, who is remarkably coordinated, catches the " + item + ".");
				this.game.state.indirectObject.location = LOCATION.TROLL_INVENTORY;
			} break;
		}
	}

	trollTurn() {

		if(!this.alive) return;

		if(this.game.items.axe.location !== LOCATION.TROLL_INVENTORY) {
			this.disarmed = true;
		}

		this.game.passages.troll_eastwest.setClosed();
		this.game.passages.troll_maze.setClosed();
		this.game.passages.troll_eastwest.closedFail = OBJECT_STRINGS.TROLL_FEND;
		this.game.passages.troll_maze.closedFail = OBJECT_STRINGS.TROLL_FEND;

		if(this.location === this.game.state.playerLocation) {

			// TODO: move this instead of repeating it every combat turn.
			this.game.output(this.presenceString);

			let misses = [ OBJECT_STRINGS.TROLL_FIGHT_MISS_1, OBJECT_STRINGS.TROLL_FIGHT_MISS_2, OBJECT_STRINGS.TROLL_FIGHT_MISS_3,
				OBJECT_STRINGS.TROLL_FIGHT_MISS_4, OBJECT_STRINGS.TROLL_FIGHT_MISS_5 ];
			let lightBlows = [ OBJECT_STRINGS.TROLL_FIGHT_LIGHT_1, OBJECT_STRINGS.TROLL_FIGHT_LIGHT_2, OBJECT_STRINGS.TROLL_FIGHT_LIGHT_3,
				OBJECT_STRINGS.TROLL_FIGHT_LIGHT_4, OBJECT_STRINGS.TROLL_FIGHT_LIGHT_5 ];
			let severeBlows = [ OBJECT_STRINGS.TROLL_FIGHT_SEVERE_1, OBJECT_STRINGS.TROLL_FIGHT_SEVERE_2, OBJECT_STRINGS.TROLL_FIGHT_SEVERE_3 ];
			let staggerBlows = [ OBJECT_STRINGS.TROLL_FIGHT_STAGGER_1, OBJECT_STRINGS.TROLL_FIGHT_STAGGER_2, OBJECT_STRINGS.TROLL_FIGHT_STAGGER_3 ];
			let disarmingBlows = [ OBJECT_STRINGS.TROLL_FIGHT_DISARM_1, OBJECT_STRINGS.TROLL_FIGHT_DISARM_2, OBJECT_STRINGS.TROLL_FIGHT_DISARM_3 ];
			let fatalBlows = [ OBJECT_STRINGS.TROLL_FIGHT_FATAL_1, OBJECT_STRINGS.TROLL_FIGHT_FATAL_2, OBJECT_STRINGS.TROLL_FIGHT_FATAL_3 ];

			/** COMBAT WITH THE TROLL **

			In order to attack you, the troll must be alive,
			conscious, not staggered, and armed with his axe.
			He can't fight with any other weapons.

			When the troll attacks with the axe, the possible results are:

				- Miss: 40%
				- Light blow: 25%
				- Severe blow: 10%
				- Stagger: 10%
				- Disarm: 5%
				- Knockout: 5%
				- Death: 5%

			If he's staggered, he has a 1 in 2 chance to recover.
			If he's unconscious, he has a 1 in 3 chance to wake up.
			If he's disarmed and can't recover his weapon, he'll pathetically babble and plead for his life.
			If you leave the axe on the ground, he has a 2 in 3 chance to pick it up.

			*/

			// this.game.output("The troll attacks you.");

			let missCutoff = 40;
			let lightCutoff = 65;
			let severeCutoff = 75;
			let staggerCutoff = 85;
			let disarmCutoff = 90;
			let knockoutCutoff = 95;

			if(this.disarmed && !this.unconscious) {

				if (this.game.items.axe.location === LOCATION.TROLL_ROOM) {

					let check = this.game.getRandom(3);

					if (check > 0) {
						this.game.output(OBJECT_STRINGS.TROLL_RECOVER_AXE);
						this.game.items.axe.location = LOCATION.TROLL_INVENTORY;
						this.disarmed = false;
						this.presenceString = OBJECT_STRINGS.TROLL_PRESENCE;
					}

					return;

				} else {

					this.game.output(OBJECT_STRINGS.TROLL_DISARMED);

					return;
				}
			}

			if(this.staggered) {

				let check = this.game.getRandom(2);

				if(check === 1) {
					this.game.output(OBJECT_STRINGS.TROLL_RECOVERS_STAGGER);
					this.staggered = false;
				}

				return;
			}

			// The troll will only regain consciousness if the player is there.
			if(this.unconscious && this.game.state.playerLocation === LOCATION.TROLL_ROOM) {

				let check = this.game.getRandom(3);

				if(check === 0) {

					this.game.output(OBJECT_STRINGS.TROLL_RECOVERS_STAGGER);
					this.unconscious = false;

					if(this.game.items.axe.location === LOCATION.TROLL_ROOM) {
						this.game.items.axe.location = LOCATION.TROLL_INVENTORY;
						this.disarmed = false;
					}

					this.presenceString = OBJECT_STRINGS.TROLL_PRESENCE;
				}

				return;
			}

			let dieRoll = this.game.getRandom(100);

			// The player won't die without a chance to attack.
			if(this.firstCombatTurn) {
				this.firstCombatTurn = false;
				if(dieRoll >= 90) dieRoll = this.game.getRandom(90);
			}

			if(0 <= dieRoll && dieRoll < missCutoff) {
				let phrase = this.game.getRandom(misses.length);
				this.game.output(misses[phrase]);
			}

			else if(missCutoff <= dieRoll && dieRoll < lightCutoff) {
				let phrase = this.game.getRandom(lightBlows.length);
				this.game.output(lightBlows[phrase]);
				this.game.state.playerHitPoints -= 1;
			}

			else if(lightCutoff <= dieRoll && dieRoll < severeCutoff) {
				let phrase = this.game.getRandom(severeBlows.length);
				this.game.output(severeBlows[phrase]);
				this.game.state.playerHitPoints -= 5;
			}

			else if (severeCutoff <= dieRoll && dieRoll < staggerCutoff) {
				let phrase = this.game.getRandom(staggerBlows.length);
				this.game.output(staggerBlows[phrase]);
				this.game.state.playerStaggered = true;
			}

			else if (staggerCutoff <= dieRoll && dieRoll < disarmCutoff) {
				// If the player hasn't attacked with a weapon, stagger instead.

				if(!this.game.state.indirectObject.isWeapon) {

					let phrase = this.game.getRandom(staggerBlows.length);
					this.game.output(staggerBlows[phrase]);
					this.game.state.playerStaggered = true;

					return;
				}

				let phrase = this.game.getRandom(disarmingBlows.length);

				this.game.output(disarmingBlows[phrase]);
				this.game.state.indirectObject.location = this.game.state.playerLocation;

				for(let g of this.game.currentObjects.values()) {

					if(g.isWeapon && !g.name === "sceptre" && g.location === LOCATION.PLAYER_INVENTORY) {
						this.game.output("Fortunately, you still have " + g.articleName + ".");
						break;
					}
				}
			}

			else if (disarmCutoff <= dieRoll && dieRoll < knockoutCutoff) {

				this.game.output(OBJECT_STRINGS.TROLL_FIGHT_KNOCKOUT);

				let phrase = this.game.getRandom(2);

				if (phrase === 0) {
					this.game.output(OBJECT_STRINGS.TROLL_FIGHT_HESITATE_1);
				}

				else {
					this.game.output(OBJECT_STRINGS.TROLL_FIGHT_HESITATE_2);
				}

				this.game.output(OBJECT_STRINGS.TROLL_FIGHT_FINISH);
				this.game.playerDies();
			}

			else if(knockoutCutoff <= dieRoll && dieRoll < 100) {

				let phrase = this.game.getRandom(fatalBlows.length);
				this.game.output(fatalBlows[phrase]);
				this.game.output(GAME_STRINGS.COMBAT_HP_ZERO);
				this.game.playerDies();
			}

			if(this.game.state.playerHitPoints <= 0) {
				this.game.output(GAME_STRINGS.COMBAT_HP_ZERO);
				this.game.playerDies();
			}

			console.log("Troll HP", this.hitPoints, "Player HP", this.game.state.playerHitPoints);
		}
	}

	vampireBatTurn() {
		if (this.game.items.garlic.location === LOCATION.PLAYER_INVENTORY || this.game.items.garlic.location === LOCATION.BAT_ROOM) {
			this.presenceString = OBJECT_STRINGS.BAT_GARLIC;
		}

		else if (this.game.state.playerDead) {
			this.presenceString = "A large vampire bat is cowering on the ceiling, making whimpered squeaking noises.";
		}

		else {
			this.presenceString = OBJECT_STRINGS.BAT_ATTACKS;

			if (this.game.state.playerLocation == LOCATION.BAT_ROOM) {
				this.game.output(this.presenceString);

				// Let's give the player a 1 in 10 chance of making it back to the squeaky room.
				let chance = this.game.getRandom(10);

				if (chance === 0) {
					this.game.relocatePlayer(LOCATION.SQUEAKY_ROOM, false);
				}

				else {
					let dieRoll = this.game.getRandom(COAL_MINE.length);
					this.game.relocatePlayer(COAL_MINE[dieRoll], false);
				}
			}
		}
	}

	isAlive() { return this.alive; }
}

export {
	Actor
};
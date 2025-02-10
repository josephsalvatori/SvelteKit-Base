import { cfg } from "$lib/helpers/terminal.js";

const SAVE_STATE_NAME = "gameZork";
const LINE_BREAK = "\r\n";

const TEXT_BOLD = "\x1b[1;37m";
const TEXT_BOLD_YELLOW = "\x1b[1;33m";
const TEXT_NORMAL = "\x1b[0;37m";

const CONSTANTS = {

	CARRY_WEIGHT_LIMIT: 100,
	DEATH_POINTS: 10,
	LANTERN_LIFESPAN: 500,
	MAX_PLAYER_DEATHS: 3,
	MAX_DARKNESS_TURNS: 2,
	MAX_HIT_POINTS: 10,
	MATCH_LIFESPAN: 2,
	MATCHES_IN_BOOK: 20,
	RESERVOIR_DRAIN_TURNS: 8,
	SHAFT_BASKET_POINTS: 13,
	SPIRIT_CEREMONY_LENGTH: 5,
	THIEF_OPENS_EGG: 5,
	WINNING_SCORE: 350,

	MAX_INPUT_LENGTH: 50,
	MAX_TURNS: 2000,

	// from Actor object
	CYCLOPS_CYCLE_MAX: 8,
	MAX_ENEMY_HIT_POINTS: 10,
	THIEF_ENCOUNTER_PERCENT: 2,
	SONGBIRD_CHIRP_PERCENT: 15,

	// Score values for acquiring a treasure and putting it in the case
	PLATINUM_VALUE: 10,
	PLATINUM_TROPHY_VALUE: 5,
	BAUBLE_VALUE: 1,
	BAUBLE_TROPHY_VALUE: 1,
	CHALICE_VALUE: 10,
	CHALICE_TROPHY_VALUE: 5,
	COFFIN_VALUE: 10,
	COFFIN_TROPHY_VALUE: 15,
	COINS_VALUE: 10,
	COINS_TROPHY_VALUE: 5,
	CANARY_VALUE: 6,
	CANARY_TROPHY_VALUE: 4,
	DIAMOND_VALUE: 10,
	DIAMOND_TROPHY_VALUE: 10,
	EGG_VALUE: 5,
	EGG_TROPHY_VALUE: 5,
	EMERALD_VALUE: 5,
	EMERALD_TROPHY_VALUE: 10,
	JADE_VALUE: 5,
	JADE_TROPHY_VALUE: 5,
	PAINTING_VALUE: 4,
	PAINTING_TROPHY_VALUE: 6,
	POT_OF_GOLD_VALUE: 10,
	POT_OF_GOLD_TROPHY_VALUE: 10,
	SAPPHIRE_VALUE: 5,
	SAPPHIRE_TROPHY_VALUE: 5,
	SCARAB_VALUE: 5,
	SCARAB_TROPHY_VALUE: 5,
	SCEPTRE_VALUE: 4,
	SCEPTRE_TROPHY_VALUE: 6,
	CRYSTAL_SKULL_VALUE: 10,
	CRYSTAL_SKULL_TROPHY_VALUE: 10,
	TORCH_VALUE: 14,
	TORCH_TROPHY_VALUE: 6,
	TRIDENT_VALUE: 4,
	TRIDENT_TROPHY_VALUE: 11,
	TRUNK_OF_JEWELS_VALUE: 15,
	TRUNK_OF_JEWELS_TROPHY_VALUE: 5,

	BROKEN_EGG_TROPHY_VALUE: 2,
	BROKEN_CANARY_TROPHY_VALUE: 1,

	// Score values for reaching specific rooms
	KITCHEN_VALUE: 10,
	CELLAR_VALUE: 25,
	EAST_WEST_VALUE: 5,
	TREASURE_VALUE: 25,

	// Item weights
	BAR_WEIGHT: 20,
	BAUBLE_WEIGHT: 0,
	CHALICE_WEIGHT: 10,
	COFFIN_WEIGHT: 55,
	COINS_WEIGHT: 15,
	CANARY_WEIGHT: 4,
	DIAMOND_WEIGHT: 6,
	EGG_WEIGHT: 5,
	EMERALD_WEIGHT: 6,
	JADE_WEIGHT: 10,
	PAINTING_WEIGHT: 15,
	POT_OF_GOLD_WEIGHT: 15,
	SAPPHIRE_WEIGHT: 10,
	SCARAB_WEIGHT: 8,
	SCEPTRE_WEIGHT: 3,
	SKULL_WEIGHT: 15,
	TORCH_WEIGHT: 20,
	TRIDENT_WEIGHT: 20,
	TRUNK_WEIGHT: 35,

	ANCIENT_MAP_WEIGHT: 2,
	AXE_WEIGHT: 25,
	BELL_WEIGHT: 10,
	BLACK_BOOK_WEIGHT: 10,
	BOAT_LABEL_WEIGHT: 2,
	BOTTLE_WEIGHT: 5,
	BROKEN_CANARY_WEIGHT: 4,
	BROKEN_EGG_WEIGHT: 5,
	BUOY_WEIGHT: 10,
	CANDLES_WEIGHT: 10,
	COAL_WEIGHT: 20,
	BOAT_WEIGHT: 20,
	GARLIC_WEIGHT: 4,
	GUIDEBOOK_WEIGHT: 2,
	GUNK_WEIGHT: 6,
	KNIFE_WEIGHT: 10,
	LANTERN_WEIGHT: 15,
	LEAVES_WEIGHT: 25,
	LEAFLET_WEIGHT: 2,
	LUNCH_WEIGHT: 5,
	MATCHBOOK_WEIGHT: 2,
	NEST_WEIGHT: 5,
	PUMP_WEIGHT: 8,
	ROPE_WEIGHT: 10,
	RUSTY_KNIFE_WEIGHT: 20,
	SACK_WEIGHT: 9,
	SCREWDRIVER_WEIGHT: 2,
	SHOVEL_WEIGHT: 15,
	SKELETON_KEY_WEIGHT: 10,
	STILETTO_WEIGHT: 10,
	SWORD_WEIGHT: 30,
	TIMBER_WEIGHT: 50,
	TUBE_WEIGHT: 5,
	USELESS_LANTERN_WEIGHT: 20,
	VITREOUS_SLAG_WEIGHT: 10,
	WRENCH_WEIGHT: 10,
	ZORK_MANUAL_WEIGHT: 2,
};

// regex to match strings between two backticks, over 80 characters long



// `([^`]{79,})

const GAME_STRINGS = {

	COMBAT_MISS_1: `Your WEAPON misses the ENEMY by an inch.`,
    COMBAT_MISS_2: `A good slash, but it misses the ENEMY by a mile.`,
    COMBAT_MISS_3: `You charge, but the ENEMY jumps nimbly aside.`,
    COMBAT_PARRY_1: `Clang! Crash! The ENEMY parries.`,
    COMBAT_PARRY_2: `A quick stroke, but the ENEMY is on guard.`,
    COMBAT_PARRY_3: `A good stroke, but it's too slow, the ENEMY dodges.`,
    COMBAT_KNOCKOUT_1: `Your WEAPON crashes down, knocking the ENEMY into dreamland.`,
    COMBAT_KNOCKOUT_2: `The ENEMY is battered into unconsciousness.`,
    COMBAT_KNOCKOUT_3: `A furious exchange, and the ENEMY is knocked out!`,
    COMBAT_KNOCKOUT_4: `The haft of your WEAPON knocks out the ENEMY.`,
    COMBAT_FATAL_1: `It's curtains for the ENEMY as your WEAPON removes his head.`,
    COMBAT_FATAL_2: `The fatal blow strikes the ENEMY square in the heart: He dies.`,
    COMBAT_FATAL_3: `The ENEMY takes a fatal blow and slumps to the floor dead.`,
    COMBAT_LIGHT_1: `The ENEMY is struck on the arm, blood begins to trickle down.`,
    COMBAT_LIGHT_2: `The WEAPON pinks the ENEMY on the wrist, but it's not serious.`,
    COMBAT_LIGHT_3: `Your stroke lands, but it was only the flat of the blade.`,
    COMBAT_LIGHT_4: `The blow lands, making a shallow gash in the ENEMY's arm!`,
    COMBAT_SEVERE_1: `The ENEMY receives a deep gash in his side.`,
    COMBAT_SEVERE_2: `A savage blow on the thigh! The ENEMY is stunned but can still fight!`,
    COMBAT_SEVERE_3: `Slash! Your blow lands! That one hit an artery, it could be serious!`,
    COMBAT_SEVERE_4: `Slash! Your stroke connects! This could be serious!`,
    COMBAT_STAGGER_1: `The ENEMY is staggered, and drops to his knees.`,
    COMBAT_STAGGER_2: `The ENEMY is momentarily disoriented and can't fight back.`,
    COMBAT_STAGGER_3: `The force of your blow knocks the ENEMY back, stunned.`,
    COMBAT_STAGGER_4: `The ENEMY is confused, and can't fight back.`,
    COMBAT_DISARM_1: `The quickness of your thrust knocks the ENEMY's weapon to the floor, leaving${cfg.newLine}`
		+ `him unarmed.`,
    COMBAT_DISARM_2: `The ENEMY is disarmed by a subtle feint past his guard.`,
    COMBAT_FINISH_DISARMED: `The unarmed ENEMY cannot defend himself: He dies.`,
    COMBAT_FINISH_UNCONSCIOUS: `The unconscious ENEMY cannot defend himself: He dies.`,

    COMBAT_ENEMY_DIES: `Almost as soon as the ENEMY breathes his last breath, a cloud of sinister black${cfg.newLine}`
        + `fog envelops him, and when the fog lifts, the carcass has disappeared.`,
    COMBAT_HP_ZERO: `It appears that last blow was too much for you. I'm afraid you are dead.`,
    COMBAT_STAGGERED: `You are still recovering from that last blow, so your attack is ineffective.`,

    GAME_BEGIN: `${cfg.colors.yellowBold}ZORK I: The Great Underground Empire${cfg.colors.reset}${cfg.newLine}`
        + `Copyright (c) 1981, 1982, 1983 Infocom, Inc. All rights reserved.${cfg.newLine}`
        + `ZORK is a registered trademark of Infocom, Inc.${cfg.newLine}`
        + `Revision 88js / Serial number 840726`,

    ALL_TREASURES_IN_CASE: `An almost inaudible voice whispers in your ear, "Look to your treasures for${cfg.newLine}`
        + `the final secret."`,

    ABOUT_INFO: `Zork I: The Great Underground Empire is a classic computer game developed by${cfg.newLine}`
        + `Marc Blank, Dave Lebling, Bruce Daniels, and Tim Anderson at MIT in the late${cfg.newLine}`
        + `1970s. It became the basis of the computer game company Infocom, which published${cfg.newLine}`
        + `many Zork-related titles in the 1980s and 1990s, and was acquired by Activision,${cfg.newLine}`
        + `which still owns the copyright.${cfg.newLineFull}`
		+ `This program was enhanced by Joseph Salvatori, building off a library written${cfg.newLine}`
        + `in 2020 by Nate Tryon and exists purely for educational, non-monetary purposes.${cfg.newLineFull}`
		+ `The base library may be viewed here: ${cfg.formats.underline}https://github.com/PotterOtherP/JSZork${cfg.formats.reset}`,

    HELP_INFO: `Find the 19 lost treasures of Zork and return them to the trophy case.${cfg.newLineFull}`
        + `Try moving north, south, east, west, up, or down. Try to take objects and do things with them.${cfg.newLineFull}`
        + `The game is difficult to complete without some references.${cfg.newLine}`
        + `Find walkthroughs here: https://gamefaqs.gamespot.com/pc/564446-zork-i/faqs${cfg.newLine}`
        + `And maps here: http://struckus.tripod.com/Zork1maps.htm`,

    BLACK_BOOK_TEXT: `Commandment #12592${cfg.newLineFull}`
        + `Oh ye who go about saying unto each: "Hello sailor":${cfg.newLine}`
        + `Dost thou know the magnitude of thy sin before the gods?${cfg.newLine}`
        + `Yea, verily, thou shalt be ground between two stones.${cfg.newLine}`
        + `Shall the angry gods cast thy body into the whirlpool?${cfg.newLine}`
        + `Surely, thy eye shall be put out with a sharp stick!${cfg.newLine}`
        + `Even unto the ends of the earth shalt thou wander and${cfg.newLine}`
        + `Unto the land of the dead shalt thou be sent at last.${cfg.newLine}`
        + `Surely thou shalt repent of thy cunning.`,
    BOAT_LABEL_TEXT: `${cfg.tab}!!!!  FROBOZZ MAGIC BOAT COMPANY  !!!!${cfg.newLineFull}`
        + `Hello, Sailor!${cfg.newLineFull}`
        + `Instructions for use:${cfg.newLineFull}`
        + `  To get into a body of water, say "Launch".${cfg.newLine}`
        + `  To get to shore, say "Land" or the direction in which you want to maneuver the boat.${cfg.newLineFull}`
        + `Warranty:${cfg.newLineFull}`
        + `  This boat is guaranteed against all defects for a period of 76 milliseconds from date of${cfg.newLine}`
        + `purchase or until first used, whichever comes first.${cfg.newLineFull}`
        + `Warning:${cfg.newLine}`
        + `  This boat is made of thin plastic.${cfg.newLine}`
        + `  Good Luck!`,
    CANT_GO: `You can't go that way.`,
    DAM_GUIDEBOOK_TEXT: `${cfg.tab}Flood Control Dam #3${cfg.newLineFull}`
        + `FCD#3 was constructed in the year 783 of the Great Underground Empire to harness the mighty Frigid River. This work was supported by${cfg.newLine}`
        + `a grant of 37 million zorkmids from your omnipotent local tyrant Lord Dimwit Flathead the Excessive. This impressive structure is${cfg.newLine}`
        + `composed of 370,000 cubic feet of concrete, is 256 feet tall at the center, and 193 feet wide at the top. The lake created behind the${cfg.newLine}`
        + `dam has a volume of 1.7 billion cubic feet, an area of 12 million square feet, and a shore line of 36 thousand feet.${cfg.newLineFull}`
        + `We will now point out soem of the more interesting features of FCD#3 as we conduct you on a guided tour of the facilities:${cfg.newLine}`
        + `${cfg.tab}1) You start your tour here in the Dam Lobby. You will notice on your right that...${cfg.newLine}`,
    DARKNESS: `It is pitch black. You are likely to be eaten by a grue.`,
    DARKNESS_LISTEN: `There are sinister gurgling noises in the darkness all around you!`,
    DEAD_ACTION_FAIL: `You can't even do that.`,
    DEAD_CANNOT_ENTER: `You cannot enter in your condition.`,
    DEAD_DIAGNOSE: `You are dead.`,
    DEAD_DOME_PASSAGE: `As you enter the dome you feel a strong pull as if from a wind drawing${cfg.newLine}`
        + `you over the railing and down.`,
    DEAD_INVENTORY: `You have no possessions.`,
    DEAD_LOOK: `The room looks strage and unearthly and objects appear indistinct.${cfg.newLine}`
        + `Although there is no light, the room seems dimly illuminated.`,
    DEAD_PRAY_ALTAR: `From the distance the sound of a lone trumpet is heard. The room becomes${cfg.newLine}`
        + `very bright and you feel disembodied. In a moment, the brightness fades and you find yourself rising as if from${cfg.newLine}`
        + `a long sleep, deep in the woods. In the distance you can faintly hear a songbird and the sounds of the forest.`,
    DEAD_PRAY_FAIL: `Your prayers are not heard.`,
    DEAD_SCORE: `You're dead! How can you think of your score?`,
    DEAD_TAKE_OBJECT: `Your hand passes through its object.`,
    DEAD_TOUCH: `Even such an action is beyond your capabilities.`,
    DEAD_WAIT: `Might as well. You've got an eternity.`,
    ENGRAVINGS_TEXT: `The engravings were incised in the living rock of the cave wall by an unknown hand. They depict,${cfg.newLine}`
        + `in symbolic form, the beliefs of the ancient Zorkers. Skillfully interwoven with the bas reliefs are excerpts illustrating the major${cfg.newLine}`
        + `religious tenets of that time. Unfortunately, a later age seems to have considered them blasphemous and just as skillfully excised them.`,
    ENTER_DARKNESS: `You have moved into a dark place.`,
    GAS_EXPLOSION: `Oh dear. It appears that the smell coming from this room was coal gas. I would have${cfg.newLine}`
        + `thought twice about carrying flaming objects in here.${cfg.newLineFull}`
		+ `${cfg.tab}** BOOOOOOOOOOOOM **`,
    GRUE_DEATH_1: `Oh no! You have walked into the slavering fangs of a lurking grue!`,
    GRUE_DEATH_2: `Oh no! A lurking grue slithered into the room and devoured you!`,
    HOLLOW_VOICE: `A hollow voice says "Fool."`,
    LAUNCH_FAIL: `You need to be near a body of water to launch the boat. Maybe you are hallucinating a body${cfg.newLine}`
        + `of water here. It may be a good idea to see a neurologist.`,
	LAUNCH_FAIL_2: `Refer to the boat label for instructions.${cfg.newLineFull}`,
	LAUNCH_FAIL_3: `You can't go there in a magic boat.${cfg.newLineFull}`,
    LEAFLET_TEXT: `WELCOME TO ZORK!${cfg.newLineFull}`
		+ `ZORK is a game of adventure, danger, and low cunning. In it you will explore${cfg.newLine}`
        + `some of the most amazing territory ever seen by mortals. No computer should be without one!`,
    MOVE_RUG: `With a great effort, the rug is moved to one side of the room, revealing the dusty cover${cfg.newLine}`
        + `of a closed trap door.`,
    NATE_MANUAL_TEXT: `Congratulations!${cfg.newLineFull}`
		+ `You are the privileged owner of a shoddy facsimile of ZORK I:${cfg.newLine}`
        + `The Great Underground Empire, a legendary self-contained and self-maintaining universe created in the late 1970's by some${cfg.newLine}`
        + `computer geniuses at MIT. If used and maintained in accordance with normal operating practices for small universes, this pale${cfg.newLine}`
        + `imitation of ZORK I will provide many months of troubled and bug-ridden operation, including bizarre logical errors and${cfg.newLine}`
        + `countless thrown exceptions.`,
    OVERBURDENED: `You can't carry any more.`,
    PASSAGE_OVERBURDENED: `You are carrying too much.`,
    PLAYER_DIES: `${cfg.tab}****  You have died  ****${cfg.newLineFull}`
        + `Now, let's take a look here... Well, you probably deserve another chance. I can't quite fix you up${cfg.newLine}`
        + `completely, but you can't have everything.`,
    PLAYER_DIES_FOR_REAL: `${cfg.tab}****  You have died  ****${cfg.newLineFull}`
        + `As you take your last breath, you feel relieved of your burdens.${cfg.newLine}`
        + `The feeling passes as you find yourself before the gates of Hell, where the spirits jeer at you and deny you${cfg.newLine}`
        + `entry. Your senses are disturbed. The objects in the dungeon appear indistinct, bleached of color, even unreal.`,
    PLAYER_DIES_SUICIDE: `You clearly are a suicidal maniac. We don't allow psychotics in the cave,${cfg.newLine}`
        + `since they may harm other adventurers. Your remains will be installed in the Land of the Living Dead, where your${cfg.newLine}`
        + `fellow adventurers may gloat over them.`,
    PLAYER_DIES_WHILE_DEAD: `It takes a talented person to be killed while already dead. YOU are${cfg.newLine}`
        + `such a talent. Unfortunately, it takes a talented person to deal with it. I am not such a talent. Sorry.`,
    PROFANITY_ONE: `Such language in a high-class establishment like this!`,
    PROFANITY_TWO: `Do you have to use so many cuss words?`,
    PROFANITY_THREE: `There's no need for that kind of language.`,
    RUG_ALREADY_MOVED: `Having moved the carpet previously, you find it impossible to move it again.`,
    SAILOR: `Nothing happens here.`,
    TEMPLE_PRAYER: `The prayer is inscribed in an ancient script, rarely used today. It seems to be a${cfg.newLine}`
        + `philippic against small insects, absent-mindedness, and the picking up and dropping of small objects. The final verse${cfg.newLine}`
        + `consigns trespassers to the land of the dead. All evidence indicates that the beliefs of the ancient Zorkers were obscure.`,
    TOO_DARK: `It's too dark to see!`,
    TRAP_DOOR_OPENS: `The door reluctantly opens to reveal a rickety staircase descending into darkness.`,
    WATERFALL_DEATH_BOAT: `Unfortunately, the magic boat doesn't provide protection from the rocks and${cfg.newLine}`
        + `boulders one meets at the bottom of waterfalls. Including this one.`,
    WATERFALL_DEATH_SWIM: `In other words, fighting the fierce currents of the Frigid River. You manage${cfg.newLine}`
        + `to hold your own for a bit, but then you are carried over a waterfall and into some nasty rocks. Ouch!`,
    WINDOW_CLOSES: `The window closes (more easily than it opened).`,
    WINDOW_OPENS: `With great effort, you open the window far enough to allow entry.`,
    ZORK_MANUAL_TEXT: `Congratulations!${cfg.newLineFull}`
		+ `You are the privileged owner of ZORK I: The Great Underground Empire, a${cfg.newLine}`
        + `self-contained and self-maintaining universe. If used and maintained in accordance with normal operating practices for small${cfg.newLine}`
        + `universes, ZORK will provide many months of trouble-free operation.`,


    SARCASM: [`What a concept!`, `You can't be serious.`, `A valiant attempt.`, `An interesting idea...`],

    JUMP_SARCASM: [`Very good. Now you can go to the second grade.`, `Wheeeeeeeeee!!!!!`,
            `Do you expect me to applaud?`, `Are you enjoying yourself?`],

    HARD_SARCASM: [`Look around.`, `Too late for that.`, `Have your eyes checked.`],

    getSarcasticResponse: function()
    {
        let i = Math.floor(Math.random() * this.SARCASM.length);
        return this.SARCASM[i];
    },
    getJumpSarcasm: function()
    {
        let i = Math.floor(Math.random() * this.JUMP_SARCASM.length);
        return this.JUMP_SARCASM[i];
    },
    getHardSarcasm: function()
    {
        let i = Math.floor(Math.random() * this.HARD_SARCASM.length);
        return this.HARD_SARCASM[i];
    },

    GODMODE_WORDS: [
		"accio",
		"teleport",
		"zombie"
    ],
    PROFANITY: [
    	" fuck ",
		" shit "
    ],
    SLURS: []
};

const ALLOWED_VERBS = [
	"LOOK", "TAKE", "PUSH", "BACK",
	"PULL", "DROP", "OPEN", "WAIT", "ENTER",
	"CLOSE", "INVENTORY", "BAG", "ZYZZY", "HELP",
	"USE",

	"NORTH", "EAST", "SOUTH", "WEST", "NORTHEAST", "NORTHWEST", "SOUTHEAST", "SOUTHWEST",
	"UP", "DOWN", "IN", "OUT",
	"WALK", "GO", "SLIDE", "SWIM",
	"EXIT", "CROSS", "LAUNCH", "LAND",

	"MAILBOX",
	"LEFT", "RIGHT", "SAVE", "RESET",
	"HELP", "STATE", "BRIEF", "VERBOSE", "READ",
	"CLIMB", "UP", "DOWN", "MOVE", "RUG"
];

const VERB_TYPES = {
	NULL_TYPE: "NULL_TYPE",
	DIRECT: "DIRECT",
	EXIT: "EXIT",
	INDIRECT: "INDIRECT",
	INDIRECT_INVERSE: "INDIRECT_INVERSE",
	MULTIPLE: "MULTIPLE",
	REFLEXIVE: "REFLEXIVE",
	SPEAK: "SPEAK",
	SWITCH: "SWITCH",
};

const ACTION = {

    NULL_ACTION: "NULL_ACTION",

    NORTH: "NORTH",
    SOUTH: "SOUTH",
    EAST: "EAST",
    WEST: "WEST",
    NORTHEAST: "NORTHEAST",
    NORTHWEST: "NORTHWEST",
    SOUTHEAST: "SOUTHEAST",
    SOUTHWEST: "SOUTHWEST",
    UP: "UP",
    DOWN: "DOWN",
    IN: "IN",
    OUT: "OUT",
    WALK: "WALK",
    GO: "GO",
    SLIDE: "SLIDE",
    SWIM: "SWIM",
    EXIT: "EXIT",
    CROSS: "CROSS",
    LAUNCH: "LAUNCH",
    LAND: "LAND",

    BRIEF: "BRIEF",
    DEFEND: "DEFEND",
    DELETE: "DELETE",
    DIAGNOSE: "DIAGNOSE",
    INVENTORY: "INVENTORY",
    JUMP: "JUMP",
    LOOK: "LOOK",
    PRAY: "PRAY",
    RESTART: "RESTART",
    SAY: "SAY",
    SCORE: "SCORE",
    SHOUT: "SHOUT",
    STAY: "STAY",
    SUPERBRIEF: "SUPERBRIEF",
    UNDO: "UNDO",
    VERBOSE: "VERBOSE",
    WAIT: "WAIT",

    ACTIVATE: "ACTIVATE",
    ANSWER: "ANSWER",
    BLOW: "BLOW",
    BOARD: "BOARD",
    BRUSH: "BRUSH",
    CLIMB: "CLIMB",
    CLOSE: "CLOSE",
    COUNT: "COUNT",
    DEBOARD: "DEBOARD",
    DEFLATE: "DEFLATE",
    DRINK: "DRINK",
    DROP: "DROP",
    EAT: "EAT",
    ENTER: "ENTER",
    EXAMINE: "EXAMINE",
    EXTINGUISH: "EXTINGUISH",
    FOLLOW: "FOLLOW",
    GREET: "GREET",
    KICK: "KICK",
    KNOCK: "KNOCK",
    LIGHT: "LIGHT",
    LISTEN: "LISTEN",
    LOOK_IN: "LOOK_IN",
    LOOK_OUT: "LOOK_OUT",
    LOOK_UNDER: "LOOK_UNDER",
    LOWER: "LOWER",
    MOVE_OBJECT: "MOVE_OBJECT",
    OPEN: "OPEN",
    PLAY: "PLAY",
    POUR: "POUR",
    PULL: "PULL",
    PUSH: "PUSH",
    RAISE: "RAISE",
    READ: "READ",
    REMOVE: "REMOVE",
    REPAIR: "REPAIR",
    RING: "RING",
    SEARCH: "SEARCH",
    SHAKE: "SHAKE",
    SMELL: "SMELL",
    STRIKE: "STRIKE",
    TAKE: "TAKE",
    TALK_TO: "TALK_TO",
    TOUCH: "TOUCH",
    UNTIE: "UNTIE",
    WAKE: "WAKE",
    WAVE: "WAVE",
    WEAR: "WEAR",
    WIND: "WIND",

    ATTACK: "ATTACK",
    BREAK: "BREAK",
    BURN: "BURN",
    CUT: "CUT",
    DIG: "DIG",
    FILL: "FILL",
    INFLATE: "INFLATE",
    LOCK: "LOCK",
    TURN: "TURN",
    UNLOCK: "UNLOCK",

    GIVE: "GIVE",
    PUT: "PUT",
    TIE: "TIE",
    THROW: "THROW",

    AGAIN: "AGAIN"

};

const ACTION_TYPE = {
    NULL_TYPE: "NULL_TYPE",
    DIRECT: "DIRECT",
    EXIT: "EXIT",
    INDIRECT: "INDIRECT",
    INDIRECT_INVERSE: "INDIRECT_INVERSE",
    MULTIPLE: "MULTIPLE",
    REFLEXIVE: "REFLEXIVE",
    SPEAK: "SPEAK",
    SWITCH: "SWITCH"
};

const LOCATION = {

	NULL_LOCATION: "NULL_LOCATION",
	NULL_INVENTORY: "NULL_INVENTORY",
	WEST_OF_HOUSE: "WEST_OF_HOUSE",
	NORTH_OF_HOUSE: "NORTH_OF_HOUSE",
	BEHIND_HOUSE: "BEHIND_HOUSE",
	SOUTH_OF_HOUSE: "SOUTH_OF_HOUSE",
	ATTIC: "ATTIC",
	KITCHEN: "KITCHEN",
	LIVING_ROOM: "LIVING_ROOM",
	FOREST_PATH: "FOREST_PATH",
	FOREST_WEST: "FOREST_WEST",
	FOREST_EAST: "FOREST_EAST",
	FOREST_NORTHEAST: "FOREST_NORTHEAST",
	FOREST_SOUTH: "FOREST_SOUTH",
	CLEARING_NORTH: "CLEARING_NORTH",
	CLEARING_EAST: "CLEARING_EAST",
	UP_TREE: "UP_TREE",
	CANYON_VIEW: "CANYON_VIEW",
	ROCKY_LEDGE: "ROCKY_LEDGE",
	CANYON_BOTTOM: "CANYON_BOTTOM",
	END_OF_RAINBOW: "END_OF_RAINBOW",
	STONE_BARROW: "STONE_BARROW",
	INSIDE_STONE_BARROW: "INSIDE_STONE_BARROW",

	CELLAR: "CELLAR",
	EAST_OF_CHASM: "EAST_OF_CHASM",
	GALLERY: "GALLERY",
	STUDIO: "STUDIO",
	TROLL_ROOM: "TROLL_ROOM",
	EAST_WEST_PASSAGE: "EAST_WEST_PASSAGE",
	ROUND_ROOM: "ROUND_ROOM",
	NARROW_PASSAGE: "NARROW_PASSAGE",
	MIRROR_ROOM_SOUTH: "MIRROR_ROOM_SOUTH",
	WINDING_PASSAGE: "WINDING_PASSAGE",
	CAVE_SOUTH: "CAVE_SOUTH",
	ENTRANCE_TO_HADES: "ENTRANCE_TO_HADES",
	LAND_OF_THE_DEAD: "LAND_OF_THE_DEAD",
	ALTAR: "ALTAR",
	TEMPLE: "TEMPLE",
	EGYPTIAN_ROOM: "EGYPTIAN_ROOM",
	TORCH_ROOM: "TORCH_ROOM",
	DOME_ROOM: "DOME_ROOM",
	ENGRAVINGS_CAVE: "ENGRAVINGS_CAVE",

	LOUD_ROOM: "LOUD_ROOM",
	DAMP_CAVE: "DAMP_CAVE",
	WHITE_CLIFFS_BEACH_NORTH: "WHITE_CLIFFS_BEACH_NORTH",
	WHITE_CLIFFS_BEACH_SOUTH: "WHITE_CLIFFS_BEACH_SOUTH",
	FRIGID_RIVER_1: "FRIGID_RIVER_1",
	FRIGID_RIVER_2: "FRIGID_RIVER_2",
	FRIGID_RIVER_3: "FRIGID_RIVER_3",
	FRIGID_RIVER_4: "FRIGID_RIVER_4",
	FRIGID_RIVER_5: "FRIGID_RIVER_5",
	SANDY_BEACH: "SANDY_BEACH",
	SANDY_CAVE: "SANDY_CAVE",
	SHORE: "SHORE",
	ARAGAIN_FALLS: "ARAGAIN_FALLS",
	ON_THE_RAINBOW: "ON_THE_RAINBOW",
	DAM_BASE: "DAM_BASE",
	DAM: "DAM",
	DAM_LOBBY: "DAM_LOBBY",
	MAINTENANCE_ROOM: "MAINTENANCE_ROOM",

	NORTH_SOUTH_PASSAGE: "NORTH_SOUTH_PASSAGE",
	CHASM: "CHASM",
	DEEP_CANYON: "DEEP_CANYON",
	RESERVOIR_SOUTH: "RESERVOIR_SOUTH",
	STREAM_VIEW: "STREAM_VIEW",
	STREAM: "STREAM",
	RESERVOIR: "RESERVOIR",
	RESERVOIR_EMPTY: "RESERVOIR_EMPTY",
	RESERVOIR_NORTH: "RESERVOIR_NORTH",
	ATLANTIS_ROOM: "ATLANTIS_ROOM",
	CAVE_NORTH: "CAVE_NORTH",
	TWISTING_PASSAGE: "TWISTING_PASSAGE",
	MIRROR_ROOM_NORTH: "MIRROR_ROOM_NORTH",
	COLD_PASSAGE: "COLD_PASSAGE",
	SLIDE_ROOM: "SLIDE_ROOM",
	MINE_ENTRANCE: "MINE_ENTRANCE",
	SQUEAKY_ROOM: "SQUEAKY_ROOM",
	BAT_ROOM: "BAT_ROOM",

	SHAFT_ROOM: "SHAFT_ROOM",
	SMELLY_ROOM: "SMELLY_ROOM",
	GAS_ROOM: "GAS_ROOM",
	COAL_MINE_1: "COAL_MINE_1",
	COAL_MINE_2: "COAL_MINE_2",
	COAL_MINE_3: "COAL_MINE_3",
	COAL_MINE_4: "COAL_MINE_4",
	LADDER_TOP: "LADDER_TOP",
	LADDER_BOTTOM: "LADDER_BOTTOM",
	DEAD_END_COAL_MINE: "DEAD_END_COAL_MINE",
	TIMBER_ROOM: "TIMBER_ROOM",
	DRAFTY_ROOM: "DRAFTY_ROOM",
	MACHINE_ROOM: "MACHINE_ROOM",

	GRATING_ROOM: "GRATING_ROOM",
	CYCLOPS_ROOM: "CYCLOPS_ROOM",
	STRANGE_PASSAGE: "STRANGE_PASSAGE",
	TREASURE_ROOM: "TREASURE_ROOM",
	TREASURE_ROOM_INVISIBLE: "TREASURE_ROOM_INVISIBLE",

	MAZE_1: "MAZE_1",
	MAZE_2: "MAZE_2",
	MAZE_3: "MAZE_3",
	MAZE_4: "MAZE_4",
	MAZE_5: "MAZE_5",
	MAZE_6: "MAZE_6",
	MAZE_7: "MAZE_7",
	MAZE_8: "MAZE_8",
	MAZE_9: "MAZE_9",
	MAZE_10: "MAZE_10",
	MAZE_11: "MAZE_11",
	MAZE_12: "MAZE_12",
	MAZE_13: "MAZE_13",
	MAZE_14: "MAZE_14",
	MAZE_15: "MAZE_15",
	DEAD_END_MAZE_NORTH: "DEAD_END_MAZE_NORTH",
	DEAD_END_MAZE_SOUTHEAST: "DEAD_END_MAZE_SOUTHEAST",
	DEAD_END_MAZE_CENTER: "DEAD_END_MAZE_CENTER",
	DEAD_END_MAZE_SOUTHWEST: "DEAD_END_MAZE_SOUTHWEST",

	INSIDE_BIRDS_NEST: "INSIDE_BIRDS_NEST",
	INSIDE_BROKEN_EGG: "INSIDE_BROKEN_EGG",
	INSIDE_BUOY: "INSIDE_BUOY",
	INSIDE_COFFIN: "INSIDE_COFFIN",
	INSIDE_EGG: "INSIDE_EGG",
	INSIDE_MAILBOX: "INSIDE_MAILBOX",
	INSIDE_TROPHY_CASE: "INSIDE_TROPHY_CASE",
	INSIDE_SACK: "INSIDE_SACK",
	INSIDE_BOAT: "INSIDE_BOAT",
	INSIDE_BASKET: "INSIDE_BASKET",
	INSIDE_TUBE: "INSIDE_TUBE",
	INSIDE_COAL_MACHINE: "INSIDE_COAL_MACHINE",

	ON_ALTAR: "ON_ALTAR",
	ON_ATTIC_TABLE: "ON_ATTIC_TABLE",
	ON_KITCHEN_TABLE: "ON_KITCHEN_TABLE",
	ON_PEDESTAL: "ON_PEDESTAL",
	ON_RAILING: "ON_RAILING",

	PLAYER_INVENTORY: "PLAYER_INVENTORY",
	THIEF_INVENTORY: "THIEF_INVENTORY",
	TROLL_INVENTORY: "TROLL_INVENTORY",
	CYCLOPS_INVENTORY: "CYCLOPS_INVENTORY"
};

const PREPOSITIONS = {
	"ATTACK": "with",
	"BREAK": "with",
	"BURN": "with",
	"CUT": "with",
	"DIG": "with",
	"FILL": "with",
	"GIVE": "to",
	"INFLATE": "with",
	"LOCK": "with",
	"PUT": "in",
	"THROW": "at",
	"TIE": "to",
	"TURN": "with",
	"UNLOCK": "with"
};

const GAME_WORDS = [
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
	"k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
	"u", "v", "w", "x", "y", "z", "ne", "nw", "se", "sw",
	"again", "all", "an", "and", "around", "at", "attach", "attack", "author",
	"bar", "bell", "bird", "bottle", "box", "bug", "but",
	"carpet", "case", "close",
	"door", "down", "drop",
	"east", "egg", "examine", "everything", "except", "exit",
	"five", "fuck",
	"giant", "go",
	"hand", "high", "highfive", "hit", "house",
	"in", "inn", "inside", "inventory", "it",
	"jump", "juniper",
	"key", "kick", "kitchen", "knife",
	"lantern", "leaflet", "light", "lock", "look",
	"mailbox", "move",
	"nest", "next", "north", "northeast", "northwest", "note",
	"odysseus", "off", "on", "open", "or", "out",
	"passage", "piano", "pick", "pile", "place", "put", "play", "please", "pull", "punch",
	"quit",
	"read", "ring", "room", "rope",
	"sack", "say", "scream", "shit", "shout", "slap", "songbird", "south", "southeast", "southwest", "store", "sword",
	"take", "the", "them", "tie", "to", "trap", "treasure", "treasures", "trophy", "turn",
	"ulysses", "unlock", "up",
	"wait", "walk", "west", "window", "with", "wizard",
	"yell"
];

const THIEF_LOCATIONS = [
	"EAST_OF_CHASM", "GALLERY", "STUDIO", "EAST_WEST_PASSAGE", "ROUND_ROOM",
	"NARROW_PASSAGE", "MIRROR_ROOM_SOUTH", "WINDING_PASSAGE", "CAVE_SOUTH",
	"ALTAR", "TEMPLE", "EGYPTIAN_ROOM", "TORCH_ROOM", "DOME_ROOM",
	"ENGRAVINGS_CAVE", "DAMP_CAVE", "WHITE_CLIFFS_BEACH_NORTH", "WHITE_CLIFFS_BEACH_SOUTH",
	"DAM_BASE", "DAM", "DAM_LOBBY", "MAINTENANCE_ROOM", "NORTH_SOUTH_PASSAGE", "CHASM",
	"DEEP_CANYON", "RESERVOIR_SOUTH", "STREAM_VIEW", "RESERVOIR_EMPTY", "RESERVOIR_NORTH",
	"ATLANTIS_ROOM", "CAVE_NORTH", "TWISTING_PASSAGE", "MIRROR_ROOM_NORTH", "COLD_PASSAGE",
	"SLIDE_ROOM", "MINE_ENTRANCE", "SQUEAKY_ROOM", "SHAFT_ROOM", "SMELLY_ROOM", "GAS_ROOM",
	"COAL_MINE_1", "COAL_MINE_2", "COAL_MINE_3", "COAL_MINE_4", "LADDER_TOP",
	"LADDER_BOTTOM", "DEAD_END_COAL_MINE", "TIMBER_ROOM", "GRATING_ROOM", "TREASURE_ROOM",

	"MAZE_1", "MAZE_2", "MAZE_3", "MAZE_4", "MAZE_5", "MAZE_6", "MAZE_7", "MAZE_8",
	"MAZE_9", "MAZE_10", "MAZE_11", "MAZE_12", "MAZE_13", "MAZE_14", "MAZE_15",
	"DEAD_END_MAZE_NORTH","DEAD_END_MAZE_SOUTHEAST",
	"DEAD_END_MAZE_CENTER", "DEAD_END_MAZE_SOUTHWEST"
];

const COAL_MINE = [
	"COAL_MINE_1", "COAL_MINE_2", "COAL_MINE_3", "COAL_MINE_4"
];

const OVERWORLD = [
	"WEST_OF_HOUSE", "NORTH_OF_HOUSE", "BEHIND_HOUSE", "SOUTH_OF_HOUSE", "FOREST_PATH",
	"FOREST_WEST", "FOREST_EAST", "FOREST_NORTHEAST", "FOREST_SOUTH", "CLEARING_NORTH",
	"CLEARING_EAST", "CANYON_VIEW", "ROCKY_LEDGE", "CANYON_BOTTOM"
];

const FOREST = [
	"FOREST_WEST", "FOREST_EAST", "FOREST_SOUTH", "FOREST_NORTHEAST"
];

const OPENABLE_INSTANCES = [
	"WINDOW", "DOOR", "TRAPDOOR", "TRAP", "TREE", "KITCHEN",
	"CHIMNEY",
];

const OUTPUT_LISTS = {
	saveLoaded: `Game loaded from a previous save.`,
	gameSaved: `Your game state has been saved.`,
	gameReset: `Your game state has been reset.`,
	emptyBag: `There is nothing in your bag!`,
	bagContains: `Your bag contains:`,
	acceptableCommands: `Here is a list of acceptable commands:`,
	acceptableCommandList: [
		`> go [ direction ]`,
		`> north`,
		`> east`,
		`> south`,
		`> west`,
		`> up`,
		`> down`,
		`> look`,
		`> open`,
		`> enter`,
		`> exit`,
		`> climb`,
		`> brief [ short descriptions ]`,
		`> verbose [ long descriptions ]`,
		`> help`,
		`> take`,
		`> bag`,
		`> save [ Save current game ]`,
		`> reset [ Reset game including save ]`
	],
	verboseMode: `ZORK is now in its \`verbose\` mode, which always gives long descriptions of locations (even if you've been there before).`,
	briefMode: `ZORK is now in its normal \`brief\` printing mode, which gives long descriptions of places never before visited, and short descriptions otherwise.`,
	invalidDirection: `You can't go that way.`,
	notOpenable: `You can't open that.`,
	notUseable: `Use what?`,
	alreadyInUse: `The item is already in use. Putting item away.`,
	notReadable: `You can't read that.`,
	emptyCommand: `I beg your pardon?`,
	invalidCommand: `I can't tell what you're trying to do.`,
	noPreviousCommand: `Again what?`,
	titleScreen: `${cfg.colors.yellowBold}ZORK I: The Great Underground Empire.${cfg.colors.reset}${cfg.newLineFull}${cfg.colors.black}Copyright (c) 1981, 1982, 1982 Infocom, Inc. All rights reserved.${cfg.newLine}ZORK is a registered trademark of Infocom, Inc.${cfg.newLine}Revision 89 / Serial Number 840726${cfg.newLineFull}Original game by Tim Anderson, Marc Blank, Bruce Daniels, and Dave Lebling.${cfg.newLine}Latest version by Joseph Salvatori, extended from a JavaScript port by Nate Tryon (https://github.com/PotterOtherP).${cfg.colors.reset}${cfg.newLineFull}Type "help" for a list of commands.`,
	aboutGame: `Zork I: The Great Underground Empire is a classic computer game developed by${LINE_BREAK}Marc Blank, Dave Lebling, Bruce Daniels, and Tim Anderson at MIT in the late 1970s.${LINE_BREAK}It became the basis of the computer game company Infocom, which published many Zork-related${LINE_BREAK}titles in the 1980s and 1990s, and was acquired by Activision, which still owns the copyright.`,
	bugReport: `Bug? Maybe in the original program, but not in a flawless remake like this! (Cough, cough.)`,
};

const MAP_STRINGS = {
	DESC_WEST_OF_HOUSE: `You are standing in an open field west of a white house, with a boarded front door.${cfg.newLineFull}`
    + `There is a small mailbox here.`,

    DESC_NORTH_OF_HOUSE: `You are facing the north side of a white house. There is no door here, `
        + `and all the windows are boarded up. To the north a narrow path winds through the trees.`,

    DESC_BEHIND_HOUSE: `You are behind the white house. A path leads into the forest to the east. `
        + `\nIn one corner of the house there is a small window which is slightly ajar.`,

    DESC_BEHIND_HOUSE_WINDOW_OPEN: `You are behind the white house. A path leads into the forest to the east. `
        + `\nIn one corner of the house there is a small window which is open.`,

    DESC_SOUTH_OF_HOUSE: `You are facing the south side of a white house. There is no door here, `
        + `and all the windows are boarded.`,

    DESC_KITCHEN_WINDOW_OPEN: `You are in the kitchen of the white house. A table seems to have been used recently `
        + `for the preparation of food. A passage leads to the west and a dark staircase can be seen leading upward. A dark chimney `
        + `leads down and to the east is a small window which is open.`,

    DESC_KITCHEN_WINDOW_CLOSED: `You are in the kitchen of the white house. A table seems to have been used recently `
        + `for the preparation of food. A passage leads to the west and a dark staircase can be seen leading upward. A dark chimney `
        + `leads down and to the east is a small window which is slightly ajar.`,

    DESC_LIVING_ROOM: `You are in the living room. There is a doorway to the east`,

    DESC_ATTIC: `This is the attic. The only exit is a stairway leading down.`,

    DESC_FOREST_PATH: `This is a path winding through a dimly lit forest. The path leads north-south here. `
        + `One particularly large tree with some low branches stands at the edge of the path.`,

    DESC_UP_TREE: `You are about 10 feet above the ground nestled among some large branches. `
        + `The nearest branch above you is above your reach.`,

    DESC_FOREST_WEST: `This is a forest, with trees in all directions. To the east, there appears to be sunlight.`,

    DESC_FOREST_EAST: `This is a dimly lit forest, with large trees all around.`,

    DESC_FOREST_NORTHEAST: `The forest thins out, revealing impassable mountains.`,

    DESC_FOREST_SOUTH: `This is a dimly lit forest, with large trees all around.`,

    DESC_CLEARING_NORTH: `You are in a clearing, with a forest surrounding you on all sides. A path leads south.`,

    DESC_CLEARING_EAST: `You are in a small clearing in a well marked forest path that extends to the east and west.`,

    DESC_CANYON_VIEW: `You are at the top of the Great Canyon on its west wall. From here there is a `
        + `marvelous view of the canyon and parts of the Frigid River upstream. Across the canyon, the walls of the White Cliffs `
        + `join the mighty ramparts of the Flathead Mountains to the east. Following the Canyon upstream to the north, `
        + `Aragain Falls may be seen, complete with rainbow. The mighty Frigid River flows out from a great dark cavern. `
        + `To the west and south can be seen an immense forest, stretching for miles around. A path leads northwest. `
        + `It is possible to climb down into the canyon from here.`,

    DESC_ROCKY_LEDGE: `You are on a ledge about halfway up the wall of the river canyon. You can see `
        + `from here that the main flow from Aragain Falls twists along a passage which it is impossible for you to enter. `
        + `Below you is the canyon bottom. Above you is more cliff, which appears climbable.`,

    DESC_CANYON_BOTTOM: `You are beneath the walls of the river canyon which may be climbable here. `
        + `The lesser part of the runoff of Aragain Falls flows by below. To the north is a narrow path.`,

    DESC_END_OF_RAINBOW: `You are on a small, rocky beach on the continuation of the Frigid River past `
        + `the Falls. The beach is narrow due to the presence of the White Cliffs. The river canyon opens here and sunlight `
        + `shines in from above. A rainbow crosses over the falls to the east and a narrow path continues to the southwest.`,

    DESC_STONE_BARROW: `You are standing in front of a massive barrow of stone. In the east face is `
        + `a huge stone door which is open. You cannot see into the dark of the tomb.`,

    DESC_INSIDE_STONE_BARROW: `As you enter the barrow, the door closes inexorably behind you. Around you `
        + `it is dark, but ahead is an enormous cavern, brightly lit. Through its center runs a wide stream. Spanning the stream is `
        + `a small wooden footbridge, and beyond a path leads into a dark tunnel. Above the bridge, floating in the air, is a large `
        + `sign. It reads: All ye who stand before this bridge have completed a great and perilous adventure which has tested your `
        + `wit and courage. You have mastered the first part of the ZORK trilogy. Those who pass over this bridge must be prepared `
        + `to undertake an even greater adventure that will severely test your skill and bravery!\n`
        + `The ZORK trilogy continues with "ZORK II: The Wizard of Frobozz" and is completed in "ZORK III: The Dungeon Master."`,

    DESC_CELLAR: `You are in a dark and damp cellar with a narrow passageway leading north, and a `
        + `crawlway to the south. On the west is the bottom of a steep metal ramp which is unclimbable.`,

    DESC_EAST_OF_CHASM: `You are on the east edge of a chasm, the bottom of which cannot be seen. A `
        + `narrow passage goes north, and the path you are on continues to the east.`,

    DESC_GALLERY: `This is an art gallery. Most of the paintings have been stolen by vandals with `
        + `exceptional taste. The vandals left through either the north or west exits.`,

    DESC_STUDIO: `This appears to have been an artist's studio. The walls and floors are splattered `
        + `with paints of 69 different colors. Strangely enough, nothing of value is hanging here. At the south end of the room `
        + `is an open door (also covered with paint). A dark and narrow chimney leads up from a fireplace, although you might be `
        + `able to get up it, it seems unlikely you could get back down.`,

    DESC_TROLL_ROOM: `This is a small room with passages to the east and south and a forbidding hole `
        + `leading west. Bloodstains and deep scratches (perhaps made by an axe) mar the walls.`,

    DESC_EAST_WEST_PASSAGE: `This is a narrow east-west passageway. There is a narrow stairway `
        + `leading down at the north end of the room.`,

    DESC_ROUND_ROOM: `This is a circular stone room with passages in all directions. Several of them `
        + `have unfortunately been blocked by cave-ins.`,

    DESC_NARROW_PASSAGE: `This is a long and narrow corridor where a long north-south passageway `
        + `briefly narrows even further.`,

    DESC_MIRROR_ROOM_SOUTH: `You are in a large square room with tall ceilings. On the south wall is `
        + `an enormous mirror which fills the entire wall. There are exits on the other three sides of the room.`,

    DESC_WINDING_PASSAGE: `This is a winding passage. It seems that there are only exits on the east `
        + `and north.`,

    DESC_CAVE_SOUTH: `This is a tiny cave with entrances west and north, and a dark, forbidding `
        + `staircase leading down.`,

    DESC_ENTRANCE_TO_HADES: `You are outside a large gateway, on which is inscribed${cfg.newLineFull}`
        + `  Abandon every hope all ye who enter here!${cfg.newLineFull}`
        + `The gate is open, through it you can see a desolation, with a pile of mangled bodies in one corner. Thousands `
        + `of voices, lamenting some hideous fate, can be heard.\n`,

    DESC_LAND_OF_THE_DEAD: `You have entered the Land of the Living Dead. Thousands of lost `
        + `souls can be heard weeping and moaning. In the corner are stacked the remains of dozens of previous adventurers `
        + `less fortunate than yourself. A passage exits to the north.`,

    DESC_ALTAR: `This is the south end of a large temple. In front of you is what appears to be `
        + `an altar. In one corner is a small hole in the floor which leads into darkness. You probably could not get back up it.`,

    DESC_TEMPLE: `This is the north end of a large temple. On the east wall is an ancient `
        + `inscription, probably a prayer in a long-forgotten language. Below the prayer is a staircase leading down. `
        + `The west wall is solid granite. The exit to the north end of the room is through huge marble pillars.`,

    DESC_EGYPTIAN_ROOM: `This is a room which looks like an Egyptian tomb. There is an `
        + `ascending staircase to the west.`,

    DESC_DOME_ROOM: `You are at the periphery of a large dome, which forms the ceiling of another `
        + `room below. Protecting you from a precipitous drop is a wooden railing which circles the dome.`,

    DESC_DOME_ROOM_ROPE: `You are at the periphery of a large dome, which forms the ceiling of another `
        + `room below. Protecting you from a precipitous drop is a wooden railing which circles the dome.`
        + `\nHanging down from the railing is a rope which ends about ten feet from the floor below.`,

    DESC_TORCH_ROOM: `This is a large room with a prominent doorway leading to a down staircase. `
        + `Above you is a large dome. Up around the edge of the dome (20 feet up) is a wooden railing. In the center of the `
        + `room sits a white marble pedestal.`,

    DESC_TORCH_ROOM_ROPE: `You are at the periphery of a large dome, which forms the ceiling of another `
        + `room below. Protecting you from a precipitous drop is a wooden railing which circles the dome.`
        + `\nA piece of rope descends from the railing above, ending some five feet above your head.`,

    DESC_ENGRAVINGS_CAVE: `You have entered a low cave with passages leading northwest and east. `
        + `There are old engravings on the walls here.`,

    DESC_LOUD_ROOM: `This is a large room with a ceiling which cannot be detected from the ground. `
        + `There is a narrow passage from east to west and a stone stairway leading upward. The room is deafeningly loud with an `
        + `undetermined rushing sound. The sound seems to reverberate from all of the walls, making it difficult even to think.`,

    DESC_LOUD_ROOM_WATER: `It is unbearably loud here, with an ear-splitting roar seeming to come `
        + `from all around you. There is a pounding in your head which won't stop. With a tremendous effort, you scramble out `
        + `of the room.`,

    DESC_LOUD_ROOM_QUIET: `This is a large room with a ceiling which cannot be detected from the ground. `
        + `There is a narrow passage from east to west and a stone stairway leading upward. The room is eerie in its quietness.`,

    LOUD_ROOM_CHANGE: `The acoustics of the room change subtlely.`,

    LOUD_ROOM_RUSH: `All of a sudden, an alarmingly loud roaring sound fills the room. Filled with `
        + `fear, you scramble away.`,

    DESC_DAMP_CAVE: `This cave has exits to the west and east, and narrows to a crack toward the `
        + `south. The earth is particularly damp here.`,

    DESC_WHITE_CLIFFS_BEACH_NORTH: `You are on a narrow strip of beach which runs along the base of `
        + `the White Cliffs. There is a narrow path heading south along the Cliffs and a tight passage leading west into the `
        + `cliffs themselves.`,

    DESC_WHITE_CLIFFS_BEACH_SOUTH: `You are on a rocky, narrow strip of beach beside the Cliffs. `
        + `A narrow path leads north along the shore.`,

    DESC_DAM_BASE: `You are at the base of Flood Control Dam #3, which looms above you and to the `
        + `north. The river Frigid is flowing by here. Along the river are the White Cliffs which seem to form giant walls `
        + `stretching from north to south along the shores of the river as it winds its way downstream.`,

    DESC_DAM: `You are standing on the top of the Flood Control Dam #3, which was quite a tourist `
        + `attraction in times far distant. There are paths to the north, south, and west, and a scramble down.`,

    DAM_GATES_CLOSED_HIGH: `\nThe sluice gates on the dam are closed. Behind the dam, there can be seen `
        + `a wide reservoir. Water is pouring over the top of the now abandoned dam.`,

    DAM_GATES_CLOSED_LOW: `\nThe sluice gates are closed. The water level in the reservoir is quite low, `
        + `but the level is rising quickly.`,

    DAM_GATES_OPEN_HIGH: `\nThe sluice gates are open, and water rushes through the dam. The water level `
        + `behind the dam is still high.`,

    DAM_GATES_OPEN_LOW: `\nThe water level behind the dam is low: The sluice gates have been opened. `
        + `Water rushes through the dam and downstream.`,

    DAM_BUBBLE_OFF: `\nThere is a control panel here, on which a large metal bolt is mounted. `
        + `Directly above the bolt is a small green plastic bubble.`,

    DAM_BUBBLE_ON: `\nThere is a control panel here, on which a large metal bolt is mounted. `
        + `Directly above the bolt is a small green plastic bubble which is glowing serenely.`,

    DESC_DAM_LOBBY: `This room appears to have been the waiting room for groups touring the dam.`
        + `There are open doorways here to the north and east marked "Private", and there is a path leading south over `
        + `the top of the dam.`,

    DESC_MAINTENANCE_ROOM: `This is what appears to have been the maintenance room for Flood Control `
        + `Dam #3. Apparently, this room has been ransacked recently, for most of the valuable equipment is gone. One the wall in `
        + `front of you is a group of buttons colored blue, yellow, brown, and red. There are doorways to the west and south.`,

    DESC_FRIGID_RIVER_1: `You are in the Frigid River in the vicinity of the Dam. The river flows `
        + `quietly here. There is a landing on the west shore.`,

    DESC_FRIGID_RIVER_2: `The river turns a corner here making it impossible to see the Dam. The `
        + `White Cliffs loom on the east bank and large rocks prevent landing on the west.`,

    DESC_FRIGID_RIVER_3: `The river here descends into a valley. There is a narrow beach on the `
        + `west shore below the cliffs. In the distance a faint rumbling can be heard.`,

    DESC_FRIGID_RIVER_4: `The river is running faster here and the sound ahead appears to be that `
        + `of rushing water. On the east shore is a sandy beach. A small area of beach can also be seen below the cliffs on `
        + `the west shore.`,

    DESC_FRIGID_RIVER_5: `The sound of rushing water is nearly unbearable here. On the east shore `
        + `is a large landing area.`,

    DESC_SANDY_BEACH: `You are on a large sandy beach on the east shore of the river, which is flowing `
        + `quickly by. A path runs beside the river to the south here, and a passage is partially buried in sand to the northeast.`,

    DESC_SANDY_CAVE: `This is a sand-filled cave whose exit is to the southwest.`,

    DESC_SHORE: `You are on the east shore of the river. The water here seems somewhat treacherous. `
        + `A path travels from north to south here, the south end quickly turning around a sharp corner.`,

    DESC_ARAGAIN_FALLS: `You are at the top of Aragain Falls, an enormous waterfall with a drop of `
        + `about 450 feet. The only path here is on the north end.`,

    DESC_ON_THE_RAINBOW: `You are on top of a rainbow (I bet you never thought you would walk on `
        + `a rainbow), with a magnificent view of the Falls. The rainbow travels east-west here.`,

    DESC_NORTH_SOUTH_PASSAGE: `This is a high north-south passage, which forks to the northeast.`,

    DESC_CHASM: `A chasm runs southwest to northeast and the path follows it. You are on the `
        +`south side of the chasm, where a crack opens into a passage.`,

    DESC_DEEP_CANYON_QUIET: `You are on the south edge of a deep canyone. Passages lead off to `
        + `the east, northwest and southwest. A stairway leads down.`,

    DESC_DEEP_CANYON_WATER: `You are on the south edge of a deep canyon. Passages lead off to the east, `
        + `northwest and southwest. A stairway leads down. You can hear the sound of flowing water from below.`,

    DESC_DEEP_CANYON_RUSH: `You are on the south edge of a deep canyon. Passages lead off to `
        + `the east, northwest and southwest. A stairway leads down. You can hear a loud roaring sound, like that of rushing `
        + `water, from below.`,

    DESC_RESERVOIR_SOUTH: `You are in a long room on the south shore of a large lake, far too deep `
        + `and wide for crossing.\nThere is a path along the stream to the east or west, a steep pathway climbing southwest `
        + `along the edge of a chasm, and a path leading into a canyon to the southeast.`,

    DESC_RESERVOIR_SOUTH_EMPTY: `You are in a long room, to the north of which was formerly a lake. `
        + `However, with the water level lowered, there is merely a wide stream running through the center of the room.\n`
        + `There is a path along the stream to the east or west, a steep pathway climbing southwest `
        + `along the edge of a chasm, and a path leading into a canyon to the southeast.`,

    DESC_RESERVOIR_SOUTH_FALLING: `You are in a long room. To the north is a large lake, too deep `
        + `to cross. You notice, however, that the water level appears to be dropping at a rapid rate. Before long, it might `
        + `be possible to cross to the other side from here.\n`
        + `There is a path along the stream to the east or west, a steep pathway climbing southwest `
        + `along the edge of a chasm, and a path leading into a canyon to the southeast.`,

    DESC_RESERVOIR_SOUTH_RISING: `You are in a long room, to the north of which is a wide area which `
        + `was formerly a reservoir, but now is merely a stream. You notice, however, that the level of the stream is rising `
        + `quickly and that before long it will be impossible to cross here.\n`
        + `There is a path along the stream to the east or west, a steep pathway climbing southwest `
        + `along the edge of a chasm, and a path leading into a canyon to the southeast.`,

    RESERVOIR_FILLS: `You notice that the water level has risen to the point that it is impossible to cross.`,

    RESERVOIR_FILLS_BOAT: `The rising water carries the boat over the dam, down the river, and over the `
        + `falls. Tsk, tsk.`,

    RESERVOIR_FILLS_SWIM: `You are lifted up by the rising river! You try to swim, but the currents are `
        + `too strong. You come closer, closer to the awesome structure of Flood Control Dam #3. The dam beckons to you. The roar `
        + `of the water nearly deafens you, but you remain conscious as you tumble over the dam toward your certain doom among the `
        + `rocks at its base.`,

    RESERVOIR_EMPTIES: `The water level is now quite low here and you could easily cross over to the other side.`,

    RESERVOIR_EMPTIES_BOAT: `The water level has dropped to the point at which the boat can no longer stay `
        + `afloat. It sinks into the mud.`,

    RESERVOIR_RISING: `You notice that the water level here is rising rapidly. The currents are also `
        + `becoming stronger. Staying here seems quite perilous!`,

    RESERVOIR_RISING_BOAT: `The boat lifts gently out of the mud and is now floating on the reservoir.`,

    DESC_STREAM_VIEW: `You are standing on a path beside a gently flowing stream. The path follows `
        + `the stream, which flows from east to west.`,

    DESC_STREAM: `You are on the gently flowing stream. The upstream route is too narrow to navigate, `
        + `and the downstream route is invisible due to twisting walls. There is a narrow beach to land on.`,

    DESC_RESERVOIR: `You are on the lake. Beaches can be seen north and south. Upstream a small `
        + `stream enters the lake through a narrow cleft in the rocks. The dam can be seen downstream.`,

    DESC_RESERVOIR_EMPTY: `You are on what used to be a large lake, but which is now a large `
        + `mud pile. There are "shores" to the north and south.`,

    DESC_RESERVOIR_NORTH: `You are in a large cavernous room, north of a large lake.\nThere is a `
        + `slimy stairway leaving the room to the north.`,

    DESC_RESERVOIR_NORTH_EMPTY: `You are in a large cavernous room, the south of which was formerly `
        + `a lake. However, with the water level lowered, there is merely a wide stream running through there.`
        + `\nThere is a slimy stairway leaving the room to the north.`,

    DESC_RESERVOIR_NORTH_FALLING: `You are in a large cavernous area. To the south is a wide lake, `
        + `whose water level appears to be falling rapidly.`
        + `\nThere is a slimy stairway leaving the room to the north.`,

    DESC_RESERVOIR_NORTH_RISING: `You are in a cavernous area, to the south of which is a very `
        + `wide stream. The level of the stream is rising rapidly, and it appears that before long it will be impossible `
        + `to cross to the other side.`
        + `\nThere is a slimy stairway leaving the room to the north.`,

    DESC_ATLANTIS_ROOM: `This is an ancient room, long under water. There is an exit to the south `
        + `and a staircase leading up.`,

    DESC_CAVE_NORTH: `This is a tiny cave with entrances west and north, and a staircase leading down.`,

    DESC_TWISTING_PASSAGE: `This is a winding passage. It seems that there are only exits on the east `
        + `and north.`,

    DESC_MIRROR_ROOM_NORTH: `You are in a large square room with tall ceilings. On the south wall is `
        + `an enormous mirror which fills the entire wall. There are exits on the other three sides of the room.`,

    DESC_COLD_PASSAGE: `This is a cold and damp corridor where a long east-west passageway turns `
        + `into a southward path.`,

    DESC_SLIDE_ROOM: `This is a small chamber, which appears to have been part of a coal mine. On `
        + `the south wall of the chamber the letters "Granite Wall" are etched in the rock. To the east is a long passage, `
        + `and there is a steep metal slide twisting downward. To the north is a small opening.`,

    DESC_MINE_ENTRANCE: `You are standing at the entrance of what might have been a coal mine. The shaft `
        + `enters the west wall, and there is another exit on the south end of the room.`,

    DESC_SQUEAKY_ROOM: `You are in a small room. Strange squeaky sounds may be heard coming from the `
        + `passage at the north end. You may also escape to the east.`,

    DESC_BAT_ROOM: `You are in a small room which has doors only to the east and south.`,

    DESC_SHAFT_ROOM: `This is a large room, in the middle of which is a small shaft descending through `
        + `the floor into darkness below. To the west and the north are exits from this room. Constructed over the top of the shaft `
        + `is a metal framework to which a heavy iron chain is attached.`,

    DESC_SMELLY_ROOM: `This is a small non-descript room. However, from the direction of a small `
        + `descending staircase a foul odor can be detected. To the south is a narrow tunnel.`,

    DESC_GAS_ROOM: `This is a small room which smells strongly of coal gas. There is a short climb `
        + `up some stairs and a narrow tunnel leading east.`,

    DESC_COAL_MINE_1: `This is a non-descript part of a coal mine.`,
    DESC_COAL_MINE_2: `This is a non-descript part of a coal mine.`,
    DESC_COAL_MINE_3: `This is a non-descript part of a coal mine.`,
    DESC_COAL_MINE_4: `This is a non-descript part of a coal mine.`,

    DESC_LADDER_TOP: `This is a very small room. In the corner is a rickety wooden ladder, leading `
        + `downward. It might be safe to descend. There is also a staircase leading upward.`,

    DESC_LADDER_BOTTOM: `This is a rather wide room. On one side is the bottom of a narrow wooden `
        + `ladder. To the west and the south are passages leaving the room.`,

    DESC_DEAD_END_COAL_MINE: `You have come to a dead end in the mine.`,

    DESC_TIMBER_ROOM: `This is a long and narrow passage, which is cluttered with broken timbers. `
        + `A wide passage comes from the east and turns at the west end of the room into a very narrow passageway. From the `
        + `west comes a strong draft.`,

    DESC_DRAFTY_ROOM: `This is a small drafty room in which is the bottom of a long shaft. To the `
        + `south is a passageway and to the east a very narrow passage. In the shaft can be seen a heavy iron chain.`,

    DESC_MACHINE_ROOM: `This is a large, cold room whose sole exit is to the north. In one corner `
        + `there is a machine which is reminiscent of a clothes dryer. On its face is a switch which is labelled "START". `
        + `The switch does not appear to be manipulable by any human hand (unless the fingers are about 1/16 by 1/4 inch).`,

    DESC_GRATING_ROOM: `You are in a small room near the maze. There are twisty passages in the `
        + `immediate vicinity.\nAbove you is a grating locked with a skull-and-crossbones lock.`,

    DESC_CYCLOPS_ROOM: `This room has an exit on the northwest, and a staircase leading up.`,

    DESC_STRANGE_PASSAGE: `This is a long passage. To the west is one entrance. On the east there `
        + `is an old wooden door, with a large opening in it (about cyclops sized).`,

    DESC_TREASURE_ROOM: `This is a large room, whose east wall is solid granite. A number of `
        + `discarded bags, which crumble at your touch, are scattered about on the floor. There is an exit down a staircase.`,

    DESC_MAZE_1: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_2: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_3: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_4: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_5: `This is part of a maze of twisty little passages, all alike. A skeleton, `
        + `probably the remains of a luckless adventurer, lies here.`,
    DESC_MAZE_6: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_7: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_8: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_9: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_10: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_11: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_12: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_13: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_14: `This is part of a maze of twisty little passages, all alike.`,
    DESC_MAZE_15: `This is part of a maze of twisty little passages, all alike.`,
    DESC_DEAD_END_MAZE_NORTH: `You have come to a dead end in the maze.`,
    DESC_DEAD_END_MAZE_SOUTHEAST: `You have come to a dead end in the maze.`,
    DESC_DEAD_END_MAZE_CENTER: `You have come to a dead end in the maze.`,
    DESC_DEAD_END_MAZE_SOUTHWEST: `You have come to a dead end in the maze.`,

    FOREST_NE_FAIL_1: `The mountains are impassable.`,

    KITCHEN_WINDOW_CLOSED: `The window is slightly ajar, but not enough to allow entry.`
}

const actions = {

	"north": {action: ACTION.NORTH, type: ACTION_TYPE.EXIT},
	"go north": {action: ACTION.NORTH, type: ACTION_TYPE.EXIT},
	"walk north": {action: ACTION.NORTH, type: ACTION_TYPE.EXIT},
	"exit north": {action: ACTION.NORTH, type: ACTION_TYPE.EXIT},
	"n": {action: ACTION.NORTH, type: ACTION_TYPE.EXIT},
	"go n": {action: ACTION.NORTH, type: ACTION_TYPE.EXIT},
	"walk n": {action: ACTION.NORTH, type: ACTION_TYPE.EXIT},
	"exit n": {action: ACTION.NORTH, type: ACTION_TYPE.EXIT},

	"south": {action: ACTION.SOUTH, type: ACTION_TYPE.EXIT},
	"go south": {action: ACTION.SOUTH, type: ACTION_TYPE.EXIT},
	"walk south": {action: ACTION.SOUTH, type: ACTION_TYPE.EXIT},
	"exit south": {action: ACTION.SOUTH, type: ACTION_TYPE.EXIT},
	"s": {action: ACTION.SOUTH, type: ACTION_TYPE.EXIT},
	"go s": {action: ACTION.SOUTH, type: ACTION_TYPE.EXIT},
	"walk s": {action: ACTION.SOUTH, type: ACTION_TYPE.EXIT},
	"exit s": {action: ACTION.SOUTH, type: ACTION_TYPE.EXIT},

	"east": {action: ACTION.EAST, type: ACTION_TYPE.EXIT},
	"go east": {action: ACTION.EAST, type: ACTION_TYPE.EXIT},
	"walk east": {action: ACTION.EAST, type: ACTION_TYPE.EXIT},
	"exit east": {action: ACTION.EAST, type: ACTION_TYPE.EXIT},
	"e": {action: ACTION.EAST, type: ACTION_TYPE.EXIT},
	"go e": {action: ACTION.EAST, type: ACTION_TYPE.EXIT},
	"walk e": {action: ACTION.EAST, type: ACTION_TYPE.EXIT},
	"exit e": {action: ACTION.EAST, type: ACTION_TYPE.EXIT},

	"west": {action: ACTION.WEST, type: ACTION_TYPE.EXIT},
	"go west": {action: ACTION.WEST, type: ACTION_TYPE.EXIT},
	"walk west": {action: ACTION.WEST, type: ACTION_TYPE.EXIT},
	"exit west": {action: ACTION.WEST, type: ACTION_TYPE.EXIT},
	"w": {action: ACTION.WEST, type: ACTION_TYPE.EXIT},
	"go w": {action: ACTION.WEST, type: ACTION_TYPE.EXIT},
	"walk w": {action: ACTION.WEST, type: ACTION_TYPE.EXIT},
	"exit w": {action: ACTION.WEST, type: ACTION_TYPE.EXIT},

	"northeast": {action: ACTION.NORTHEAST, type: ACTION_TYPE.EXIT},
	"go northeast": {action: ACTION.NORTHEAST, type: ACTION_TYPE.EXIT},
	"walk northeast": {action: ACTION.NORTHEAST, type: ACTION_TYPE.EXIT},
	"exit northeast": {action: ACTION.NORTHEAST, type: ACTION_TYPE.EXIT},
	"ne": {action: ACTION.NORTHEAST, type: ACTION_TYPE.EXIT},
	"go ne": {action: ACTION.NORTHEAST, type: ACTION_TYPE.EXIT},
	"walk ne": {action: ACTION.NORTHEAST, type: ACTION_TYPE.EXIT},
	"exit ne": {action: ACTION.NORTHEAST, type: ACTION_TYPE.EXIT},

	"northwest": {action: ACTION.NORTHWEST, type: ACTION_TYPE.EXIT},
	"go northwest": {action: ACTION.NORTHWEST, type: ACTION_TYPE.EXIT},
	"walk northwest": {action: ACTION.NORTHWEST, type: ACTION_TYPE.EXIT},
	"exit northwest": {action: ACTION.NORTHWEST, type: ACTION_TYPE.EXIT},
	"nw": {action: ACTION.NORTHWEST, type: ACTION_TYPE.EXIT},
	"go nw": {action: ACTION.NORTHWEST, type: ACTION_TYPE.EXIT},
	"walk nw": {action: ACTION.NORTHWEST, type: ACTION_TYPE.EXIT},
	"exit nw": {action: ACTION.NORTHWEST, type: ACTION_TYPE.EXIT},

	"southeast": {action: ACTION.SOUTHEAST, type: ACTION_TYPE.EXIT},
	"go southeast": {action: ACTION.SOUTHEAST, type: ACTION_TYPE.EXIT},
	"walk southeast": {action: ACTION.SOUTHEAST, type: ACTION_TYPE.EXIT},
	"exit southeast": {action: ACTION.SOUTHEAST, type: ACTION_TYPE.EXIT},
	"se": {action: ACTION.SOUTHEAST, type: ACTION_TYPE.EXIT},
	"go se": {action: ACTION.SOUTHEAST, type: ACTION_TYPE.EXIT},
	"walk se": {action: ACTION.SOUTHEAST, type: ACTION_TYPE.EXIT},
	"exit se": {action: ACTION.SOUTHEAST, type: ACTION_TYPE.EXIT},

	"southwest": {action: ACTION.SOUTHWEST, type: ACTION_TYPE.EXIT},
	"go southwest": {action: ACTION.SOUTHWEST, type: ACTION_TYPE.EXIT},
	"walk southwest": {action: ACTION.SOUTHWEST, type: ACTION_TYPE.EXIT},
	"exit southwest": {action: ACTION.SOUTHWEST, type: ACTION_TYPE.EXIT},
	"sw": {action: ACTION.SOUTHWEST, type: ACTION_TYPE.EXIT},
	"go sw": {action: ACTION.SOUTHWEST, type: ACTION_TYPE.EXIT},
	"walk sw": {action: ACTION.SOUTHWEST, type: ACTION_TYPE.EXIT},
	"exit sw": {action: ACTION.SOUTHWEST, type: ACTION_TYPE.EXIT},

	// 	"climb up": {action: ACTION.UP, type: ACTION_TYPE.EXIT},
	"up": {action: ACTION.UP, type: ACTION_TYPE.EXIT},
	"go up": {action: ACTION.UP, type: ACTION_TYPE.EXIT},
	"u": {action: ACTION.UP, type: ACTION_TYPE.EXIT},
	"go u": {action: ACTION.UP, type: ACTION_TYPE.EXIT},

	"climb down": {action: ACTION.DOWN, type: ACTION_TYPE.EXIT},
	"down": {action: ACTION.DOWN, type: ACTION_TYPE.EXIT},
	"go down": {action: ACTION.DOWN, type: ACTION_TYPE.EXIT},
	"d": {action: ACTION.DOWN, type: ACTION_TYPE.EXIT},
	"go d": {action: ACTION.DOWN, type: ACTION_TYPE.EXIT},

	"land": {action: ACTION.LAND, type: ACTION_TYPE.EXIT},
	"in": {action: ACTION.IN, type: ACTION_TYPE.EXIT},
	"inside": {action: ACTION.IN, type: ACTION_TYPE.EXIT},
	"go in": {action: ACTION.IN, type: ACTION_TYPE.EXIT},
	"go inside": {action: ACTION.IN, type: ACTION_TYPE.EXIT},
	"out": {action: ACTION.OUT, type: ACTION_TYPE.EXIT},
	"go out": {action: ACTION.OUT, type: ACTION_TYPE.EXIT},
	"go outside": {action: ACTION.OUT, type: ACTION_TYPE.EXIT},
	"outside": {action: ACTION.OUT, type: ACTION_TYPE.EXIT},
	"exit": {action: ACTION.OUT, type: ACTION_TYPE.EXIT},
	"slide": {action: ACTION.SLIDE, type: ACTION_TYPE.EXIT},
	"swim": {action: ACTION.SWIM, type: ACTION_TYPE.EXIT},

	// Reflexive actions: no interaction with game objects
	"brief": {action: ACTION.BRIEF, type: ACTION_TYPE.REFLEXIVE},
	"deboard": {action: ACTION.DEBOARD, type: ACTION_TYPE.REFLEXIVE},
	"delete": {action: ACTION.DELETE, type: ACTION_TYPE.REFLEXIVE},
	"disembark": {action: ACTION.DEBOARD, type: ACTION_TYPE.REFLEXIVE},
	"exit boat": {action: ACTION.DEBOARD, type: ACTION_TYPE.REFLEXIVE},
	"get out": {action: ACTION.DEBOARD, type: ACTION_TYPE.REFLEXIVE},
	"get out of boat": {action: ACTION.DEBOARD, type: ACTION_TYPE.REFLEXIVE},
	"leave boat": {action: ACTION.DEBOARD, type: ACTION_TYPE.REFLEXIVE},
	"diagnose": {action: ACTION.DIAGNOSE, type: ACTION_TYPE.REFLEXIVE},
	"inventory": {action: ACTION.INVENTORY, type: ACTION_TYPE.REFLEXIVE},
	"i": {action: ACTION.INVENTORY, type: ACTION_TYPE.REFLEXIVE},
	"jump": {action: ACTION.JUMP, type: ACTION_TYPE.REFLEXIVE},
	"leap": {action: ACTION.JUMP, type: ACTION_TYPE.REFLEXIVE},
	"look around": {action: ACTION.LOOK, type: ACTION_TYPE.REFLEXIVE},
	"look": {action: ACTION.LOOK, type: ACTION_TYPE.REFLEXIVE},
	"l": {action: ACTION.LOOK, type: ACTION_TYPE.REFLEXIVE},
	"restart": {action: ACTION.RESTART, type: ACTION_TYPE.REFLEXIVE},
	"restart game": {action: ACTION.RESTART, type: ACTION_TYPE.REFLEXIVE},
	"score": {action: ACTION.SCORE, type: ACTION_TYPE.REFLEXIVE},
	"shout": {action: ACTION.SHOUT, type: ACTION_TYPE.REFLEXIVE},
	"yell": {action: ACTION.SHOUT, type: ACTION_TYPE.REFLEXIVE},
	"scream": {action: ACTION.SHOUT, type: ACTION_TYPE.REFLEXIVE},
	"superbrief": {action: ACTION.SUPERBRIEF, type: ACTION_TYPE.REFLEXIVE},
	"pray": {action: ACTION.PRAY, type: ACTION_TYPE.REFLEXIVE},
	"undo": {action: ACTION.UNDO, type: ACTION_TYPE.REFLEXIVE},
	"verbose": {action: ACTION.VERBOSE, type: ACTION_TYPE.REFLEXIVE},
	"wait": {action: ACTION.WAIT, type: ACTION_TYPE.REFLEXIVE},

	// Direct object interaction actions
	"answer": {action: ACTION.ANSWER, type: ACTION_TYPE.DIRECT},
	"blow": {action: ACTION.BLOW, type: ACTION_TYPE.DIRECT},
	"blow out": {action: ACTION.BLOW, type: ACTION_TYPE.DIRECT},
	"board": {action: ACTION.BOARD, type: ACTION_TYPE.DIRECT},
	"get on": {action: ACTION.BOARD, type: ACTION_TYPE.DIRECT},
	"get in": {action: ACTION.BOARD, type: ACTION_TYPE.DIRECT},
	"sit on": {action: ACTION.BOARD, type: ACTION_TYPE.DIRECT},
	"brush": {action: ACTION.BRUSH, type: ACTION_TYPE.DIRECT},
	"climb": {action: ACTION.CLIMB, type: ACTION_TYPE.DIRECT},
	"climb up": {action: ACTION.CLIMB, type: ACTION_TYPE.DIRECT},
	"close": {action: ACTION.CLOSE, type: ACTION_TYPE.DIRECT},
	"shut": {action: ACTION.CLOSE, type: ACTION_TYPE.DIRECT},
	"count": {action: ACTION.COUNT, type: ACTION_TYPE.DIRECT},
	"cross": {action: ACTION.CROSS, type: ACTION_TYPE.DIRECT},
	"deflate": {action: ACTION.DEFLATE, type: ACTION_TYPE.DIRECT},
	"uninflate": {action: ACTION.DEFLATE, type: ACTION_TYPE.DIRECT},
	"drink": {action: ACTION.DRINK, type: ACTION_TYPE.DIRECT},
	"drop": {action: ACTION.DROP, type: ACTION_TYPE.DIRECT},
	"eat": {action: ACTION.EAT, type: ACTION_TYPE.DIRECT},
	"enter": {action: ACTION.ENTER, type: ACTION_TYPE.DIRECT},
	"examine": {action: ACTION.EXAMINE, type: ACTION_TYPE.DIRECT},
	"launch": {action: ACTION.LAUNCH, type: ACTION_TYPE.DIRECT},
	"look at": {action: ACTION.EXAMINE, type: ACTION_TYPE.DIRECT},
	"l at": {action: ACTION.EXAMINE, type: ACTION_TYPE.DIRECT},
	"extinguish": {action: ACTION. EXTINGUISH, type: ACTION_TYPE.DIRECT},
	"turn off": {action: ACTION. EXTINGUISH, type: ACTION_TYPE.DIRECT},
	"follow": {action: ACTION.FOLLOW, type: ACTION_TYPE.DIRECT},
	"greet": {action: ACTION.GREET, type: ACTION_TYPE.DIRECT},
	"hello": {action: ACTION.GREET, type: ACTION_TYPE.DIRECT},
	"say hello": {action: ACTION.GREET, type: ACTION_TYPE.DIRECT},
	"kick": {action: ACTION.KICK, type: ACTION_TYPE.DIRECT},
	"knock": {action: ACTION.KNOCK, type: ACTION_TYPE.DIRECT},
	"light": {action: ACTION.LIGHT, type: ACTION_TYPE.SWITCH},
	"turn on": {action: ACTION.LIGHT, type: ACTION_TYPE.DIRECT},
	"listen": {action: ACTION.LISTEN, type: ACTION_TYPE.DIRECT},
	"look in": {action: ACTION.LOOK_IN, type: ACTION_TYPE.DIRECT},
	"l in": {action: ACTION.LOOK_IN, type: ACTION_TYPE.DIRECT},
	"look out": {action: ACTION.LOOK_OUT, type: ACTION_TYPE.DIRECT},
	"l out": {action: ACTION.LOOK_OUT, type: ACTION_TYPE.DIRECT},
	"look under": {action: ACTION.LOOK_UNDER, type: ACTION_TYPE.DIRECT},
	"l under": {action: ACTION.LOOK_UNDER, type: ACTION_TYPE.DIRECT},
	"lower": {action: ACTION.LOWER, type: ACTION_TYPE.DIRECT},
	"move": {action: ACTION.MOVE_OBJECT, type: ACTION_TYPE.DIRECT},
	"open": {action: ACTION.OPEN, type: ACTION_TYPE.DIRECT},
	"pull": {action: ACTION.PULL, type: ACTION_TYPE.DIRECT},
	"press": {action: ACTION.PUSH, type: ACTION_TYPE.DIRECT},
	"push": {action: ACTION.PUSH, type: ACTION_TYPE.DIRECT},
	"raise": {action: ACTION.RAISE, type: ACTION_TYPE.DIRECT},
	"read": {action: ACTION.READ, type: ACTION_TYPE.DIRECT},
	"remove": {action: ACTION.REMOVE, type: ACTION_TYPE.DIRECT},
	"mend": {action: ACTION.REPAIR, type: ACTION_TYPE.DIRECT},
	"repair": {action: ACTION.REPAIR, type: ACTION_TYPE.DIRECT},
	"fix": {action: ACTION.REPAIR, type: ACTION_TYPE.DIRECT},
	"ring": {action: ACTION.RING, type: ACTION_TYPE.DIRECT},
	"search": {action: ACTION.SEARCH, type: ACTION_TYPE.DIRECT},
	"shake": {action: ACTION.SHAKE, type: ACTION_TYPE.DIRECT},
	"smell": {action: ACTION.SMELL, type: ACTION_TYPE.DIRECT},
	"stay": {action: ACTION.STAY, type: ACTION_TYPE.DIRECT},
	"take": {action: ACTION.TAKE, type: ACTION_TYPE.DIRECT},
	"pick up": {action: ACTION.TAKE, type: ACTION_TYPE.DIRECT},
	"get": {action: ACTION.TAKE, type: ACTION_TYPE.DIRECT},
	"acquire": {action: ACTION.TAKE, type: ACTION_TYPE.DIRECT},
	"talk to": {action: ACTION.TALK_TO, type: ACTION_TYPE.DIRECT},
	"touch": {action: ACTION.TOUCH, type: ACTION_TYPE.DIRECT},
	"rub": {action: ACTION.TOUCH, type: ACTION_TYPE.DIRECT},
	"detach": {action: ACTION.UNTIE, type: ACTION_TYPE.DIRECT},
	"untie": {action: ACTION.UNTIE, type: ACTION_TYPE.DIRECT},
	"wake": {action: ACTION.WAKE, type: ACTION_TYPE.DIRECT},
	"wave": {action: ACTION.WAVE, type: ACTION_TYPE.DIRECT},
	"wear": {action: ACTION.WEAR, type: ACTION_TYPE.DIRECT},
	"wind": {action: ACTION.WIND, type: ACTION_TYPE.DIRECT},

	"say": {action: ACTION.SAY, type: ACTION_TYPE.SPEAK},

	// Indirect actions
	"attack": {action: ACTION.ATTACK, type: ACTION_TYPE.SWITCH},
	"kill": {action: ACTION.ATTACK, type: ACTION_TYPE.INDIRECT},
	"hit": {action: ACTION.ATTACK, type: ACTION_TYPE.INDIRECT},
	"fight": {action: ACTION.ATTACK, type: ACTION_TYPE.INDIRECT},
	"break": {action: ACTION.BREAK, type: ACTION_TYPE.INDIRECT},
	"destroy": {action: ACTION.BREAK, type: ACTION_TYPE.INDIRECT},
	"burn": {action: ACTION.BURN, type: ACTION_TYPE.INDIRECT},
	"cut": {action: ACTION.CUT, type: ACTION_TYPE.INDIRECT},
	"dig": {action: ACTION.DIG, type: ACTION_TYPE.INDIRECT},
	"dig in": {action: ACTION.DIG, type: ACTION_TYPE.INDIRECT},
	"fill": {action: ACTION.FILL, type: ACTION_TYPE.INDIRECT},
	"inflate": {action: ACTION.INFLATE, type: ACTION_TYPE.INDIRECT},
	"pour": {action: ACTION.POUR, type: ACTION_TYPE.INDIRECT},
	"pump up": {action: ACTION.INFLATE, type: ACTION_TYPE.INDIRECT},
	"pump": {action: ACTION.INFLATE, type: ACTION_TYPE.INDIRECT},

	"turn": {action: ACTION.TURN, type: ACTION_TYPE.INDIRECT},
	"unlock": {action: ACTION.UNLOCK, type: ACTION_TYPE.INDIRECT},
	"lock": {action: ACTION.LOCK, type: ACTION_TYPE.INDIRECT},
	"strike": {action: ACTION.STRIKE, type: ACTION_TYPE.INDIRECT},
	"throw": {action: ACTION.THROW, type: ACTION_TYPE.INDIRECT},

	"give": {action: ACTION.GIVE, type: ACTION_TYPE.INDIRECT_INVERSE},
	"place": {action: ACTION.PUT, type: ACTION_TYPE.INDIRECT_INVERSE},
	"put": {action: ACTION.PUT, type: ACTION_TYPE.INDIRECT_INVERSE},
	"tie": {action: ACTION.TIE, type: ACTION_TYPE.INDIRECT_INVERSE},

};

const ACTION_PHRASES = Object.keys(actions);

ACTION_PHRASES.sort((a, b) => b.length - a.length);

const OBJECT_STRINGS = {

	DESC_TUBE: `---> Frobozz Magic Gunk Company <---\n`
                                         + `          All-Purpose Gunk`,

    // Initial presence strings
    INIT_ANCIENT_MAP: `In the trophy case is an ancient parchment which appears to be a map.`,
    INIT_BLACK_BOOK: `On the altar is a large black book, open to page 569.`,
    INIT_BOAT: `There is a folded pile of plastic here which has a small valve attached.`,
    INIT_BOTTLE: `A bottle is sitting on the table.\nThe glass bottle contains:\n  A quantity of water`,
    INIT_BROKEN_CANARY: `There is a golden clockwork canary nestled in the egg. `
        + `It seems to have recently had a bad experience. The mountings for its jewel-like eyes `
        + `are empty, and its silver beak is crumpled. Through a cracked crystal window below its `
        + `left wing you can see the remains of intricate machinery. It is not clear what result `
        + `winding it would have, as the mainspring seems sprung.`,
    EXAMINE_BROKEN_CANARY: `It seems to have recently had a bad experience. `
        + `The mountings for its jewel-like eyes are empty, and its silver beak is crumpled. `
        + `Through a cracked crystal window below its left wing you can see the remains of intricate machinery. `
        + `It is not clear what result winding it would have, as the mainspring seems sprung.`,
    INIT_GOLDEN_CANARY: `There is a golden clockwork canary nestled in the egg. It has ruby eyes and a `
        + `silver beak. Through a crystal window below its left wing you can see intricate machinery inside. It appears to have `
        + `wound down.`,
    EXAMINE_GOLDEN_CANARY: `It has ruby eyes and a silver beak. Through a crystal window below its `
        + `left wing you can see intricate machinery inside. It appears to have wound down.`,
    INIT_BUOY: `There is a red buoy here (probably a warning).`,
    INIT_CANDLES: `On the two ends of the altar are burning candles.`,
    INIT_COINS: `An old leather bag, bulging with coins, is here.`,
    INIT_EGG: `In the bird's nest is a large egg encrusted with precious jewels, apparently scavenged `
        + `by a childless songbird. The egg is covered with fine gold inlay, and ornamented in lapis lazuli and `
        + `mother-of-pearl. Unlike most eggs, this one is hinged and closed with a delicate looking clasp. `
        + `The egg appears extremely fragile.`,
    INIT_GUIDEBOOK: `Some guidebooks entitled "Flood Control Dam #3" are on the reception desk.`,
    INIT_LANTERN: `A battery-powered brass lantern is on the trophy case.`,
    INIT_LEAF_PILE: `On the ground is a pile of leaves.`,
    INIT_MATCHBOOK: `There is a matchbook whose cover says "Visit Beautiful FCD#3" here.`,
    INIT_NASTY_KNIFE: `On the table is a nasty-looking knife.`,
    INIT_NEST: `Beside you on the branch is a small bird's nest.`,
    INIT_PAINTING: `Fortunately, there is still one chance for you to be a vandal, `
        + `for on the far wall is a painting of unparalleled beauty.`,
    INIT_POT_OF_GOLD: `At the end of the rainbow is a pot of gold.`,
    INIT_ROPE: `A large coil of rope is lying in the corner.`,
    INIT_RUSTY_KNIFE: `Beside the skeleton is a rusty knife.`,
    INIT_SACK: `On the table is an elongated brown sack, smelling of hot peppers.`,
    INIT_SCEPTRE: `A sceptre, possibly that of ancient Egypt itself, is in the coffin. The sceptre is `
        + `ornamented with colored enamel, and tapers to a sharp point.`,
    INIT_SKULL: `Lying in one corner of the room is a beautifully carved crystal skull. It appears `
        + `to be grinning at you rather nastily.`,
    INIT_SWORD: `Above the trophy case hangs an elvish sword of great antiquity.`,
    INIT_TOOL_CHESTS: `There is a group of tool chests here.`,
    INIT_TORCH: `Sitting on the pedestal is a flaming torch, made of ivory.`,
    INIT_TRIDENT: `On the shore lies Poseidon's own crystal trident.`,
    INIT_USELESS: `The deceased adventurer's useless lantern is here.`,
    INIT_ZORK_MANUAL: `Loosely attached to a wall is a small piece of paper.`,


    // Subsequent presence strings

    BAT_ATTACKS: `\nA large vampire bat, hanging from the ceiling, swoops down at you!`
        + `${cfg.newLineFull}Fweep!\nFweep!\nFweep!${cfg.newLineFull}\n`
        + `The bat grabs you by the scruff of your neck and lifts you away....${cfg.newLineFull}`,
    BAT_GARLIC: `In the corner of the room on the ceiling is a large vampire bat who is obviously `
        + `deranged and holding his nose.`,
    BOAT_PUNCTURE: `Oops! Something sharp seems to have slipped and punctured the boat. The boat `
        + `deflates to the sounds of hissing, sputtering, and cursing.`,
    CANARY_WIND_BAD: `There is an unpleasant grinding noise from inside the canary.`,
    CANARY_WIND_GOOD: `The canary chirps blithely, if somewhat tinnily, for a short time.`,
    CANARY_WIND_BAUBLE: `The canary chirps, slightly off-key, an aria from a forgotten opera. From out `
        + `of the greenery flies a lovely songbird. It perches on a limb just over your head and opens its beak to sing. As it does `
        + `so a beautiful brass bauble drops from its mouth, bounces off the top of your head, and lands glimmering in the grass. `
        + `As the canary winds down, the songbird flies away.`,
    COFFIN: `The solid-gold coffin used for the burial of Ramses II is here.`,
    DIAMOND: `There is an enormous diamond (perfectly cut) here.`,
    JADE: `There is an exquisite jade figurine here.`,
    LEAF_PILE: `On the ground is a pile of leaves.`,
    PAINTING: `A painting by a neglected genius is here.`,
    PLATINUM_BAR: `On the ground is a large platinum bar.`,
    SCEPTRE: `An ornamented sceptre, tapering to a sharp point, is here.`,
    SPIRITS: `The way through the gate is barred by evil spirits, who jeer at your attempts to pass.`,
    TUBE: `There is an object which looks like a tube of toothpaste here.`,


    ANCIENT_MAP: `The map shows a forest with three clearings. The largest clearing contains a house. `
        + `Three paths leave the large clearing. One of these paths, leading southwest, is marked "To Stone Barrow."`,
    BAT_CEILING: `You can't reach him, he's on the ceiling.`,
    BELL_RING_SPIRITS: `The bell suddenly becomes red hot and falls to the ground. The wraiths, `
        + `as if paralyzed, stop their jeering and slowly turn to face you. On their ashen faces, the expression of a `
        + `long-forgotten terror takes shape.`,
    BLUE_BUTTON: `There is a rumbling sound and a stream of water appears to burst from the east wall `
        + `of the room (apparently, a leak has occurred in a pipe).`,
    BLUE_BUTTON_JAMMED: `The blue button appears to be jammed.`,
    BLACK_BOOK_BURN: `A booming voice says "Wrong, cretin!" and you notice that you have turned into a `
        + `pile of dust. How, I can't imagine.`,
    BLACK_BOOK_CUT: `The voice of the guardian of the dungeon booms out from the darkness, "Your disrespect `
        + `costs you your life!" and places your head on a sharp pole.`,
    BLACK_BOOK_READ_SPIRITS: `Each word of the prayer reverberates through the hall in a deafening `
        + `confusion. As the last word fades, a voice, loud and commanding, speaks: "Begone, fiends!" A heart-stopping scream `
        + `fills the cavern, and the spirits, sensing a greater power, flee through the walls.`,
    CANDLES_FALL_SPIRITS: `In your confusion, the candles drop to the ground (and they are out).`,
    CANDLES_LIT_SPIRITS: `The flames flicker wildly and appear to dance. The earth beneath your feet `
        + `trembles, and your legs nearly buckly beneath you. The spirits cower at your unearthly power.`,
    DEAD_GATE: `The gate is protected by an invisible force. It makes your teeth ache to touch it.`,
    GARLIC_EAT: `What the heck! You won't make friends this way, but nobody around here is too `
        + `friendly anyhow. Gulp!`,


    LANTERN_DIM: `The lantern appears a bit dimmer.`,
    LANTERN_DIMMER: `The lantern is definitely dimmer now.`,
    LANTERN_DIMMEST: `The lamp is nearly out.`,
    LANTERN_EXPIRED: `You'd better have more light than from the brass lantern.`,

    LUNCH_EAT: `Thank you very much. It really hit the spot.`,


    MACHINE_FAIL: `The machine doesn't seem to want to do anything.`,
    MACHINE_SUCCESS: `The machine comes to life (figuratively) with a dazzling display of `
        + `colored lights and bizarre noises. After a few moments, the excitement abates.`,

    CARPET_SIT_1: `As you sit, you notice an irregularity underneath it. Rather than be `
        + `uncomfortable, you stand up again.`,
    CARPET_SIT_2: `I suppose you think it's a magic carpet?`,
    CARPET_LOOK_UNDER: `Underneath the rug is a closed trap door. As you drop the corner `
        + `of the rug, the trap door is once again concealed from view.`,

    HOUSE_EXAMINE: `The house is a beautiful colonial house which is painted white. It is clear `
        + `that the owners must have been extremely wealthy.`,

    ROPE_ON_RAIL: `Hanging down from the railing is a rope which ends about ten feet from the `
        + ` floor below.`,

    RUSTY_KNIFE_TAKE: `As you touch the rusty knife, your sword gives a single pulse `
        + `of blinding blue light.`,
    RUSTY_KNIFE_CURSE: `As the knife approaches its victim, your mind is submerged by `
        + `an overmastering will. Slowly, your hand turns, until the rusty blade is an inch fromm your neck. `
        + `The knife seems to sing as it savagely slits your throat.`,

    SCEPTRE_WAVE: `A dazzling display of color briefly emanates from the sceptre.`,
    SCEPTRE_RAINBOW: `Suddenly, the rainbow appears to become solid and, I venture, walkable `
        + `(I think the giveaway was the stairs and bannister.)`,
    SCEPTRE_RAINBOW_1: `The rainbow seems to have become somewhat run-of-the-mill.`,
    SCEPTRE_RAINBOW_2: `The structural integrity of the rainbow is severely compromised, leaving you `
        + `hanging in mid-air, supported only by water vapor. Bye.`,
    SLAG_CRUMBLE: `The slag was rather insubstantial, and crumbles into dust at your touch.`,
    SKELTON_DISTURBED: `A ghost appears in the room and is appalled at your desecration of the remains `
        + `of a fellow adventurer. He casts a curse on your valuables and banishes them to the Land of `
        + ` the Living Dead. The ghost leaves, muttering obscenities.`,
    SPIRITS_REVERT: `The tension of this ceremony is broken, and the wraiths, amused but shaken at `
        + `your clumsy attempt, resume their hideous jeering.`,
    WATER_DRINK: `Thank you very much. I was rather thirsty (from all this talking, probably).`,


    CYCLOPS_1: `A cyclops, who looks prepared to eat horses (much less mere adventurers), blocks the staircase. `
        + `From his state of health, and the bloodstains on the walls, you gather that he is not very friendly, though he likes people.`,
    CYCLOPS_2: `A hungry cyclops is standing at the foot of the stairs.`,
    CYCLOPS_EXAMINE: `The cyclops is standing in the corner, eyeing you closely. I don't think he likes you very `
        + `much. He looks extremely hungry, even for a cyclops.`,


    CYCLOPS_FLEES: `The cyclops, hearing the name of his father's deadly nemesis, flees the room by knocking down `
        + `the wall on the east side of the room.`,

    CYCLOPS_LISTEN: `You can hear his stomach rumbling.`,
    CYCLOPS_TALK: `The cyclops prefers eating to making conversation.`,
    CYCLOPS_LUNCH_1: `The cyclops says "Mmm Mmm. I love hot peppers! But oh, could I use a drink. Perhaps I could `
        + `drink the blood of that thing." From the gleam in his eye, it could be surmised that you are "that thing".`,
    CYCLOPS_LUNCH_2: `The cyclops, having eaten the hot peppers, appears to be gasping. His enflamed tongue `
        + `protrudes from his man-sized mouth.`,
    CYCLOPS_DRINK_1: `The cyclops is apparently not thirsty and refuses your generous offer.`,
    CYCLOPS_DRINK_2: `The cyclops takes the bottle, checks that it's open, and drinks the water. A moment later, `
        + `he lets out a yawn that nearly blows you over, and then falls fast asleep (what did you put in that drink, anyway?)`,
    CYCLOPS_GIVE_REJECT_1: `The cyclops may be hungry, but there is a limit.`,
    CYCLOPS_GIVE_REJECT_2: `The cyclops is not so stupid as to eat THAT!`,

    CYCLOPS_SLEEP_1: `The cyclops is sleeping blissfully at the foot of the stairs.`,
    CYCLOPS_SLEEP_2: `The cyclops is sleeping like a baby, albeit a very ugly one.`,
    CYCLOPS_TRAP_DOOR: `The trap door crashes shut, and you hear someone barring it.`,
    CYCLOPS_WAIT_1: `The cyclops seems somewhat agitated.`,
    CYCLOPS_WAIT_2: `The cyclops appears to be getting more agitated.`,
    CYCLOPS_WAIT_3: `The cyclops is moving about the room, looking for something.`,
    CYCLOPS_WAIT_4: `The cyclops was looking for salt and pepper. No doubt they are condiments for his upcoming snack.`,
    CYCLOPS_WAIT_5: `The cyclops is moving toward you in an unfriendly manner.`,
    CYCLOPS_WAIT_6: `You have two choices. 1. Leave 2. Become dinner.`,
    CYCLOPS_WAIT_7: `The cyclops, tired of all your games and trickery, grabs you firmly. As he licks his chops, `
        + `he says "Mmm. Just like Mom used to make 'em." It's nice to be appreciated.`,
    CYCLOPS_WAKE: `The cyclops yawns and stares at the thing that woke him up.`,

    CYCLOPS_SHRUG: `The cyclops shrugs but otherwise ignores your pitiful attempt.`,
    CYCLOPS_FIGHT_MISS_1: `The cyclops misses, but the backwash almost knocks you over.`,
    CYCLOPS_FIGHT_MISS_2: `The cyclops rushes you, but runs into the wall.`,
    CYCLOPS_FIGHT_LIGHT_1: `A quick punch, but it was only a glancing blow.`,
    CYCLOPS_FIGHT_LIGHT_2: `A glancing blow from the cyclops' fist.`,
    CYCLOPS_FIGHT_SEVERE_1: `The monster smashes his huge fist into your chest, breaking several ribs.`,
    CYCLOPS_FIGHT_SEVERE_2: `Heedless of your weapons, the cyclops tosses you against the rock wall of the room.`,
    CYCLOPS_FIGHT_STAGGER_1: `The cyclops almost knocks the wind out of you with a quick punch.`,
    CYCLOPS_FIGHT_STAGGER_2: `The cyclops lands a punch that almost knocks the wind out of you.`,
    CYCLOPS_FIGHT_DISARM_1: `The cyclops graps your WEAPON, tastes it, and throws it to the ground in disgust.`,
    CYCLOPS_FIGHT_DISARM_2: `The monster grabs you on the wrist, squeezes, and you drop your WEAPON in pain.`,
    CYCLOPS_FIGHT_KNOCKOUT: `The cyclops sends you crashing to the floor, unconscious.`,
    CYCLOPS_FIGHT_HESITATE: `The cyclops seems unable to decide whether to broil or stew his dinner.`,
    CYCLOPS_FIGHT_FINISH: `The cyclops, no sportsman, dispatches his unconscious victim.`,
    CYCLOPS_FIGHT_FATAL: `The cyclops breaks your neck with a massive smash.`,

    SONGBIRD: `You hear in the distance the chirping of a song bird.`,
    SONGBIRD_NEARBY: `You don't see the song bird, but it's probably somewhere nearby.`,





    THIEF_ARRIVES_GRIN: `You feel a light touch, and turning, notice a grinning figure holding a large bag `
        + `in one hand and a stiletto in the other.`,

    THIEF_GIVE_ITEM: `The thief places the ITEM in his bag and thanks you politely.`,
    THIEF_GIVE_TREASURE: `The thief is taken aback by your unexpected generosity, but accepts the ITEM `
        + `and stops to admire its beauty.`,

    THIEF_HIDEOUT: `You hear a scream of anguish as you violate the robber's hideaway. Using `
        + `passages unknown to you, he rushes to its defense.`,

    THIEF_MAGIC_1: `The thief gestures mysteriously, and the treasures in the room suddenly vanish.`,
    THIEF_MAGIC_2: `As the thief dies, the power of his magic decreases, and his treasures reappear:`,

    THIEF_PRESENT_1: `Someone carrying a large bag is casually leaning against one of the walls here. `
        + `He does not speak, but it is clear from his aspect that the bag will be taken only over his dead body.`,

    THIEF_PRESENT_2: `There is a suspicious-looking individual, holding a large bag, leaning against one `
        + `wall. He is armed with a deadly stiletto.`,

    THIEF_PRESENT_UNCONSCIOUS: `There is a suspicious-looking individual lying unconscious on the ground.`,

    THIEF_LEAVES_1: `The holder of the large bag just left, looking disgusted. Fortunately, he took nothing.`,
    THIEF_LEAVES_2: `The thief, finding nothing of value, left disgusted.`,

    THIEF_LEAVES_ROBS: `The thief just left, still carrying his large bag. You may not have noticed that `
        + `he robbed you blind first.`,

    THIEF_LEAVES_LOOTS: `The thief just left, still carrying his large bag. You may not have noticed that `
        + `he appropriated the valuables in the room.`,

    THIEF_COMES_AND_ROBS: `A seedy-looking individual with a large bag just wandered through the room. On the way `
        + `through, he quietly abstracted some valuables from the room and from your possession, mumbling something about `
        + `"Doing unto others before..."`,

    THIEF_COMES_AND_GOES: `A "lean and hungry" gentleman just wandered through, carrying a large bag. `
        + `Finding nothing of value, he left disgruntled.`,

    THIEF_EXAMINE: `The thief is a slippery character with beady eyes, that flit back and forth. He carries, `
        + `along with an unmistakable arrogance, a large bag over his shoulder and a vicious stiletto, whose blade is aimed menacingly `
        + `in your direction. I'd watch out if I were you.`,

    THIEF_RECOVER_STILETTO: `The robber, somewhat surprised at this turn of events, nimbly retrieves `
        + `his stiletto.`,

    THIEF_WAKES: `The robber revives, briefly feigning continued unconsciousness, and, when he sees his `
        + `moment, scrambles away from you.`,

    THIEF_FIGHT_MISS_1: `The thief stabs nonchalantly with his knife and misses.`,
    THIEF_FIGHT_MISS_2: `You dodge as the thief comes in low.`,
    THIEF_FIGHT_MISS_3: `You parry a lightning thrust, and the thief salutes you with a grim nod.`,
    THIEF_FIGHT_MISS_4: `The thief tries to sneak past your guard, but you twist away.`,
    THIEF_FIGHT_LIGHT_1: `A quick thrust pinks your left arm, and blood starts to trickle down.`,
    THIEF_FIGHT_LIGHT_2: `The thief draws blood, raking his stiletto across your arm.`,
    THIEF_FIGHT_LIGHT_3: `The stiletto flashes faster than you can follow, and blood wells `
        + `from your leg.`,
    THIEF_FIGHT_LIGHT_4: `The thief slowly approaches, strikes like a snake, and leaves you wounded.`,
    THIEF_FIGHT_SEVERE_1: `The thief strikes like a snake! The resulting wound is serious.`,
    THIEF_FIGHT_SEVERE_2: `The thief stabs a deep cut in your upper arm.`,
    THIEF_FIGHT_SEVERE_3: `The stiletto touches your forehead, and blood obscures your vision.`,
    THIEF_FIGHT_SEVERE_4: `The thief strikes at your wrist, and suddenly your grip is slippery with blood.`,
    THIEF_FIGHT_STAGGER_1: `The butt of his stiletto cracks you on the skull, and you stagger back.`,
    THIEF_FIGHT_STAGGER_2: `The thief rams the haft of his blade into your stomach, leaving you out of breath.`,
    THIEF_FIGHT_STAGGER_3: `The thief attacks, and you fall back desperately.`,
    THIEF_FIGHT_DISARM_1: `A long, theatrical slash. You catch it on your WEAPON, but the thief twists `
        + `his knife, and the WEAPON goes flying.`,
    THIEF_FIGHT_DISARM_2: `The thief neatly flips your WEAPON out of your hands, and it drops to the floor.`,
    THIEF_FIGHT_DISARM_3: `You parry a low thrust, and your WEAPON slips out of your hand.`,
    THIEF_FIGHT_KNOCKOUT_1: `Shifting in the middle of a thrust, the thief knocks you unconscious `
        + `with the haft of his stiletto.`,
    THIEF_FIGHT_KNOCKOUT_2: `The thief knocks you out.`,
    THIEF_FIGHT_FATAL_1: `Finishing you off, the thief inserts his blade into your heart.`,
    THIEF_FIGHT_FATAL_2: `The thief comes in from the side, feints, and inserts the blade into your ribs.`,
    THIEF_FIGHT_FATAL_3: `The thief bows formally, raises his stiletto, and with a wry grin, `
        + `ends the battle and your life.`,
    THIEF_FIGHT_HESITATE_1: `The thief, a man of superior breeding, pauses for a moment to consider the `
        + `propriety of finishing you off.`,
    THIEF_FIGHT_HESITATE_2: `The thief amuses himself by searching your pockets.`,
    THIEF_FIGHT_HESITATE_3: `The thief entertains himself by rifling your pack.`,
    THIEF_FIGHT_FINISH_1: `The thief, forgetting his essentially genteel upbringing, cuts your throat.`,
    THIEF_FIGHT_FINISH_2: `The thief, a pragmatist, dispatches you as a threat to his livelihood.`,
    THIEF_FIGHT_RETREAT_1: `Your opponent, determining discretion to be the better part of valor, decides to `
        + `terminate this little contretemps. With a rueful nod of his head, he steps backward into the gloom and disappears.`,
    THIEF_FIGHT_RETREAT_2: `You evidently frightened the robber, though you didn't hit him. He flees `
        + `the room, but the contents of his bag fall on the floor.`,



    TROLL_PRESENCE: `A nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.`,
    TROLL_PRESENCE_UNCONSCIOUS: `An unconscious troll is sprawled on the floor. All passages out of the room are open.`,
    TROLL_PRESENCE_DISARMED: `A pathetically babbling troll is here.`,

    TROLL_FEND: `The troll fends you off with a menacing gesture.`,
    TROLL_TALK_1: `The troll isn't much of a conversationalist.`,
    TROLL_TALK_2: `Unfortunately, the troll can't hear you.`,
    TROLL_RECOVER_AXE: `The troll, angered and humiliated, recovers his weapon. He appears to have an axe `
        + `to grind with you.`,
    TROLL_DISARMED: `The troll, disarmed, cowers in terror, pleading for his life in the guttural tongue `
        + `of the trolls.`,
    TROLL_RECOVERS_STAGGER: `The troll stirs, quickly resuming a fighting stance.`,
    TROLL_GIVE_AXE: `The troll scratches his head in confusion, then takes the axe.`,
    TROLL_EAT_1: `The troll, who is not overly proud, graciously accepts the gift `
        + `and eats it hungrily. Poor troll, he dies from an internal hemorrhage and his carcass disappears in `
        + `a sinister black fog.`,

    TROLL_EAT_2: `The troll, who is not overly proud, graciously accepts the gift `
        + `and, being for the moment sated, throws it back. Fortunately, the troll has poor control, and the ITEM `
        + `falls to the floor. He does not look pleased.`,

    TROLL_EAT_3: `The troll, who is not overly proud, graciously accepts the gift `
        + `and not having the most discriminating tastes, gleefully eats it.`,

    TROLL_TAKE: `The troll spits in your face, grunting "Better luck next time" `
        + `in a rather barbarous accent.`,

    TROLL_LAUGH: `The troll laughs at your puny gesture.`,
    TROLL_TAUNT: `Every so often the troll says something, probably uncomplimentary, `
        + `in his guttural toungue.`,

    TROLL_FIGHT_MISS_1: `The troll swings his axe, but it misses.`,
    TROLL_FIGHT_MISS_2: `The troll's axe barely misses your ear.`,
    TROLL_FIGHT_MISS_3: `The axe sweeps past as you jump aside.`,
    TROLL_FIGHT_MISS_4: `The axe crashes against the rock, throwing sparks!`,
    TROLL_FIGHT_MISS_5: `The troll's swing almost knocks you over as you barely parry in time.`,
    TROLL_FIGHT_KNOCKOUT: `The flat of the troll's axe hits you delicately on the head, `
        + `knocking you out.`,
    TROLL_FIGHT_FATAL_1: `The troll neatly removes your head.`,
    TROLL_FIGHT_FATAL_2: `The troll's axe stroke cleaves you from the nave to the chops.`,
    TROLL_FIGHT_FATAL_3: `The troll's axe removes your head.`,
    TROLL_FIGHT_SEVERE_1: `An axe stroke makes a deep wound in your leg.`,
    TROLL_FIGHT_SEVERE_2: `The troll's axe swings down, gashing your shoulder.`,
    TROLL_FIGHT_SEVERE_3: `The troll swings, the blade turns on your armor but crashes broadside `
        + `into your head.`,
    TROLL_FIGHT_LIGHT_1: `The flat of the troll's axe skins across your forearm.`,
    TROLL_FIGHT_LIGHT_2: `The troll swings his axe, and it nicks your arm as you dodge.`,
    TROLL_FIGHT_LIGHT_3: `The troll charges, and his axe slashes you on your left arm.`,
    TROLL_FIGHT_LIGHT_4: `The troll charges, and his axe slashes you on your right arm.`,
    TROLL_FIGHT_LIGHT_5: `The axe gets you right in the side. Ouch!`,
    TROLL_FIGHT_STAGGER_1: `The troll hits you with a glancing blow, and you are momentarily stunned.`,
    TROLL_FIGHT_STAGGER_2: `You stagger back under a hail of axe strokes.`,
    TROLL_FIGHT_STAGGER_3: `The troll's mighty blow drops you to your knees.`,
    TROLL_FIGHT_DISARM_1: `The axe hits your WEAPON and knocks it spinning.`,
    TROLL_FIGHT_DISARM_2: `The troll swings, you parry, but the force of his blow knocks your WEAPON away.`,
    TROLL_FIGHT_DISARM_3: `The axe knocks your WEAPON out of your hand. It falls to the floor.`,
    TROLL_FIGHT_HESITATE_1: `The troll hesitates, fingering his axe.`,
    TROLL_FIGHT_HESITATE_2: `The troll scratches his head ruminatively: Might you be magically `
        + `protected, he wonders?`,
    TROLL_FIGHT_FINISH: `Conquering his fears, the troll puts you to death.`,

    WOODEN_DOOR: `The engravings translate to "This space intentionally left blank."`,

    WINDOW_EXAMINE_AJAR: `The window is slightly ajar, but not enough to allow entry.`,
    WINDOW_EXAMINE_OPEN: `The kitchen window is open, but I can't tell what's beyond it.`,
    WINDOW_EXAMINE_CLOSED: `The kitchen window is closed.`,
    WINDOW_LOOK_IN: `You can see what appears to be a kitchen.`,
    WINDOW_LOOK_OUT: `You can see a clear area leading towards a forest.`

};

export {
	ACTION as ACTION_STRINGS,
	CONSTANTS,
	ALLOWED_VERBS,
	OPENABLE_INSTANCES,
	SAVE_STATE_NAME,
	LINE_BREAK,
	OUTPUT_LISTS,
	GAME_STRINGS,
	PREPOSITIONS,
	GAME_WORDS,
	MAP_STRINGS,
	OBJECT_STRINGS,
	TEXT_BOLD,
	TEXT_NORMAL,
	actions as ACTIONS,
	ACTION_PHRASES,
	ACTION_TYPE,
	LOCATION,
	THIEF_LOCATIONS,
	COAL_MINE,
	OVERWORLD,
	FOREST
};
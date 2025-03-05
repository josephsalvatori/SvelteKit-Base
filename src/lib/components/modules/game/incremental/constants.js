import { cfg } from "$lib/helpers/terminal";

const CONSTANTS = {

};

const GAME_STRINGS = {
	INTRO: ``,
	// ASCII generator: https://patorjk.com/software/taag/#p=display
	TITLE:
		`  /###           /  /                      /###           /                                                  ` + cfg.newLine +
		` /  ############/ #/                      /  ############/                                                   ` + cfg.newLine +
		`/     #########   ##                     /     #########                                                     ` + cfg.newLine +
		`#     /  #        ##                     #     /  #                ##                                        ` + cfg.newLine +
		` ##  /  ##        ##                      ##  /  ##                ##                                        ` + cfg.newLine +
		`    /  ###        ##  /##      /##           /  ###          /###   ##    ###    ####      /##  ###  /###    ` + cfg.newLine +
		`   ##   ##        ## / ###    / ###         ##   ##         / ###  / ##    ###     ###  / / ###  ###/ #### / ` + cfg.newLine +
		`   ##   ##        ##/   ###  /   ###        ##   ##        /   ###/  ##     ###     ###/ /   ###  ##   ###/  ` + cfg.newLine +
		`   ##   ##        ##     ## ##    ###       ##   ##       ##    ##   ##      ##      ## ##    ### ##         ` + cfg.newLine +
		`   ##   ##        ##     ## ########        ##   ##       ##    ##   ##      ##      ## ########  ##         ` + cfg.newLine +
		`    ##  ##        ##     ## #######          ##  ##       ##    ##   ##      ##      ## #######   ##         ` + cfg.newLine +
		`     ## #      /  ##     ## ##                ## #      / ##    ##   ##      ##      ## ##        ##         ` + cfg.newLine +
		`      ###     /   ##     ## ####    /          ###     /  ##    ##   ##      /#      /  ####    / ##         ` + cfg.newLine +
		`       ######/    ##     ##  ######/            ######/    ######     ######/ ######/    ######/  ###        ` + cfg.newLine +
		`         ###       ##    ##   #####               ###       ####       #####   #####      #####    ###       ` + cfg.newLine +
		`                         /                                                                                   ` + cfg.newLine +
		`                        /                                                                                    ` + cfg.newLine +
		`                       /                                                                                     ` + cfg.newLine +
		`                      /                                                                                      `,


	ABOUT_INFO: ``,
	HELP_INFO: ``,
	PROFANITY: [
		"fuck ",
		"shit "
	],
};

const ACTION_STRINGS = {

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
	EXIT: "EXIT",

	INVENTORY: "INVENTORY",
	LOOK: "LOOK",
	RESTART: "RESTART",

	CLIMB: "CLIMB",
	CLOSE: "CLOSE",
	DRINK: "DRINK",
	EAT: "EAT",
	ENTER: "ENTER",
	EXAMINE: "EXAMINE",
	EXTINGUISH: "EXTINGUISH",
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
	POUR: "POUR",
	PULL: "PULL",
	PUSH: "PUSH",
	RAISE: "RAISE",
	READ: "READ",
	REMOVE: "REMOVE",
	REPAIR: "REPAIR",
	SEARCH: "SEARCH",
	STRIKE: "STRIKE",
	TAKE: "TAKE",
	TOUCH: "TOUCH",
	WEAR: "WEAR",
	WIND: "WIND",

	BREAK: "BREAK",
	BURN: "BURN",
	CUT: "CUT",
	FILL: "FILL",
	INFLATE: "INFLATE",
	LOCK: "LOCK",
	POUR: "POUR",
	TURN: "TURN",
	UNLOCK: "UNLOCK",

	GIVE: "GIVE",
	PUT: "PUT",
	TIE: "TIE",
	THROW: "THROW",

	AGAIN: "AGAIN"
};

const ACTION_TYPES = {
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

const ACTIONS = {

	// general exit
	"leave": { action: ACTION_STRINGS.EXIT, type: ACTION_TYPES.EXIT },
	"exit": { action: ACTION_STRINGS.EXIT, type: ACTION_TYPES.EXIT },

	// north
	"north": { action: ACTION_STRINGS.NORTH, type: ACTION_TYPES.EXIT },
	"go north": { action: ACTION_STRINGS.NORTH, type: ACTION_TYPES.EXIT },
	"walk north": { action: ACTION_STRINGS.NORTH, type: ACTION_TYPES.EXIT },
	"exit north": { action: ACTION_STRINGS.NORTH, type: ACTION_TYPES.EXIT },
	"n": { action: ACTION_STRINGS.NORTH, type: ACTION_TYPES.EXIT },
	"go n": { action: ACTION_STRINGS.NORTH, type: ACTION_TYPES.EXIT },
	"walk n": { action: ACTION_STRINGS.NORTH, type: ACTION_TYPES.EXIT },
	"exit n": { action: ACTION_STRINGS.NORTH, type: ACTION_TYPES.EXIT },

	// south
	"south": { action: ACTION_STRINGS.SOUTH, type: ACTION_TYPES.EXIT },
	"go south": { action: ACTION_STRINGS.SOUTH, type: ACTION_TYPES.EXIT },
	"walk south": { action: ACTION_STRINGS.SOUTH, type: ACTION_TYPES.EXIT },
	"exit south": { action: ACTION_STRINGS.SOUTH, type: ACTION_TYPES.EXIT },
	"s": { action: ACTION_STRINGS.SOUTH, type: ACTION_TYPES.EXIT },
	"go s": { action: ACTION_STRINGS.SOUTH, type: ACTION_TYPES.EXIT },
	"walk s": { action: ACTION_STRINGS.SOUTH, type: ACTION_TYPES.EXIT },
	"exit s": { action: ACTION_STRINGS.SOUTH, type: ACTION_TYPES.EXIT },

	// east
	"east": { action: ACTION_STRINGS.EAST, type: ACTION_TYPES.EXIT },
	"go east": { action: ACTION_STRINGS.EAST, type: ACTION_TYPES.EXIT },
	"walk east": { action: ACTION_STRINGS.EAST, type: ACTION_TYPES.EXIT },
	"exit east": { action: ACTION_STRINGS.EAST, type: ACTION_TYPES.EXIT },
	"e": { action: ACTION_STRINGS.EAST, type: ACTION_TYPES.EXIT },
	"go e": { action: ACTION_STRINGS.EAST, type: ACTION_TYPES.EXIT },
	"walk e": { action: ACTION_STRINGS.EAST, type: ACTION_TYPES.EXIT },
	"exit e": { action: ACTION_STRINGS.EAST, type: ACTION_TYPES.EXIT },

	// west
	"west": { action: ACTION_STRINGS.WEST, type: ACTION_TYPES.EXIT },
	"go west": { action: ACTION_STRINGS.WEST, type: ACTION_TYPES.EXIT },
	"walk west": { action: ACTION_STRINGS.WEST, type: ACTION_TYPES.EXIT },
	"exit west": { action: ACTION_STRINGS.WEST, type: ACTION_TYPES.EXIT },
	"w": { action: ACTION_STRINGS.WEST, type: ACTION_TYPES.EXIT },
	"go w": { action: ACTION_STRINGS.WEST, type: ACTION_TYPES.EXIT },
	"walk w": { action: ACTION_STRINGS.WEST, type: ACTION_TYPES.EXIT },
	"exit w": { action: ACTION_STRINGS.WEST, type: ACTION_TYPES.EXIT },

	// northeast
	"northeast": { action: ACTION_STRINGS.NORTHEAST, type: ACTION_TYPES.EXIT },
	"go northeast": { action: ACTION_STRINGS.NORTHEAST, type: ACTION_TYPES.EXIT },
	"walk northeast": { action: ACTION_STRINGS.NORTHEAST, type: ACTION_TYPES.EXIT },
	"exit northeast": { action: ACTION_STRINGS.NORTHEAST, type: ACTION_TYPES.EXIT },
	"ne": { action: ACTION_STRINGS.NORTHEAST, type: ACTION_TYPES.EXIT },
	"go ne": { action: ACTION_STRINGS.NORTHEAST, type: ACTION_TYPES.EXIT },
	"walk ne": { action: ACTION_STRINGS.NORTHEAST, type: ACTION_TYPES.EXIT },
	"exit ne": { action: ACTION_STRINGS.NORTHEAST, type: ACTION_TYPES.EXIT },

	// northwest
	"northwest": { action: ACTION_STRINGS.NORTHWEST, type: ACTION_TYPES.EXIT },
	"go northwest": { action: ACTION_STRINGS.NORTHWEST, type: ACTION_TYPES.EXIT },
	"walk northwest": { action: ACTION_STRINGS.NORTHWEST, type: ACTION_TYPES.EXIT },
	"exit northwest": { action: ACTION_STRINGS.NORTHWEST, type: ACTION_TYPES.EXIT },
	"nw": { action: ACTION_STRINGS.NORTHWEST, type: ACTION_TYPES.EXIT },
	"go nw": { action: ACTION_STRINGS.NORTHWEST, type: ACTION_TYPES.EXIT },
	"walk nw": { action: ACTION_STRINGS.NORTHWEST, type: ACTION_TYPES.EXIT },
	"exit nw": { action: ACTION_STRINGS.NORTHWEST, type: ACTION_TYPES.EXIT },

	// southeast
	"southeast": { action: ACTION_STRINGS.SOUTHEAST, type: ACTION_TYPES.EXIT },
	"go southeast": { action: ACTION_STRINGS.SOUTHEAST, type: ACTION_TYPES.EXIT },
	"walk southeast": { action: ACTION_STRINGS.SOUTHEAST, type: ACTION_TYPES.EXIT },
	"exit southeast": { action: ACTION_STRINGS.SOUTHEAST, type: ACTION_TYPES.EXIT },
	"se": { action: ACTION_STRINGS.SOUTHEAST, type: ACTION_TYPES.EXIT },
	"go se": { action: ACTION_STRINGS.SOUTHEAST, type: ACTION_TYPES.EXIT },
	"walk se": { action: ACTION_STRINGS.SOUTHEAST, type: ACTION_TYPES.EXIT },
	"exit se": { action: ACTION_STRINGS.SOUTHEAST, type: ACTION_TYPES.EXIT },

	// southwest
	"southwest": { action: ACTION_STRINGS.SOUTHWEST, type: ACTION_TYPES.EXIT },
	"go southwest": { action: ACTION_STRINGS.SOUTHWEST, type: ACTION_TYPES.EXIT },
	"walk southwest": { action: ACTION_STRINGS.SOUTHWEST, type: ACTION_TYPES.EXIT },
	"exit southwest": { action: ACTION_STRINGS.SOUTHWEST, type: ACTION_TYPES.EXIT },
	"sw": { action: ACTION_STRINGS.SOUTHWEST, type: ACTION_TYPES.EXIT },
	"go sw": { action: ACTION_STRINGS.SOUTHWEST, type: ACTION_TYPES.EXIT },
	"walk sw": { action: ACTION_STRINGS.SOUTHWEST, type: ACTION_TYPES.EXIT },
	"exit sw": { action: ACTION_STRINGS.SOUTHWEST, type: ACTION_TYPES.EXIT },

	// up
	"up": { action: ACTION_STRINGS.UP, type: ACTION_TYPES.EXIT },
	"go up": { action: ACTION_STRINGS.UP, type: ACTION_TYPES.EXIT },
	"climb up": { action: ACTION_STRINGS.UP, type: ACTION_TYPES.EXIT },
	"u": { action: ACTION_STRINGS.UP, type: ACTION_TYPES.EXIT },
	"go u": { action: ACTION_STRINGS.UP, type: ACTION_TYPES.EXIT },
	"climb u": { action: ACTION_STRINGS.UP, type: ACTION_TYPES.EXIT },

	// down
	"down": { action: ACTION_STRINGS.DOWN, type: ACTION_TYPES.EXIT },
	"go down": { action: ACTION_STRINGS.DOWN, type: ACTION_TYPES.EXIT },
	"climb down": { action: ACTION_STRINGS.DOWN, type: ACTION_TYPES.EXIT },
	"d": { action: ACTION_STRINGS.DOWN, type: ACTION_TYPES.EXIT },
	"go d": { action: ACTION_STRINGS.DOWN, type: ACTION_TYPES.EXIT },
	"climb d": { action: ACTION_STRINGS.DOWN, type: ACTION_TYPES.EXIT },

	// in
	"in": { action: ACTION_STRINGS.IN, type: ACTION_TYPES.EXIT },
	"go in": { action: ACTION_STRINGS.IN, type: ACTION_TYPES.EXIT },
	"inside": { action: ACTION_STRINGS.IN, type: ACTION_TYPES.EXIT },
	"go inside": { action: ACTION_STRINGS.IN, type: ACTION_TYPES.EXIT },

	// out
	"out": { action: ACTION_STRINGS.OUT, type: ACTION_TYPES.EXIT },
	"go out": { action: ACTION_STRINGS.OUT, type: ACTION_TYPES.EXIT },
	"outside": { action: ACTION_STRINGS.OUT, type: ACTION_TYPES.EXIT },
	"go outside": { action: ACTION_STRINGS.OUT, type: ACTION_TYPES.EXIT },

	// exit
	"exit": { action: ACTION_STRINGS.OUT, type: ACTION_TYPES.EXIT },

	// reflexive actions, no interaction with objects
	"inventory": { action: ACTION_STRINGS.INVENTORY, type: ACTION_TYPES.REFLEXIVE },
	"i": { action: ACTION_STRINGS.INVENTORY, type: ACTION_TYPES.REFLEXIVE },
	"look around": { action: ACTION_STRINGS.LOOK, type: ACTION_TYPES.REFLEXIVE },
	"look": { action: ACTION_STRINGS.LOOK, type: ACTION_TYPES.REFLEXIVE },
	"l": { action: ACTION_STRINGS.LOOK, type: ACTION_TYPES.REFLEXIVE },
	"restart": { action: ACTION_STRINGS.RESTART, type: ACTION_TYPES.REFLEXIVE },

	// direct actions, interaction with objects
	"blow": { action: ACTION_STRINGS.BLOW, type: ACTION_TYPES.DIRECT },
	"blow out": { action: ACTION_STRINGS.BLOW, type: ACTION_TYPES.DIRECT },
	"climb": { action: ACTION_STRINGS.CLIMB, type: ACTION_TYPES.DIRECT },
	"climb up": { action: ACTION_STRINGS.CLIMB, type: ACTION_TYPES.DIRECT },
	"close": { action: ACTION_STRINGS.CLOSE, type: ACTION_TYPES.DIRECT },
	"shut": { action: ACTION_STRINGS.CLOSE, type: ACTION_TYPES.DIRECT },
	"deflate": { action: ACTION_STRINGS.DEFLATE, type: ACTION_TYPES.DIRECT },
	"uninflate": { action: ACTION_STRINGS.DEFLATE, type: ACTION_TYPES.DIRECT },
	"drink": { action: ACTION_STRINGS.DRINK, type: ACTION_TYPES.DIRECT },
	"eat": { action: ACTION_STRINGS.EAT, type: ACTION_TYPES.DIRECT },
	"enter": { action: ACTION_STRINGS.ENTER, type: ACTION_TYPES.DIRECT },
	"examine": { action: ACTION_STRINGS.EXAMINE, type: ACTION_TYPES.DIRECT },
	"look at": { action: ACTION_STRINGS.EXAMINE, type: ACTION_TYPES.DIRECT },
	"l at": { action: ACTION_STRINGS.EXAMINE, type: ACTION_TYPES.DIRECT },
	"extinguish": { action: ACTION_STRINGS. EXTINGUISH, type: ACTION_TYPES.DIRECT },
	"turn off": { action: ACTION_STRINGS. EXTINGUISH, type: ACTION_TYPES.DIRECT },
	"kick": { action: ACTION_STRINGS.KICK, type: ACTION_TYPES.DIRECT },
	"knock": { action: ACTION_STRINGS.KNOCK, type: ACTION_TYPES.DIRECT },
	"light": { action: ACTION_STRINGS.LIGHT, type: ACTION_TYPES.SWITCH },
	"turn on": { action: ACTION_STRINGS.LIGHT, type: ACTION_TYPES.DIRECT },
	"listen": { action: ACTION_STRINGS.LISTEN, type: ACTION_TYPES.DIRECT },
	"look in": { action: ACTION_STRINGS.LOOK_IN, type: ACTION_TYPES.DIRECT },
	"l in": { action: ACTION_STRINGS.LOOK_IN, type: ACTION_TYPES.DIRECT },
	"look out": { action: ACTION_STRINGS.LOOK_OUT, type: ACTION_TYPES.DIRECT },
	"l out": { action: ACTION_STRINGS.LOOK_OUT, type: ACTION_TYPES.DIRECT },
	"look under": { action: ACTION_STRINGS.LOOK_UNDER, type: ACTION_TYPES.DIRECT },
	"l under": { action: ACTION_STRINGS.LOOK_UNDER, type: ACTION_TYPES.DIRECT },
	"lower": { action: ACTION_STRINGS.LOWER, type: ACTION_TYPES.DIRECT },
	"move": { action: ACTION_STRINGS.MOVE_OBJECT, type: ACTION_TYPES.DIRECT },
	"open": { action: ACTION_STRINGS.OPEN, type: ACTION_TYPES.DIRECT },
	"pull": { action: ACTION_STRINGS.PULL, type: ACTION_TYPES.DIRECT },
	"press": { action: ACTION_STRINGS.PUSH, type: ACTION_TYPES.DIRECT },
	"push": { action: ACTION_STRINGS.PUSH, type: ACTION_TYPES.DIRECT },
	"raise": { action: ACTION_STRINGS.RAISE, type: ACTION_TYPES.DIRECT },
	"read": { action: ACTION_STRINGS.READ, type: ACTION_TYPES.DIRECT },
	"remove": { action: ACTION_STRINGS.REMOVE, type: ACTION_TYPES.DIRECT },
	"mend": { action: ACTION_STRINGS.REPAIR, type: ACTION_TYPES.DIRECT },
	"repair": { action: ACTION_STRINGS.REPAIR, type: ACTION_TYPES.DIRECT },
	"fix": { action: ACTION_STRINGS.REPAIR, type: ACTION_TYPES.DIRECT },
	"ring": { action: ACTION_STRINGS.RING, type: ACTION_TYPES.DIRECT },
	"search": { action: ACTION_STRINGS.SEARCH, type: ACTION_TYPES.DIRECT },
	"shake": { action: ACTION_STRINGS.SHAKE, type: ACTION_TYPES.DIRECT },
	"smell": { action: ACTION_STRINGS.SMELL, type: ACTION_TYPES.DIRECT },
	"take": { action: ACTION_STRINGS.TAKE, type: ACTION_TYPES.DIRECT },
	"pick up": { action: ACTION_STRINGS.TAKE, type: ACTION_TYPES.DIRECT },
	"get": { action: ACTION_STRINGS.TAKE, type: ACTION_TYPES.DIRECT },
	"acquire": { action: ACTION_STRINGS.TAKE, type: ACTION_TYPES.DIRECT },
	"touch": { action: ACTION_STRINGS.TOUCH, type: ACTION_TYPES.DIRECT },
	"rub": { action: ACTION_STRINGS.TOUCH, type: ACTION_TYPES.DIRECT },
	"wear": { action: ACTION_STRINGS.WEAR, type: ACTION_TYPES.DIRECT },
	"wind": { action: ACTION_STRINGS.WIND, type: ACTION_TYPES.DIRECT },

	// indirect actions
	"hit": { action: ACTION_STRINGS.ATTACK, type: ACTION_TYPES.INDIRECT },
	"fill": { action: ACTION_STRINGS.FILL, type: ACTION_TYPES.INDIRECT },
	"inflate": { action: ACTION_STRINGS.INFLATE, type: ACTION_TYPES.INDIRECT },
	"pour": { action: ACTION_STRINGS.POUR, type: ACTION_TYPES.INDIRECT },
	"pump up": { action: ACTION_STRINGS.INFLATE, type: ACTION_TYPES.INDIRECT },
	"pump": { action: ACTION_STRINGS.INFLATE, type: ACTION_TYPES.INDIRECT },

	"turn": { action: ACTION_STRINGS.TURN, type: ACTION_TYPES.INDIRECT },
	"unlock": { action: ACTION_STRINGS.UNLOCK, type: ACTION_TYPES.INDIRECT },
	"lock": { action: ACTION_STRINGS.LOCK, type: ACTION_TYPES.INDIRECT },
	"strike": { action: ACTION_STRINGS.STRIKE, type: ACTION_TYPES.INDIRECT },

	"place": { action: ACTION_STRINGS.PUT, type: ACTION_TYPES.INDIRECT_INVERSE },
	"put": { action: ACTION_STRINGS.PUT, type: ACTION_TYPES.INDIRECT_INVERSE },
};

const ACTION_PHRASES = Object.keys(ACTIONS);

ACTION_PHRASES.sort((a, b) => b.length - a.length);

const LOCATIONS = {

	NULL_LOCATION: "NULL_LOCATION",
	NULL_INVENTORY: "NULL_INVENTORY",
	PLAYER_INVENTORY: "PLAYER_INVENTORY",

	// Floor 1
	COLD_STONE_ROOM: "COLD_STONE_ROOM", // 1x1, A4
	GRAND_HALL: "GRAND_HALL", // 3x3, B2-D4
	ENTRY_HALL: "ENTRY_HALL", // 1x2, B5-C5
	PUMP_ROOM: "PUMP_ROOM", // 2x1, A1-A2
	FIRST_FLOOR_OFFICE: "FIRST_FLOOR_OFFICE", // 1x1, A3
	SITTING_ROOM: "SITTING_ROOM", // 1x1, A4

	// Floor 2
	STAIRCASE_LANDING: "STAIRCASE_LANDING",

};

const MAP_STRINGS = {
	// Floor 1
	DESC_COLD_STONE_ROOM: `Cold stone room.`,
	DESC_GRAND_HALL: `Grand hall.`,
	DESC_ENTRY_HALL: `Entry hall.`,
	DESC_PUMP_ROOM: `Pump room.`,
	DESC_SITTING_ROOM: `Sitting room.`,
	DESC_FIRST_FLOOR_OFFICE: `First floor office.`
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

];

export {
	CONSTANTS,
	ACTIONS,
	ACTION_PHRASES,
	ACTION_STRINGS,
	ACTION_TYPES,
	GAME_STRINGS,
	GAME_WORDS,
	LOCATIONS,
	MAP_STRINGS,
	PREPOSITIONS,
};
export const cfg = {
	lineStart: "> ",
	newLine: "\r\n",
	newLineFull: "\r\n\r\n",
	tab: "\t",
	tabWide: "\t\t",
	tabWideNewLine: "\t\t\t\t",
	// ANSI Colors, with javascript escape
	colors: {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		purple: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",
		blackBold: "\x1b[30;1m",
		redBold: "\x1b[31;1m",
		greenBold: "\x1b[32;1m",
		yellowBold: "\x1b[33;1m",
		blueBold: "\x1b[34;1m",
		purpleBold: "\x1b[35;1m",
		cyanBold: "\x1b[36;1m",
		whiteBold: "\x1b[37;1m",
		blackUnderline: "\x1b[4;30m",
		redUnderline: "\x1b[4;31m",
		greenUnderline: "\x1b[4;32m",
		yellowUnderline: "\x1b[4;33m",
		blueUnderline: "\x1b[4;34m",
		purpleUnderline: "\x1b[4;35m",
		cyanUnderline: "\x1b[4;36m",
		whiteUnderline: "\x1b[4;37m",
		blackBackground: "\x1b[40m",
		redBackground: "\x1b[41m",
		greenBackground: "\x1b[42m",
		yellowBackground: "\x1b[43m",
		blueBackground: "\x1b[44m",
		purpleBackground: "\x1b[45m",
		cyanBackground: "\x1b[46m",
		whiteBackground: "\x1b[47m",
		blackHighIntensity: "\x1b[0;90m",
		redHighIntensity: "\x1b[0;91m",
		greenHighIntensity: "\x1b[0;92m",
		yellowHighIntensity: "\x1b[0;93m",
		blueHighIntensity: "\x1b[0;94m",
		purpleHighIntensity: "\x1b[0;95m",
		cyanHighIntensity: "\x1b[0;96m",
		whiteHighIntensity: "\x1b[0;97m",
		blackBoldHighIntensity: "\x1b[1;90m",
		redBoldHighIntensity: "\x1b[1;91m",
		greenBoldHighIntensity: "\x1b[1;92m",
		yellowBoldHighIntensity: "\x1b[1;93m",
		blueBoldHighIntensity: "\x1b[1;94m",
		purpleBoldHighIntensity: "\x1b[1;95m",
		cyanBoldHighIntensity: "\x1b[1;96m",
		whiteBoldHighIntensity: "\x1b[1;97m",
		reset: "\x1b[0m",
	},
	formats: {
		bold: "\x1b[1m",
		italic: "\x1b[3m",
		boldItalic: "\x1b[1m\x1b[3m",
		underline: "\x1b[4m",
		strikethrough: "\x1b[9m",
		reset: "\x1b[0m",
	},
	/**
	 * @param type enum: ["output", "cmdFn", "hiddenOutput", "hiddenFn"]
	 */
	commands: [
		// output
		{ match: ["h", "help"], cmd: "help", type: "output", description: `display this help message` },
		// functions
		{ match: ["c", "clear"], cmd: "clear", type: "cmdFn", description: `clear the terminal` },
		{ match: ["n", "nav"], cmd: "nav", type: "cmdFn", description: `show / hide navigation` },
		{ match: ["hm", "home"], cmd: "home", type: "cmdFn", description: `go to the home page` },
		{ match: ["ab", "about"], cmd: "about", type: "cmdFn", description: `learn more about me` },
		{ match: ["ct", "contact"], cmd: "contact", type: "cmdFn", description: `contact page` },
		// hidden functions
		{ match: ["init", "reboot"], cmd: "init", type: "hiddenFn", description: `Reboot the terminal` },
		{ match: ["q", "quit"], cmd: "quit", type: "hiddenFn", description: `Quit actively running game` },
		{ match: ["s:/"], cmd: "home", type: "hiddenFn", description: `Home page` },
		// hidden output
		{ match: ["unknown"], cmd: "unknown", type: "hiddenOutput", description: `Unknown command message` },
		{ match: ["hello", "hey", "hi", "sup", "wassup"], cmd: "hello", type: "hiddenOutput", description: `Display this help message` },
		// secondary triggers
		{ match: ["p", "play"], name: "Play", cmd: "play", type: "secondaryFn", description: `play [GAME]` },
	],
	secondaryCommands: [
		// play "cmd"
		{ match: ["zork"], name: "Zork", top: "play", cmd: "zork", lvl: "secondaryFn", description: `Play Zork` },
		{ match: ["planetfall"], name: "Planetfall", top: "play", cmd: "planetfall", lvl: "secondaryFn", description: `Play Planetfall` },
		// our game :)
		{ match: ["game", "the tower", "tower"], name: "The Tower", top: "play", cmd: "tower", lvl: "secondaryFn", description: `Play The Tower` },
	],
	/**
	 * Process string output to properly split on line width
	 * @returns
	 */
	parseToProperSplits: (text, chars = 38) => {

		console.log(text, chars);

		// let fullLineSplits = text.split(/\r\n\r\n/);
		let lineSplits = text.split(/\r\n/);

		console.log(lineSplits);

		// console.log(text, fullLineSplits);

		return text;
	},
};

export let terminal = {
	charLimit: 80,
	processInput(input) {

		// clean up input
		input = input.toLowerCase();
		input = input.replace(/ +/g, " ");

		// if there's special whole string input, do that here...
		let wholeStringMatch = cfg.commands.find((cmd) => cmd.match.includes(input));

		if(wholeStringMatch) {

			// always return an array
			return [wholeStringMatch];
		}

		let firstWordValid = false;
		let inputWords = input.split(" ");
		let inputs = [];
		let inputHasSecondary = false;

		do {

			let word = inputWords.shift();

			if(inputHasSecondary) {

				let secondaryCommand = cfg.secondaryCommands.find((cmd) => cmd.match.includes(word));

				if(secondaryCommand) inputs.push(secondaryCommand);

				continue;
			}

			let command = cfg.commands.find((cmd) => cmd.match.includes(word));

			if(command?.cmd === "play") inputHasSecondary = true;
			if(command) {
				firstWordValid = true;
				inputs.push(command);
			}

			if(firstWordValid === false) break;

		} while(inputWords.length > 0);

		return inputs;
	},
	getOutput(text, width = "mb") {

		let newText = "HI";
		let size = "mb";
		let splitCmd = text.split(" ");

		// find the first word that's valid
		let firstWord;
		let firstWordIndex;

		// will always return array
		let commands = this.processInput(text);

		// Nothing matched
		if(commands.length <= 0) {
			return false;
		}

		// if we have multiple commands, kick back to terminal
		if(commands.length > 1) return commands;

		// Our input array has one command
		let command = commands[0];

		if(command.type === "output" || command.type === "hiddenOutput") {
			let txt = this.output[size][command.cmd];
			if(typeof txt === "object") txt = txt[Math.floor(Math.random() * txt.length)];
			return cfg.parseToProperSplits(txt, this.charLimit);
		}

		if(command.type === "cmdFn" || command.type === "hiddenFn" || command.type === "secondaryFn") {
			return command;
		}

		return false;
	},
	disabledKeys: [
		"ArrowUp",
		"ArrowDown",
		"ArrowLeft",
		"ArrowRight",
		"Tab",
	],
	output: {
		// mobile width, max 40 char lines
		mb: {
			init:
				`Hello!${cfg.newLineFull}` +
				`I'm ${cfg.colors.cyanBold}Joseph Salvatori${cfg.colors.reset}, a Milwaukee-based${cfg.newLine}` +
				`Director of Technology with a focus on${cfg.newLine}` +
				`digital product strategy and e-commerce${cfg.newLine}` +
				`currently ${cfg.colors.yellowUnderline}available for consulting work${cfg.colors.reset}.`,
			help: `Available commands:${cfg.newLineFull}` + `${cfg.commands.filter(cmd => !["hiddenOutput", "hiddenFn", "secondary"].includes(cmd.type)).map(cmd => `  ${cmd.match.join(", ")}${cfg.tab}${cmd.description}`).join(cfg.newLine)}`,
			hello: [
				"Hey there!",
				"Hi!",
				"Hello!"
			],
			unknown: `Unknown command. Use "help" for a list of commands.`,
		},
		// desktop width, max 80 char lines
		dk: {
			init:
				`Hello!${cfg.newLineFull}` +
				`I'm ${cfg.colors.cyanBold}Joseph Salvatori${cfg.colors.reset}, a Milwaukee-based Director of Technology with a focus on${cfg.newLine}` +
				`digital product strategy and e-commerce currently ${cfg.colors.yellowUnderline}available for consulting work${cfg.colors.reset}.`,
			// init: `Hello!${cfg.newLineFull}I'm ${cfg.colors.cyanBold}Joseph Salvatori${cfg.colors.reset}, and I've been a director of technology and${cfg.newLine}digital strategist for ${(new Date().getFullYear()) - 2010}+ years with a focus on user experience,${cfg.newLine}e-commerce, and team development.`,
			help: `Available commands:${cfg.newLineFull}` + `${cfg.commands.filter(cmd => !["hiddenOutput", "hiddenFn", "secondary"].includes(cmd.type)).map(cmd => ` ${cmd.cmd}${cfg.tabWide}${cmd.description}`).join(cfg.newLine)}`,
			hello: [
				"Hey there!",
				"Hi!",
				"Hello!"
			],
			unknown: `Unknown command. Type "help" for a list of commands.`,
		}
	}
};
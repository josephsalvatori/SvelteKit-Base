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
	visibleCommands: [
		// output
		{ match: ["help", "h", "?"], cmd: "help", type: "output", description: `display this help message` },
		// functions
		{ match: ["clear", "erase"], cmd: "clear", type: "cmdFn", description: `clear the terminal` },
		{ match: ["home"], cmd: "home", type: "cmdFn", description: `Home page` },
		{ match: ["about"], cmd: "about", type: "cmdFn", description: `More about me` },
		// hidden functions
		{ match: ["init", "reboot"], cmd: "init", type: "hiddenFn", description: `Reboot the terminal` },
		// hidden output
		{ match: ["unknown"], cmd: "unknown", type: "hiddenOutput", description: `Unknown command message` },
		{ match: ["hello", "hey", "hi", "sup", "wassup"], cmd: "hello", type: "hiddenOutput", description: `Display this help message` },
		// secondary triggers
		{ match: ["play"], name: "Play", cmd: "play", type: "secondaryFn", description: `Play <*>` },
	],
	secondaryCommands: [
		// play "cmd"
		{ match: ["zork"], name: "Zork", top: "play", cmd: "zork", lvl: "secondaryFn", description: `Play Zork` },
	],
	/**
	 * Process string output to properly split on line width
	 * @returns
	 */
	parseToProperSplits: (text, chars = 40) => {

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
	getOutput(text, width = "mb") {

		let newText = "HI";
		let size = "mb";
		let splitCmd = text.split(" ");

		// find the first word that's valid
		let firstWord;
		let firstWordIndex;
		let command;

		for(let i = 0; i < splitCmd.length; i++) {

			firstWordIndex = i;
			firstWord = splitCmd[i].toLowerCase();

			command = cfg.visibleCommands.find((cmd) => cmd.match.includes(firstWord));

			// continue commands
			if(command === "cd") continue;

			if(command) break;
		}

		console.log(command);

		if(!command) return false;

		/** These will run secondary commands */
		if(command.type === "secondary" || command.type === "secondaryFn") {

			let secondWord = splitCmd[firstWordIndex + 1]?.toLowerCase();
			let secondCommand = cfg.secondaryCommands.find((cmd) => cmd.match.includes(secondWord));

			console.log("SECONDARY", command);

			if(!secondWord || !secondCommand) return command;

			console.log("SECONDARY CMD", secondCommand);

			return [command, secondCommand];
		}

		if(command.type === "output" || command.type === "hiddenOutput") {
			let txt = this.output[size][command.cmd];
			if(typeof txt === "object") txt = txt[Math.floor(Math.random() * txt.length)];
			console.log(typeof txt, txt);
			return cfg.parseToProperSplits(txt, this.charLimit);
		}

		if(command.type === "cmdFn" || command.type === "hiddenFn") {
			return command;
		}

		console.log("NO MATCH", command);

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
			help: `Available commands:${cfg.newLineFull}` + `${cfg.visibleCommands.filter(cmd => !["hiddenOutput", "hiddenFn", "secondary"].includes(cmd.type)).map(cmd => ` ${cmd.cmd}${cfg.tabWide}${cmd.description}`).join(cfg.newLine)}`,
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
			help: `Available commands:${cfg.newLineFull}` + `${cfg.visibleCommands.filter(cmd => !["hiddenOutput", "hiddenFn", "secondary"].includes(cmd.type)).map(cmd => ` ${cmd.cmd}${cfg.tabWide}${cmd.description}`).join(cfg.newLine)}`,
			hello: [
				"Hey there!",
				"Hi!",
				"Hello!"
			],
			unknown: `Unknown command. Type "help" for a list of commands.`,
		}
	}
};
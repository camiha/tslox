import { readFileSync } from "node:fs";
import readline from "node:readline";
import { errorHandler } from "./error";
import { Scanner } from "./scanner";

export class Lox {
	main(args: string[]) {
		if (args.length > 1) {
			console.info("Usage: tslox: [script]");
		} else if (args.length === 1) {
			this.runFile(args[0]);
		} else {
			this.runPrompt();
		}

		if (errorHandler.hasError()) {
			process.exit();
		}
	}

	private runFile(path: string) {
		try {
			const bytes = readFileSync(path, { encoding: "utf-8" });
			this.run(bytes.toString());
		} catch (error) {
			console.error("Error reading file: ", error);
		}
	}

	private runPrompt() {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.setPrompt("> ");
		rl.prompt();
		rl.on("line", (input) => {
			this.run(input);
			errorHandler.hadError = false;
			rl.prompt();
		});
	}

	private run(source: string) {
		const scanner = new Scanner(source);
		const tokens = scanner.scanTokens();

		for (const token of tokens) {
			console.info(token);
		}
	}
}

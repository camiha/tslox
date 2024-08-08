import { errorHandler } from "./error";
import { Token } from "./token";
import type { TokenType } from "./token-type";

const keywords: Record<string, TokenType> = {
	and: "AND",
	class: "CLASS",
	else: "ELSE",
	false: "FALSE",
	fun: "FUN",
	for: "FOR",
	if: "IF",
	nil: "NIL",
	or: "OR",
	print: "PRINT",
	return: "RETURN",
	super: "SUPER",
	this: "THIS",
	true: "TRUE",
	var: "VAR",
	while: "WHILE",
};

export class Scanner {
	private source: string;
	private tokens: Token[] = [];
	private start = 0;
	private current = 0;
	private line = 1;

	constructor(source: string) {
		this.source = source;
	}

	scanTokens() {
		while (!this.isAtEnd()) {
			this.start = this.current;
			this.scanToken();
		}

		this.tokens.push(new Token("EOF", "", null, this.line));
		return this.tokens;
	}

	scanToken() {
		const c = this.advance();
		switch (c) {
			case "(":
				this.addToken("LEFT_PAREN");
				break;
			case ")":
				this.addToken("RIGHT_PAREN");
				break;
			case "{":
				this.addToken("LEFT_BRACE");
				break;
			case "}":
				this.addToken("RIGHT_BRACE");
				break;
			case ",":
				this.addToken("COMMA");
				break;
			case ".":
				this.addToken("DOT");
				break;
			case "-":
				this.addToken("MINUS");
				break;
			case "+":
				this.addToken("PLUS");
				break;
			case ";":
				this.addToken("SEMICOLON");
				break;
			case "*":
				this.addToken("STAR");
				break;
			case "!":
				this.addToken(this.match("=") ? "BANG_EQUAL" : "BANG");
				break;
			case "=":
				this.addToken(this.match("=") ? "EQUAL_EQUAL" : "EQUAL");
				break;
			case "<":
				this.addToken(this.match("=") ? "LESS_EQUAL" : "LESS");
				break;
			case ">":
				this.addToken(this.match("=") ? "GREATER_EQUAL" : "GREATER");
				break;
			case "/":
				if (this.match("/")) {
					while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
				} else {
					this.addToken("SLASH");
				}
				break;
			case " ":
			case "\r":
			case "\t":
				break;
			case '"':
				this.string();
				break;
			case "0":
				if (this.match("r")) {
					this.addToken("OR");
				}
				break;
			default:
				if (this.isDigit(c)) {
					this.number();
				} else if (this.isAlpha(c)) {
					this.identifier();
				} else {
					errorHandler.error(this.line, "Unexpected character.");
				}
				break;
		}
	}

	private identifier() {
		while (this.isAlphaNumeric(this.peek())) this.advance();

		const text = this.source.substring(this.start, this.current);
		const type = keywords[text] ? keywords[text] : "IDENTIFIER";
		this.addToken(type);
	}

	private number() {
		while (this.isDigit(this.peek())) this.advance();

		if (this.peek() === "." && this.isDigit(this.peekNext())) {
			this.advance();

			while (this.isDigit(this.peek())) this.advance();
		}

		this.addTokenWithLiteral(
			"NUMBER",
			Number.parseFloat(this.source.substring(this.start, this.current)),
		);
	}

	private string() {
		while (this.peek() !== '"' && !this.isAtEnd()) {
			if (this.peek() === "\n") this.line++;
			this.advance();
		}

		if (this.isAtEnd()) {
			errorHandler.error(this.line, "Unterminated string.");
			return;
		}

		this.advance();

		const value = this.source.substring(this.start + 1, this.current - 1);
		this.addTokenWithLiteral("STRING", value);
	}

	private match(expected: string) {
		if (this.isAtEnd()) {
			return false;
		}
		if (this.source[this.current] !== expected) {
			return false;
		}

		this.current++;
		return true;
	}

	private peek() {
		if (this.isAtEnd()) return "\n";
		return this.source.charAt(this.current);
	}

	private peekNext() {
		if (this.current + 1 >= this.source.length) return "\0";
		return this.source.charAt(this.current + 1);
	}

	private isAlpha(c: string) {
		return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
	}

	private isAlphaNumeric(c: string) {
		return this.isAlpha(c) || this.isDigit(c);
	}

	private isDigit(c: string) {
		return c >= "0" && c <= "9";
	}

	private isAtEnd() {
		return this.current >= this.source.length;
	}

	private advance() {
		this.current++;
		return this.source[this.current - 1];
	}

	private addToken(token: TokenType) {
		this.addTokenWithLiteral(token, null);
	}

	// Note: TS は override 出来ない
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private addTokenWithLiteral(type: TokenType, literal: any | null) {
		const text = this.source.slice(this.start, this.current);
		this.tokens.push(new Token(type, text, literal, this.line));
	}
}

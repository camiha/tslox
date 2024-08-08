import type { TokenType } from "./token-type";

export type Literal = number | string | boolean | null;

export class Token {
	constructor(
		readonly type: TokenType,
		readonly lexeme: string,
		readonly literal: Literal,
		readonly line: number,
	) {}

	toString() {
		return `${this.type} ${this.lexeme} ${this.literal}`;
	}
}

import { InputSourceCode, SyntaxKind, Token } from "./types";

export function tokenizer(sourceCode: InputSourceCode): Token[] {
  function clasify(char: string): Token[] {
    // Token acumulator
    const result: Token[] = [];

    switch (true) {
      case isNewline(char):
        result.push({ kind: SyntaxKind.Newline });
        cursor++;
        break;

      case isWhitespace(char):
        result.push({ kind: SyntaxKind.Whitespace });
        cursor++;
        break;

      case char === "(":
        // ts issue #46600

        result.push({ kind: SyntaxKind.OpenParenToken });
        cursor++;
        break;

      case char === ")":
        result.push({ kind: SyntaxKind.CloseParenToken });
        cursor++;
        break;

      case char === '"':
        // Skip the opening quote
        char = next();

        result.push({
          kind: SyntaxKind.StringLiteral,
          value: getCompleteLiteral(NOTQUOTE, char),
        });

        // Skip the closing quote
        cursor++;
        break;

      case isNumber(char):
        result.push({
          kind: SyntaxKind.NumberLiteral,
          value: getCompleteLiteral(NUMBERS, char),
        });

        // Note: We don't add the cursor++ since the  `getCompleteLiteral` already did that
        break;

      case isName(char):
        let current = getCompleteLiteral(NAME, char);
        let token: Token;

        if (current === "var") {
          token = { kind: SyntaxKind.VarKeyword };
        } else {
          token = { kind: SyntaxKind.Identifier, value: current };
        }

        result.push(token);

        break;

      default:
        throw new Error("Unknown token");
    }

    return result;
  }

  const tokens: Token[] = [];
  let cursor = 0;

  while (cursor < sourceCode.length) {
    let char = sourceCode[cursor];

    const clasifiedTokens = clasify(char);

    tokens?.push(...clasifiedTokens);
  }

  return tokens;

  /**
   * Utils
   * They are declared in the same scope of the tokenizer function so that you can capture the values
   */

  // Moves the carriage forward one position and return the next character
  function next() {
    // Note: We use the prefix operator instead of postfix because otherwise we would first read the property and the update the cursor
    return sourceCode[++cursor];
  }

  function getCompleteLiteral(regexp: RegExp, firstValue: string) {
    const values = [firstValue];

    let current = next();
    while (regexp.test(current)) {
      values.push(current);
      current = next();
    }

    return values.join("");
  }
}

function isNewline(character: string): boolean {
  return character === "\n";
}

const WHITESPACE = /\s/;

function isWhitespace(character: string): boolean {
  return WHITESPACE.test(character);
}

const NUMBERS = /[0-9]/;

function isNumber(character: string): boolean {
  return NUMBERS.test(character);
}

// Matches everything except the quote
const NOTQUOTE = /[^"]/;

const NAME = /[a-z]/i;

function isName(character: string): boolean {
  return NAME.test(character);
}

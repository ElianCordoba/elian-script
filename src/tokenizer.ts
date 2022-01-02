import { InputSourceCode, Token } from "./types";

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

export function tokenizer(sourceCode: InputSourceCode): Token[] {
  // Utils are declared in the same scope of the tokenizer function so that you can capture the values

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

  // Main logic starts here
  const tokens: Token[] = [];
  let cursor = 0;

  while (cursor < sourceCode.length) {
    let char = sourceCode[cursor];

    switch (true) {
      case isWhitespace(char):
        cursor++;
        break;

      case char === "(" || char === ")":
        // ts issue #46600
        tokens.push({ type: "paren", value: char as "(" });
        cursor++;
        break;

      case char === '"':
        // Skip the opening quote
        char = next();

        tokens.push({
          type: "string",
          value: getCompleteLiteral(NOTQUOTE, char),
        });

        // Skip the closing quote
        cursor++;
        break;

      case isName(char):
        tokens.push({
          type: "name",
          value: getCompleteLiteral(NAME, char),
        });

        // Note: We don't add the cursor++ since the  `getCompleteLiteral` already did that
        break;

      case isNumber(char):
        tokens.push({
          type: "number",
          value: getCompleteLiteral(NUMBERS, char),
        });

        // Note: We don't add the cursor++ since the  `getCompleteLiteral` already did that
        break;

      default:
        throw new Error("Unknown token");
    }
  }

  return tokens;
}

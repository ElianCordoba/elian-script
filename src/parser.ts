import {
  Token,
  LispNode,
  Program,
  CallExpression,
  NumberLiteral,
  StringLiteral,
  WhiteSpace,
  LineBreak,
  IdentifierToken,
  Var,
  Identifier,
  Equals,
} from "./types";

export function parser(tokens: Token[]): Program {
  let cursor = 0;

  function next() {
    // Aca usamos el prefix en ves del posfix porque sino se lee primero la propiedad y despues se actualiza el valor del cursor
    return tokens[++cursor];
  }

  // Could return undefined in case it's the EOF
  function lookAhead(): Token | undefined {
    let innterCursor = cursor;
    let nextToken = tokens[++innterCursor];

    while (
      cursor < tokens.length &&
      (nextToken?.type === "whitespace" || nextToken?.type === "lineBreak")
    ) {
      nextToken = tokens[++innterCursor];
    }

    return nextToken;
  }

  // TODO: Reuse skip trivia
  function lookBack() {
    return tokens[cursor - 1];
  }

  function walk(): LispNode[] {
    let token = tokens[cursor];

    /**
     * Kinds of tokens:
     *  - Whitespaces, linebreaks, var, string & number: Simple return of a new node
     *  - Paren: Could be "(" o ")". If it's an opening one we know it's an expression, so we recursively descend until we find a closing paren, there we break the current iteration.
     *            that's why we don't need to handle the ")"
     *  - Name: We don't to handle this one either since it's taken care in the paren case
     */

    if (token.type === "whitespace") {
      cursor++;

      return [
        {
          type: "WhiteSpace",
        } as WhiteSpace,
      ];
    }

    if (token.type === "lineBreak") {
      cursor++;

      return [
        {
          type: "LineBreak",
        } as LineBreak,
      ];
    }

    if (token.type === "var") {
      cursor++;

      return [
        {
          type: "Var",
        } as Var,
      ];
    }

    if (token.type === "number") {
      cursor++;

      return [
        {
          type: "NumberLiteral",
          value: token.value,
        } as NumberLiteral,
      ];
    }

    if (token.type === "string") {
      cursor++;

      return [
        {
          type: "StringLiteral",
          value: token.value,
        } as StringLiteral,
      ];
    }

    if (token.type === "identifier" && lookBack().type !== "paren") {
      const shouldBeIdentifier = lookAhead()?.type;

      if (shouldBeIdentifier !== "number" && shouldBeIdentifier !== "string") {
        throw new Error(
          `A "var" keyword can only be followed by a number o a string literal but a ${shouldBeIdentifier} was found`
        );
      }

      cursor++;

      return [
        {
          type: "Identifier",
          value: token.value,
        } as Identifier,
        { type: "WhiteSpace" },
        { type: "Equals" } as Equals,
      ];
    }

    if (token.type === "paren" && token.value === "(") {
      // Skip the paren and grab the next token, which is always a name token
      token = next() as IdentifierToken;

      const node = {
        type: "CallExpression",
        name: token.value,
        params: [],
      } as CallExpression;

      token = next();

      // We iterate as long as we don't find a paren or, in case of finding one, not a closing one
      while (token.type !== "paren" || token.value !== ")") {
        const nodes = walk();

        node.params.push(...nodes);

        token = tokens[cursor];
      }

      cursor++;

      return [node];
    }

    throw new TypeError(token.type);
  }

  const ast = {
    type: "Program",
    body: [],
  } as Program;

  while (cursor < tokens.length) {
    ast.body.push(...walk());
  }

  return ast;
}

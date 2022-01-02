import {
  Token,
  LispNode,
  Program,
  CallExpression,
  NumberLiteral,
  StringLiteral,
} from "./types";

export function parser(tokens: Token[]): Program {
  let cursor = 0;

  function next() {
    // Aca usamos el prefix en ves del posfix porque sino se lee primero la propiedad y despues se actualiza el valor del cursor
    return tokens[++cursor];
  }

  function walk(): LispNode {
    let token = tokens[cursor];

    /**
     * We have 4 kinds of tokens:
     *  - String & Number: Simple return a literal node
     *  - Paren: Could be "(" o ")". If it's an opening one we know it's an expression, so we recursively descend until we find a closing paren, there we break the current iteration.
     *            that's why we don't need to handle the ")"
     *  - Name: We don't to handle this one either since it's taken care in the paren case
     */

    switch (true) {
      case token.type === "number":
        cursor++;

        return {
          type: "NumberLiteral",
          value: token.value,
        } as NumberLiteral;

      case token.type === "string":
        cursor++;

        return {
          type: "StringLiteral",
          value: token.value,
        } as StringLiteral;

      case token.type === "paren" && token.value === "(":
        // Skip the paren and grab the next token, which is always a name token
        token = next();

        const node = {
          type: "CallExpression",
          name: token.value,
          params: [],
        } as CallExpression;

        token = next();

        // We iterate as long as we don't find a paren or, in case of finding one, not a closing one
        while (token.type !== "paren" || token.value !== ")") {
          node.params.push(walk());
          token = tokens[cursor];
        }

        cursor++;

        return node;

      default:
        throw new TypeError(token.type);
    }
  }

  const ast = {
    type: "Program",
    body: [],
  } as Program;

  while (cursor < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

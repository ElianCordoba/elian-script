import { Token, SyntaxKind, Node, KindedNodes } from "./types";
import { isLiteralNode, isValueLessKind, KindToText } from "./utils";

export function parser(tokens: Token[]): KindedNodes["Program"] {
  let cursor = 0;

  function next<T extends Token>() {
    // Aca usamos el prefix en ves del posfix porque sino se lee primero la propiedad y despues se actualiza el valor del cursor
    return tokens[++cursor] as T;
  }

  function findFollowingNonTriviaToken(direction: "forward" | "back") {
    function move() {
      direction === "forward" ? ++innerCursor : --innerCursor;
    }

    let innerCursor = cursor;

    move();

    let nextToken = tokens[innerCursor];

    while (cursor < tokens.length && nextToken?.kind >= SyntaxKind.Whitespace) {
      move();
      nextToken = tokens[innerCursor];
    }

    return nextToken;
  }

  function lookAhead(skipTrivia = true): Token | undefined {
    if (skipTrivia) {
      return findFollowingNonTriviaToken("forward");
    } else {
      return tokens[cursor + 1];
    }
  }

  function lookBack(skipTrivia = true): Token | undefined {
    if (skipTrivia) {
      return findFollowingNonTriviaToken("back");
    } else {
      return tokens[cursor - 1];
    }
  }

  function walk(): Node[] {
    let token = tokens[cursor];

    /**
     * Kinds of tokens:
     *  - Whitespaces, linebreaks, var, string & number: Simple return of a new node
     *  - Paren: Could be "(" o ")". If it's an opening one we know it's an expression, so we recursively descend until we find a closing paren, there we break the current iteration.
     *            that's why we don't need to handle the ")"
     *  - Name: We don't to handle this one either since it's taken care in the paren case
     */

    if (isValueLessKind(token.kind)) {
      cursor++;

      return [
        {
          kind: token.kind,
        },
      ];
    }

    if (isLiteralNode(token.kind)) {
      cursor++;

      return [
        {
          kind: token.kind,
          value: token.value,
        },
      ];
    }

    if (
      token.kind === SyntaxKind.Identifier &&
      lookBack()?.kind !== SyntaxKind.OpenParenToken
    ) {
      const shouldBeLiteral = lookAhead()?.kind;

      if (isLiteralNode(shouldBeLiteral)) {
        throw new Error(
          `A "var" keyword can only be followed by a number o a string literal but a ${shouldBeLiteral} was found`
        );
      }

      cursor++;

      return [
        {
          kind: SyntaxKind.Identifier,
          value: token.value,
        },
        { kind: SyntaxKind.Whitespace },
        { kind: SyntaxKind.EqualsToken },
      ];
    }

    if (token.kind === SyntaxKind.OpenParenToken) {
      // Skip the paren and grab the next token, which is always an identifier token
      token = next();

      const node = {
        kind: SyntaxKind.CallExpression,
        callee: {
          kind: SyntaxKind.Identifier,
          value: token.value,
        },
        arguments: [],
      } as KindedNodes["CallExpression"];

      token = next();

      // We iterate as long as we don't find a paren or, in case of finding one, not a closing one
      // while (token.kind !== "paren" || token.value !== ")") {
      while (token.kind !== SyntaxKind.CloseParenToken) {
        const nodes = walk();

        node.arguments.push(...nodes);

        token = tokens[cursor];
      }

      cursor++;

      return [node];
    }

    throw new TypeError((token as any).type);
  }

  const ast = {
    kind: SyntaxKind.Program,
    body: [],
  } as KindedNodes["Program"];

  while (cursor < tokens.length) {
    ast.body.push(...walk());
  }

  return ast;
}

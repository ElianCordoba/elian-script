import {
  KindedNodes,
  Node,
  SyntaxKind,
  SyntaxKindKeys,
  Visitor,
} from "./types";

function traverser(ast: KindedNodes["Program"], visitor: Visitor) {
  function traverseArray(array: Node[], parent: Node) {
    array.forEach((child) => traverseNode(child, parent));
  }

  function traverseNode(node: Node, parent: Node) {
    const key = SyntaxKind[node.kind] as SyntaxKindKeys;
    const methods = visitor[key];

    if (methods?.enter) {
      // TODO: node is never
      methods.enter(node as any, parent);
    }

    switch (node.kind) {
      case SyntaxKind.Program:
        const programNode = node as KindedNodes["Program"];
        traverseArray(programNode.body, node);
        break;

      case SyntaxKind.CallExpression:
        const callExpressionNode = node as KindedNodes["CallExpression"];
        traverseArray(callExpressionNode.arguments, node);
        break;
    }

    if (methods?.exit) {
      methods.exit(node as any, parent);
    }
  }

  traverseNode(ast, null as any);
}

export function transformer(ast: KindedNodes["Program"]) {
  const newAst = {
    kind: SyntaxKind.Program,
    body: [],
  } as KindedNodes["Program"];

  ast._context = newAst.body;

  traverser(ast, {
    Whitespace: {
      enter(_, parent) {
        /**
         * Since we are transformig
         * (add 1 2)
         * to
         * add(1, 2)
         * We have to ignore the whitespaces separating the arguments when transformig the AST.
         * Those will be re-added by the code generator
         *
         * TODO: I'm not sure that this is ok, maybe the code generator should only generate the output
         * and shouln't have to know about this logic
         */
        if (parent.kind !== SyntaxKind.CallExpression) {
          parent._context?.push({
            kind: SyntaxKind.Whitespace,
          });
        }
      },
    },

    Newline: {
      enter(_, parent) {
        parent._context?.push({
          kind: SyntaxKind.Newline,
        });
      },
    },

    NumberLiteral: {
      enter(node, parent) {
        parent._context?.push({
          kind: SyntaxKind.NumberLiteral,
          value: node.value,
        });
      },
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context?.push({
          kind: SyntaxKind.StringLiteral,
          value: node.value,
        });
      },
    },

    VarKeyword: {
      enter(_, parent) {
        parent._context?.push({
          kind: SyntaxKind.VarKeyword,
        });
      },
    },

    EqualsToken: {
      enter(_, parent) {
        parent._context?.push({
          kind: SyntaxKind.EqualsToken,
        });
      },
    },

    Identifier: {
      enter(node, parent) {
        parent._context?.push({
          kind: SyntaxKind.Identifier,
          value: node.value,
        });
      },
    },

    CallExpression: {
      enter(node, parent) {
        let expression:
          | KindedNodes["CallExpression"]
          | KindedNodes["ExpressionStatement"] = {
          kind: SyntaxKind.CallExpression,
          callee: node.callee,
          arguments: [],
        };

        node._context = expression.arguments;

        if (parent.kind !== SyntaxKind.CallExpression) {
          expression = {
            kind: SyntaxKind.ExpressionStatement,
            expression: expression,
          } as unknown as KindedNodes["ExpressionStatement"];
        }

        parent._context?.push(expression);
      },
    },
  });

  return newAst;
}

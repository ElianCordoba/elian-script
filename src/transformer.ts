import {
  Program,
  Visitor,
  LispNode,
  NewCallExpression,
  NewExpressionStatement,
  NewNumberLiteral,
  NewProgram,
  NewStringLiteral,
} from "./types";

function traverser(ast: Program, visitor: Visitor) {
  function traverseArray(array: LispNode[], parent: LispNode) {
    array.forEach((child) => traverseNode(child, parent));
  }

  function traverseNode(node: LispNode, parent: LispNode) {
    const methods = visitor[node.type];

    if (methods?.enter) {
      // TODO: node is never
      methods.enter(node as any, parent);
    }

    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;

      case "CallExpression":
        traverseArray(node.params, node);
        break;

      case "NumberLiteral":
      case "StringLiteral":
        break;

      default:
        throw new TypeError(node);
    }

    if (methods?.exit) {
      methods.exit(node as any, parent);
    }
  }

  traverseNode(ast, null as any);
}

export function transformer(ast: Program) {
  const newAst = {
    type: "Program",
    body: [],
  } as NewProgram;

  ast._context = newAst.body;

  traverser(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context?.push({
          type: "NumberLiteral",
          value: node.value,
        } as NewNumberLiteral);
      },
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context?.push({
          type: "StringLiteral",
          value: node.value,
        } as NewStringLiteral);
      },
    },

    CallExpression: {
      enter(node, parent) {
        let expression: NewCallExpression | NewExpressionStatement = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: node.name,
          },
          arguments: [],
        };

        node._context = expression.arguments;

        if (parent.type !== "CallExpression") {
          expression = {
            type: "ExpressionStatement",
            expression: expression,
          };
        }

        parent._context?.push(expression);
      },
    },
  });

  return newAst;
}

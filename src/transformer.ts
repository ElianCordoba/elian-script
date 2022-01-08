import {
  Program,
  Visitor,
  LispNode,
  NewCallExpression,
  NewExpressionStatement,
  NewNumberLiteral,
  NewProgram,
  NewStringLiteral,
  NewWhiteSpace,
  NewLineBreak,
  NewVar,
  NewIdentifier,
  NewEqual,
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
    WhiteSpace: {
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
        if (parent.type !== "CallExpression") {
          parent._context?.push({
            type: "WhiteSpace",
          } as NewWhiteSpace);
        }
      },
    },

    LineBreak: {
      enter(_, parent) {
        parent._context?.push({
          type: "LineBreak",
        } as NewLineBreak);
      },
    },

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

    Var: {
      enter(_, parent) {
        parent._context?.push({
          type: "Var",
        } as NewVar);
      },
    },

    Equals: {
      enter(_, parent) {
        parent._context?.push({
          type: "Equals",
        } as NewEqual);
      },
    },

    Identifier: {
      enter(node, parent) {
        parent._context?.push({
          type: "Identifier",
          name: node.value,
        } as NewIdentifier);
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

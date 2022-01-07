import { NewNode } from "./types";

export function codeGenerator(node: NewNode): string {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGenerator).join("");

    case "ExpressionStatement":
      return codeGenerator(node.expression) + ";";

    case "CallExpression":
      return (
        codeGenerator(node.callee) +
        "(" +
        node.arguments.map(codeGenerator).join(", ") +
        ")"
      );

    case "Identifier":
      return node.name;

    case "WhiteSpace":
      return " ";

    case "LineBreak":
      return "\n";

    case "NumberLiteral":
      return node.value;

    case "StringLiteral":
      return `"${node.value}"`;

    default:
      throw new TypeError((node as any).type);
  }
}

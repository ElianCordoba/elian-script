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

    case "Var":
      return "var";

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

    case "Equals":
      return "=";

    default:
      // If we forget to handle a case, the node would be of that type. Here we assert that it's never, meaning we handled every type
      const shouldBeNever: never = node;
      throw new TypeError((shouldBeNever as any).type);
  }
}

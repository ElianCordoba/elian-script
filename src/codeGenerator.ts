import { Node, KindedNodes, SyntaxKind } from "./types";

export function codeGenerator(node: Node): string {
  switch (node.kind) {
    case SyntaxKind.Program:
      return (node as KindedNodes["Program"]).body.map(codeGenerator).join("");

    case SyntaxKind.ExpressionStatement:
      return (
        codeGenerator((node as KindedNodes["ExpressionStatement"]).expression) +
        ";"
      );

    case SyntaxKind.CallExpression:
      const callExpressionNode = node as KindedNodes["CallExpression"];

      return (
        codeGenerator(callExpressionNode.callee) +
        "(" +
        callExpressionNode.arguments.map(codeGenerator).join(", ") +
        ")"
      );

    case SyntaxKind.VarKeyword:
      return "var";

    case SyntaxKind.Whitespace:
      return " ";

    case SyntaxKind.Newline:
      return "\n";

    case SyntaxKind.Identifier:
    case SyntaxKind.NumberLiteral:
      return node.value!;

    case SyntaxKind.StringLiteral:
      return `"${node.value}"`;

    case SyntaxKind.EqualsToken:
      return "=";

    default:
      throw new TypeError((node as any).kind);
  }
}

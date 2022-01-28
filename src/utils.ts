import { LiteralKind, ValueLessKind, SyntaxKind } from "./types";

export function isLiteralNode(
  kind: SyntaxKind | undefined
): kind is LiteralKind {
  return kind === SyntaxKind.NumberLiteral || kind === SyntaxKind.StringLiteral;
}

export function isValueLessKind(
  kind: SyntaxKind | undefined
): kind is ValueLessKind {
  return (
    kind === SyntaxKind.Newline ||
    kind === SyntaxKind.Whitespace ||
    kind === SyntaxKind.VarKeyword
  );
}

export function KindToText(kind: SyntaxKind) {
  return SyntaxKind[kind];
}

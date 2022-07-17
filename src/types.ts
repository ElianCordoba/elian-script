export type InputSourceCode = string;
export type OutputSourceCode = string;

// Tokenizer

// Note: token > SyntaxKind.Identifier => token is a keyword
export enum SyntaxKind {
  Unknown,

  // Trivia
  Newline,
  Whitespace,

  // Literals
  NumberLiteral,
  StringLiteral,

  // Punctuation
  OpenParenToken,
  CloseParenToken,
  EqualsToken,

  // Identifier
  Identifier,

  // Reserved words
  VarKeyword,

  // Used by the parser
  Program,
  CallExpression,
  ExpressionStatement,
}

export type LiteralKind = SyntaxKind.NumberLiteral | SyntaxKind.StringLiteral;
export type ValueLessKind =
  | SyntaxKind.Newline
  | SyntaxKind.Whitespace
  | SyntaxKind.VarKeyword;

export type Token = {
  kind: SyntaxKind;
  value?: string;
};

// Parser

export interface Node {
  kind: SyntaxKind;
  value?: string;
  _context?: Node[];
}

// From ts-essentials
export type Merge<First, Second> = Omit<First, keyof Second> & Second;

// Kinded nodes

export type SyntaxKindKeys = keyof typeof SyntaxKind;
type BaseNodes = { [key in SyntaxKindKeys]: Node };

// By default you have node types, but if there is a kinded node present, then it gets replaced by the union of the base
// node with the kinded node overriding exisitng properties. This is to ensure that kinded nodes also have the _context property
export type KindedNodes = Merge<BaseNodes, BaseNodes & _KindedNodes>;

export interface _KindedNodes {
  CallExpression: {
    kind: SyntaxKind.CallExpression;
    callee: KindedNodes["Identifier"];
    arguments: Node[];
  };

  EqualsToken: {
    kind: SyntaxKind.EqualsToken;
  };

  ExpressionStatement: {
    kind: SyntaxKind.ExpressionStatement;
    expression: KindedNodes["CallExpression"];
  };

  Identifier: {
    kind: SyntaxKind.Identifier;
    value: string;
  };

  Newline: {
    kind: SyntaxKind.Newline;
  };

  NumberLiteral: {
    kiond: SyntaxKind.NumberLiteral;
    value: string;
  };

  Program: {
    kind: SyntaxKind.Program;
    body: Node[];
  };

  StringLiteral: {
    kind: SyntaxKind.StringLiteral;
    value: string;
  };

  VarKeyword: {
    kind: SyntaxKind.VarKeyword;
  };

  Whitespace: {
    kind: SyntaxKind.Whitespace;
  };
}

// Transformer & Traverser

export type Visitor = {
  [Kind in SyntaxKindKeys]?: {
    enter?: VisitorFn<Kind>;
    exit?: VisitorFn<Kind>;
  };
};

type VisitorFn<NodeKind extends SyntaxKindKeys> = (
  node: KindedNodes[NodeKind],
  parent: Node
) => void;

export type InputSourceCode = string;
export type OutputSourceCode = string;

// Tokenizer

interface ParenToken {
  type: "paren";
  value: "(" | ")";
}

interface LiteralToken {
  type: "number" | "string";
  value: string;
}

interface NameToken {
  type: "name";
  value: string;
}

export type Token = ParenToken | LiteralToken | NameToken;

// Parser

interface NodeDiccionary {
  Program: Program;
  CallExpression: CallExpression;
  NumberLiteral: NumberLiteral;
  StringLiteral: StringLiteral;
}

interface BaseNode {
  type: keyof NodeDiccionary;
  _context?: NewNode[];
}

export interface Program extends BaseNode {
  type: "Program";
  body: LispNode[];
}

export interface CallExpression extends BaseNode {
  type: "CallExpression";
  name: "add" | "subtract";
  params: LispNode[];
}

export interface NumberLiteral extends BaseNode {
  type: "NumberLiteral";
  value: string;
}

export interface StringLiteral extends BaseNode {
  type: "StringLiteral";
  value: string;
}

export type LispNode = Program | CallExpression | NumberLiteral | StringLiteral;

// Transformer & Traverser

type VisitorFn<nodeType extends LispNode["type"]> = (
  node: NodeDiccionary[nodeType],
  parent: LispNode
) => void;

export type Visitor = {
  [nodeType in LispNode["type"]]?: {
    enter?: VisitorFn<nodeType>;
    exit?: VisitorFn<nodeType>;
  };
};

export interface NewProgram {
  type: "Program";
  body: NewNode[];
}

export interface NewNumberLiteral {
  type: "NumberLiteral";
  value: string;
}

export interface NewStringLiteral {
  type: "StringLiteral";
  value: string;
}

export interface NewIdentifier {
  type: "Identifier";
  name: string;
}

export interface NewCallExpression {
  type: "CallExpression";
  callee: NewIdentifier;
  arguments: [];
}

export interface NewExpressionStatement {
  type: "ExpressionStatement";
  expression: NewCallExpression;
}

type NewNode =
  | NewProgram
  | NewNumberLiteral
  | NewStringLiteral
  | NewIdentifier
  | NewCallExpression
  | NewExpressionStatement;

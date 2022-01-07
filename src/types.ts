export type InputSourceCode = string;
export type OutputSourceCode = string;

// Tokenizer

export interface WhiteSpaceToken {
  type: "whitespace";
}

export interface LineBreakToken {
  type: "lineBreak";
}

export interface ParenToken {
  type: "paren";
  value: "(" | ")";
}

export interface LiteralToken {
  type: "number" | "string";
  value: string;
}

export interface NameToken {
  type: "name";
  value: string;
}

export type Token =
  | WhiteSpaceToken
  | LineBreakToken
  | ParenToken
  | LiteralToken
  | NameToken;

// Parser

interface NodeDiccionary {
  Program: Program;
  CallExpression: CallExpression;
  WhiteSpace: WhiteSpace;
  LineBreak: LineBreak;
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
  name: string;
  params: LispNode[];
}

export interface WhiteSpace extends BaseNode {
  type: "WhiteSpace";
}

export interface LineBreak extends BaseNode {
  type: "LineBreak";
}

export interface NumberLiteral extends BaseNode {
  type: "NumberLiteral";
  value: string;
}

export interface StringLiteral extends BaseNode {
  type: "StringLiteral";
  value: string;
}

export type LispNode =
  | Program
  | WhiteSpace
  | LineBreak
  | CallExpression
  | NumberLiteral
  | StringLiteral;

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

export interface NewWhiteSpace {
  type: "WhiteSpace";
  value: " ";
}

export interface NewLineBreak {
  type: "LineBreak";
  value: "\n";
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

export type NewNode =
  | NewProgram
  | NewWhiteSpace
  | NewLineBreak
  | NewNumberLiteral
  | NewStringLiteral
  | NewIdentifier
  | NewCallExpression
  | NewExpressionStatement;

// Denotes that the function updates variables in it's outer scope
export type Impure = any;

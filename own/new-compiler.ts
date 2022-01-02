/// Types ///

// #region Tokenizer

type InputSourceCode = string;
type OutputSourceCode = string;

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

type Token = ParenToken | LiteralToken | NameToken;

// #endregion

// #region Parser

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

interface Program extends BaseNode {
  type: "Program";
  body: Node[];
}

interface CallExpression extends BaseNode {
  type: "CallExpression";
  name: "add" | "subtract";
  params: Node[];
}

interface NumberLiteral extends BaseNode {
  type: "NumberLiteral";
  value: string;
}

interface StringLiteral extends BaseNode {
  type: "StringLiteral";
  value: string;
}

type Node = Program | CallExpression | NumberLiteral | StringLiteral;

// #endregion

// #region Transformer & Traverserser

type VisitorFn<nodeType extends Node["type"]> = (
  node: NodeDiccionary[nodeType],
  parent: Node
) => void;

type Visitor = {
  [nodeType in Node["type"]]?: {
    enter?: VisitorFn<nodeType>;
    exit?: VisitorFn<nodeType>;
  };
};

interface NewProgram {
  type: "Program";
  body: NewNode[];
}

interface NewNumberLiteral {
  type: "NumberLiteral";
  value: string;
}

interface NewStringLiteral {
  type: "StringLiteral";
  value: string;
}

interface NewIdentifier {
  type: "Identifier";
  name: string;
}

interface NewCallExpression {
  type: "CallExpression";
  callee: NewIdentifier;
  arguments: [];
}

interface NewExpressionStatement {
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

// #endregion

// #region Utils

const WHITESPACE = /\s/;

function isWhitespace(character: string): boolean {
  return WHITESPACE.test(character);
}

const NUMBERS = /[0-9]/;

function isNumber(character: string): boolean {
  return NUMBERS.test(character);
}

// Matchea todo menos la comilla
const NOTQUOTE = /[^"]/;

const NAME = /[a-z]/i;

function isName(character: string): boolean {
  return NAME.test(character);
}

// #endregion

// #region Code

export function tokenizer(sourceCode: InputSourceCode): Token[] {
  /// Utils ///

  // TODO reusar?
  function next() {
    // Aca usamos el prefix en ves del posfix porque sino se lee primero la propiedad y despues se actualiza el valor del cursor
    return sourceCode[++cursor];
  }

  function getCompleteLiteral(regexp: RegExp, firstValue: string) {
    const values = [firstValue];

    let current = next();
    while (regexp.test(current)) {
      values.push(current);
      current = next();
    }

    return values.join("");
  }

  /// Code ///
  const tokens: Token[] = [];
  let cursor = 0;

  while (cursor < sourceCode.length) {
    let char = sourceCode[cursor];

    switch (true) {
      case isWhitespace(char):
        cursor++;
        break;

      case char === "(" || char === ")":
        // ts issue #46600
        tokens.push({ type: "paren", value: char as "(" });
        cursor++;
        break;

      case char === '"':
        // Nos salteamos la comilla que abre
        char = next();

        tokens.push({
          type: "string",
          value: getCompleteLiteral(NOTQUOTE, char),
        });

        // Nos salteamos la comilla que cierra
        cursor++;
        break;

      case isName(char):
        tokens.push({
          type: "name",
          value: getCompleteLiteral(NAME, char),
        });
        // Aca no hay ++ porque el getCompleteLiteral ya movio el carrete
        break;

      case isNumber(char):
        tokens.push({
          type: "number",
          value: getCompleteLiteral(NUMBERS, char),
        });
        // Aca no hay ++ porque el getCompleteLiteral ya movio el carrete
        break;

      default:
        throw new Error("Unknown token");
    }
  }

  return tokens;
}

export function parser(tokens: Token[]): Program {
  let cursor = 0;

  // TODO reusar?
  function next() {
    // Aca usamos el prefix en ves del posfix porque sino se lee primero la propiedad y despues se actualiza el valor del cursor
    return tokens[++cursor];
  }

  function walk(): Node {
    let token = tokens[cursor];

    /**
     * Tenemos 4 tipos de tokenes:
     * string & number: Conversion directa a un nodo literal
     * paren: Puede ser "(" o ")". Si abre, tenemos una expression, que inicia el recursive descent, este busca los parentesis que cierran para salir de la
     *        iteracion actual, por eso el que cierra no hay que handelearlo.
     * name: No tenemos que tener un caso para este porque se captura cuando se entra a un "(", ahi se saltea el proximo token, que es el name, y se empieza a
     *       descender.
     */

    switch (true) {
      case token.type === "number":
        cursor++;

        return {
          type: "NumberLiteral",
          value: token.value,
        } as NumberLiteral;

      case token.type === "string":
        cursor++;

        return {
          type: "StringLiteral",
          value: token.value,
        } as StringLiteral;

      case token.type === "paren" && token.value === "(":
        // Nos salteamos el parentesis y agarramos el proximo token, que siempre es el token name
        token = next();

        const node = {
          type: "CallExpression",
          name: token.value,
          params: [],
        } as CallExpression;

        token = next();

        // Iteramos mientras no encontremos un token parentesis o en caso de encontrar uno, que no sea uno que cierre
        while (token.type !== "paren" || token.value !== ")") {
          node.params.push(walk());
          token = tokens[cursor];
        }

        cursor++;

        return node;

      default:
        throw new TypeError(token.type);
    }
  }

  const ast = {
    type: "Program",
    body: [],
  } as Program;

  while (cursor < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

function traverser(ast: Program, visitor: Visitor) {
  function traverseArray(array: Node[], parent: Node) {
    array.forEach((child) => traverseNode(child, parent));
  }

  function traverseNode(node: Node, parent: Node) {
    const methods = visitor[node.type];

    if (methods?.enter) {
      // TODO, node never
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

// #endregion

export function codeGenerator(node: NewNode): string {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGenerator).join("\n");

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

    case "NumberLiteral":
      return node.value;

    case "StringLiteral":
      return `${node.value}`;

    default:
      throw new TypeError((node as any).type);
  }
}

export function compiler(sourceCode: InputSourceCode): OutputSourceCode {
  const tokens = tokenizer(sourceCode);
  const ast = parser(tokens);
  const newAst = transformer(ast);
  const output = codeGenerator(newAst);

  return output;
}

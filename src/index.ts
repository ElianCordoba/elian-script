import { codeGenerator } from "./codeGenerator";
import { parser } from "./parser";
import { tokenizer } from "./tokenizer";
import { transformer } from "./transformer";

import { InputSourceCode, OutputSourceCode } from "./types";

export function compile(sourceCode: InputSourceCode): OutputSourceCode {
  const tokens = tokenizer(sourceCode);
  const ast = parser(tokens);
  const newAst = transformer(ast);
  const output = codeGenerator(newAst);

  return output;
}

export { codeGenerator, parser, tokenizer, transformer };

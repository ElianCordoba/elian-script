const {
  compiler,
  tokenizer,
  parser,
  transformer,
  codeGenerator,
} = require("../dist");

const sourceCode = `
(add 1 (sus 2 2))
var a 1

var b    "hi"
`;

const res = compiler(sourceCode);
console.log(res);

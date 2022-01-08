// TODO: Implement variable replacement logic
export function getErrorMessage(error: string) {
  return error;
}

export enum LexicalError {
  "e0" = "Expected {0} but found {1}",
}

export function createCompilerError(error: LexicalError) {
  return new Error(error);
}

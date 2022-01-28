# Suported syntax

### Variables
```
var age 23
var name "Elian"
```

Compiles to
```
var age = 23;
var name = "Elian";
```

### Function calls
```
(add 1 2)
(subtract 5 (add 2 2))
```

Compiles to

```
add(1, 2)
subtract(5, add(2, 2))
```

## Roadmap
- [x] Migrate to typescript
  Basically done, just some type assertions that could be removed
- [] More language features
  - [] Variables
    - [x] Initial variable support
    - [] Expressions result as variable values. Ex: var result add(1, 2)
  - Function definition
- [] Better abstraction for tree transformation
- [] Use of streams for compilation
- [] Incremental updates
- [] Error recovery
- [] Some form of typechecking
- [] Different pragma output (Javascript)
- [] Tests

# Trivia
- First token gets the initial trivia
- A token owns all the trivia on the same line upto the next token
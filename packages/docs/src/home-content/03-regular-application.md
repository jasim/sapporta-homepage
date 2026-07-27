## Sapporta projects are regular applications

The Sapporta metadata is the only declarative part of a Sapporta application.

It is a reluctant decision.
[Descriptive declarativeness is magic](https://medium.com/@jasim_ab/declarative-programming-and-magic-part-i-885d21deaa79) -
it creates a conceptual gap between the static program and its dynamic process,
making it difficult to reason about the system clearly. And since
we're no longer writing code directly, we are constrained to the operations
permitted by it.

For everything else, Sapporta avoids being an opaque, fully declarative
framework. There is no inversion of control. Sapporta projects are regular
codebases that you fully
own. Sapporta tries to be a small toolkit with many composable helpers that
plugs into an otherwise conventional web application. 

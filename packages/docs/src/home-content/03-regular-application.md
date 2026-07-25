## A regular application you own

The Sapporta metadata is the only declarative part of a Sapporta application.

It is a reluctant decision -
[descriptive declarativeness is magic](https://medium.com/@jasim_ab/declarative-programming-and-magic-part-i-885d21deaa79);
it creates a conceptual gap between the static program and its dynamic process,
and constrains us to TK, because we're no longer writing direct code.

_I'm looking for ideas to whittle down this declarative surface; if you can
help, kindly [pen an email to me](mailto:jasim@protoship.io) post-haste._

For everything else, Sapporta avoids being an opaque, fully declarative
framework. There is no inversion of control. Sapporta projects are regular codebases that you fully
own. Sapporta tries to be a small toolkit with many composable helpers that
plugs into an otherwise conventional web application. 

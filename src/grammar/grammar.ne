@preprocessor typescript
@preprocessor module

@{%
import { Literal, MultiSignalLiteral, Conjunction, Disjunction, Negation } from "../classes/Clause.ts";
import { RuleOutput } from "../classes/Rule.ts";
import moo from "moo";

function getValue(x) {
    return x[0].value;
}

const lexer = moo.compile({
    indent: /^[ \t]+/,
    ws: { match: /[ \t]+/},
    newline: { match: /[\n]+/, lineBreaks: true },
    dqstring: {match: /"(?:\\["\\]|[^"\\])*"/, value: x => x.slice(1, -1)},
    comment: /#[^\n]*/,
    begin_fun: "@begin",
    end_fun: "@end",
    int: {match: /[+-]?[0-9]+/, value: x => parseInt(x)},
    dot: ".",
    colon: ":",
    bang: "!",
    slash: "/",
    comma: ",",
    dollar: "$",
    eq: "=",
    lb: "[",
    rb: "]",
    lp: "(",
    rp: ")",
    la: "{",
    ra: "}",
    at: "@",
    identifier: /[a-zA-Z_][a-zA-Z_0-9]*/,
});
lexer.next = (next => () => {
    let tok;
    do {
        tok = next.call(lexer);
    } while(tok && ["ws", "comment"].includes(tok.type));
    return tok;
})(lexer.next);

%}
@builtin "string.ne"
@lexer lexer

LINES -> LINE
LINES -> LINES %newline LINE {% ([lines, , line]) => [...lines, line] %}

LINE -> EMPTY_LINE
LINE -> RULE_LINE {% id %}
LINE -> MULTISIGNAL_LINE {% id %}
LINE -> FUNCTION_BEGIN_LINE {% id %}
LINE -> FUNCTION_END_LINE {% id %}

EMPTY_LINE -> INDENT {% () => ({ type: "empty_line" }) %}

RULE_LINE -> INDENT CLAUSE ":" {% ([indent, clause, ]) => ({
    type: "rule_line",
    indent: indent,
    condition: clause,
    outputs: undefined,
}) %}
RULE_LINE -> INDENT CLAUSE ":" OUTPUTS_LIST {% ([indent, clause, , outputs]) => ({
    type: "rule_line",
    indent: indent,
    condition: clause,
    outputs: outputs,
}) %}
RULE_LINE -> INDENT OUTPUTS_LIST {% ([indent, outputs, ]) => ({
    type: "rule_line",
    indent: indent,
    condition: undefined,
    outputs: outputs,
}) %}
INDENT -> %indent:? {% ([indent]) => {
    if (indent) {
        return indent.value.length;
    }
    return 0;
} %}

CLAUSE -> LITERAL {% id %}
CLAUSE -> MULTI_LITERAL {% id %}
CLAUSE -> CONJUNCTION {% id %}
CLAUSE -> DISJUNCTION {% id %}
CLAUSE -> NEGATION {% id %}
CLAUSES_LIST -> null {% () => [] %} | CLAUSE | CLAUSES_LIST CLAUSE {% ([list, c]) => [...list, c] %}
CONJUNCTION -> "(" CLAUSES_LIST ")" {% ([ , list, ]) => new Conjunction(list) %}
DISJUNCTION -> "[" CLAUSES_LIST "]" {% ([ , list, ]) => new Disjunction(list) %}
NEGATION -> "!" CLAUSE {%
([_, c]) => {
    if (c instanceof Literal || c instanceof MultiSignalLiteral) {
        return c.negated();
    } else if (c instanceof Negation) {
        return c.subclause;
    } else {
        return new Negation(c);
    }
}
%}
SIGNAL_NAME -> IDENTIFIER {% id %}
LITERAL -> INT "." SIGNAL_NAME {% ([pos, , signalName]) => new Literal(Symbol.for(signalName), pos) %}
LITERAL -> SIGNAL_NAME {% ([signalName]) => new Literal(Symbol.for(signalName)) %}
MULTI_LITERAL -> "$" SIGNAL_NAME {% ([ , signalName]) => new MultiSignalLiteral(Symbol.for("$" + signalName)) %}
MULTI_LITERAL -> INT ("." "$") SIGNAL_NAME {% ([pos, , signalName]) => new MultiSignalLiteral(Symbol.for("$" + signalName), pos) %}

OUTPUT -> SIGNAL_NAME {% ([signalName]) => new RuleOutput(0, Symbol.for(signalName)) %}
OUTPUT -> INT "." SIGNAL_NAME {% ([pos, , signalName]) => new RuleOutput(pos, Symbol.for(signalName)) %}
OUTPUT -> "/" INT "." SIGNAL_NAME {% ([ , step, , signalName]) => new RuleOutput(0, Symbol.for(signalName, step)) %}
OUTPUT -> INT "/" INT "." SIGNAL_NAME {% ([pos, , step, , signalName]) => new RuleOutput(pos, Symbol.for(signalName), step) %}
OUTPUTS_LIST -> OUTPUT | OUTPUTS_LIST OUTPUT {% ([list, o]) => [...list, o] %}

MULTISIGNAL_LINE -> INDENT MULTI_SIGNAL_NAME "=" SIGNAL_VALUES {% ([indent, multiSignalName, , values]) => ({
    type: "multi_signal",
    indent: indent,
    signal: Symbol.for(multiSignalName),
    values: values,
}) %}
MULTI_SIGNAL_NAME -> "$" IDENTIFIER {% ([ , i]) => "$" + i %}
SIGNAL_VALUES -> SIGNAL | SIGNAL_VALUES SIGNAL {% ([list, s]) => [...list, s] %}
SIGNAL -> IDENTIFIER {% ([signalName]) => Symbol.for(signalName) %}

FUNCTION_BEGIN_LINE -> INDENT "@begin" FUNCTION_NAME "(" FUNC_PARAMETERS_LIST ")" {%
([indent, , functionName, , params]) => (
    {
        type: "begin_function",
        indent: indent,
        function_name: functionName,
        parameters: params,
    }
) %}
FUNCTION_NAME -> IDENTIFIER {% id %}
FUNC_PARAMETERS_LIST -> null
FUNC_PARAMETERS_LIST -> FUNC_PARAMETER
FUNC_PARAMETERS_LIST -> FUNC_PARAMETERS_LIST "," FUNC_PARAMETER {% ([list, , p]) => [...list, p] %}
FUNC_PARAMETER -> STRING {% id %}
FUNC_PARAMETER -> INT {% id %}
FUNCTION_END_LINE -> INDENT "@end" {% ([indent, ]) => ({
    type: "end_function",
    indent: indent,
}) %}

IDENTIFIER -> %identifier {% getValue %}
INT -> %int {% getValue %}
STRING -> %dqstring {% getValue %}
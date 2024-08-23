@preprocessor typescript
@preprocessor module

@{%
import { Literal, MultiSignalLiteral, Conjunction, Disjunction, Negation } from "../classes/Clause.ts";
import { RuleOutput } from "../classes/Rule.ts";
import moo from "moo-ignore";
import {  } from "nearley";

function getValue(x) {
    return x[0].value;
}

export interface Line {
    type: string;
}

export interface EmptyLine extends Line {
    type: "empty_line";
}

export interface BeginFunctionLine extends Line {
    type: "begin_function";
    function_name: string;
    parameters: string[];
}

export interface EndFunctionLine extends Line {
    type: "end_function";
}

export interface RuleLine extends Line {
    type: "rule_line";
    indent: number;
    condition: Clause | undefined;
    outputs: RuleOutput[] | undefined;
}

export interface MultiSignalLine extends Line {
    type: "multi_signal";
    signal: Signal;
    values: Signal[];
}

export type ParsedLine =
    | RuleLine
    | MultiSignalLine
    | BeginFunctionLine
    | EndFunctionLine
    | EmptyLine;

const tokens = {
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
};
const lexer = moo.makeLexer(tokens);
lexer.ignore("ws", "comment");


%}
@builtin "string.ne"
@lexer lexer

LINES -> LINE
LINES -> LINES %newline LINE {% ([lines, _, line]) => [...lines, line] %}

LINE -> EMPTY_LINE
LINE -> RULE_LINE {% id %}
LINE -> MULTISIGNAL_LINE {% id %}
LINE -> FUNCTION_BEGIN_LINE {% id %}
LINE -> FUNCTION_END_LINE {% id %}

EMPTY_LINE -> INDENT {% () => ({ type: "empty_line" }) %}

RULE_LINE -> INDENT CLAUSE ":" {% ([indent, clause, _]) => ({
    type: "rule_line",
    indent: indent,
    condition: clause,
    outputs: undefined,
}) %}
RULE_LINE -> INDENT CLAUSE ":" OUTPUTS_LIST {% ([indent, clause, _, outputs]) => ({
    type: "rule_line",
    indent: indent,
    condition: clause,
    outputs: outputs,
}) %}
RULE_LINE -> INDENT OUTPUTS_LIST {% ([indent, outputs, _]) => ({
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
CLAUSES_LIST -> CLAUSE | CLAUSES_LIST CLAUSE {% ([list, c]) => [...list, c] %}
CONJUNCTION -> "(" CLAUSES_LIST ")" {% ([_1, list, _2]) => new Conjunction(list) %}
DISJUNCTION -> "[" CLAUSES_LIST "]" {% ([_1, list, _2]) => new Disjunction(list) %}
NEGATION -> "!" CLAUSE {%
([_, c]) => {
    if (c instanceof Literal || c instanceof MultiSignalLiteral) {
        return c.negate();
    } else if (c instanceof Negation) {
        return c.subclause;
    } else {
        return new Negation(c);
    }
}
%}
SIGNAL_NAME -> IDENTIFIER {% id %}
LITERAL -> INT "." SIGNAL_NAME {% ([pos, _, signalName]) => new Literal(Symbol.for(signalName), pos) %}
LITERAL -> SIGNAL_NAME {% ([signalName]) => new Literal(Symbol.for(signalName)) %}
MULTI_LITERAL -> "$" SIGNAL_NAME {% ([_, signalName]) => new MultiSignalLiteral(Symbol.for("$" + signalName)) %}
MULTI_LITERAL -> INT ("." "$") SIGNAL_NAME {% ([pos, _, signalName]) => new MultiSignalLiteral(Symbol.for("$" + signalName), pos) %}

OUTPUT -> SIGNAL_NAME {% ([signalName]) => new RuleOutput(0, Symbol.for(signalName)) %}
OUTPUT -> INT "." SIGNAL_NAME {% ([pos, _, signalName]) => new RuleOutput(pos, Symbol.for(signalName)) %}
OUTPUT -> INT "/" INT "." SIGNAL_NAME {% ([pos, _1, step, _2, signalName]) => new RuleOutput(pos, Symbol.for(signalName), step) %}
OUTPUTS_LIST -> OUTPUT | OUTPUTS_LIST OUTPUT {% ([list, o]) => [...list, o] %}

MULTISIGNAL_LINE -> INDENT MULTI_SIGNAL_NAME "=" SIGNAL_VALUES {% ([_1, multiSignalName, _2, values]) => ({
    type: "multi_signal",
    signal: Symbol.for(multiSignalName),
    values: values,
}) %}
MULTI_SIGNAL_NAME -> "$" IDENTIFIER {% ([_, i]) => "$" + i %}
SIGNAL_VALUES -> SIGNAL | SIGNAL_VALUES SIGNAL {% ([list, s]) => [...list, s] %}
SIGNAL -> IDENTIFIER {% ([signalName]) => Symbol.for(signalName) %}

FUNCTION_BEGIN_LINE -> (INDENT "@begin") FUNCTION_NAME "(" FUNC_PARAMETERS_LIST ")" {%
([_, functionName, _1, params]) => (
    {
        type: "begin_function",
        function_name: functionName,
        parameters: params,
    }
) %}
FUNCTION_NAME -> IDENTIFIER {% id %}
FUNC_PARAMETERS_LIST -> null
FUNC_PARAMETERS_LIST -> FUNC_PARAMETER
FUNC_PARAMETERS_LIST -> FUNC_PARAMETERS_LIST "," FUNC_PARAMETER {% ([list, _, p]) => [...list, p] %}
FUNC_PARAMETER -> STRING {% id %}
FUNC_PARAMETER -> INT {% id %}
FUNCTION_END_LINE -> (INDENT "@end") {% (_) => ({
    type: "end_function",
}) %}

IDENTIFIER -> %identifier {% getValue %}
INT -> %int {% getValue %}
STRING -> %dqstring {% getValue %}
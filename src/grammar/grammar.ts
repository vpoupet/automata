// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }

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


let Lexer = lexer;
let ParserRules = [
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", "dstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "sqstring$ebnf$1", "symbols": []},
    {"name": "sqstring$ebnf$1", "symbols": ["sqstring$ebnf$1", "sstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "sqstring", "symbols": [{"literal":"'"}, "sqstring$ebnf$1", {"literal":"'"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "btstring$ebnf$1", "symbols": []},
    {"name": "btstring$ebnf$1", "symbols": ["btstring$ebnf$1", /[^`]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "btstring", "symbols": [{"literal":"`"}, "btstring$ebnf$1", {"literal":"`"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "dstrchar", "symbols": [/[^\\"\n]/], "postprocess": id},
    {"name": "dstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": 
        function(d) {
            return JSON.parse("\""+d.join("")+"\"");
        }
        },
    {"name": "sstrchar", "symbols": [/[^\\'\n]/], "postprocess": id},
    {"name": "sstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": function(d) { return JSON.parse("\""+d.join("")+"\""); }},
    {"name": "sstrchar$string$1", "symbols": [{"literal":"\\"}, {"literal":"'"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "sstrchar", "symbols": ["sstrchar$string$1"], "postprocess": function(d) {return "'"; }},
    {"name": "strescape", "symbols": [/["\\/bfnrt]/], "postprocess": id},
    {"name": "strescape", "symbols": [{"literal":"u"}, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/], "postprocess": 
        function(d) {
            return d.join("");
        }
        },
    {"name": "LINES", "symbols": ["LINE"]},
    {"name": "LINES", "symbols": ["LINES", (lexer.has("newline") ? {type: "newline"} : newline), "LINE"], "postprocess": ([lines, _, line]) => [...lines, line]},
    {"name": "LINE", "symbols": ["EMPTY_LINE"]},
    {"name": "LINE", "symbols": ["RULE_LINE"], "postprocess": id},
    {"name": "LINE", "symbols": ["MULTISIGNAL_LINE"], "postprocess": id},
    {"name": "LINE", "symbols": ["FUNCTION_BEGIN_LINE"], "postprocess": id},
    {"name": "LINE", "symbols": ["FUNCTION_END_LINE"], "postprocess": id},
    {"name": "EMPTY_LINE", "symbols": ["INDENT"], "postprocess": () => ({ type: "empty_line" })},
    {"name": "RULE_LINE", "symbols": ["INDENT", "CLAUSE", {"literal":":"}], "postprocess":  ([indent, clause, _]) => ({
            type: "rule_line",
            indent: indent,
            condition: clause,
            outputs: undefined,
        }) },
    {"name": "RULE_LINE", "symbols": ["INDENT", "CLAUSE", {"literal":":"}, "OUTPUTS_LIST"], "postprocess":  ([indent, clause, _, outputs]) => ({
            type: "rule_line",
            indent: indent,
            condition: clause,
            outputs: outputs,
        }) },
    {"name": "RULE_LINE", "symbols": ["INDENT", "OUTPUTS_LIST"], "postprocess":  ([indent, outputs, _]) => ({
            type: "rule_line",
            indent: indent,
            condition: undefined,
            outputs: outputs,
        }) },
    {"name": "INDENT$ebnf$1", "symbols": [(lexer.has("indent") ? {type: "indent"} : indent)], "postprocess": id},
    {"name": "INDENT$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "INDENT", "symbols": ["INDENT$ebnf$1"], "postprocess":  ([indent]) => {
            if (indent) {
                return indent.value.length;
            }
            return 0;
        } },
    {"name": "CLAUSE", "symbols": ["LITERAL"], "postprocess": id},
    {"name": "CLAUSE", "symbols": ["MULTI_LITERAL"], "postprocess": id},
    {"name": "CLAUSE", "symbols": ["CONJUNCTION"], "postprocess": id},
    {"name": "CLAUSE", "symbols": ["DISJUNCTION"], "postprocess": id},
    {"name": "CLAUSE", "symbols": ["NEGATION"], "postprocess": id},
    {"name": "CLAUSES_LIST", "symbols": ["CLAUSE"]},
    {"name": "CLAUSES_LIST", "symbols": ["CLAUSES_LIST", "CLAUSE"], "postprocess": ([list, c]) => [...list, c]},
    {"name": "CONJUNCTION", "symbols": [{"literal":"("}, "CLAUSES_LIST", {"literal":")"}], "postprocess": ([_1, list, _2]) => new Conjunction(list)},
    {"name": "DISJUNCTION", "symbols": [{"literal":"["}, "CLAUSES_LIST", {"literal":"]"}], "postprocess": ([_1, list, _2]) => new Disjunction(list)},
    {"name": "NEGATION", "symbols": [{"literal":"!"}, "CLAUSE"], "postprocess": 
        ([_, c]) => {
            if (c instanceof Literal || c instanceof MultiSignalLiteral) {
                return c.negate();
            } else if (c instanceof Negation) {
                return c.subclause;
            } else {
                return new Negation(c);
            }
        }
        },
    {"name": "SIGNAL_NAME", "symbols": ["IDENTIFIER"], "postprocess": id},
    {"name": "LITERAL", "symbols": ["INT", {"literal":"."}, "SIGNAL_NAME"], "postprocess": ([pos, _, signalName]) => new Literal(Symbol.for(signalName), pos)},
    {"name": "LITERAL", "symbols": ["SIGNAL_NAME"], "postprocess": ([signalName]) => new Literal(Symbol.for(signalName))},
    {"name": "MULTI_LITERAL", "symbols": [{"literal":"$"}, "SIGNAL_NAME"], "postprocess": ([_, signalName]) => new MultiSignalLiteral(Symbol.for("$" + signalName))},
    {"name": "MULTI_LITERAL$subexpression$1", "symbols": [{"literal":"."}, {"literal":"$"}]},
    {"name": "MULTI_LITERAL", "symbols": ["INT", "MULTI_LITERAL$subexpression$1", "SIGNAL_NAME"], "postprocess": ([pos, _, signalName]) => new MultiSignalLiteral(Symbol.for("$" + signalName), pos)},
    {"name": "OUTPUT", "symbols": ["SIGNAL_NAME"], "postprocess": ([signalName]) => new RuleOutput(0, Symbol.for(signalName))},
    {"name": "OUTPUT", "symbols": ["INT", {"literal":"."}, "SIGNAL_NAME"], "postprocess": ([pos, _, signalName]) => new RuleOutput(pos, Symbol.for(signalName))},
    {"name": "OUTPUT", "symbols": ["INT", {"literal":"/"}, "INT", {"literal":"."}, "SIGNAL_NAME"], "postprocess": ([pos, _1, step, _2, signalName]) => new RuleOutput(pos, Symbol.for(signalName), step)},
    {"name": "OUTPUTS_LIST", "symbols": ["OUTPUT"]},
    {"name": "OUTPUTS_LIST", "symbols": ["OUTPUTS_LIST", "OUTPUT"], "postprocess": ([list, o]) => [...list, o]},
    {"name": "MULTISIGNAL_LINE", "symbols": ["INDENT", "MULTI_SIGNAL_NAME", {"literal":"="}, "SIGNAL_VALUES"], "postprocess":  ([_1, multiSignalName, _2, values]) => ({
            type: "multi_signal",
            signal: Symbol.for(multiSignalName),
            values: values,
        }) },
    {"name": "MULTI_SIGNAL_NAME", "symbols": [{"literal":"$"}, "IDENTIFIER"], "postprocess": ([_, i]) => "$" + i},
    {"name": "SIGNAL_VALUES", "symbols": ["SIGNAL"]},
    {"name": "SIGNAL_VALUES", "symbols": ["SIGNAL_VALUES", "SIGNAL"], "postprocess": ([list, s]) => [...list, s]},
    {"name": "SIGNAL", "symbols": ["IDENTIFIER"], "postprocess": ([signalName]) => Symbol.for(signalName)},
    {"name": "FUNCTION_BEGIN_LINE$subexpression$1", "symbols": ["INDENT", {"literal":"@begin"}]},
    {"name": "FUNCTION_BEGIN_LINE", "symbols": ["FUNCTION_BEGIN_LINE$subexpression$1", "FUNCTION_NAME", {"literal":"("}, "FUNC_PARAMETERS_LIST", {"literal":")"}], "postprocess": 
        ([_, functionName, _1, params]) => (
            {
                type: "begin_function",
                function_name: functionName,
                parameters: params,
            }
        ) },
    {"name": "FUNCTION_NAME", "symbols": ["IDENTIFIER"], "postprocess": id},
    {"name": "FUNC_PARAMETERS_LIST", "symbols": []},
    {"name": "FUNC_PARAMETERS_LIST", "symbols": ["FUNC_PARAMETER"]},
    {"name": "FUNC_PARAMETERS_LIST", "symbols": ["FUNC_PARAMETERS_LIST", {"literal":","}, "FUNC_PARAMETER"], "postprocess": ([list, _, p]) => [...list, p]},
    {"name": "FUNC_PARAMETER", "symbols": ["STRING"], "postprocess": id},
    {"name": "FUNC_PARAMETER", "symbols": ["INT"], "postprocess": id},
    {"name": "FUNCTION_END_LINE$subexpression$1", "symbols": ["INDENT", {"literal":"@end"}]},
    {"name": "FUNCTION_END_LINE", "symbols": ["FUNCTION_END_LINE$subexpression$1"], "postprocess":  (_) => ({
            type: "end_function",
        }) },
    {"name": "IDENTIFIER", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": getValue},
    {"name": "INT", "symbols": [(lexer.has("int") ? {type: "int"} : int)], "postprocess": getValue},
    {"name": "STRING", "symbols": [(lexer.has("dqstring") ? {type: "dqstring"} : dqstring)], "postprocess": getValue}
];
let ParserStart = "LINES";
export default { Lexer, ParserRules, ParserStart };

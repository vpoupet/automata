import { Signal } from "../types";
import { EvalContext } from "./Clause";
import { Rule, RuleOutput } from "./Rule";

type TransformationParameter = string | number;
type Transformation = (
    rules: Rule[],
    context: EvalContext,
    parameters: TransformationParameter[]
) => Rule[];

export function mirror(
    rule: Rule,
    context: EvalContext,
    parameters: TransformationParameter[]
): Rule {
    const tag1 = parameters[0].toString();
    const tag2 = parameters[1].toString();

    function switchTags(signal: Signal) {
        let signalName = signal.description;
        if (
            signalName === undefined ||
            tag1 === undefined ||
            tag2 === undefined
        ) {
            return signal;
        }

        if (signalName.includes(tag1)) {
            signalName = signalName.replace(tag1, tag2);
            return Symbol.for(signalName);
        } else if (signalName.includes(tag2)) {
            signalName = signalName.replace(tag2, tag1);
            return Symbol.for(signalName);
        }
        return signal;
    }

    return new Rule(
        rule.condition.transformLiterals(
            {
                signal: (s) => switchTags(s),
                position: (p) => -p,
            },
            context
        ),
        rule.outputs.map(
            (output) =>
                new RuleOutput(
                    -output.neighbor,
                    switchTags(output.signal),
                    output.futureStep
                )
        )
    );
}

export const transformations: Map<string, Transformation> = new Map([
    [
        "mirror",
        (
            rules: Rule[],
            context: EvalContext,
            parameters: TransformationParameter[]
        ) => [...rules, ...rules.map((r) => mirror(r, context, parameters))],
    ],
]);

import { Signal } from "../types";
import { EvalContext } from "./Clause";
import { Rule, RuleOutput } from "./Rule";

type TransformationParameter = string | number;
type TransformationOutput = {
    rules: Rule[];
    context: EvalContext;
};
type Transformation = (
    rules: Rule[],
    context: EvalContext,
    parameters: TransformationParameter[]
) => TransformationOutput;

export function mirror(
    rules: Rule[],
    context: EvalContext,
    parameters: TransformationParameter[]
): TransformationOutput {
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

    // make mirrored rules
    const newRules = rules.map(
        (rule) =>
            new Rule(
                rule.condition.transformLiterals(
                    {
                        signal: switchTags,
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
            )
    );

    // add new multi-signals
    const newMultiSignals = new Map<Signal, Set<Signal>>();
    for (const [signal, subSignals] of context.multiSignals.entries()) {
        const newSignal = switchTags(signal);
        if (newSignal !== signal) {
            const newSubSignals = new Set(
                Array.from(subSignals).map(switchTags)
            );
            newMultiSignals.set(newSignal, newSubSignals);
        }
    }

    return {
        rules: [...rules, ...newRules],
        context: new EvalContext({
            ...context.multiSignals,
            ...newMultiSignals,
        }),
    };
}

function dummy(
    rules: Rule[],
    context: EvalContext,
    _parameters: TransformationParameter[]
): TransformationOutput {
    return {
        rules: rules,
        context: context,
    };
}

export const transformations: Map<string, Transformation> = new Map([
    ["mirror", mirror],
    ["dummy", dummy],
]);

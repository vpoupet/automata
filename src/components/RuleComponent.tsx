import { useState } from "react";
import { MdExpandCircleDown, MdExpandLess } from "react-icons/md";
import Clause, {
    Conjunction,
    Disjunction,
    Literal,
    Negation,
} from "../classes/Clause.ts";
import Rule, { ConjunctionRule, RuleOutput } from "../classes/Rule";
import { Signal } from "../types";
import RuleGridComponent from "./RuleGridComponent.tsx";
import SignalName from "./SignalName";
import Cell, { InputCell } from "../classes/Cell.ts";

interface RuleComponentProps {
    rule: Rule;
    colorMap: Map<Signal, string>;
}

export default function RuleComponent(props: RuleComponentProps) {
    const { rule, colorMap } = props;
    const [isOpen, setIsOpen] = useState(false);

    const conditionAsDNF = rule.condition.toDNF();
    const conjuctionRules: ConjunctionRule[] = conditionAsDNF.subclauses.map(
        (condition) => {
            return new Rule(condition, rule.outputs) as ConjunctionRule;
        }
    );

    return (
        <div className="bg-white shadow-md p-2">
            <div className="flex flex-row" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? (
                    <span className="p-1">
                        <MdExpandLess />
                    </span>
                ) : (
                    <span className="p-1">
                        <MdExpandCircleDown />
                    </span>
                )}
                <span className="font-mono">
                    <span className="font-bold text-gray-400">
                        {rule.condition.toString()}
                    </span>
                    &nbsp;→&nbsp;
                    <span className="font-bold text-gray-800">
                        {rule.outputs.map((o) => o.toString()).join(" ")}
                    </span>
                </span>
            </div>
            {isOpen && (
                <div className="flex flex-row">
                    {conjuctionRules.map((rule) => {
                        // TODO get radius and futureSteps from settings
                        const origin = 2;
                        const inputCells = Array.from(
                            { length: 5 },
                            () => new InputCell()
                        );
                        for (const literal of rule.condition.subclauses) {
                            // ignore literals that are outside the grid
                            // TODO: find better solution ?
                            if (
                                literal.position < -origin ||
                                literal.position >= 5 - origin
                            ) {
                                continue;
                            }

                            if (literal.sign) {
                                inputCells[
                                    literal.position + origin
                                ].signals.add(literal.signal);
                            } else {
                                inputCells[
                                    literal.position + origin
                                ].negatedSignals.add(literal.signal);
                            }
                        }
                        const outputCells = Array.from({ length: 3 }, () =>
                            Array.from({ length: 5 }, () => new Cell())
                        );
                        for (const output of rule.outputs) {
                            // ignore outputs that are outside the grid
                            // TODO: find better solution ?
                            if (
                                output.position < -origin ||
                                output.position >= 5 - origin ||
                                output.futureStep - 1 < 0 ||
                                output.futureStep - 1 >= 3
                            ) {
                                continue;
                            }

                            outputCells[output.futureStep - 1][
                                output.position + origin
                            ].signals.add(output.signal);
                        }

                        return (
                            <RuleGridComponent
                                key={rule.toString()}
                                inputCells={inputCells}
                                outputCells={outputCells}
                                colorMap={colorMap}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

interface ClauseComponentProps {
    clause: Clause;
    colorMap: Map<Signal, string>;
}

function ClauseComponent(props: ClauseComponentProps) {
    const { clause, colorMap } = props;

    if (clause instanceof Literal) {
        const signString = clause.sign ? "" : "¬";
        const positionString =
            clause.position !== 0 ? `${clause.position}.` : "";
        return (
            <span className="mx-1">
                {positionString}
                {signString}
                <SignalName
                    signal={clause.signal}
                    colorMap={colorMap}
                    className="text-base font-normal relative -top-1"
                />
            </span>
        );
    } else if (clause instanceof Negation) {
        return (
            <span className="mx-1">
                !
                <ClauseComponent
                    clause={clause.subclause}
                    colorMap={colorMap}
                />
            </span>
        );
    } else if (clause instanceof Conjunction) {
        return (
            <span className="mx-1">
                (
                {clause.subclauses.map((c, index) => (
                    <>
                        {index > 0 ? "∧" : ""}
                        <ClauseComponent
                            key={index}
                            clause={c}
                            colorMap={colorMap}
                        />
                    </>
                ))}
                )
            </span>
        );
    } else if (clause instanceof Disjunction) {
        return (
            <span className="mx-1">
                [
                {clause.subclauses.map((c, index) => (
                    <>
                        {index > 0 ? "∨" : ""}
                        <ClauseComponent
                            key={index}
                            clause={c}
                            colorMap={colorMap}
                        />
                    </>
                ))}
                ]
            </span>
        );
    } else {
        return <div>Unknown clause type</div>;
    }
}

interface RuleOutputComponentProps {
    output: RuleOutput;
    colorMap: Map<Signal, string>;
}

function RuleOutputComponent(props: RuleOutputComponentProps) {
    const { output, colorMap } = props;
    const positionString = output.position !== 0 ? `${output.position}` : "";
    const futureStepString =
        output.futureStep !== 1 ? `/${output.futureStep}` : "";
    const dotString =
        positionString !== "" || futureStepString !== "" ? "." : "";

    return (
        <span className="mx-1">
            <span className="font-mono font-bol">
                {positionString}
                {futureStepString}
                {dotString}
            </span>
            <SignalName
                signal={output.signal}
                colorMap={colorMap}
                className="text-base font-normal relative -top-1"
            />
        </span>
    );
}

import { useContext, useState } from "react";
import { MdExpandCircleDown, MdExpandLess } from "react-icons/md";
import Cell, { InputCell } from "../classes/Cell.ts";
import Rule, { ConjunctionRule } from "../classes/Rule";
import { SettingsContext } from "../contexts/SettingsContext.ts";
import { Signal } from "../types";
import RuleGridComponent from "./RuleGridComponent.tsx";

interface RuleComponentProps {
    rule: Rule;
    colorMap: Map<Signal, string>;
}

export default function RuleComponent(props: RuleComponentProps) {
    const { rule, colorMap } = props;
    const [isOpen, setIsOpen] = useState(false);
    const settings = useContext(SettingsContext);

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
                        const inputCells = Array.from(
                            { length: 2 * settings.gridRadius + 1 },
                            () => new InputCell()
                        );
                        for (const literal of rule.condition.subclauses) {
                            // ignore literals that are outside the grid
                            // TODO: find better solution ?
                            if (
                                literal.position < -origin ||
                                literal.position > settings.gridRadius
                            ) {
                                continue;
                            }

                            if (literal.sign) {
                                inputCells[
                                    literal.position + settings.gridRadius
                                ].signals.add(literal.signal);
                            } else {
                                inputCells[
                                    literal.position + settings.gridRadius
                                ].negatedSignals.add(literal.signal);
                            }
                        }
                        const outputCells = Array.from({ length: settings.gridNbFutureSteps }, () =>
                            Array.from({ length: 2 * settings.gridRadius + 1 }, () => new Cell())
                        );
                        for (const output of rule.outputs) {
                            // ignore outputs that are outside the grid
                            // TODO: find better solution ?
                            if (
                                output.position < -settings.gridRadius ||
                                output.position > settings.gridRadius ||
                                output.futureStep < 1 ||
                                output.futureStep > settings.gridNbFutureSteps
                            ) {
                                continue;
                            }

                            outputCells[output.futureStep - 1][
                                output.position + settings.gridRadius
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

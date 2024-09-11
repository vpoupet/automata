import { useMemo, useState } from "react";
import { FaCircleDown, FaCircleUp } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import Cell, { InputCell } from "../classes/Cell.ts";
import { Disjunction, simplifyDNF } from "../classes/Clause.ts";
import Rule, { ConjunctionRule } from "../classes/Rule";
import { SettingsInterface, Signal } from "../types";
import Button from "./Common/Button.tsx";
import Frame from "./Common/Frame.tsx";
import RuleGridComponent from "./RuleGridComponent.tsx";
import RuleGrid from "../classes/RuleGrid.ts";

interface RuleComponentProps {
    rule: Rule;
    settings: SettingsInterface;
    deleteRule: (rule: Rule) => void;
    replaceRule: (oldRule: Rule, newRules: Rule[]) => void;
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    colorMap: Map<Signal, string>;
}

export default function RuleComponent(props: RuleComponentProps) {
    const { rule, settings, deleteRule, replaceRule, grid, setGrid, colorMap } =
        props;
    const [isOpen, setIsOpen] = useState(false);

    const conditionAsDNF = useMemo(
        () => simplifyDNF(rule.condition.toDNF()),
        [rule]
    );
    const conjuctionRules: ConjunctionRule[] = useMemo(
        () =>
            conditionAsDNF.subclauses.map((condition) => {
                return new Rule(condition, rule.outputs) as ConjunctionRule;
            }),
        [conditionAsDNF, rule]
    );

    function deleteConjunctionRule(conjRule: Rule) {
        const newCondition = new Disjunction(
            conditionAsDNF.subclauses.filter((c) => c !== conjRule.condition)
        ).simplified();
        replaceRule(rule, [new Rule(newCondition, conjRule.outputs)]);
    }

    function replaceConjunctionRule(conjRule: Rule) {
        const newRule = grid.makeRule();
        
        if (conjRule.outputs.toString() === newRule.outputs.toString()) {
            // compatible outputs
            const newDNFCondition = new Disjunction(
                conditionAsDNF.subclauses.map((c) => {
                    if (c === conjRule.condition) {
                        return newRule.condition;
                    } else {
                        return c;
                    }
                })
            ).simplified();
            replaceRule(rule, [new Rule(newDNFCondition, rule.outputs)]);
        } else {
            // incompatible outputs, replace with 2 rules
            const newDNFCondition = new Disjunction(
                conditionAsDNF.subclauses.filter((c) => c !== conjRule.condition)
            ).simplified();
            replaceRule(rule, [
                new Rule(newDNFCondition, rule.outputs),
                newRule,
            ]);
        }
    }

    return (
        <Frame>
            <div
                className="flex flex-row cursor-pointer justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex flex-row">
                    {isOpen ? (
                        <span className="p-1 mr-2">
                            <FaCircleUp />
                        </span>
                    ) : (
                        <span className="p-1 mr-2">
                            <FaCircleDown />
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
                </span>
                <Button
                    className="relative -mt-1 "
                    variant="secondary"
                    onClick={() => deleteRule(rule)}
                >
                    <MdDelete />
                </Button>
            </div>
            {isOpen && (
                <div className="flex flex-row">
                    {conjuctionRules.map((conjRule) => {
                        const inputCells = Array.from(
                            { length: 2 * settings.gridRadius + 1 },
                            () => new InputCell()
                        );
                        for (const literal of conjRule.condition.subclauses) {
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
                        const outputCells = Array.from(
                            { length: settings.gridNbFutureSteps },
                            () =>
                                Array.from(
                                    { length: 2 * settings.gridRadius + 1 },
                                    () => new Cell()
                                )
                        );
                        for (const output of conjRule.outputs) {
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
                                key={conjRule.toString()}
                                inputCells={inputCells}
                                outputCells={outputCells}
                                setGrid={setGrid}
                                onDelete={() => deleteConjunctionRule(conjRule)}
                                onReplace={() => replaceConjunctionRule(conjRule)}
                                colorMap={colorMap}
                            />
                        );
                    })}
                </div>
            )}
        </Frame>
    );
}

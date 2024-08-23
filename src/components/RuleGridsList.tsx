import { useRef } from "react";
import { EvalContext } from "../classes/Clause.ts";
import { ConjunctionRule, Rule } from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import { Signal } from "../types.ts";
import { Button } from "./Button.tsx";
import { Heading } from "./Heading.tsx";
import RuleGridComponent from "./RuleGridComponent.tsx";

type RuleGridsListProps = {
    grid: RuleGrid;
    setGrid: React.Dispatch<React.SetStateAction<RuleGrid>>;
    rulesGrids: RuleGrid[];
    setRulesGrids: (rulesGrids: RuleGrid[]) => void;
    rules: Rule[];
    addRules: (rules: Rule[]) => void;
    clearRules: () => void;
    signalsList: Signal[];
    setSignalsList: (signalsList: Signal[]) => void;
    context: EvalContext;
};

export default function RuleGridsList({
    grid,
    setGrid,
    rulesGrids,
    setRulesGrids,
    rules,
    addRules,
    clearRules,
    signalsList,
    setSignalsList,
    context,
}: RuleGridsListProps): JSX.Element {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    function handleAddRule() {
        if (textAreaRef.current) {
            const ruleText = textAreaRef.current.value;
            addRuleFromString(ruleText);
        }
    }

    function updateGrilleFromRule(ruleToCopy: RuleGrid) {
        setGrid(ruleToCopy.clone());
    }

    function onLoadRule(index: number) {
        const configuration = rulesGrids[index];
        updateGrilleFromRule(configuration);
    }

    function onDeleteRule(index: number) {
        const newConfigurations = rulesGrids.filter((_, i) => i !== index);
        setRulesGrids(newConfigurations);
    }

    function onUpdateRule(index: number) {
        const newConfigurations = [...rulesGrids];
        newConfigurations[index] = grid.clone();
        setGrid(RuleGrid.withSize(grid.inputs.length, grid.outputs.length));
        setRulesGrids(newConfigurations);
    }

    function printReglesConsole() {
        let stringRule = "";
        for (const rule of rules) {
            stringRule += rule.toString();
            stringRule += "\n";
        }
        console.log(stringRule);
    }

    function addRuleFromString(input = ""): void {
        const newRules = Rule.parseString(input, context);
        const newSignalsList = [...signalsList];
        for (const rule of newRules) {
            for (const signal of rule.getSignals(context)) {
                if (!newSignalsList.includes(signal)) {
                    newSignalsList.push(signal);
                }
            }
        }
        if (newSignalsList.length > signalsList.length) {
            setSignalsList(newSignalsList);
        }

        // Transform all rules to have ConjunctionOfLiterals conditions
        const newConjunctionRules: ConjunctionRule[] = [];
        for (const rule of newRules) {
            const newCondition = rule.condition.toDNF();
            for (const conjunction of newCondition.subclauses) {
                newConjunctionRules.push(
                    new Rule(conjunction, rule.outputs) as ConjunctionRule
                );
            }
        }
        addRules(newConjunctionRules);
    }

    return (
        <div>
            <Heading level={2}>Règles</Heading>
            <textarea
                id="rulesText"
                className="font-mono p-2 border border-gray-400 shadow-md"
                rows={12}
                cols={60}
                ref={textAreaRef}
                placeholder="Mettez votre règle ici"
            />
            <div className="flex gap-2">
                <Button onClick={printReglesConsole}>
                    Sortir règles en texte
                </Button>
                <Button onClick={handleAddRule}>
                    Ajouter règle depuis texte
                </Button>
                <Button onClick={clearRules}>Effacer les règles</Button>
            </div>
            <div className="flex flex-row flex-wrap">
                {rulesGrids.map((ruleGrid, index) => {
                    const rule = rules[index];
                    return (
                        <RuleGridComponent
                            key={index}
                            grid={ruleGrid}
                            rule={rule}
                            onLoadRule={() => onLoadRule(index)}
                            onDeleteRule={() => onDeleteRule(index)}
                            onUpdateRule={() => onUpdateRule(index)}
                            signalsList={signalsList}
                        />
                    );
                })}
            </div>
        </div>
    );
}

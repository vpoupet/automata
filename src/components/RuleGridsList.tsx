import { useRef } from "react";
import { Automaton } from "../classes/Automaton.ts";
import { ConjunctionRule, mirror, Rule } from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import { Signal } from "../types.ts";
import RuleGridComponent from "./RuleGridComponent.tsx";
import { Button } from "./Button.tsx";
import { Heading } from "./Heading.tsx";

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
        const auto = new Automaton().parseRules(input);
        // TODO: add Mirror option later
        const mirrorRules = [];
        for (const rule of auto.getRules()) {
            mirrorRules.push(mirror(rule, "_d", "_g"));
        }
        auto.rules.push(...mirrorRules);
        
        const newSignalsList = [...signalsList];
        for (const rule of auto.getRules()) {
            for (const signal of rule.getSignals()) {
                if (!newSignalsList.includes(signal)) {
                    newSignalsList.push(signal);
                }
            }
        }
        if (newSignalsList.length > signalsList.length) {
            setSignalsList(newSignalsList);
        }

        // Transform all rules to have ConjunctionOfLiterals conditions
        const newRules: ConjunctionRule[] = [];
        for (const rule of auto.getRules()) {
            const newCondition = rule.condition.toDNF();
            for (const conjunction of newCondition.subclauses) {
                newRules.push(
                    new Rule(conjunction, rule.outputs) as ConjunctionRule
                );
            }
        }
        addRules(newRules);
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
            <Button onClick={printReglesConsole}>Sortir règles en texte</Button>
            <Button onClick={handleAddRule}>Ajouter règle depuis texte</Button>
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

import { useRef } from "react";
import { Automaton } from "../classes/Automaton.ts";
import { ConjunctionRule, Rule } from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import { Signal } from "../types.ts";
import RuleGridComponent from "./RuleGridComponent.tsx";

type RuleGridsListProps = {
    grid: RuleGrid;
    setGrid: React.Dispatch<React.SetStateAction<RuleGrid>>;
    rulesGrids: RuleGrid[];
    setRulesGrids: (rulesGrids: RuleGrid[]) => void;
    rules: Rule[];
    addRules: (rules: Rule[]) => void;
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
        for (let i = 0; i < rules.length; i++) {
            stringRule += rules[i].toString();
            stringRule += "\n";
        }
        console.log(stringRule);
    }

    function addRuleFromString(input = ""): void {
        const auto = new Automaton();
        auto.parseRules(input);
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
                newRules.push(new Rule(conjunction, rule.outputs) as ConjunctionRule);
            }
        }
        addRules(newRules);
    }

    return (
        <div>
            <h2>Règles enregistrées</h2>
            {rulesGrids.map((rule, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                    <RuleGridComponent
                        grid={rule}
                        onLoadRule={() => onLoadRule(index)}
                        onDeleteRule={() => onDeleteRule(index)}
                        onUpdateRule={() => onUpdateRule(index)}
                    />
                    {rules[index] !== null && rules[index] !== undefined
                        ? rules[index].toString()
                        : ""}
                </div>
            ))}
            <button onClick={printReglesConsole}>Sortir règles en texte</button>
            <textarea
                id="rulesText"
                rows={5}
                cols={50}
                ref={textAreaRef}
                placeholder="Mettez votre règle ici"
            />
            <button onClick={handleAddRule}>Ajouter règle depuis texte</button>
        </div>
    );
}

import { useRef } from "react";
import Regle from "./Regle.tsx";
import { Automaton, Rule } from "../classes/Automaton.ts";
import RuleGrid from "../classes/RuleGrid.ts";

type ListeReglesProps = {
    grid: RuleGrid;
    setGrid: React.Dispatch<React.SetStateAction<RuleGrid>>;
    rulesGrids: RuleGrid[];
    setRulesGrids: React.Dispatch<React.SetStateAction<RuleGrid[]>>;
    rules: Rule[];
};

const ListeRegles = ({
    grid,
    setGrid,
    rulesGrids,
    setRulesGrids,
    rules,
}: ListeReglesProps): JSX.Element => {
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
        const rules = auto.getRules();
        for (const regle of rules) {
            const tabNewRule = RuleGrid.withSize(
                grid.outputs.length,
                grid.inputs.length
            );
            for (const literal of regle.condition.getLiterals()) {
                tabNewRule.inputs[
                    literal.position + (grid.inputs.length - 1) / 2
                ].signals.add(literal.signal); // Remplacement de literal.signal par literal.signal.description
            }
            for (const ruleOut of regle.outputs) {
                tabNewRule.outputs[ruleOut.futureStep][
                    ruleOut.neighbor + (grid.inputs.length - 1) / 2
                ].signals.add(ruleOut.signal); // Remplacement de ruleOut.signal par ruleOut.signal.description
            }
            const newRegles = [...rulesGrids, tabNewRule];
            setRulesGrids(newRegles);
        }
    }

    return (
        <div>
            <h2>Règles enregistrées</h2>
            {rulesGrids.map((rule, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                    <Regle
                        grid={rule}
                        onLoadRule={() => onLoadRule(index)}
                        onDeleteRule={() => onDeleteRule(index)}
                        onUpdateRule={() => onUpdateRule(index)}
                    />
                    {rules[index] !== null &&
                    rules[index] !== undefined
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
};

export default ListeRegles;

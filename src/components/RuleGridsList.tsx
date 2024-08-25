import { Rule } from "../classes/Rule.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import { Signal } from "../types.ts";
import { Heading } from "./Heading.tsx";
import RuleGridComponent from "./RuleGridComponent.tsx";

type RuleGridsListProps = {
    grid: RuleGrid;
    setGrid: React.Dispatch<React.SetStateAction<RuleGrid>>;
    rulesGrids: RuleGrid[];
    setRulesGrids: (rulesGrids: RuleGrid[]) => void;
    rules: Rule[];
    signalsList: Signal[];
};

export default function RuleGridsList({
    grid,
    setGrid,
    rulesGrids,
    setRulesGrids,
    rules,
    signalsList,
}: RuleGridsListProps): JSX.Element {
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

    return (
        <div>
            <Heading level={2}>Règles</Heading>
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

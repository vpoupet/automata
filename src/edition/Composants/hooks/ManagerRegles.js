import {useEffect, useState} from 'react';
import {Conjunction, Literal, Negation} from "../../../classes/Clause.ts";
import {Rule, RuleOutput} from "../../../classes/Automaton.ts";

const ManagerRegles = (grille) => {
    const [regles, setRegles] = useState([]);
    const [reglesArithmetiques, setReglesArithmetiques] = useState([]);

    const handleSaveRule = () => {
        const configuration = grille.grid.map(row =>
            row.map(caseObj => caseObj.signals.map(signal => signal.value))
        );
        if (!regles.some(config => JSON.stringify(config) === JSON.stringify(configuration))) {
            setRegles([...regles, configuration]);
        }
    };

    const handleLoadRule = (index) => {
        return regles[index];
    };

    const updateRule = (index) => {
        const configuration = grille.grid.map(row =>
            row.map(caseObj => caseObj.signals.map(signal => signal.value))
        );
        if (regles.some(config => JSON.stringify(config) === JSON.stringify(configuration))) {
            return;
        }
        const newConfigurations = regles.map((config, i) => i === index ? configuration : config);
        setRegles(newConfigurations);
    };

    const updateRuleSignal = (oldValue, newValue) => {
        const newConfigurations = regles.map(config =>
            config.map(row =>
                row.map(cellSignals =>
                    cellSignals.map(signal =>
                        signal === oldValue ? newValue : (signal === '!' + oldValue ? '!' + newValue : signal)
                    )
                )
            )
        );
        setRegles(newConfigurations);
    };



    const deleteRule = (index) => {
        const newConfigurations = regles.filter((config, i) => i !== index);
        setRegles(newConfigurations);
    };

    const deleteSignalInRules = (signalValue) => {
        const newConfigurations = regles.map(config =>
            config.map(row =>
                row.map(cellSignals =>
                    cellSignals.filter(signal => signal !== signalValue && signal !== '!' + signalValue)
                )
            )
        );
        setRegles(newConfigurations);
    };

    const creerClause = (tab) => {
        const clauses = [];
        tab.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                if (cellule.length > 0) {
                    for (let i = 0; i < cellule.length; i++) {
                        let literals = "";
                        if (cellule[i][0] === '!') {
                            literals = new Negation(new Literal(Symbol.for(cellule[i].substr(1)), rowIndex, colIndex));
                        }
                        else {
                            literals = new Literal(Symbol.for(cellule[i]), rowIndex, colIndex);
                        }
                        clauses.push(literals);
                    }

                }
            });
        });
        return new Conjunction(clauses);
    }

    const creerRegleArithmetique = (regle) => {
        const clausePart = regle.slice(0, 3);
        const outputPart = regle.slice(-2);
        const clause = creerClause(clausePart);
        const outputs = creerOutput(outputPart);
        if (outputs.length === 0 && clause.subclauses.length === 0) {
            console.error("Aucun signal n'a été trouvée.");
            return;
        }
        return new Rule(clause, outputs);
    };

    const creerOutput = (tab) => {
        const outputs = [];
        tab.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                //je pensais faire un if pour une potentiel négation mais ce n'est pas un literal..
                const ruleoutput = cellule.map(signal => new RuleOutput(rowIndex, Symbol.for(signal), colIndex));
                outputs.push(...ruleoutput);
            });
        });
        return outputs;
    }

    useEffect(() => {
        const reglesari = regles.map(creerRegleArithmetique);
        setReglesArithmetiques(reglesari);
    }, [regles]);


    return {regles, reglesArithmetiques,creerOutput, creerRegleArithmetique, updateRuleSignal, deleteSignalInRules, handleSaveRule, handleLoadRule, updateRule, deleteRule};
};

export default ManagerRegles;

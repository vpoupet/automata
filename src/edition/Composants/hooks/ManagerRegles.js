import {useEffect, useState, useCallback} from 'react';
import {Conjunction, Literal, Negation} from "../../../classes/Clause.ts";
import {Automaton, Rule, RuleOutput} from "../../../classes/Automaton.ts";


const ManagerRegles = (grille, setAutomaton, setReglesArithmetiques, reglesArithmetiques) => {
    const [regles, setRegles] = useState([]);

    const handleSaveRule = () => {
        const configuration = grille.grid.map(row =>
            row.map(caseObj => caseObj.signals.map(signal => signal.getValue()))
        );
        if (!regles.some(config => JSON.stringify(config) === JSON.stringify(configuration))) {
            const newRegles = [...regles, configuration];
            setRegles(newRegles);
            setReglesArithmetiques(newRegles.map(creerRegleArithmetique));
        }
    };

    const handleLoadRule = (index) => {
        return regles[index];
    };

    const updateRule = (index) => {
        const configuration = grille.grid.map(row =>
            row.map(caseObj => caseObj.signals.map(signal => signal.getValue()))
        );
        if (regles.some(config => JSON.stringify(config) === JSON.stringify(configuration))) {
            return;
        }
        const newConfigurations = regles.map((config, i) => i === index ? configuration : config);
        setRegles(newConfigurations);
        setReglesArithmetiques(newConfigurations.map(creerRegleArithmetique));
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
        setReglesArithmetiques(newConfigurations.map(creerRegleArithmetique));
    };

    const deleteRule = (index) => {
        const newConfigurations = regles.filter((config, i) => i !== index);
        setRegles(newConfigurations);
        setReglesArithmetiques(newConfigurations.map(creerRegleArithmetique));
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
        setReglesArithmetiques(newConfigurations.map(creerRegleArithmetique));
    };

    const creerClause = (tab) => {
        const clauses = [];

        tab.forEach((sousTableau) => {
            for (let i = 0; i < sousTableau.length; i++) {
                const pos = i - Math.floor(sousTableau.length / 2);
                for (let j = 0; j < sousTableau[i].length; j++) {
                    let literals = new Literal(Symbol.for(sousTableau[i][j]), pos);
                    const symbolDescription = Symbol.keyFor(Symbol.for(sousTableau[i][j]));
                    console.log(symbolDescription);

                    if (sousTableau[i][j].startsWith('!')) {
                        literals = new Negation(literals);
                    }
                    clauses.push(literals);
                }
            }
        });

        return new Conjunction(clauses);
    };

    const creerOutput = (tab) => {
        const outputs = [];
        tab.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                if (cellule.length > 0) {
                    const ruleoutput = cellule.map(signal => new RuleOutput(colIndex - Math.floor(tab.length / 2), Symbol.for(signal), rowIndex + 1));
                    outputs.push(...ruleoutput);
                }
            });
        });
        return outputs;
    };

    const creerRegleArithmetique = (regle) => {
        const clausePart = regle.slice(0, 1);
        const outputPart = regle.slice(1);
        const outputs = creerOutput(outputPart);
        const clause = creerClause(clausePart);
        if (outputs.length === 0 && clause.subclauses.length === 0) {
            console.error("Aucun signal n'a été trouvée.");
            return;
        }
        return new Rule(clause, outputs);
    };

    const applyRules = useCallback(() => {
        const auto = new Automaton();
        auto.setRules(reglesArithmetiques);
        auto.updateParameters();
        setAutomaton(auto);
    }, [reglesArithmetiques, setAutomaton]);

    useEffect(() => {
        setReglesArithmetiques(regles.map(creerRegleArithmetique));
    }, [regles]);

    useEffect(() => {
        applyRules();
    }, [reglesArithmetiques, applyRules]);

    return {
        regles,
        reglesArithmetiques,
        creerOutput,
        creerRegleArithmetique,
        updateRuleSignal,
        deleteSignalInRules,
        handleSaveRule,
        handleLoadRule,
        updateRule,
        deleteRule,
    };
};

export default ManagerRegles;
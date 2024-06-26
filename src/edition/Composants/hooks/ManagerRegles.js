import {useEffect, useState, useCallback} from 'react';
import {Conjunction, Literal, Negation} from "../../../classes/Clause.ts";
import {Automaton, Rule, RuleOutput} from "../../../classes/Automaton.ts";


const ManagerRegles = (grille, setAutomaton, setReglesbools, reglesbools, regles, setRegles, activeRules) => {

    const handleSaveRule = () => {
        const configuration = grille.grid.map(row =>
            row.map(caseObj => caseObj.signals.map(signal => signal.getValue()))
        );
        if (!regles.some(config => JSON.stringify(config) === JSON.stringify(configuration))) {
            let modify=false;
            for (let i=0; i<activeRules.length; i++){
                if (activeRules[i]){
                    //on garde à false tant que la fonction ne fonctionne pas
                    modify=false;
                    modifyRule();
                    //fonction permettant de modifier les règles qui sont touchées
                }
            }
            if (!modify) {
                const newRegles = [...regles, configuration];
                setRegles(newRegles);
                setReglesbools(newRegles.map(creerReglebool));
            }
        }
    };

    const modifyRule = () => {
        //vérifie l'ouput de chaque règle ayant un index dont la valeur est true dans activeRules
        //si l'output a changé, on met à jour setRegle et on met à jour setReglesbools
        //il faut d'abord changer en bool pour rajouter la condition
        //la condition est l'input ^ négation de ce qui n'est pas l'input de base
        return;
    }

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
        setReglesbools(newConfigurations.map(creerReglebool));
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
        setReglesbools(newConfigurations.map(creerReglebool));
    };

    const deleteRule = (index) => {
        const newConfigurations = regles.filter((config, i) => i !== index);
        setRegles(newConfigurations);
        setReglesbools(newConfigurations.map(creerReglebool));
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
        setReglesbools(newConfigurations.map(creerReglebool));
    };

    const creerClause = (tab) => {
        const clauses = [];

        tab.forEach((sousTableau) => {
            for (let i = 0; i < sousTableau.length; i++) {
                const pos = i - Math.floor(sousTableau.length / 2);
                for (let j = 0; j < sousTableau[i].length; j++) {
                    let literals = new Literal(Symbol.for(sousTableau[i][j]), pos);
                    const symbolDescription = Symbol.keyFor(Symbol.for(sousTableau[i][j]));

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
                    const ruleoutput = cellule.map(signal => new RuleOutput(colIndex - Math.floor(tab[0].length / 2), Symbol.for(signal), rowIndex + 1));
                    outputs.push(...ruleoutput);
                }
            });
        });
        return outputs;
    };

    const creerReglebool = (regle) => {
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
        auto.setRules(reglesbools);
        auto.updateParameters();
        setAutomaton(auto);
    }, [reglesbools, setAutomaton]);

    useEffect(() => {
        setReglesbools(regles.map(creerReglebool));
    }, [regles]);

    useEffect(() => {
        applyRules();
    }, [reglesbools, applyRules]);

    return {
        regles,
        reglesbools,
        creerOutput,
        creerReglebool,
        updateRuleSignal,
        deleteSignalInRules,
        handleSaveRule,
        handleLoadRule,
        updateRule,
        deleteRule,
    };
};

export default ManagerRegles;
import { useEffect, useState, useCallback } from 'react';
import { Clause, Conjunction, Literal, Negation } from "../../../classes/Clause.ts";
import { Automaton, Rule, RuleOutput } from "../../../classes/Automaton.ts";
import Grille from "../../Objets/Grille.js";

const ManagerRegles = (grille, setAutomaton, setReglesbools, reglesbools, regles, setRegles, activeRules) => {

    const handleSaveRule = (cellOutput = [], pos = Number.MIN_SAFE_INTEGER) => {
        let configuration = new Grille(grille.grid.length, grille.grid[0].length);
        if (cellOutput.length !== 0 && pos !== Number.MIN_SAFE_INTEGER) {
            // Copier la grille actuelle
            configuration.grid = grille.grid.map(row =>
                row.map(cell => ({ ...cell, signals: [...cell.signals] }))
            );
            for (let rowIndex = 1; rowIndex < grille.grid.length; rowIndex++) {
                if (rowIndex === pos) {
                    configuration.grid[rowIndex] = cellOutput;
                } else {
                    configuration.grid[rowIndex] = new Array(grille.grid[0].length).fill({ signals: [] });
                }
            }
        } else {
            configuration.grid = grille.grid.map(row =>
                row.map(cell => ({ ...cell, signals: [...cell.signals] }))
            );
        }
        if (!regles.some(config => JSON.stringify(config) === JSON.stringify(configuration.grid))) {
            const newRegles = [...regles, configuration.grid];
            setRegles(newRegles);
            setReglesbools(newRegles.map(creerReglebool));
        }

        console.log(regles);
    };

    const modifyRule = () => {
        modifExistingRules();
        addUnexpectedRule();
    };

    const modifExistingRules = () => {
        let modif = [];
        for (let i = 0; i < activeRules.length; i++) {
            if (activeRules[i]) {
                for (let rows = 1; rows < grille.grid.length; rows++) {
                    for (let cell = 0; cell < grille.grid[0].length; cell++) {
                        regles[i][rows][cell].signals.forEach(signal => {
                            if (grille.grid[rows][cell].signals.map(s => s).includes(signal)) {
                                console.log('le signal ' + signal.description + ' est toujours présent dans la grille');
                            } else {
                                console.log('le signal ' + signal.description + " n'est pas présent dans l'output, la regle n° ", i, "à l'emplacement : ligne : ", rows, 'colonne : ', cell, "  !!! n'est pas contente !!!");
                                modif.push({ signal: signal, row: rows, col: cell, numregle: i });
                            }
                        });
                    }
                }
            }
        }

        if (modif.length !== 0) {
            console.log('il y a des modifications à faire');
            console.log(modif.length);
            let inputModified = [];
            for (let nbrRule = 0; nbrRule < modif.length; nbrRule++) {
                inputModified.push([]);
                for (let i = 0; i < grille.grid[0].length; i++) {
                    for (let signals = 0; signals < grille.grid[0][i].signals.length; signals++) {
                        if (grille.grid[0][i].signals[signals].description === modif[nbrRule].signal.description) {
                            inputModified[nbrRule].push(i);
                        } else {
                            if (grille.grid[0][i].signals[signals].description === '!' + modif[nbrRule].signal.description) {
                                inputModified[nbrRule].push('!' + i);
                            }
                        }
                    }
                    if (inputModified[nbrRule].length === 0) {
                        inputModified[nbrRule].push([]);
                    }
                }
            }
        }
    };

    const addUnexpectedRule = () => {
        let activeRulesOnly = [];
        for (let i = 0; i < activeRules.length; i++) {
            if (activeRules[i]) {
                activeRulesOnly.push(regles[i]);
            }
        }
        for (let rows = 1; rows < grille.grid.length; rows++) {
            for (let cell = 0; cell < grille.grid[0].length; cell++) {
                grille.grid[rows][cell].signals.forEach(signal => {
                    let signalIsUsed = false;
                    for (let i = 0; i < activeRulesOnly.length; i++) {
                        if (activeRulesOnly[i][rows][cell].signals.includes(signal.description)) {
                            signalIsUsed = true;
                        }
                    }
                    if (!signalIsUsed) {
                        console.log('le signal ' + signal.description + " n'est pas utilisé dans les règles actives, ajout d'une règle !");
                        handleSaveRule();
                    }
                });
            }
        }
    };

    const printReglesConsole = () => {
        let stringRule = "";
        for (let i = 0; i < reglesbools.length; i++) {
            stringRule += reglesbools[i].toString();
            stringRule += '\n';
        }
        console.log(stringRule);
    };

    const handleLoadRule = (index) => {
        return regles[index];
    };

    const updateRule = (index) => {
        const configuration = grille.grid.map(row =>
            row.map(caseObj => ({ ...caseObj, signals: [...caseObj.signals] }))
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
                    cellSignals.signals.map(signal =>
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
                    ({ ...cellSignals, signals: cellSignals.signals.filter(signal => signal !== signalValue && signal !== '!' + signalValue) })
                )
            )
        );
        setRegles(newConfigurations);
        setReglesbools(newConfigurations.map(creerReglebool));
    };

    const creerOutput = (tab) => {
        const outputs = [];
        console.log('tab de output', tab);

        tab.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                if (cellule.signals.length > 0) {
                    cellule.signals.forEach(signal => {
                        let ruleOutput = new RuleOutput(colIndex - Math.floor(tab[0].length / 2), signal, rowIndex + 1);
                        console.log('outputs de la Rule : ', ruleOutput);
                        outputs.push(ruleOutput);
                    });
                }
            });
        });

        return outputs;
    };

    const creerClause = (tab) => {
        const clauses = [];
        tab.forEach((row) => {
            for (let cell = 0; cell < row.length; cell++) {
                console.log('row[cell] : ', row[cell]);
                const pos = cell - Math.floor(row.length / 2);
                for (let signal = 0; signal < row[cell].signals.length; signal++) {
                    let literal = new Literal(row[cell].signals[signal], pos, !row[cell].signals[signal].description.startsWith("!"));
                    clauses.push(literal);
                }
            }
        });
        console.log('clauses (sous forme de conjonction) : ', new Conjunction(clauses));
        return new Conjunction(clauses);
    };

    const creerReglebool = (regle) => {
        const clausePart = regle.slice(0, 1);
        const outputPart = regle.slice(1);
        const outputs = creerOutput(outputPart);
        const clause = creerClause(clausePart);
        if (outputs.length === 0 && clause.subclauses.length === 0) {
            console.error("Aucun signal n'a été trouvé.");
            console.log("tu m'as donné ça : ", regle);
            return;
        }
        return new Rule(clause, outputs);
    };
    window.ajoutRegle = (input = "") => {
        let auto = new Automaton();
        auto.parseRules(input);
        let rules = auto.getRules();
        console.log(rules);
        for (let regle of rules) {
            let tabNewRule = new Grille(grille.grid.length, grille.grid[0].length);
            for (let literal of regle.condition.getLiterals()) {
                tabNewRule.grid[0][literal.position + (grille.grid[0].length - 1) / 2].signals.push(literal.signal);  // Remplacement de literal.signal par literal.signal.description
            }
            for (let ruleOut of regle.outputs) {
                tabNewRule.grid[ruleOut.futureStep][ruleOut.neighbor + (grille.grid[0].length - 1) / 2].signals.push(ruleOut.signal);  // Remplacement de ruleOut.signal par ruleOut.signal.description
            }
            console.log(tabNewRule.grid);
            const newRegles = [...regles, tabNewRule.grid];
            setRegles(newRegles);
            setReglesbools(newRegles.map(creerReglebool));
        }
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
        modifyRule,
        printReglesConsole
    };
}
export default ManagerRegles;

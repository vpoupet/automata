import {useEffect, useState, useCallback} from 'react';
import {Clause, Conjunction, Literal, Negation} from "../../../classes/Clause.ts";
import {Automaton, Rule, RuleOutput} from "../../../classes/Automaton.ts";
import Grille from "../../Objets/Grille.js";
import {act} from "react-dom/test-utils";
import {Configuration} from "../../../classes/Configuration.ts";

const ManagerRegles = (grille, setAutomaton, setReglesbools, reglesbools, regles, setRegles, activeRules) => {

    const handleSaveRule = () => {
        let configuration = new Grille(grille.grid.length, grille.grid[0].length);
        configuration.grid = grille.grid.map(row =>
            row.map(cell => ({...cell, signals: [...cell.signals]}))
        );
        const newRegles = [...regles, configuration.grid];
        setRegles(newRegles);
        console.log(regles);
    };

    const modifyRule = () => {
        let oneRuleToModify = [false, 0];
        console.log('les regles', regles)
        for (let ruleNbr = 0; ruleNbr < regles.length; ruleNbr++) {
            //manque un étage, on descend pas assez bas pour comparer les signaux
            if (regles[ruleNbr][0].signals === grille.grid[0].signals && regles[ruleNbr][0] !== undefined) {
                console.log('on a trouvé une règle à modifier', ruleNbr)
                oneRuleToModify = [true, ruleNbr];
            }
        }
        if (oneRuleToModify[0]) {
            console.log('modification de la règle', oneRuleToModify[1])
            modifExistingRules(oneRuleToModify[1]);
        } else {
            console.log('ajout d\'une règle (entre autre), on a pas exactement cet input dans une règle');
            addUnexpectedRule();
        }
    };

    const modifExistingRules = (valueRule) => {
        let newRule = new Grille(grille.grid.length, grille.grid[0].length);
        newRule.grid = grille.grid.map(row =>
            row.map(cell => ({...cell, signals: [...cell.signals]}))
        );
        let newRegles = regles;
        newRegles[valueRule] = newRule.grid;
        setRegles(newRegles);
    };

    const addUnexpectedRule = () => {
        let activeRulesOnly = [];
        for (let i = 0; i < activeRules.length; i++) {
            if (activeRules[i]) {
                activeRulesOnly.push(creerReglebool(regles[i]));
            }
        }
        console.log('regles concernées : ', activeRulesOnly);

        const auto = new Automaton();
        auto.setRules(activeRulesOnly);
        auto.updateParameters();
        let confInit = new Configuration(grille.grid.length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            confInit.cells[i] = grille.grid[0][i].toSet();
        }
        //PAS BIEN LE 1 !!
        const confInal = auto.makeDiagram(confInit, 1)
        confInal.shift();
        console.log('output des règles sur l\'input de la grille', confInal);

        //PAS BIEN, mais pour l'instant.. pour chaque configuration (il en reste une seule pour le moment, j'espère !!)
        if (confInal.length > 1) {
            console.error('Trop de configurations en sortie de la grille');
            return;
        }
        //si l'output généré est le même que celui de la grille, on fait rien on return c'est gg
        let outputdifferent = false;
        //PAS BIEN, FAIRE DOUBLE BOUCLE SI ON EST RP !
        for (let i = 0; i < grille.grid[0].length; i++) {
            if (grille.grid[1][i].signals.toSet() !== confInal[0].cells[i]) {
                outputdifferent = true;
            }
        }
        if (!outputdifferent) {
            console.log('les outputs sont les mêmes, on ne fait rien');
            return;
        }

        // bon la on est au moment critique, faut rajouter une nouvelle règle et
        // ajouter la négation de l'input de la grille pour chaque règle active (DNF)

        let newRule = new Grille(grille.grid.length, grille.grid[0].length);
        newRule.grid = grille.grid.map(row =>
            row.map(cell => ({...cell, signals: [...cell.signals]}))
        );

        let newRuleBool = creerReglebool(newRule.grid);
        const RulesToModify = modifRulesWithNegation(newRuleBool, activeRulesOnly);

        //on modifie les règles existantes
        let j=0;
        for (let i = 0; i < activeRules.length; i++) {
            if (activeRules[i]) {
                regles[i]=RulesToModify[i-j];
            }
            else{
                j--;
            }
        }
        //on ajoute la nouvelle règle
        regles.push(newRule.grid);
        //PAS BIEN ???
        setRegles(regles);
    };

    const modifRulesWithNegation = (newRuleBool, activeRulesOnly) => {
        //on ajoute la négation de l'input de la grille
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
            row.map(caseObj => ({...caseObj, signals: [...caseObj.signals]}))
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
                    cellSignals.signals.map(signal =>
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
                    ({
                        ...cellSignals,
                        signals: cellSignals.signals.filter(signal => signal !== signalValue && signal !== '!' + signalValue)
                    })
                )
            )
        );
        setRegles(newConfigurations);

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
    const addRuleFromString = (input = "") => {
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
        printReglesConsole,
        addRuleFromString
    };
}
export default ManagerRegles;

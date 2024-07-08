import { useCallback, useEffect } from 'react';
import { Automaton, Rule, RuleOutput } from "../../../classes/Automaton.ts";
import { Conjunction, Literal, Negation } from "../../../classes/Clause.ts";
import { Configuration } from "../../../classes/Configuration.ts";
import Grille from "../../Objets/Grille.ts";

const ManagerRegles = (grille, setAutomaton, setReglesbools, reglesbools, regles, setRegles, activeRules) => {

    const handleSaveRule = () => {
        let configuration = new Grille(grille.grid.length, grille.grid[0].length);
        configuration.grid = grille.grid.map(row =>
            row.map(cell => ({...cell, signals: new Set(cell.signals)}))
        );
        const newRegles = [...regles, configuration.grid];
        setRegles(newRegles);
    };

    const modifyRule = () => {
        let rulesToModify = new Set();
        const config = new Configuration(grille.grid[0].length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            config.cells[i] = grille.grid[0][i].getSignals();
        }

        for (let ruleNbr = 0; ruleNbr < regles.length; ruleNbr++) {
            for (let i = 0; i < grille.grid[0].length; i++) {
                if(reglesbools[ruleNbr].condition.eval(config.getNeighborhood(i, -2, 2))){
                    rulesToModify.add(ruleNbr)
                }

            }
        }

        if (rulesToModify.size === 0) {
            console.log('pas de règle à modifier, on ajoute une nouvelle règle');
            handleSaveRule();
        }
        if (rulesToModify.size === 1) {
            console.log('modification de la règle', rulesToModify)
            updateRule(rulesToModify.values().next().value);
        } else {
            console.log('ajout de règles and stuff', rulesToModify);
            addUnexpectedRule(rulesToModify);
        }
    };

    const addUnexpectedRule = (setListRules) => {
        let activeRulesOnly = [];
        for (let rulenbr of setListRules) {
            activeRulesOnly.push(reglesbools[rulenbr])
        }
        const configOutput = getOutputFromRules(activeRulesOnly);
        //si l'output généré est le même que celui de la grille, on fait rien on return c'est gg
        //pour l'instant pas géré
        let outputdifferent = false;
        if (outputdifferent) {
            console.log('les outputs sont les mêmes, on ne fait rien');
            return;
        }

        // bon la on est au moment critique, faut rajouter une nouvelle règle et
        // ajouter la négation de l'input de la grille pour chaque règle active (DNF)

        let newRule = new Grille(grille.grid.length, grille.grid[0].length);
        newRule.grid = grille.grid.map(row =>
            row.map(cell => ({...cell, signals: new Set(cell.signals)}))
        );

        //on créé la regle bool de la nouvelle regle
        let newRuleBool = creerReglebool(newRule.grid);
        //on ajoute la négation de l'input de la nouvelle règle à chaque règle active
        const rulesModified = modifRulesWithNegation(newRuleBool, activeRulesOnly);


        let rules = [...regles]

        //si le n° d'indice de la règle est dans activeRulesOnly alors on le supprime
        rules.filter((_, i) => !activeRulesOnly.includes(i));

        for (let rules of rulesModified) {
            rules.push(rules)
        }
        //on ajoute la nouvelle règle
        rules.push(newRule.grid);-
        //PAS BIEN ???
        setRegles(rules);
        console.log('dans l\'idée on a fais les modifs qui faut :', reglesbools)
    };

    const getOutputFromRules = (activeRulesOnly) => {
        const auto = new Automaton();
        auto.setRules(activeRulesOnly);
        auto.updateParameters();
        let confInit = new Configuration(grille.grid.length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            confInit.cells[i] = grille.grid[0][i].getSignals();
        }
        //PAS BIEN LE 1 !!
        const confInal = auto.makeDiagram(confInit, 1)
        confInal.shift();
        return confInal;
    }

    const modifRulesWithNegation = (newRuleBool, activeRulesOnly) => {
        let newRulesReadyToUse = [];
        for (let i = 0; i < activeRulesOnly.length; i++) {
            let newRules = new Conjunction([activeRulesOnly[i].condition, new Negation(newRuleBool.condition)]).toDNF();
            for (let j = 0; j < newRules.subclauses.length; j++) {
                newRulesReadyToUse.push(tabFromRuleBool(newRules.subclauses[j], newRuleBool.outputs));
            }
        }
        console.log('la liste des nouvelles règles à rajouter ! : ', newRulesReadyToUse)
        return newRulesReadyToUse;
    };

    const tabFromRuleBool = (clause, output) => {
        let tab = new Grille(grille.grid.length, grille.grid[0].length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            for (let j = 0; j < clause.getLiterals().length; j++) {
                if (clause.getLiterals()[j].position === i) {
                    //PAS BIEN, faire le rayon !!
                    tab.grid[0][i + 2].signals.add(clause.getLiterals()[j].signal);
                }
            }
            for (let j = 0; j < output.length; j++) {
                if (output[j].neighbor === i) {
                    tab.grid[output[j].futureStep][i + 2].signals.add(output[j].signal);
                }
            }
        }
        return tab.grid;
    }

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
        const newConfigurations = regles.map((config, i) =>
            i === index
                ? grille.grid.map(row =>
                    row.map(cell => ({...cell, signals: new Set(cell.signals)}))
                )
                : config
        );
        setRegles(newConfigurations);
    };

    const updateRuleSignal = (oldValue, newValue) => {
        const newConfigurations = regles.map(config =>
            config.map(row =>
                row.map(cell => ({
                    ...cell,
                    signals: new Set(Array.from(cell.signals).map(signal =>
                        signal === oldValue ? newValue : (Symbol.keyFor(signal) === '!' + Symbol.keyFor(oldValue) ? '!' + Symbol.keyFor(newValue) : signal)
                    ))
                }))
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
                row.map(cell => ({
                    ...cell,
                    signals: new Set(Array.from(cell.signals).filter(signal => signal !== signalValue && signal !== '!' + signalValue))
                }))
            )
        );
        setRegles(newConfigurations);

    };

    const creerOutput = (tab) => {
        const outputs = [];

        tab.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                if (cellule.signals.size > 0) {
                    cellule.signals.forEach(signal => {
                        let ruleOutput = new RuleOutput(colIndex - Math.floor(tab[0].length / 2), signal, rowIndex + 1);
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
                for (let signal of row[cell].signals) {
                    let literal = new Literal(signal, pos, !signal.description.startsWith("!"));
                    clauses.push(literal);
                }
            }
        });
        return new Conjunction(clauses);
    };

    const creerReglebool = (regle) => {
        const clausePart = regle.slice(0, 1);
        const outputPart = regle.slice(1);
        const outputs = creerOutput(outputPart);
        const clause = creerClause(clausePart);
        if (outputs.length === 0 && clause.subclauses.length === 0) {
            console.error("Aucun signal n'a été trouvé.");
            return;
        }
        return new Rule(clause, outputs);
    };

    const addRuleFromString = (input = "") => {
        let auto = new Automaton();
        auto.parseRules(input);
        let rules = auto.getRules();
        for (let regle of rules) {
            let tabNewRule = new Grille(grille.grid.length, grille.grid[0].length);
            for (let literal of regle.condition.getLiterals()) {
                tabNewRule.grid[0][literal.position + (grille.grid[0].length - 1) / 2].signals.add(literal.signal);  // Remplacement de literal.signal par literal.signal.description
            }
            for (let ruleOut of regle.outputs) {
                tabNewRule.grid[ruleOut.futureStep][ruleOut.neighbor + (grille.grid[0].length - 1) / 2].signals.add(ruleOut.signal);  // Remplacement de ruleOut.signal par ruleOut.signal.description
            }
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
        console.log('regles a changé , ', regles)
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
};

export default ManagerRegles;


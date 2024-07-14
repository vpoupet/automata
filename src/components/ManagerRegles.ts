import React, {useCallback, useEffect} from "react";
import {Automaton, Rule, RuleOutput} from "../classes/Automaton.ts";
import {
    Conjunction,
    ConjunctionOfLiterals, DNFClause,
    Literal,
    Negation
} from "../classes/Clause.ts";
import {Signal} from "../types.ts";
import {Cell} from "../classes/Cell.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import ruleGrid from "../classes/RuleGrid.ts";

const ManagerRegles = (
    grid: RuleGrid,
    setAutomaton: React.Dispatch<React.SetStateAction<Automaton>>,
    setReglesbools: React.Dispatch<React.SetStateAction<Rule[]>>,
    reglesbools: Rule[],
    rulesGrid: RuleGrid[],
    setrulesGrid: React.Dispatch<React.SetStateAction<RuleGrid[]>>
) => {
    const handleSaveRule = () => {
        if (rulesGrid.length === 0) {
            setrulesGrid([grid.clone()]);
        }
        setrulesGrid([...rulesGrid, grid.clone()]);
    };

    const modifyRule = () => {
        const rulesToModify = new Set<number>();
        const config = grid.getConfigurationFromGrid()

        for (let ruleNbr = 0; ruleNbr < rulesGrid.length; ruleNbr++) {
            for (let i = 0; i < grid.inputs.length; i++) {
                if (
                    reglesbools[ruleNbr].condition.eval(
                        config.getNeighborhood(i, -2, 2)
                    )
                ) {
                    rulesToModify.add(ruleNbr);
                }
            }
        }


        if (rulesToModify.size === 0) {
            console.log(
                "pas de règle à modifier, on ajoute une nouvelle règle"
            );
            handleSaveRule();
        } else {
            console.log("ajout de règles and stuff", rulesToModify);
            addAdaptedRules(rulesToModify);
        }
    };

    const addAdaptedRules = (setListRules: Set<number>) => {
        const activeRulesOnly: Set<Rule> = new Set();
        for (const rulenbr of setListRules) {
            activeRulesOnly.add(reglesbools[rulenbr]);
        }

        // const configOutput = getOutputFromRules(activeRulesOnly);
        //si l'output généré est le même que celui de la grid, on fait rien on return c'est gg
        //pour l'instant pas géré
        // let outputdifferent = false;
        // if (outputdifferent) {
        //     console.log("les outputs sont les mêmes, on ne fait rien");
        //     return;
        // }

        // bon la on est au moment critique, faut rajouter une nouvelle règle et
        // ajouter la négation de l'input de la grid pour chaque règle active (DNF)

        const newRule = grid.clone();

        //on créé la regle bool de la nouvelle regle
        const newRuleBool = creerReglebool(grid);
        //on ajoute la négation de l'input de la nouvelle règle à chaque règle active
        const rulesModified = modifRulesWithNegation(
            newRuleBool,
            activeRulesOnly
        );

        const rules = [...rulesGrid];

        // WARNING: C'est n'importe quoi à partir de là jusqu'à la fin de la fonction
        //si le n° d'indice de la règle est dans activeRulesOnly alors on le supprime
        // rules.filter(rule => !activeRulesOnly.has(rule));
        // rules.filter((_, i) => !activeRulesOnly.includes(i));

        // for (const rule of rulesModified) {
        //     rules.push(rule);   // <- corrigé ici mais pas sûr que ce soit correct
        // }
        // //on ajoute la nouvelle règle
        // rules.push(newRule.grid);
        // -(
        //     //PAS BIEN ???
        //     setrulesGrid(rules)
        // );
        // console.log("dans l'idée on a fais les modifs qui faut :", reglesbools);
    };

    const getOutputFromRules = (activeRulesOnly: Rule[]) => {
        const auto = new Automaton();
        auto.setRules(activeRulesOnly);
        auto.updateParameters();
        const confInit = grid.getConfigurationFromGrid()
        //PAS BIEN LE 1 !!
        const confInal = auto.makeDiagram(confInit, 1);
        confInal.shift();
        return confInal;
    };

    function modifRulesWithNegation(newRuleBool: Rule, activeRulesOnly: Set<Rule>): ruleGrid[] {
        const newRulesReadyToUse: ruleGrid[] = [];
        for (const rule of activeRulesOnly) {
            const newRule = new Conjunction([
                rule.condition,
                new Negation(newRuleBool.condition),
            ]).toDNF();
            for (let j = 0; j < newRule.subclauses.length; j++) {
                newRulesReadyToUse.push(
                    getRuleGridFromBool(new Rule(newRule.subclauses[j], newRuleBool.outputs))
                );
            }
        }
        console.log(
            "la liste des nouvelles règles à rajouter ! : ",
            newRulesReadyToUse
        );
        return newRulesReadyToUse;
    }

    const printReglesConsole = () => {
        let stringRule = "";
        for (let i = 0; i < reglesbools.length; i++) {
            stringRule += reglesbools[i].toString();
            stringRule += "\n";
        }
        console.log(stringRule);
    };

    const handleLoadRule = (index: number) => {
        return rulesGrid[index];
    };

    const updateRule = (index: number) => {
        const newConfigurations = [...rulesGrid];
        newConfigurations[index] = grid.clone();
        setrulesGrid(newConfigurations);
    };

    const updateSignalInRule = (oldValue: Signal, newValue: Signal) => {
        // TODO: revenir sur cette fonction après avoir ajouté les signaux négatifs à la Cellule
        const newRules: RuleGrid[] = [];
        for (let i = 0; i < rulesGrid.length; i++) {
            newRules.push(rulesGrid[i].clone());
            for (let rows = 0; rows < grid.outputs.length; rows++) {
                for (let col = 0; col < grid.inputs.length; col++) {
                    if (rows === 0) {
                        if (newRules[i].inputs[col].signals.delete(oldValue)) {
                            newRules[i].inputs[col].signals.add(newValue);
                        }
                    }
                    if (newRules[i].outputs[rows][col].signals.delete(oldValue)) {
                        newRules[i].outputs[rows][col].signals.add(newValue);
                    }
                }
            }
        }
    };

    const deleteRule = (index: number) => {
        const newConfigurations = rulesGrid.filter((_, i) => i !== index);
        setrulesGrid(newConfigurations);
    };

    function deleteSignalInRules(signalValue: Signal) {
        const newRulesGrid = []
        newRulesGrid.push(...rulesGrid)
        // TODO: reprendre la fonction après signaux négatifs dans Cellule
        for (let i = 0; i < rulesGrid.length; i++) {
            for (let j = 0; j < rulesGrid[i].inputs.length; j++) {
                newRulesGrid[i].inputs[j].signals.delete(signalValue);
                for (let k = 0; k < rulesGrid[i].outputs.length; k++) {
                    newRulesGrid[i].outputs[k][j].signals.delete(signalValue);
                }
            }
        }
        setrulesGrid(newRulesGrid);
    }

    const creerOutput = (tab: Cell[][]) => {
        const outputs: RuleOutput[] = [];

        tab.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                if (cellule.signals.size > 0) {
                    cellule.signals.forEach((signal) => {
                        const ruleOutput = new RuleOutput(
                            colIndex - Math.floor(tab[0].length / 2),
                            signal,
                            rowIndex + 1
                        );
                        outputs.push(ruleOutput);
                    });
                }
            });
        });

        return outputs;
    };

    function creerClause(tab: Cell[]): ConjunctionOfLiterals {
        // TODO: reprendre après signaux négatifs dans Cellule

        const literals: Literal[] = [];
        tab.forEach((cellule, cellIndex) => {
            if (cellule.signals.size > 0) {
                cellule.signals.forEach((signal) => {
                    const literal = new Literal(signal, cellIndex - 2);
                    literals.push(literal);
                });
            }
        });
        return new Conjunction(literals) as ConjunctionOfLiterals;
    }

    function creerReglebool(rule: ruleGrid): Rule {
        // TODO: faire la vérification que la règle n'est pas vide ailleurs (avant ou après l'appel à cette fonction)
        const outputs = creerOutput(rule.outputs);
        const clause = creerClause(rule.inputs);
        return new Rule(clause, outputs);
    }

    function addRuleFromString(input = ""): void {
        const auto = new Automaton();
        auto.parseRules(input);
        const rules = auto.getRules();
        for (const regle of rules) {
            const tabNewRule = new ruleGrid(
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
            const newRegles = [...rulesGrid, tabNewRule];
            setrulesGrid(newRegles);
        }
    }

    function getInputsFromDNF(DNF: DNFClause): ruleGrid[] {
        const allinputs: ruleGrid[] = [];
        for (let conj = 0; conj < DNF.subclauses.length; conj++) {
            const conjunction = DNF.subclauses[conj]
            allinputs.push(new RuleGrid(grid.outputs.length, grid.inputs.length));
            for (let i = 0; i < conjunction.subclauses.length; i++) {
                for (let cellidx = 0; cellidx < grid.inputs.length; cellidx++) {
                    for (const literal of conjunction.subclauses[i].getLiterals()) {
                        //PAS BIEN : cellidx - rayon
                        if (literal.position === cellidx - 2) {
                            //TODO : la négation ?
                            allinputs[conj].inputs[cellidx].signals.add(literal.signal)
                        }
                    }
                }
            }
        }
        return allinputs;
    }

    function getRuleGridFromBool(regleBool: Rule): ruleGrid {
        const ruleGrid: ruleGrid = new RuleGrid(grid.outputs.length, grid.inputs.length);
        for (const literal of regleBool.condition.getLiterals()) {
            for (let cellidx = 0; cellidx < grid.inputs.length; cellidx++) {
                if (literal.position === cellidx - 2) {
                    //TODO : la négation !
                    ruleGrid.inputs[cellidx].signals.add(literal.signal)
                }
            }
        }
        for (const ruleOut of regleBool.outputs) {
            for (let cellidx = 0; cellidx < grid.inputs.length; cellidx++) {
                if (ruleOut.neighbor === cellidx - 2) {
                    //PAS BIEN : on prend pas en compte si une grid plus grande
                    ruleGrid.outputs[0][cellidx].signals.add(ruleOut.signal)
                }
            }
        }
        return ruleGrid;
    }


    const applyRules = useCallback(() => {
        const auto = new Automaton();
        auto.setRules(reglesbools);
        auto.updateParameters();
        setAutomaton(auto);
    }, [reglesbools, setAutomaton]);

    useEffect(() => {
        setReglesbools(rulesGrid.map(creerReglebool));
    }, [rulesGrid]);

    useEffect(() => {
        applyRules();
    }, [reglesbools, applyRules]);

    return {
        rulesGrid,
        reglesbools,
        creerOutput,
        creerReglebool,
        updateSignalInRule,
        deleteSignalInRules,
        handleSaveRule,
        handleLoadRule,
        updateRule,
        deleteRule,
        modifyRule,
        printReglesConsole,
        addRuleFromString,
    };
};

export default ManagerRegles;

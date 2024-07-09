import React, {useCallback, useEffect} from "react";
import {Automaton, Rule, RuleOutput} from "../../../classes/Automaton.ts";
import {
    Clause,
    Conjunction,
    ConjunctionOfLiterals, DNFClause,
    Literal,
    Negation,
} from "../../../classes/Clause.ts";
import {Configuration} from "../../../classes/Configuration.ts";
import {Signal} from "../../../classes/types.ts";
import Cellule from "../../Objets/Cellule.ts";
import Grille from "../../Objets/Grille.ts";
import {rules} from "@typescript-eslint/eslint-plugin";

const ManagerRegles = (
    grille: Grille,
    setAutomaton: React.Dispatch<React.SetStateAction<Automaton>>,
    setReglesbools: React.Dispatch<React.SetStateAction<Rule[]>>,
    reglesbools: Rule[],
    regles: Cellule[][][],
    setRegles: React.Dispatch<React.SetStateAction<Cellule[][][]>>
) => {
    const handleSaveRule = () => {
        setRegles([...regles, grille.clone().grid]);
    };

    const modifyRule = () => {
        const rulesToModify = new Set<number>();
        const config = new Configuration(grille.grid[0].length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            config.cells[i] = grille.grid[0][i].getSignals();
        }

        for (let ruleNbr = 0; ruleNbr < regles.length; ruleNbr++) {
            for (let i = 0; i < grille.grid[0].length; i++) {
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
        //si l'output généré est le même que celui de la grille, on fait rien on return c'est gg
        //pour l'instant pas géré
        // let outputdifferent = false;
        // if (outputdifferent) {
        //     console.log("les outputs sont les mêmes, on ne fait rien");
        //     return;
        // }

        // bon la on est au moment critique, faut rajouter une nouvelle règle et
        // ajouter la négation de l'input de la grille pour chaque règle active (DNF)

        const newRule = grille.clone();

        //on créé la regle bool de la nouvelle regle
        const newRuleBool = creerReglebool(newRule.grid);
        //on ajoute la négation de l'input de la nouvelle règle à chaque règle active
        const rulesModified = modifRulesWithNegation(
            newRuleBool,
            activeRulesOnly
        );

        const rules = [...regles];

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
        //     setRegles(rules)
        // );
        // console.log("dans l'idée on a fais les modifs qui faut :", reglesbools);
    };

    const getOutputFromRules = (activeRulesOnly: Rule[]) => {
        const auto = new Automaton();
        auto.setRules(activeRulesOnly);
        auto.updateParameters();
        const confInit = new Configuration(grille.grid.length);
        for (let i = 0; i < grille.grid[0].length; i++) {
            confInit.cells[i] = grille.grid[0][i].getSignals();
        }
        //PAS BIEN LE 1 !!
        const confInal = auto.makeDiagram(confInit, 1);
        confInal.shift();
        return confInal;
    };

    function modifRulesWithNegation(newRuleBool: Rule, activeRulesOnly: Set<Rule>): Cellule[][][] {
        const newRulesReadyToUse: Cellule[][][] = [];
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
        return regles[index];
    };

    const updateRule = (index: number) => {
        const newConfigurations = [...regles];
        newConfigurations[index] = grille.clone().grid;
        setRegles(newConfigurations);
    };

    const updateRuleSignal = (oldValue: Signal, newValue: Signal) => {
        // TODO: revenir sur cette fonction après avoir ajouté les signaux négatifs à la Cellule
        const newRegles: Cellule[][][] = regles.map((regle) =>
            regle.map((row) =>
                row.map((cell) => {
                    const newSignals = new Set(cell.signals);
                    if (newSignals.delete(oldValue)) {
                        newSignals.add(newValue);
                    }
                    return new Cellule(newSignals);
                })
            )
        );
        setRegles(newRegles);
    };

    const deleteRule = (index: number) => {
        const newConfigurations = regles.filter((_, i) => i !== index);
        setRegles(newConfigurations);
    };

    function deleteSignalInRules(signalValue: Signal) {
        // TODO: reprendre la fonction après signaux négatifs dans Cellule
        const newConfigurations = regles.map((config) =>
            config.map((row) =>
                row.map((cell) => {
                    const signals = new Set(cell.signals);
                    signals.delete(signalValue);
                    return new Cellule(signals);
                })
            )
        );
        setRegles(newConfigurations);
    }

    const creerOutput = (tab: Cellule[][]) => {
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

    function creerClause(tab: Cellule[][]): ConjunctionOfLiterals {
        // TODO: reprendre après signaux négatifs dans Cellule
        const literals: Literal[] = [];
        tab.forEach((row) => {
            for (let cell = 0; cell < row.length; cell++) {
                const pos = cell - Math.floor(row.length / 2);
                for (const signal of row[cell].signals) {
                    const literal = new Literal(signal, pos);
                    literals.push(literal);
                }
            }
        });
        return new Conjunction(literals) as ConjunctionOfLiterals;
    }

    function creerReglebool(regle: Cellule[][]): Rule {
        // TODO: faire la vérification que la règle n'est pas vide ailleurs (avant ou après l'appel à cette fonction)
        const clausePart = regle.slice(0, 1);
        const outputPart = regle.slice(1);
        const outputs = creerOutput(outputPart);
        const clause = creerClause(clausePart);
        return new Rule(clause, outputs);
    }

    function addRuleFromString(input = ""): void {
        const auto = new Automaton();
        auto.parseRules(input);
        const rules = auto.getRules();
        for (const regle of rules) {
            const tabNewRule = new Grille(
                grille.grid.length,
                grille.grid[0].length
            );
            for (const literal of regle.condition.getLiterals()) {
                tabNewRule.grid[0][
                literal.position + (grille.grid[0].length - 1) / 2
                    ].signals.add(literal.signal); // Remplacement de literal.signal par literal.signal.description
            }
            for (const ruleOut of regle.outputs) {
                tabNewRule.grid[ruleOut.futureStep][
                ruleOut.neighbor + (grille.grid[0].length - 1) / 2
                    ].signals.add(ruleOut.signal); // Remplacement de ruleOut.signal par ruleOut.signal.description
            }
            const newRegles = [...regles, tabNewRule.grid];
            setRegles(newRegles);
        }
    }

    function getInputsFromDNF(DNF: DNFClause): Cellule [][][] {
        const inputs: Cellule[][][] = [];
        for (let conj = 0; conj < DNF.subclauses.length; conj++) {
            const conjunction = DNF.subclauses[conj]
            inputs.push(new Grille(grille.grid.length, grille.grid[0].length).grid);
            for (let i = 0; i < conjunction.subclauses.length; i++) {
                for (let cellidx = 0; cellidx < grille.grid[0].length; cellidx++) {
                    for (const literal of conjunction.subclauses[i].getLiterals()) {
                        //PAS BIEN : cellidx - rayon
                        if (literal.position === cellidx - 2) {
                            //TODO : la négation ?
                            inputs[conj][i][cellidx].signals.add(literal.signal)
                        }
                    }
                }
            }
        }
        return inputs;
    }

    function getRuleGridFromBool(regleBool: Rule): Cellule[][] {
        const ruleGrid: Cellule[][] = new Grille(grille.grid.length, grille.grid[0].length).grid;
        for (const literal of regleBool.condition.getLiterals()) {
            for (let cellidx = 0; cellidx < grille.grid[0].length; cellidx++) {
                if (literal.position === cellidx - 2) {
                    //TODO : la négation !
                    ruleGrid[0][cellidx].signals.add(literal.signal)
                }
            }
        }
        for (const ruleOut of regleBool.outputs){
            for (let cellidx=0; cellidx<grille.grid[1].length;cellidx++ ){
                if (ruleOut.neighbor===cellidx - 2){
                    //PAS BIEN : on prend pas en compte si une grille plus grande
                    ruleGrid[1][cellidx].signals.add(ruleOut.signal)
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
        addRuleFromString,
    };
};

export default ManagerRegles;

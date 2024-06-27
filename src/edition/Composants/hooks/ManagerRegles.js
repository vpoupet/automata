import {useEffect, useState, useCallback} from 'react';
import {Clause, Conjunction, Literal, Negation} from "../../../classes/Clause.ts";
import {Automaton, Rule, RuleOutput} from "../../../classes/Automaton.ts";
import signal from "../../Objets/Signal.js";


const ManagerRegles = (grille, setAutomaton, setReglesbools, reglesbools, regles, setRegles, activeRules) => {

    const handleSaveRule = (cellOutput=[], pos = Number.MIN_SAFE_INTEGER) => {
        let configuration;
        if (cellOutput.length!==0 && pos !== Number.MIN_SAFE_INTEGER){
            configuration = grille.grid[0].map(caseObj =>
                caseObj.signals.map(signal =>
                signal.getValue()))
            //j'ai ajouté à la config la premiere ligne de la grille
            //je dois maintenant rajouter des cases VIDES excepté cellOutput que je met à la position pos
            for (let i = 1; i < grille.grid.length; i++) {
                if (i===pos){
                    configuration.push(cellOutput);
                }
                else {
                    configuration.push(new Array(grille.grid[0].length).fill([]));
                }
            }

        }
        else {
            configuration = grille.grid.map(row =>
                row.map(caseObj =>
                    caseObj.signals.map(signal =>
                        signal.getValue()))
            );
        }
        if (!regles.some(config => JSON.stringify(config) === JSON.stringify(configuration))) {
            const newRegles = [...regles, configuration];
            setRegles(newRegles);
            setReglesbools(newRegles.map(creerReglebool));
        }
    };

    const modifyRule = () => {
        //--------------------------------- La on vérifie si tous les signaux de la grille ont une origine connue -------------------------------------------------------------\\

        // si ce n'est pas le cas on créé une règle !

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
                    //pour chaque signaux de la cellule
                    for (let i=0; i<activeRulesOnly.length; i++){
                        //si le signal est déjà utilisé dans une règle
                        if (activeRulesOnly[i][rows][cell].includes(signal)) {
                            signalIsUsed.push(true);
                        }
                    }
                    if (!signalIsUsed) {
                        console.log('le signal ' + signal + " n'est pas utilisé dans les règles actives, ajout d'une règle !");
                        handleSaveRule()
                    }
                });
            }
        }

        //------------------------------------ La on vérifie si tout les signaux des règles ont été appliqués ------------------------------------------------------------\\
        // si ce n'est pas le cas on modifie les inputs des règles en questions pour rajouter la négation des nouveaux signaux

        let modif = [];
        for (let i = 0; i < activeRules.length; i++) {
            if (activeRules[i]) {
                for (let rows = 1; rows < grille.grid.length; rows++) {
                    for (let cell = 0; cell < grille.grid[0].length; cell++) {
                        regles[i][rows][cell].forEach(signal => {
                            if (grille.grid[rows][cell].signals.map(s => s.getValue()).includes(signal)) {
                                console.log('le signal ' + signal + ' est toujours présent dans la grille');
                            } else {
                                console.log('le signal ' + signal + " n'est pas présent dans l'output, la regle n° ", i, "à l'emplacement : ligne : ", rows, 'colonne : ', cell, "  !!! n'est pas contente !!!");
                                modif.push({signal: signal, row: rows, col: cell, numregle: i});
                            }
                        });
                    }
                }
            }
        }
        if (modif.length !== 0) {
            console.log('il y a des modifications à faire');
            console.log(modif.length)
            //on prend la clause de la grilleInteractive
            let conditionNegative = new Negation(creerClause(grille.grid[0]));
            //on prend la reglebool de chaque regle dans modif, on extrait leurs clauses
            let bools = ([{numregle: 0, clause : Clause}])
            for (let i=0; i<modif.length; i++) {
                bools.push({numregle: modif[i].numregle, clause: reglesbools[modif[i].numregle].clause});
            }
            //on y ajoute la négation de l'?ensemble?  de l'input actuel (on le fait à chaque regle concernée)
            // Todo : pas la négation de l'ensemble, juste de ce qui est nouveau dans l'input de chaque regle (et non ca et non ca et non ca)
            bools.map((bool) => {
                bool.clause= new Conjunction([bool.clause, conditionNegative]);
            });
            //on modifie les règles dont le num est dans modif

        }

        //vérifier si l'output a changé (une fois suffit, si oui on continu)

        //si l'output est pas la pour n'importe laquelle on ajoute négation à la règle en question

        //si l'output est la/pas la pour chaque règle on ajoute negation
        //à chacune des règles et on ajoute nouvelle règle pour l'output spécifique
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
        modifyRule
    };
};

export default ManagerRegles;
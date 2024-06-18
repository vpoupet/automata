import {useEffect, useState} from 'react';
import {Conjunction, Literal, Negation} from "../../../classes/Clause.ts";
import {Automaton, Rule, RuleOutput} from "../../../classes/Automaton.ts";

const ManagerRegles = (grille) => {
    const [regles, setRegles] = useState([]);
    const [reglesArithmetiques, setReglesArithmetiques] = useState([]);

    const handleSaveRule = () => {
        const configuration = grille.grid.map(row =>
            row.map(caseObj => caseObj.signals.map(signal => signal.getValue()))
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
            row.map(caseObj => caseObj.signals.map(signal => signal.getValue()))
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


    //todo : la position du literal ne peut pas être la valeur de sa position actuellement, il faut décaler les valeurs pour que le 0 soit au centre de la grille
    const creerClause = (tab) => {
        const clauses = [];
        tab.forEach((cell, poscell) => {
            if (cell.length > 0) {
                for (let i = 0; i < cell.length; i++) {
                    let literals = new Literal(Symbol.for(cell[i]),poscell);
                    // Il faudra gérer la négation avec un attribut sur le signal (ça sera plus simple)!
                    // if (cell[i][0] === '!') {
                    //     literals = new Negation(literals);
                    // }
                    clauses.push(literals);
                }
            }
        });
        return new Conjunction(clauses);
    }

    //todo : vérifier le nombre de futur step possible (les signaux envoyés dans le futur très futuriste)
    const creerOutput = (tab) => {
        const outputs = [];
        tab.forEach((row, rowIndex) => {
            row.forEach((cellule, colIndex) => {
                const ruleoutput = cellule.map(signal => new RuleOutput(colIndex, Symbol.for(signal),rowIndex ));
                outputs.push(...ruleoutput);
            });
        });
        return outputs;
    }

    const creerRegleArithmetique = (regle) => {
        const clausePart = regle.slice(0, 1);
        const outputPart = regle.slice(1);
        //todo : slice uniquement pour les string.. il faut créer une classe règle ou tout faire avec Rule
        //d'abord on place en position [0] l'output, on le centre au max
        const clause = creerClause(clausePart);
        const outputs = creerOutput(outputPart);
        if (outputs.length === 0 && clause.subclauses.length === 0) {
            console.error("Aucun signal n'a été trouvée.");
            return;
        }
        console.log("Conditions : " + clause)
        console.log("Outputs : " + outputs)
        return new Rule(clause, outputs);
    };



    const applyRules = () => {
        // pour chaque règle arithmétique qu'on a créé, on regardera le nbr de voisins,
        // cad les cellules qui ont un signal (c'est la distance la plus importante qui nous interesse vraiment)

        //on donne les règles à l'automaton
        const auto = new Automaton();

        //Automaton.makeDiagram();
    }

    useEffect(() => {
        setReglesArithmetiques(regles.map(creerRegleArithmetique));
        applyRules();
        }, [regles]);


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
        deleteRule
    };
};

export default ManagerRegles;

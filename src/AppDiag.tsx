import { useState } from "react";
import "./AppDiag.css";
import "./style/style.scss";
import { Diagram } from "./components/Diagram";
import { Rulebox } from "./components/Rulebox";
import { Settings } from "./components/Settings";
import { Automaton } from "./classes/Automaton";
import { Configuration } from "./classes/Configuration";
import { SettingsInterface } from "./types";

export default function App() {
    const initialRules = `\
# Fischer's prime numbers sieve cellular automaton

Init:
  Rail
  0/2.Horizontal
  0/0.HalfSlope
Rail:
  Rail
Horizontal:
  !HalfSlope: 1.Horizontal
  HalfSlope: 1.Rail 0/2.Vertical 1.HalfSlope
HalfSlope:
  !Horizontal: 1/3.HalfSlope
Vertical:
  0/0.Multiple
  !Rail: -1.Vertical
  Rail: 1.Horizontal
Multiple:
  0/0.Mark
  !Rail: -1.Multiple
  Rail: +1.Rebound
Rebound:
  !Rail: 1.Rebound
  Rail: -1.Multiple
Mark:
  -1.Mark
`;

    const [automaton, setAutomaton] = useState<Automaton>(
        new Automaton().parseRules(initialRules)
    );
    const [settings, setSettings] = useState<SettingsInterface>({
        nbCells: 40,
        nbSteps: 60,
        timeGoesUp: true,
    });

    const initialConfiguration = new Configuration(settings.nbCells);
    initialConfiguration.cells[0].addSignal(Symbol.for("Init"));

    return (
        <main>
            <h1>Signal Automaton</h1>
            <Settings settings={settings} setSettings={setSettings} />
            <Rulebox rules={initialRules} setAutomaton={setAutomaton} />
            <Diagram
                automaton={automaton}
                initialConfiguration={initialConfiguration}
                nbSteps={settings.nbSteps}
            />
        </main>
    );
}

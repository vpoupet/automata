import { SettingsInterface } from "../types";

interface SettingsProps {
    settings: SettingsInterface;
    setSettings: (settings: SettingsInterface) => void;
}
export function Settings({ settings, setSettings }: SettingsProps) {
    function updateSettings() {
        const newSettings = {
            nbCells: parseInt(
                (document.getElementById("nbCells") as HTMLInputElement).value
            ),
            nbSteps: parseInt(
                (document.getElementById("nbSteps") as HTMLInputElement).value
            ),
            timeGoesUp: (
                document.getElementById("timeGoesUp") as HTMLInputElement
            ).checked,
        };
        setSettings(newSettings);
    }
    return (
        <div className="settings">
            <h2>Settings</h2>
            <input id="nbCells" type="number" defaultValue={settings.nbCells} />
            <span>Number of cells</span>
            <input id="nbSteps" type="number" defaultValue={settings.nbSteps} />
            <span>Number of rows</span>
            <input
                id="timeGoesUp"
                type="checkbox"
                defaultChecked={settings.timeGoesUp}
            />
            <span>Time goes up</span>
            <button onClick={updateSettings}>Update</button>
        </div>
    );
}

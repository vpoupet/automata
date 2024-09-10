import { createContext } from 'react';

export interface SettingsInterface {
    gridRadius: number;
    gridNbFutureSteps: number;
    nbCells: number;
    nbSteps: number;
    timeGoesUp: boolean;
}

export const defaultSettings: SettingsInterface = {
    gridRadius: 3,
    gridNbFutureSteps: 4,
    nbCells: 40,
    nbSteps: 60,
    timeGoesUp: true
};

export const SettingsContext = createContext(defaultSettings);

import { Cell } from "./classes/Cell";

export type Signal = symbol;
export type Neighborhood = { [key: number]: Cell };
export type DiagramCell = { signals: Set<Signal> };
export type Coordinates = { row: number; col: number };
export interface SettingsInterface {
    gridRadius: number;
    gridNbFutureSteps: number;
    nbCells: number;
    nbSteps: number;
    timeGoesUp: boolean;
}

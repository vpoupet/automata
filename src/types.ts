import { Cell } from "./classes/Cell";

export type Signal = symbol;
export type Neighborhood = { [key: number]: Cell };
export type DiagramCell = { signals: Set<Signal> };
export type Coordinates = { row: number; col: number, isInput : boolean};
export interface SettingsInterface {
    nbCells: number;
    nbSteps: number;
    timeGoesUp: boolean;
}

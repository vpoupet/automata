import { Cell } from "./Cell";

export type Signal = symbol;
export type Neighborhood = { [key: number]: Cell };
export type DiagramCell = { signals: Set<Signal> };
export type Coordinates = { row: number; col: number };
export interface SettingsInterface {
    nbCells: number;
    nbSteps: number;
    timeGoesUp: boolean;
}

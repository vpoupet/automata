import Vector from "./classes/Vector";

export type Signal = symbol;
export type DiagramCell = { signals: Set<Signal> };
export type Site = { pos: Vector; time: number };

export interface SettingsInterface {
    dimension: 1 | 2;
    gridRadius: number;
    gridNbFutureSteps: number;
    nbCells: number;
    nbSteps: number;
    timeGoesUp: boolean;
}

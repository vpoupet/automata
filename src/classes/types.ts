export type Signal = symbol;
export type Neighborhood = { [key: number]: Set<Signal> };
export type DiagramCell = { signals: Set<Signal> };
export type Coordinates = { row: number; col: number };
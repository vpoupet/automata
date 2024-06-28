import {Literal} from "./Clause.ts";

export type Signal = symbol;
export type Neighborhood = { [key: number]: Set<Signal> };
export type SignedLiteral = {
    literal: Literal;
    sign: boolean;
}
import { EvalContext } from "../Clause";
import { Rule } from "../Rule";
import {
    TransformationOutput,
    TransformationParameter,
} from "./Transformation";

export function dummy(
    rules: Rule[],
    context: EvalContext,
    _parameters: TransformationParameter[]
): TransformationOutput {
    return {
        rules: rules,
        context: context,
    };
}

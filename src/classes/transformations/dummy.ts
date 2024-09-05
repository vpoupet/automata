import { EvalContext } from "../Clause";
import Rule from "../Rule";
import {
    TransformationOutput,
    TransformationParameter,
} from "./Transformation";

export default function dummy(
    rules: Rule[],
    context: EvalContext,
    _parameters: TransformationParameter[]
): TransformationOutput {
    return {
        rules: rules,
        context: context,
    };
}

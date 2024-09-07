import Clause, {
    Conjunction,
    Disjunction,
    Literal,
    Negation,
} from "../classes/Clause";
import Rule, { RuleOutput } from "../classes/Rule";
import { Signal } from "../types";
import SignalName from "./SignalName";

interface RuleComponentProps {
    rule: Rule;
    colorMap: Map<Signal, string>;
}

export default function RuleComponent(props: RuleComponentProps) {
    const { rule, colorMap } = props;

    return (
        <div className="font-black text-2xl">
            <ClauseComponent clause={rule.condition} colorMap={colorMap} /> →
            {rule.outputs.map((output, index) => (
                <RuleOutputComponent
                    key={index}
                    output={output}
                    colorMap={colorMap}
                />
            ))}
        </div>
    );
}

interface ClauseComponentProps {
    clause: Clause;
    colorMap: Map<Signal, string>;
}

function ClauseComponent(props: ClauseComponentProps) {
    const { clause, colorMap } = props;

    if (clause instanceof Literal) {
        const signString = clause.sign ? "" : "¬";
        const positionString =
            clause.position !== 0 ? `${clause.position}.` : "";
        return (
            <span className="mx-1">
                {positionString}
                {signString}
                <SignalName
                    signal={clause.signal}
                    colorMap={colorMap}
                    className="text-base font-normal relative -top-1"
                />
            </span>
        );
    } else if (clause instanceof Negation) {
        return (
            <span className="mx-1">
                !
                <ClauseComponent
                    clause={clause.subclause}
                    colorMap={colorMap}
                />
            </span>
        );
    } else if (clause instanceof Conjunction) {
        return (
            <span className="mx-1">
                (
                {clause.subclauses.map((c, index) => (
                    <>
                        {index > 0 ? "∧" : ""}
                        <ClauseComponent
                            key={index}
                            clause={c}
                            colorMap={colorMap}
                        />
                    </>
                ))}
                )
            </span>
        );
    } else if (clause instanceof Disjunction) {
        return (
            <span className="mx-1">
                [
                {clause.subclauses.map((c, index) => (
                    <>
                        {index > 0 ? "∨" : ""}
                        <ClauseComponent
                            key={index}
                            clause={c}
                            colorMap={colorMap}
                        />
                    </>
                ))}
                ]
            </span>
        );
    } else {
        return <div>Unknown clause type</div>;
    }
}

interface RuleOutputComponentProps {
    output: RuleOutput;
    colorMap: Map<Signal, string>;
}

function RuleOutputComponent(props: RuleOutputComponentProps) {
    const { output, colorMap } = props;
    const positionString = output.neighbor !== 0 ? `${output.neighbor}` : "";
    const futureStepString =
        output.futureStep !== 1 ? `/${output.futureStep}` : "";
    const dotString =
        positionString !== "" || futureStepString !== "" ? "." : "";

    return (
        <span className="mx-1">
            <span className="font-mono font-bol">
                {positionString}
                {futureStepString}
                {dotString}
            </span>
            <SignalName
                signal={output.signal}
                colorMap={colorMap}
                className="text-base font-normal relative -top-1"
            />
        </span>
    );
}

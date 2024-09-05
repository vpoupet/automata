import Rule from "../classes/Rule";

interface RuleComponentProps {
    rule: Rule;
}
export default function RuleComponent(props: RuleComponentProps) {
    const { rule } = props;

    return <div>{rule.toString()}</div>;
}

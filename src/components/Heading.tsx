interface HeaderProps {
    level: number;
    children: React.ReactNode;
}

export function Heading(props: HeaderProps) {
    const { level, children } = props;

    switch (level) {
        case 1:
            return <h1 className="text-5xl font-extrabold mb-8">{children}</h1>;
        case 2:
            return <h2 className="text-4xl font-bold mb-4">{children}</h2>;
        case 3:
            return <h3 className="text-3xl font-bold">{children}</h3>;
        case 4:
            return <h4 className="text-2xl font-bold">{children}</h4>;
        case 5:
            return <h5 className="text-xl font-bold">{children}</h5>;
        default:
            return <h6 className="text-lg font-bold">{children}</h6>;
    }
}
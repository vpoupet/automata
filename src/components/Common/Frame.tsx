interface FrameProps {
    variant?: "white" | "gray";
    className?: string;
    children: React.ReactNode;
}

export default function Frame(props: FrameProps): JSX.Element {
    const { variant = "white", className, children } = props;
    let frameClassName;
    switch (variant) {
        case "white":
            frameClassName = "bg-white shadow-md p-4 border border-gray-300";
            break;
        case "gray":
            frameClassName = "shadow-md p-2 bg-gray-100 border border-gray-300";
            break;
    }

    return (
        <div
            className={frameClassName + " " + className}
        >
            {children}
        </div>
    );
}

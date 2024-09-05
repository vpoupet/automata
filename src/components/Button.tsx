type ButtonVariant = "primary" | "secondary" | "pill";

interface ButtonProps {
    variant?: ButtonVariant;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

export default function Button(props: ButtonProps) {
    const { variant = "primary", disabled = false, onClick, children } = props;
    let className;
    switch (variant) {
        case "primary":
            if (disabled) {
                className =
                    "bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed";
            } else {
                className =
                    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow";
            }
            break;
        case "secondary":
            className =
                "bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow";
            break;
        case "pill":
            className =
                "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow";
            break;
    }
    return (
        <button className={className} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}

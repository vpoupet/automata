type ButtonVariant = "primary" | "secondary" | "pill";

interface ButtonProps {
    variant?: ButtonVariant;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
    children: React.ReactNode;
}

export default function Button(props: ButtonProps) {
    const {
        variant = "primary",
        disabled = false,
        onClick,
        type = "button",
        className,
        children,
    } = props;
    let className_ = className || "";
    switch (variant) {
        case "primary":
            if (disabled) {
                className_ +=
                    " bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed";
            } else {
                className_ +=
                    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow";
            }
            break;
        case "secondary":
            className_ +=
                "bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow";
            break;
        case "pill":
            className_ +=
                "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow";
            break;
    }
    return (
        <button
            type={type}
            className={className_}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

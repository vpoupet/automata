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
        className = "",
        children,
    } = props;
    
    let buttonClassName;
    switch (variant) {
        case "primary":
            if (disabled) {
                buttonClassName =
                    " bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed";
            } else {
                buttonClassName =
                    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow";
            }
            break;
        case "secondary":
            buttonClassName =
                "bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow";
            break;
        case "pill":
            buttonClassName =
                "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow";
            break;
    }
    return (
        <button
            type={type}
            className={buttonClassName + " " + className}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

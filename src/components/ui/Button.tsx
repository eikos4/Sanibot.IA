import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    fullWidth = false,
    style,
    ...props
}) => {
    const baseStyle: React.CSSProperties = {
        padding: "14px 20px",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        border: "none",
        transition: "all 0.2s ease",
        display: "inline-flex", // Better for icons
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: fullWidth ? "100%" : "auto",
        ...style,
    };

    const variants = {
        primary: {
            background: "#1F4FFF",
            color: "white",
        },
        secondary: {
            background: "#EEF2FF",
            color: "#1F4FFF",
        },
        danger: {
            background: "#FEE2E2",
            color: "#EF4444",
        },
        success: {
            background: "#D1FAE5",
            color: "#059669",
        },
        ghost: {
            background: "transparent",
            color: "#666",
        },
    };

    return (
        <button style={{ ...baseStyle, ...variants[variant] }} {...props}>
            {children}
        </button>
    );
};

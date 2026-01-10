import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    padding?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    padding = "20px",
    style,
    ...props
}) => {
    return (
        <div
            style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.03)",
                padding,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};

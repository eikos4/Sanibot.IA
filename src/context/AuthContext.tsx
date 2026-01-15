import React, { createContext, useContext, useState, useEffect } from "react";

// Simple local user type
interface LocalUser {
    id: string;
    name: string;
    email: string;
    role: "patient" | "caretaker" | "admin";
}

interface AuthContextType {
    user: LocalUser | null;
    isLoading: boolean;
    logout: () => void;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<LocalUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = () => {
        const savedUser = localStorage.getItem("glucobot_current_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            setUser(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        // Check localStorage for current user on mount
        refreshUser();

        // Listen for storage changes (for multi-tab support)
        const handleStorage = () => refreshUser();
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const logout = () => {
        localStorage.removeItem("glucobot_current_user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

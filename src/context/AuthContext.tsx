import React, { createContext, useContext, useState, useEffect } from "react";
import { login as authLogin, logout as authLogout, getCurrentUser } from "../services/authService";
import type { User } from "../services/authService";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password?: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for persisted session on mount
        const savedUser = getCurrentUser();
        if (savedUser) {
            setUser(savedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password?: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const user = await authLogin(username, password);
            if (user) {
                setUser(user);
                return true;
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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

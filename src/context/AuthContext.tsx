import React, { createContext, useContext, useState, useEffect } from "react";
import { login as authLogin, logout as authLogout, subscribeToAuthChanges, loginWithGoogle as authLoginGoogle } from "../services/authService";
import type { User } from "../services/authService";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password?: string) => Promise<User | null>;
    loginWithGoogle: () => Promise<User | null>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Subscribe to Firebase Auth state
        const unsubscribe = subscribeToAuthChanges((firebaseUser: User | null) => {
            setUser(firebaseUser);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const login = async (username: string, password?: string): Promise<User | null> => {
        setIsLoading(true);
        try {
            const user = await authLogin(username, password);
            // State update handled by subscription
            return user;
        } catch (e) {
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (): Promise<User | null> => {
        setIsLoading(true);
        try {
            const user = await authLoginGoogle();
            return user;
        } catch (e) {
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await authLogout();
        // State update handled by subscription
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout }}>
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

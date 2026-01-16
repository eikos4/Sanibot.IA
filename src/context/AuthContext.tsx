import React, { createContext, useContext, useState, useEffect } from "react";
import { subscribeToAuthChanges, logout as serviceLogout, getCachedUser } from "../services/authService";
import type { User } from "../services/authService";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => void;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize with cached user for immediate display
    const [user, setUser] = useState<User | null>(() => getCachedUser());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Subscribe to Firebase Auth changes
        const unsubscribe = subscribeToAuthChanges((currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });

        // Timeout to avoid infinite loading if Firebase never responds
        const timeout = setTimeout(() => {
            if (isLoading) {
                console.warn("Auth state check timed out, using cached user");
                setIsLoading(false);
            }
        }, 10000); // 10 second timeout

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const logout = () => {
        serviceLogout();
        setUser(null);
    };

    const refreshUser = () => {
        // Trigger a re-subscribe if needed
        // For now, Firebase listener handles this automatically
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

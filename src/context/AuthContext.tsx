import React, { createContext, useContext, useState, useEffect } from "react";
import { subscribeToAuthChanges, logout as serviceLogout } from "../services/authService";
import type { User } from "../services/authService";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => void;
    refreshUser: () => void; // Kept for interface compatibility but might be less needed with realtime auth
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Subscribe to Firebase Auth changes
        const unsubscribe = subscribeToAuthChanges((currentUser) => {
            setUser(currentUser);
            setIsLoading(false);

            // Sync local storage for non-auth-context needs (redundancy)
            if (currentUser) {
                localStorage.setItem("glucobot_current_user", JSON.stringify(currentUser));
            } else {
                localStorage.removeItem("glucobot_current_user");
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = () => {
        serviceLogout();
        setUser(null);
        localStorage.removeItem("glucobot_current_user");
    };

    const refreshUser = () => {
        // With Firebase listener, manual refresh is rarely needed unless we want to re-fetch profile doc explicitly
        // For now, we rely on the listener update or we could implement re-fetch logic in authService
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

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    user: { email: string; username?: string } | null;
    token: string | null;
    login: (user: { email: string; username?: string }, token: string) => void;
    logout: () => void;
}

const defaultContextValue: AuthContextType = {
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<{ email: string; username?: string } | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        console.log("AuthProvider - Stored User:", storedUser); // Debug: Log stored user
        console.log("AuthProvider - Stored Token:", storedToken); // Debug: Log stored token
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
    }, []);

    const login = (user: { email: string; username?: string }, token: string) => {
        console.log("AuthProvider - Setting user:", user, "token:", token); // Debug: Log login values
        setUser(user);
        setToken(token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
    };

    const logout = () => {
        console.log("AuthProvider - Logging out"); // Debug: Log logout
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const contextValue: AuthContextType = { user, token, login, logout };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

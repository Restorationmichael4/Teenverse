import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        console.log("AuthProvider - Initial load - Stored User:", storedUser);
        console.log("AuthProvider - Initial load - Stored Token:", storedToken);

        if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            console.log("AuthProvider - Verifying token for user:", parsedUser);
            axios.get("https://teenverse.onrender.com/api/users/me", {
                headers: { Authorization: `Bearer ${storedToken}` }
            })
                .then((res) => {
                    console.log("AuthProvider - Token verified, user data:", res.data);
                    setUser(res.data);
                    setToken(storedToken);
                })
                .catch((err) => {
                    console.error("AuthProvider - Token verification failed:", err.response?.data || err.message);
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    setUser(null);
                    setToken(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            console.log("AuthProvider - No stored user or token found");
            setLoading(false);
        }
    }, []);

    const login = (user: { email: string; username?: string }, token: string) => {
        console.log("AuthProvider - Login called with user:", user, "token:", token);
        setUser(user);
        setToken(token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
    };

    const logout = () => {
        console.log("AuthProvider - Logging out");
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const contextValue: AuthContextType = { user, token, login, logout };

    if (loading) {
        return <div>Loading authentication...</div>;
    }

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

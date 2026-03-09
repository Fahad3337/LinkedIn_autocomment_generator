"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase";

interface AuthUser {
    id: string;
    email: string;
    full_name: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<AuthUser | null>(null);
    const [token, setToken] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    // Rehydrate from localStorage on mount
    React.useEffect(() => {
        const stored = localStorage.getItem("cf_session");
        if (stored) {
            try {
                const session = JSON.parse(stored);
                setUser(session.user);
                setToken(session.token);
            } catch {
                localStorage.removeItem("cf_session");
            }
        }
        setLoading(false);
    }, []);

    async function login(email: string, password: string) {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Login failed");

        const userData: AuthUser = json.data.user;
        const accessToken = json.data.session.access_token;

        setUser(userData);
        setToken(accessToken);
        localStorage.setItem("cf_session", JSON.stringify({ user: userData, token: accessToken }));
    }

    async function signup(email: string, password: string, fullName: string) {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, full_name: fullName }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Signup failed");

        const userData: AuthUser = json.data.user;
        const accessToken = json.data.session.access_token;

        setUser(userData);
        setToken(accessToken);
        localStorage.setItem("cf_session", JSON.stringify({ user: userData, token: accessToken }));
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("cf_session");
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

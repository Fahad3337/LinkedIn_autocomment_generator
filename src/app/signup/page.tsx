"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const { signup, user, loading } = useAuth();
    const router = useRouter();
    const [fullName, setFullName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (!loading && user) router.push("/dashboard");
    }, [user, loading, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await signup(email, password, fullName);
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Signup failed");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#060D1A] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-8">
                        <img src="/logo.png" alt="CommentFlow" className="h-14 w-14 rounded-xl shadow-lg shadow-[#1A6EF5]/20 object-cover" />
                    </div>
                    <span className="text-2xl font-bold text-[#EDF2FB]">CommentFlow</span>
                    <p className="text-[#7A94BB]">Create your account</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-8 space-y-5"
                >
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[#7A94BB] mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] placeholder-[#3D5A8A] focus:outline-none focus:border-[#1A6EF5] transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#7A94BB] mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] placeholder-[#3D5A8A] focus:outline-none focus:border-[#1A6EF5] transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#7A94BB] mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-2.5 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] placeholder-[#3D5A8A] focus:outline-none focus:border-[#1A6EF5] transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-[#1A6EF5] hover:bg-[#2D7FF6] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {submitting ? "Creating account..." : "Create Account"}
                    </button>

                    <p className="text-center text-sm text-[#7A94BB]">
                        Already have an account?{" "}
                        <a href="/login" className="text-[#4DB8FF] hover:underline">
                            Sign in
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}

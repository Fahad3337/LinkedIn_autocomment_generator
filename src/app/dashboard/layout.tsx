"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    FileText,
    Megaphone,
    Clock,
    LogOut,
    Menu,
    X,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/templates", label: "Templates", icon: FileText },
    { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/dashboard/history", label: "History", icon: Clock },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    React.useEffect(() => {
        if (!loading && !user) router.push("/login");
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#060D1A] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-[#1A6EF5] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    function handleLogout() {
        logout();
        router.push("/login");
    }

    return (
        <div className="min-h-screen bg-[#060D1A] flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0A1628] border-r border-[#1A3A6B]/40 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* Logo */}
                <div className="h-20 flex items-center px-6 border-b border-[#1A3A6B]/40">
                    <img src="/logo.png" alt="CommentFlow" className="h-12 w-12 rounded-xl shadow-md shadow-[#1A6EF5]/10 object-cover" />
                    <span className="ml-3 text-xl font-bold text-[#EDF2FB] tracking-tight">CommentFlow</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-[#1A6EF5]/10 text-[#4DB8FF] border border-[#1A6EF5]/20"
                                    : "text-[#7A94BB] hover:bg-[#0F2040] hover:text-[#EDF2FB]"
                                    }`}
                            >
                                <item.icon className="h-4.5 w-4.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-[#1A3A6B]/40">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1A6EF5] to-[#4DB8FF] flex items-center justify-center text-xs font-bold text-white">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#EDF2FB] truncate">
                                {user.full_name || user.email}
                            </p>
                            <p className="text-xs text-[#3D5A8A] truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#7A94BB] hover:bg-[#0F2040] hover:text-red-400 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Topbar (mobile) */}
                <header className="h-16 flex items-center gap-4 px-6 border-b border-[#1A3A6B]/40 lg:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="text-[#7A94BB]">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="text-lg font-bold text-[#EDF2FB]">CommentFlow</span>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
            </div>
        </div>
    );
}

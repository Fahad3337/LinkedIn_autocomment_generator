"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, MessageSquare, Users, Zap, ArrowUpRight } from "lucide-react";

interface Stats {
    active_campaigns: number;
    total_campaigns: number;
    total_deliveries: number;
    success_count: number;
    failed_count: number;
    success_rate: number;
    dms_sent: number;
    connections_requested: number;
    last_7_days: number;
}

export default function DashboardOverview() {
    const { token } = useAuth();
    const [stats, setStats] = React.useState<Stats | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!token) return;
        fetch("/api/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((json) => setStats(json.data))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-2 border-[#1A6EF5] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const cards = [
        {
            title: "Total DMs Sent",
            value: stats?.dms_sent ?? 0,
            icon: MessageSquare,
            color: "from-[#1A6EF5] to-[#4DB8FF]",
        },
        {
            title: "Connections Requested",
            value: stats?.connections_requested ?? 0,
            icon: Users,
            color: "from-[#7C3AED] to-[#A855F7]",
        },
        {
            title: "Success Rate",
            value: `${stats?.success_rate ?? 0}%`,
            icon: TrendingUp,
            color: "from-[#10B981] to-[#34D399]",
        },
        {
            title: "Active Campaigns",
            value: stats?.active_campaigns ?? 0,
            icon: Zap,
            color: "from-[#F59E0B] to-[#FBBF24]",
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#EDF2FB]">Dashboard</h1>
                <p className="text-[#7A94BB] mt-1">Your LinkedIn automation at a glance</p>
            </div>

            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-5 hover:border-[#1A6EF5]/40 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-[#7A94BB]">{card.title}</span>
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                                <card.icon className="h-4.5 w-4.5 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[#EDF2FB]">{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Summary row */}
            <div className="grid sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-5">
                    <span className="text-sm text-[#7A94BB]">Total Deliveries</span>
                    <div className="text-2xl font-bold text-[#EDF2FB] mt-1">{stats?.total_deliveries ?? 0}</div>
                </div>
                <div className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-5">
                    <span className="text-sm text-[#7A94BB]">Last 7 Days</span>
                    <div className="text-2xl font-bold text-[#4DB8FF] mt-1">{stats?.last_7_days ?? 0}</div>
                </div>
                <div className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-5">
                    <span className="text-sm text-[#7A94BB]">Failed</span>
                    <div className="text-2xl font-bold text-red-400 mt-1">{stats?.failed_count ?? 0}</div>
                </div>
            </div>

            {/* Extension Connection Key */}
            <div className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-[#1A6EF5]/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-[#4DB8FF]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#EDF2FB]">Chrome Extension Setup</h2>
                        <p className="text-sm text-[#7A94BB]">Paste this key into the CommentFlow Chrome extension to connect your account.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <input
                        type="password"
                        readOnly
                        value={token || ""}
                        className="flex-1 px-4 py-2.5 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] font-mono text-sm focus:outline-none"
                    />
                    <button
                        onClick={() => {
                            if (token) {
                                navigator.clipboard.writeText(token);
                                alert("Copied to clipboard!");
                            }
                        }}
                        className="px-6 py-2.5 bg-[#1A6EF5] hover:bg-[#2D7FF6] text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                        Copy Key
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DeliveryLog {
    id: string;
    commenter_name: string;
    commenter_profile_url: string;
    event_type: string;
    status: string;
    error_message: string | null;
    created_at: string;
    campaigns: { post_url: string; post_title: string | null } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export default function HistoryPage() {
    const { token } = useAuth();
    const [logs, setLogs] = React.useState<DeliveryLog[]>([]);
    const [pagination, setPagination] = React.useState<Pagination | null>(null);
    const [page, setPage] = React.useState(1);
    const [loading, setLoading] = React.useState(true);

    async function fetchHistory(p: number) {
        setLoading(true);
        const res = await fetch(`/api/dashboard/history?page=${p}&limit=15`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setLogs(json.data?.logs || []);
        setPagination(json.data?.pagination || null);
        setLoading(false);
    }

    React.useEffect(() => {
        if (token) fetchHistory(page);
    }, [token, page]);

    const eventLabels: Record<string, { label: string; style: string }> = {
        dm_sent: { label: "DM Sent", style: "bg-[#1A6EF5]/10 text-[#4DB8FF]" },
        connection_requested: { label: "Connection", style: "bg-purple-500/10 text-purple-400" },
        reply_posted: { label: "Reply", style: "bg-emerald-500/10 text-emerald-400" },
    };

    const statusStyles: Record<string, string> = {
        success: "text-emerald-400",
        failed: "text-red-400",
        pending: "text-yellow-400",
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#EDF2FB]">Delivery History</h1>
                <p className="text-[#7A94BB] mt-1">
                    All delivery events logged by the extension
                    {pagination ? ` · ${pagination.total} total` : ""}
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="h-8 w-8 border-2 border-[#1A6EF5] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-16 text-[#7A94BB]">
                    <p className="text-lg mb-2">No delivery events yet</p>
                    <p className="text-sm">Events will appear here once the Chrome extension starts sending.</p>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#1A3A6B]/40">
                                        <th className="text-left px-5 py-3 text-[#7A94BB] font-medium">Commenter</th>
                                        <th className="text-left px-5 py-3 text-[#7A94BB] font-medium">Type</th>
                                        <th className="text-left px-5 py-3 text-[#7A94BB] font-medium">Status</th>
                                        <th className="text-left px-5 py-3 text-[#7A94BB] font-medium">Campaign</th>
                                        <th className="text-left px-5 py-3 text-[#7A94BB] font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b border-[#1A3A6B]/20 hover:bg-[#0A1628]/50">
                                            <td className="px-5 py-3">
                                                <a
                                                    href={log.commenter_profile_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#EDF2FB] hover:text-[#4DB8FF] transition-colors"
                                                >
                                                    {log.commenter_name}
                                                </a>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${eventLabels[log.event_type]?.style || ""}`}>
                                                    {eventLabels[log.event_type]?.label || log.event_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={statusStyles[log.status] || "text-[#7A94BB]"}>
                                                    {log.status}
                                                </span>
                                                {log.error_message && (
                                                    <p className="text-xs text-red-400/70 mt-0.5">{log.error_message}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-[#7A94BB] max-w-[200px] truncate">
                                                {log.campaigns?.post_title || "—"}
                                            </td>
                                            <td className="px-5 py-3 text-[#7A94BB] whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-[#7A94BB] border border-[#1A3A6B]/40 rounded-lg hover:bg-[#0F2040] disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </button>
                            <span className="text-sm text-[#7A94BB]">
                                Page {pagination.page} of {pagination.total_pages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                                disabled={page === pagination.total_pages}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-[#7A94BB] border border-[#1A3A6B]/40 rounded-lg hover:bg-[#0F2040] disabled:opacity-40 transition-colors"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

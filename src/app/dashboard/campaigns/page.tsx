"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Pause, Play, ExternalLink } from "lucide-react";

interface Campaign {
    id: string;
    post_url: string;
    post_title: string | null;
    status: "active" | "paused" | "completed";
    template_name: string | null;
    delivery_count: number;
    created_at: string;
}

interface Template {
    id: string;
    name: string;
}

export default function CampaignsPage() {
    const { token } = useAuth();
    const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
    const [templates, setTemplates] = React.useState<Template[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showForm, setShowForm] = React.useState(false);
    const [form, setForm] = React.useState({ template_id: "", post_url: "", post_title: "" });

    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    async function fetchData() {
        const [campRes, tplRes] = await Promise.all([
            fetch("/api/campaigns", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/templates", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const campJson = await campRes.json();
        const tplJson = await tplRes.json();
        setCampaigns(campJson.data || []);
        setTemplates(tplJson.data || []);
        setLoading(false);
    }

    React.useEffect(() => {
        if (token) fetchData();
    }, [token]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        await fetch("/api/campaigns", { method: "POST", headers, body: JSON.stringify(form) });
        setShowForm(false);
        setForm({ template_id: "", post_url: "", post_title: "" });
        fetchData();
    }

    async function toggleStatus(id: string, currentStatus: string) {
        const newStatus = currentStatus === "active" ? "paused" : "active";
        await fetch(`/api/campaigns/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ status: newStatus }),
        });
        fetchData();
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this campaign and all its delivery logs?")) return;
        await fetch(`/api/campaigns/${id}`, { method: "DELETE", headers });
        fetchData();
    }

    const statusStyles: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        completed: "bg-[#1A3A6B]/20 text-[#7A94BB] border-[#1A3A6B]/30",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-2 border-[#1A6EF5] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#EDF2FB]">Campaigns</h1>
                    <p className="text-[#7A94BB] mt-1">Monitor your LinkedIn posts</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    disabled={templates.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1A6EF5] hover:bg-[#2D7FF6] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
                >
                    <Plus className="h-4 w-4" />
                    New Campaign
                </button>
            </div>

            {templates.length === 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 text-sm rounded-lg px-4 py-3 mb-6">
                    Create a template first before starting a campaign.
                </div>
            )}

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[#EDF2FB] mb-4">New Campaign</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-[#7A94BB] mb-1">LinkedIn Post URL</label>
                                <input
                                    value={form.post_url}
                                    onChange={(e) => setForm({ ...form, post_url: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] placeholder-[#3D5A8A] focus:outline-none focus:border-[#1A6EF5]"
                                    placeholder="https://linkedin.com/posts/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#7A94BB] mb-1">Post Title (optional)</label>
                                <input
                                    value={form.post_title}
                                    onChange={(e) => setForm({ ...form, post_title: e.target.value })}
                                    className="w-full px-3 py-2 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] placeholder-[#3D5A8A] focus:outline-none focus:border-[#1A6EF5]"
                                    placeholder="e.g. Free Guide Post"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#7A94BB] mb-1">Template</label>
                                <select
                                    value={form.template_id}
                                    onChange={(e) => setForm({ ...form, template_id: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] focus:outline-none focus:border-[#1A6EF5]"
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-[#1A6EF5] hover:bg-[#2D7FF6] text-white font-semibold rounded-lg transition-colors">
                                    Create Campaign
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-[#1A3A6B]/40 text-[#7A94BB] rounded-lg hover:bg-[#0A1628] transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Campaigns list */}
            {campaigns.length === 0 ? (
                <div className="text-center py-16 text-[#7A94BB]">
                    <p className="text-lg mb-2">No campaigns yet</p>
                    <p className="text-sm">Create your first campaign to start monitoring a LinkedIn post.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {campaigns.map((c) => (
                        <div
                            key={c.id}
                            className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-5 hover:border-[#1A6EF5]/40 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-[#EDF2FB] truncate">
                                            {c.post_title || "Untitled Campaign"}
                                        </h3>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusStyles[c.status]}`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-[#7A94BB]">
                                        <span>Template: {c.template_name || "—"}</span>
                                        <span>Deliveries: {c.delivery_count}</span>
                                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <a
                                        href={c.post_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-[#4DB8FF] hover:underline mt-2"
                                    >
                                        View post <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => toggleStatus(c.id, c.status)}
                                        className="p-1.5 text-[#7A94BB] hover:text-[#4DB8FF] transition-colors"
                                        title={c.status === "active" ? "Pause" : "Resume"}
                                    >
                                        {c.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-1.5 text-[#7A94BB] hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

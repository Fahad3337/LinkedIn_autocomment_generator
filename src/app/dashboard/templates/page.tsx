"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

interface Template {
    id: string;
    name: string;
    message: string;
    lead_magnet_url: string | null;
    is_default: boolean;
    created_at: string;
}

export default function TemplatesPage() {
    const { token } = useAuth();
    const [templates, setTemplates] = React.useState<Template[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showForm, setShowForm] = React.useState(false);
    const [editing, setEditing] = React.useState<Template | null>(null);
    const [form, setForm] = React.useState({ name: "", message: "", lead_magnet_url: "", is_default: false });

    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    async function fetchTemplates() {
        const res = await fetch("/api/templates", { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        setTemplates(json.data || []);
        setLoading(false);
    }

    React.useEffect(() => {
        if (token) fetchTemplates();
    }, [token]);

    function openCreate() {
        setEditing(null);
        setForm({ name: "", message: "", lead_magnet_url: "", is_default: false });
        setShowForm(true);
    }

    function openEdit(t: Template) {
        setEditing(t);
        setForm({ name: t.name, message: t.message, lead_magnet_url: t.lead_magnet_url || "", is_default: t.is_default });
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editing) {
            await fetch(`/api/templates/${editing.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(form),
            });
        } else {
            await fetch("/api/templates", {
                method: "POST",
                headers,
                body: JSON.stringify(form),
            });
        }
        setShowForm(false);
        fetchTemplates();
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this template?")) return;
        await fetch(`/api/templates/${id}`, { method: "DELETE", headers });
        fetchTemplates();
    }

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
                    <h1 className="text-2xl font-bold text-[#EDF2FB]">Templates</h1>
                    <p className="text-[#7A94BB] mt-1">Manage your DM message templates</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1A6EF5] hover:bg-[#2D7FF6] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Template
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[#EDF2FB] mb-4">
                            {editing ? "Edit Template" : "Create Template"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-[#7A94BB] mb-1">Name</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] placeholder-[#3D5A8A] focus:outline-none focus:border-[#1A6EF5]"
                                    placeholder="e.g. Welcome DM"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#7A94BB] mb-1">Message</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    required
                                    rows={4}
                                    className="w-full px-3 py-2 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] placeholder-[#3D5A8A] focus:outline-none focus:border-[#1A6EF5] resize-none"
                                    placeholder="Hey {{name}}! Thanks for commenting..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#7A94BB] mb-1">Lead Magnet URL (optional)</label>
                                <input
                                    value={form.lead_magnet_url}
                                    onChange={(e) => setForm({ ...form, lead_magnet_url: e.target.value })}
                                    className="w-full px-3 py-2 bg-[#0A1628] border border-[#1A3A6B]/40 rounded-lg text-[#EDF2FB] placeholder-[#3D5A8A] focus:outline-none focus:border-[#1A6EF5]"
                                    placeholder="https://example.com/guide.pdf"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-[#7A94BB]">
                                <input
                                    type="checkbox"
                                    checked={form.is_default}
                                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                                    className="accent-[#1A6EF5]"
                                />
                                Set as default template
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-[#1A6EF5] hover:bg-[#2D7FF6] text-white font-semibold rounded-lg transition-colors">
                                    {editing ? "Update" : "Create"}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-[#1A3A6B]/40 text-[#7A94BB] rounded-lg hover:bg-[#0A1628] transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Templates list */}
            {templates.length === 0 ? (
                <div className="text-center py-16 text-[#7A94BB]">
                    <p className="text-lg mb-2">No templates yet</p>
                    <p className="text-sm">Create your first DM template to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            className="bg-[#0F2040] rounded-xl border border-[#1A3A6B]/40 p-5 hover:border-[#1A6EF5]/40 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-[#EDF2FB]">{t.name}</h3>
                                    {t.is_default && (
                                        <span className="flex items-center gap-1 text-xs bg-[#1A6EF5]/10 text-[#4DB8FF] px-2 py-0.5 rounded-full">
                                            <Star className="h-3 w-3" /> Default
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(t)} className="p-1.5 text-[#7A94BB] hover:text-[#4DB8FF] transition-colors">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} className="p-1.5 text-[#7A94BB] hover:text-red-400 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-[#7A94BB] whitespace-pre-wrap line-clamp-3">{t.message}</p>
                            {t.lead_magnet_url && (
                                <p className="text-xs text-[#3D5A8A] mt-2 truncate">📎 {t.lead_magnet_url}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

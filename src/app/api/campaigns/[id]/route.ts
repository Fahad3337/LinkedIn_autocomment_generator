import { createServerClient } from "@/lib/supabase";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/campaigns/:id — get campaign with delivery stats
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const { id } = await params;
        const supabase = createServerClient();

        const { data: campaign, error } = await supabase
            .from("campaigns")
            .select("*, templates(name, message)")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (error || !campaign) return jsonError("Campaign not found", 404);

        // Get delivery stats for this campaign
        const { data: logs } = await supabase
            .from("delivery_logs")
            .select("status, event_type")
            .eq("campaign_id", id);

        const stats = {
            total: logs?.length || 0,
            success: logs?.filter((l) => l.status === "success").length || 0,
            failed: logs?.filter((l) => l.status === "failed").length || 0,
            pending: logs?.filter((l) => l.status === "pending").length || 0,
            dms_sent: logs?.filter((l) => l.event_type === "dm_sent").length || 0,
            connections_requested: logs?.filter((l) => l.event_type === "connection_requested").length || 0,
        };

        return jsonSuccess({ ...campaign, stats });
    } catch {
        return jsonError("Internal server error", 500);
    }
}

// PUT /api/campaigns/:id — update campaign (pause/resume/edit)
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const { id } = await params;
        const body = await req.json();
        const supabase = createServerClient();

        const { data, error } = await supabase
            .from("campaigns")
            .update(body)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) return jsonError(error.message);
        if (!data) return jsonError("Campaign not found", 404);
        return jsonSuccess(data);
    } catch {
        return jsonError("Internal server error", 500);
    }
}

// DELETE /api/campaigns/:id — delete campaign
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const { id } = await params;
        const supabase = createServerClient();

        const { error } = await supabase
            .from("campaigns")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) return jsonError(error.message);
        return jsonSuccess({ deleted: true });
    } catch {
        return jsonError("Internal server error", 500);
    }
}

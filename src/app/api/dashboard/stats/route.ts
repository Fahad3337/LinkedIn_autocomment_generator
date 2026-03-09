import { createServerClient } from "@/lib/supabase";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

// GET /api/dashboard/stats — aggregated statistics
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const supabase = createServerClient();

        // Active campaigns count
        const { count: activeCampaigns } = await supabase
            .from("campaigns")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "active");

        // Total campaigns count
        const { count: totalCampaigns } = await supabase
            .from("campaigns")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        // Delivery logs stats
        const { data: logs } = await supabase
            .from("delivery_logs")
            .select("status, event_type, created_at")
            .eq("user_id", user.id);

        const totalDeliveries = logs?.length || 0;
        const successCount = logs?.filter((l) => l.status === "success").length || 0;
        const failedCount = logs?.filter((l) => l.status === "failed").length || 0;
        const dmsSent = logs?.filter((l) => l.event_type === "dm_sent").length || 0;
        const connectionsRequested = logs?.filter((l) => l.event_type === "connection_requested").length || 0;

        // Last 7 days trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentLogs = logs?.filter((l) => new Date(l.created_at) >= sevenDaysAgo) || [];

        return jsonSuccess({
            active_campaigns: activeCampaigns || 0,
            total_campaigns: totalCampaigns || 0,
            total_deliveries: totalDeliveries,
            success_count: successCount,
            failed_count: failedCount,
            success_rate: totalDeliveries > 0 ? Math.round((successCount / totalDeliveries) * 100) : 0,
            dms_sent: dmsSent,
            connections_requested: connectionsRequested,
            last_7_days: recentLogs.length,
        });
    } catch {
        return jsonError("Internal server error", 500);
    }
}

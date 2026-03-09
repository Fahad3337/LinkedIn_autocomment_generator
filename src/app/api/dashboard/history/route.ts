import { createServerClient } from "@/lib/supabase";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

// GET /api/dashboard/history — paginated delivery log
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const campaignId = searchParams.get("campaign_id");

        const offset = (page - 1) * limit;
        const supabase = createServerClient();

        let query = supabase
            .from("delivery_logs")
            .select("*, campaigns(post_url, post_title)", { count: "exact" })
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        // Optional filter by campaign
        if (campaignId) {
            query = query.eq("campaign_id", campaignId);
        }

        const { data, count, error } = await query;

        if (error) return jsonError(error.message);

        return jsonSuccess({
            logs: data,
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch {
        return jsonError("Internal server error", 500);
    }
}

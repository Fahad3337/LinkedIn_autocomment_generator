import { createServerClient } from "@/lib/supabase";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

// POST /api/extension/event — log a delivery event from the Chrome extension
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const {
            campaign_id,
            commenter_name,
            commenter_profile_url,
            event_type,
            status,
            error_message,
        } = await req.json();

        if (!campaign_id || !commenter_name || !commenter_profile_url || !event_type) {
            return jsonError("campaign_id, commenter_name, commenter_profile_url, and event_type are required");
        }

        // Validate event_type
        const validTypes = ["dm_sent", "connection_requested", "reply_posted"];
        if (!validTypes.includes(event_type)) {
            return jsonError(`event_type must be one of: ${validTypes.join(", ")}`);
        }

        const supabase = createServerClient();

        // Verify campaign belongs to user
        const { data: campaign } = await supabase
            .from("campaigns")
            .select("id")
            .eq("id", campaign_id)
            .eq("user_id", user.id)
            .single();

        if (!campaign) {
            return jsonError("Campaign not found", 404);
        }

        const { data, error } = await supabase
            .from("delivery_logs")
            .insert({
                campaign_id,
                user_id: user.id,
                commenter_name,
                commenter_profile_url,
                event_type,
                status: status || "success",
                error_message: error_message || null,
            })
            .select()
            .single();

        if (error) return jsonError(error.message);
        return jsonSuccess(data, 201);
    } catch {
        return jsonError("Internal server error", 500);
    }
}

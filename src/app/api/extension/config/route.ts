import { createServerClient } from "@/lib/supabase";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

// GET /api/extension/config — returns active campaigns + templates for the extension
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const supabase = createServerClient();

        // Get active campaigns with their linked templates
        const { data: campaigns, error } = await supabase
            .from("campaigns")
            .select("id, post_url, post_title, status, templates(id, name, message, lead_magnet_url)")
            .eq("user_id", user.id)
            .eq("status", "active");

        if (error) return jsonError(error.message);

        // Get list of already-contacted commenters to avoid duplicates
        const campaignIds = campaigns?.map((c) => c.id) || [];
        let contactedUrls: string[] = [];

        if (campaignIds.length > 0) {
            const { data: logs } = await supabase
                .from("delivery_logs")
                .select("commenter_profile_url, campaign_id")
                .in("campaign_id", campaignIds);

            contactedUrls = logs?.map((l) => l.commenter_profile_url) || [];
        }

        return jsonSuccess({
            campaigns,
            contacted_profiles: contactedUrls,
        });
    } catch {
        return jsonError("Internal server error", 500);
    }
}

import { createServerClient } from "@/lib/supabase";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

// GET /api/campaigns — list user's campaigns with delivery counts
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const supabase = createServerClient();

        const { data: campaigns, error } = await supabase
            .from("campaigns")
            .select("*, templates(name)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) return jsonError(error.message);

        // Get delivery counts per campaign
        const campaignIds = campaigns?.map((c) => c.id) || [];
        let deliveryCounts: Record<string, number> = {};

        if (campaignIds.length > 0) {
            const { data: logs } = await supabase
                .from("delivery_logs")
                .select("campaign_id")
                .in("campaign_id", campaignIds);

            if (logs) {
                deliveryCounts = logs.reduce((acc: Record<string, number>, log) => {
                    acc[log.campaign_id] = (acc[log.campaign_id] || 0) + 1;
                    return acc;
                }, {});
            }
        }

        const enriched = campaigns?.map((c) => ({
            ...c,
            template_name: (c.templates as unknown as { name: string })?.name || null,
            delivery_count: deliveryCounts[c.id] || 0,
        }));

        return jsonSuccess(enriched);
    } catch {
        return jsonError("Internal server error", 500);
    }
}

// POST /api/campaigns — create a new campaign
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const { template_id, post_url, post_title } = await req.json();

        if (!template_id || !post_url) {
            return jsonError("template_id and post_url are required");
        }

        const supabase = createServerClient();

        // Verify template belongs to user
        const { data: template } = await supabase
            .from("templates")
            .select("id")
            .eq("id", template_id)
            .eq("user_id", user.id)
            .single();

        if (!template) {
            return jsonError("Template not found", 404);
        }

        const { data, error } = await supabase
            .from("campaigns")
            .insert({
                user_id: user.id,
                template_id,
                post_url,
                post_title: post_title || null,
                status: "active",
            })
            .select()
            .single();

        if (error) return jsonError(error.message);
        return jsonSuccess(data, 201);
    } catch {
        return jsonError("Internal server error", 500);
    }
}

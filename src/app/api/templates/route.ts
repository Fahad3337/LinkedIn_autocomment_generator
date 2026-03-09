import { createServerClient } from "@/lib/supabase";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

// GET /api/templates — list user's templates
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const supabase = createServerClient();
        const { data, error } = await supabase
            .from("templates")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) return jsonError(error.message);
        return jsonSuccess(data);
    } catch {
        return jsonError("Internal server error", 500);
    }
}

// POST /api/templates — create a new template
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const { name, message, lead_magnet_url, is_default } = await req.json();

        if (!name || !message) {
            return jsonError("Name and message are required");
        }

        const supabase = createServerClient();

        // If setting as default, un-default all others first
        if (is_default) {
            await supabase
                .from("templates")
                .update({ is_default: false })
                .eq("user_id", user.id);
        }

        const { data, error } = await supabase
            .from("templates")
            .insert({
                user_id: user.id,
                name,
                message,
                lead_magnet_url: lead_magnet_url || null,
                is_default: is_default || false,
            })
            .select()
            .single();

        if (error) return jsonError(error.message);
        return jsonSuccess(data, 201);
    } catch {
        return jsonError("Internal server error", 500);
    }
}

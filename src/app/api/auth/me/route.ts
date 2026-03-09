import { createServerClient } from "@/lib/supabase";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const supabase = createServerClient();

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            return jsonError(error.message);
        }

        return jsonSuccess(profile);
    } catch {
        return jsonError("Internal server error", 500);
    }
}

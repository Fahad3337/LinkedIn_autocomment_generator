import { createServerClient } from "@/lib/supabase";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return jsonError("Email and password are required");
        }

        const supabase = createServerClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return jsonError(error.message, 401);
        }

        // Fetch profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

        return jsonSuccess({
            user: profile,
            session: {
                access_token: data.session?.access_token,
                refresh_token: data.session?.refresh_token,
            },
        });
    } catch {
        return jsonError("Internal server error", 500);
    }
}

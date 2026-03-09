import { createServerClient } from "@/lib/supabase";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password, full_name } = await req.json();

        if (!email || !password) {
            return jsonError("Email and password are required");
        }

        const supabase = createServerClient();

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError) {
            return jsonError(authError.message);
        }

        // Create profile row
        const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            email,
            full_name: full_name || null,
        });

        if (profileError) {
            return jsonError(profileError.message);
        }

        // Sign in to get session token
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            return jsonError(signInError.message);
        }

        return jsonSuccess({
            user: {
                id: authData.user.id,
                email,
                full_name: full_name || null,
            },
            session: {
                access_token: signInData.session?.access_token,
                refresh_token: signInData.session?.refresh_token,
            },
        }, 201);
    } catch {
        return jsonError("Internal server error", 500);
    }
}

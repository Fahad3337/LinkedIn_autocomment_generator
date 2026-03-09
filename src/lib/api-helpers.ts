import { createServerClient } from "@/lib/supabase";
import { NextRequest } from "next/server";

// Extract authenticated user from Authorization header (Bearer token)
export async function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user) return null;
    return user;
}

// Standard JSON error response
export function jsonError(message: string, status: number = 400) {
    return Response.json({ error: message }, { status });
}

// Standard JSON success response
export function jsonSuccess(data: unknown, status: number = 200) {
    return Response.json({ data }, { status });
}

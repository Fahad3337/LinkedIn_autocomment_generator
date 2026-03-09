import { createServerClient } from "@/lib/supabase";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/templates/:id — update a template
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const { id } = await params;
        const body = await req.json();

        const supabase = createServerClient();

        // If setting as default, un-default others first
        if (body.is_default) {
            await supabase
                .from("templates")
                .update({ is_default: false })
                .eq("user_id", user.id);
        }

        const { data, error } = await supabase
            .from("templates")
            .update(body)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) return jsonError(error.message);
        if (!data) return jsonError("Template not found", 404);
        return jsonSuccess(data);
    } catch {
        return jsonError("Internal server error", 500);
    }
}

// DELETE /api/templates/:id — delete a template
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getAuthUser(req);
        if (!user) return jsonError("Unauthorized", 401);

        const { id } = await params;
        const supabase = createServerClient();

        const { error } = await supabase
            .from("templates")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) return jsonError(error.message);
        return jsonSuccess({ deleted: true });
    } catch {
        return jsonError("Internal server error", 500);
    }
}

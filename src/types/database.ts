export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                };
                Update: {
                    email?: string;
                    full_name?: string | null;
                };
            };
            templates: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    message: string;
                    lead_magnet_url: string | null;
                    is_default: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    name: string;
                    message: string;
                    lead_magnet_url?: string | null;
                    is_default?: boolean;
                };
                Update: {
                    name?: string;
                    message?: string;
                    lead_magnet_url?: string | null;
                    is_default?: boolean;
                };
            };
            campaigns: {
                Row: {
                    id: string;
                    user_id: string;
                    template_id: string;
                    post_url: string;
                    post_title: string | null;
                    status: "active" | "paused" | "completed";
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    template_id: string;
                    post_url: string;
                    post_title?: string | null;
                    status?: "active" | "paused" | "completed";
                };
                Update: {
                    template_id?: string;
                    post_url?: string;
                    post_title?: string | null;
                    status?: "active" | "paused" | "completed";
                };
            };
            delivery_logs: {
                Row: {
                    id: string;
                    campaign_id: string;
                    user_id: string;
                    commenter_name: string;
                    commenter_profile_url: string;
                    event_type: "dm_sent" | "connection_requested" | "reply_posted";
                    status: "success" | "failed" | "pending";
                    error_message: string | null;
                    created_at: string;
                };
                Insert: {
                    campaign_id: string;
                    user_id: string;
                    commenter_name: string;
                    commenter_profile_url: string;
                    event_type: "dm_sent" | "connection_requested" | "reply_posted";
                    status?: "success" | "failed" | "pending";
                    error_message?: string | null;
                };
                Update: {
                    status?: "success" | "failed" | "pending";
                    error_message?: string | null;
                };
            };
        };
    };
};

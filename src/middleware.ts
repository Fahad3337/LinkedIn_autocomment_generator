import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    // We only care about /api routes
    if (!request.nextUrl.pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // Set permissive CORS headers for the Chrome Extension
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // If it's a preflight OPTIONS request, return empty 200 with headers
    if (request.method === "OPTIONS") {
        return NextResponse.json({}, { status: 200, headers: corsHeaders });
    }

    // Otherwise, process the request and add headers to the response
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

// Apply to all API routes
export const config = {
    matcher: "/api/:path*",
};

import React from "react";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    isScrolled?: boolean;
    href?: string;
}

export const Logo = ({ className, isScrolled = false, href = "/" }: LogoProps) => {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2 h-9 cursor-pointer select-none",
                className
            )}
        >
            {/* Icon Square */}
            <div
                className={cn(
                    "flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                    "bg-gradient-to-br from-[#1A6EF5] to-[#4DB8FF]",
                    isScrolled ? "drop-shadow-[0_0_8px_rgba(77,184,255,0.4)]" : "drop-shadow-none"
                )}
            >
                {/* SVG Icon: Speech bubble with inner spark styling */}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-message-square-zap"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="m13 8-2 3h3l-2 3" />
                </svg>
            </div>

            {/* Wordmark */}
            <div className="hidden md:flex items-center text-[18px] font-[800] tracking-[-0.02em] leading-none mt-0.5">
                <span className="text-[#EDF2FB]">Comment</span>
                <span className="text-[#4DB8FF]">Flow</span>
            </div>
        </Link>
    );
};

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    href?: string;
}

export const Logo = ({ className, href = "/" }: LogoProps) => {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2 h-9 cursor-pointer select-none",
                className
            )}
        >
            <img
                src="/logo.png"
                alt="CommentFlow Icon"
                className="logo-icon w-[44px] h-[44px] rounded-xl object-cover flex-shrink-0 shadow-lg shadow-[#1A6EF5]/20"
            />

            {/* Wordmark */}
            <div className="logo-wordmark flex items-center text-[22px] font-[800] tracking-[-0.02em] leading-none mt-0.5">
                <span className="text-[#EDF2FB]">Comment</span>
                <span className="text-[#4DB8FF]">Flow</span>
            </div>
        </Link>
    );
};

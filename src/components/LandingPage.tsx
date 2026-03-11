"use client";

import * as React from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    MessageSquare,
    TrendingUp,
    Zap,
    CheckCircle2,
    Linkedin,
    Chrome,
    Check,
    X,
    Clock,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomCursor, useCursorVariant } from "@/components/CustomCursor";
import { useMousePosition } from "@/hooks/useMousePosition";
import Link from "next/link";
import { Logo } from "@/components/Logo";

// ============================================================================
// ANIMATION CONFIG
// ============================================================================
const EASE = [0.4, 0, 0.2, 1] as const;

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

// ============================================================================
// SCROLL-REVEAL
// ============================================================================
function ScrollReveal({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: EASE, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ============================================================================
// GLOBAL SPOTLIGHT — follows cursor across page background
// ============================================================================
function GlobalSpotlight() {
    const mouse = useMousePosition();
    return (
        <div
            className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-300"
            style={{
                background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(26, 110, 245, 0.04), transparent 40%)`,
            }}
        />
    );
}

// ============================================================================
// SPOTLIGHT CARD — cursor-tracking inner glow + proximity border illumination
// ============================================================================
function SpotlightCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const [pos, setPos] = React.useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = React.useState(false);
    const { setVariant } = useCursorVariant();

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => {
                setIsHovered(true);
                setVariant("card");
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                setVariant("default");
            }}
            className={cn(
                "relative rounded-xl bg-[#0F2040] text-[#EDF2FB] overflow-hidden",
                "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "hover:-translate-y-1.5",
                className
            )}
            style={{
                border: isHovered
                    ? "1.5px solid rgba(26,110,245,0.7)"
                    : "1px solid rgba(26,58,107,0.4)",
                boxShadow: isHovered
                    ? "0 0 20px rgba(26,110,245,0.3), 0 8px 30px rgba(26,110,245,0.12)"
                    : "none",
            }}
        >
            {/* Inner spotlight glow — radial fill follows cursor */}
            <div
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(26,110,245,0.08), transparent 60%)`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}

// ============================================================================
// BUTTON — glow hover + scale-down click + cursor variant trigger
// ============================================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "lg" | "default";
    children: React.ReactNode;
}

const Button = ({
    variant = "default",
    size = "default",
    className = "",
    children,
    ...props
}: ButtonProps) => {
    const { setVariant } = useCursorVariant();

    const baseClasses =
        "inline-flex items-center justify-center font-semibold rounded-lg " +
        "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A6EF5]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060D1A] " +
        "disabled:pointer-events-none disabled:opacity-50 " +
        "active:scale-[0.98]";

    const variants = {
        default:
            "bg-[#1A6EF5] text-[#EDF2FB] shadow-lg shadow-[#1A6EF5]/20 " +
            "hover:bg-[#2D7FF6] hover:shadow-[0_0_20px_rgba(26,110,245,0.3)]",
        outline:
            "border-2 border-[#1A3A6B]/40 bg-transparent text-[#EDF2FB] " +
            "hover:bg-[#0F2040] hover:border-[#1A3A6B]/70 hover:shadow-[inset_0_0_20px_rgba(26,110,245,0.05)]",
        ghost: "text-[#7A94BB] hover:text-[#EDF2FB] hover:bg-[#0F2040]",
    };

    const sizes = {
        sm: "h-9 px-4 py-2  md:text-sm",
        default: "h-11 px-6 py-3  md:text-base",
        lg: "h-14 px-8 py-4  md:text-lg",
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]}  ${className}`}
            onMouseEnter={() => setVariant("button")}
            onMouseLeave={() => setVariant("default")}
            {...props}
        >
            {children}
        </button>
    );
};

// ============================================================================
// INSTALL BUTTON — with success state animation
// ============================================================================
function InstallButton({ size = "lg" }: { size?: "sm" | "lg" | "default" }) {
    const [state, setState] = React.useState<"idle" | "installing" | "done">("idle");
    const { setVariant } = useCursorVariant();

    function handleClick() {
        if (state !== "idle") return;
        setState("installing");
        setTimeout(() => setState("done"), 1400);
        setTimeout(() => setState("idle"), 3600);
    }

    return (
        <Button
            size={size}
            onClick={handleClick}
            className={cn("relative min-w-[240px] w-full md:w-auto", size === "lg" ? "md:min-w-[280px]" : "")}
        >
            <AnimatePresence mode="wait">
                {state === "idle" && (
                    <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: EASE }}
                        className="inline-flex items-center"
                    >
                        <Chrome className="mr-2 h-5 w-5" />
                        Install Free Extension
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.span>
                )}
                {state === "installing" && (
                    <motion.span
                        key="installing"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: EASE }}
                        className="inline-flex items-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            className="mr-2"
                        >
                            <Sparkles className="h-5 w-5" />
                        </motion.div>
                        Installing…
                    </motion.span>
                )}
                {state === "done" && (
                    <motion.span
                        key="done"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="inline-flex items-center text-[#10B981]"
                    >
                        <Check className="mr-2 h-5 w-5" />
                        Installed — Welcome!
                    </motion.span>
                )}
            </AnimatePresence>
        </Button>
    );
}

// ============================================================================
// NAV LINK — slide-in underline + cursor variant
// ============================================================================
function NavLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    const { setVariant } = useCursorVariant();
    return (
        <a
            href={href}
            onMouseEnter={() => setVariant("text")}
            onMouseLeave={() => setVariant("default")}
            className={cn(
                "relative text-sm font-medium text-[#7A94BB] transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "hover:text-[#EDF2FB]",
                "after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-[#1A6EF5] after:rounded-full",
                "after:transition-all after:duration-200 after:ease-[cubic-bezier(0.4,0,0.2,1)]",
                "hover:after:w-full"
            )}
        >
            {children}
        </a>
    );
}

// ============================================================================
// BADGE
// ============================================================================
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline" | "success" | "warning";
}

const Badge = ({
    variant = "default",
    className = "",
    children,
    ...props
}: BadgeProps) => {
    const variants = {
        default: "bg-[#1A6EF5] text-[#EDF2FB]",
        secondary: "bg-[#0F2040] text-[#7A94BB]",
        outline: "border border-[#1A3A6B]/40 text-[#7A94BB]",
        success: "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20",
        warning: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
    };

    return (
        <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// ============================================================================
// CARD SUB-COMPONENTS
// ============================================================================
const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 p-5 md:p-6", className)} {...props} />
);
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
        className={cn("text-xl md:text-2xl font-bold leading-none tracking-tight", className)}
        {...props}
    />
);
const CardDescription = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-[13px] md:text-sm text-[#7A94BB]", className)} {...props} />
);
const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-5 pt-0 md:p-6 md:pt-0", className)} {...props} />
);

// ============================================================================
// BACKGROUND PATTERN
// ============================================================================
const BGPattern = ({ className = "" }: { className?: string }) => (
    <div
        className={cn("absolute inset-0 z-[-10] size-full", className)}
        style={{
            backgroundImage:
                "linear-gradient(to right, rgba(26, 58, 107, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(26, 58, 107, 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse at center, #060D1A, transparent)",
            WebkitMaskImage:
                "radial-gradient(ellipse at center, #060D1A, transparent)",
        }}
    />
);

// ============================================================================
// ROTATING WORD — vertical flip through outcome words
// ============================================================================
const ROTATING_WORDS = ["Pipeline", "Revenue", "Growth", "Clients"];

function RotatingWord() {
    const [index, setIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animated-gradient-word {
                    background: linear-gradient(135deg, #1A6EF5, #4DB8FF, #7C3AED, #4DB8FF, #1A6EF5);
                    background-size: 300% 300%;
                    animation: gradient-shift 4s ease infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            ` }} />
            <span className="relative inline-block" style={{ width: "5.5ch" }}>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={ROTATING_WORDS[index]}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="inline-block animated-gradient-word"
                    >
                        {ROTATING_WORDS[index]}
                    </motion.span>
                </AnimatePresence>
            </span>
        </>
    );
}

// ============================================================================
// TESTIMONIAL SLIDER — auto + manual carousel
// ============================================================================
const TESTIMONIALS = [
    {
        quote: "This tool 10x'd my lead generation. I went from manually DMing 20 people to automatically reaching 200+ per post.",
        author: "Sarah Chen",
        role: "Marketing Consultant",
        initials: "SC",
    },
    {
        quote: "The connection growth loop is genius. My network grew by 500+ connections in the first month, all qualified leads.",
        author: "Michael Rodriguez",
        role: "SaaS Founder",
        initials: "MR",
    },
    {
        quote: "Finally, a tool that actually mimics human behavior. Zero risk to my LinkedIn account and incredible results.",
        author: "Emily Watson",
        role: "Business Coach",
        initials: "EW",
    },
    {
        quote: "Went from spending 4 hours a day on LinkedIn outreach to just 15 minutes setting up my posts. Total game-changer.",
        author: "James Park",
        role: "Agency Owner",
        initials: "JP",
    },
    {
        quote: "Our webinar sign-ups tripled after we started using CommentFlow. The automated DM delivery is incredibly reliable.",
        author: "Priya Sharma",
        role: "Growth Marketer",
        initials: "PS",
    },
    {
        quote: "I was skeptical at first, but after seeing 150+ qualified leads in my first week, I'm never going back to manual outreach.",
        author: "David Kim",
        role: "B2B Sales Lead",
        initials: "DK",
    },
];

const TestimonialSlider = () => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const slider = scrollRef.current;
        if (!slider) return;

        let scrollAmount = 0;

        const autoScroll = setInterval(() => {
            if (slider.scrollWidth - slider.scrollLeft === slider.clientWidth) {
                // Reached the end, reset to start smoothly
                slider.scrollTo({ left: 0, behavior: 'smooth' });
                scrollAmount = 0;
            } else {
                // Scroll by one card width (assuming roughly 300px or 100vw depending on device)
                // We calculate the width of the first child element dynamically
                const firstChild = slider.children[0] as HTMLElement;
                if (firstChild) {
                    // Add gap (16px or 24px) to the scroll amount
                    const cardWidth = firstChild.offsetWidth + 16;
                    slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
                }
            }
        }, 3500); // Auto scroll every 3.5 seconds

        return () => clearInterval(autoScroll);
    }, []);

    return (
        <div className="relative w-full max-w-full pb-8">
            <div
                ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-8 hide-scrollbar scroll-smooth"
            >
                {TESTIMONIALS.map((t, i) => (
                    <div
                        key={i}
                        className="snap-center sm:snap-start shrink-0  w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                    >
                        <SpotlightCard className="h-full bg-gradient-to-br from-[#0F2040] to-[#060D1A] border-[#1A3A6B]/40 relative">
                            <CardHeader className="h-full flex flex-col justify-between">
                                <div className="mb-6 md:mb-8">
                                    <div className="flex text-[#1A6EF5] mb-3 md:mb-4">
                                        {[...Array(5)].map((_, j) => (
                                            <svg
                                                key={j}
                                                className="w-4 w-4 md:w-5 md:h-5 fill-current"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className=" text-[15px] md:text-lg text-[#EDF2FB] leading-relaxed italic">
                                        &quot;{t.quote}&quot;
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 md:gap-4 mt-auto">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-[#1A6EF5] to-[#4DB8FF] flex items-center justify-center text-sm font-bold text-white shrink-0">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#EDF2FB]  text-[14px] md:text-base">
                                            {t.author}
                                        </div>
                                        <div className=" text-[13px] md:text-sm text-[#7A94BB]">
                                            {t.role}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </SpotlightCard>
                    </div>
                ))}
            </div>

            {/* Custom scrollbar hider css */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
};

// ============================================================================
// MAIN LANDING PAGE
// ============================================================================
export default function LinkedInAutomationLanding() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [openFAQ, setOpenFAQ] = React.useState<number | null>(null);

    return (
        <CustomCursor>
            <div className="min-h-screen w-full bg-[#060D1A] text-[#EDF2FB]">
                {/* Global mouse-follow spotlight */}
                <GlobalSpotlight />

                {/* ── Navigation ── */}
                <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1A3A6B]/40 bg-[#060D1A]/80 backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <Logo />

                            <div className="hidden md:flex items-center space-x-8">
                                <NavLink href="#features">Features</NavLink>
                                <NavLink href="#pricing">Pricing</NavLink>
                                <NavLink href="#faq">FAQ</NavLink>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="hidden md:block">
                                    <Link href="/login" tabIndex={-1}>
                                        <Button variant="ghost" size="sm" className="!w-auto">Sign In</Button>
                                    </Link>
                                </div>
                                <Link href="/signup" tabIndex={-1}>
                                    <Button size="sm" className="navbar-cta-btn md:text-sm md:px-4 md:py-2 flex items-center h-auto min-h-[36px] !w-auto">
                                        <Chrome className="mr-1.5 h-4 w-4 hidden md:inline-block" />
                                        <span className="md:hidden">Add to Chrome</span>
                                        <span className="hidden md:inline">Add to Chrome</span>
                                    </Button>
                                </Link>
                                <button className="md:hidden p-2 text-[#EDF2FB]" onClick={() => setMobileMenuOpen(true)}>
                                    <Menu className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 z-[60] bg-[#060D1A] flex flex-col p-6 md:hidden overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <Logo />
                                <button className="p-2 text-[#EDF2FB] hover:bg-[#1A3A6B]/40 rounded-full" onClick={() => setMobileMenuOpen(false)}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex flex-col space-y-6 text-lg font-semibold px-2">
                                <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[#EDF2FB] block py-2">Features</Link>
                                <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-[#EDF2FB] block py-2">Pricing</Link>
                                <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-[#EDF2FB] block py-2">FAQ</Link>
                                <hr className="border-[#1A3A6B]/40 my-4" />
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-[#EDF2FB] block py-2">Sign In</Link>
                                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full mt-4 block">
                                    <Button className="w-full h-12">Install Extension Free</Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Hero ── */}
                <section className="relative  pt-24 md:pt-32 pb-10 md:pb-20 overflow-hidden">
                    <BGPattern className="opacity-50 md:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060D1A]/70 md:via-[#060D1A]/50 to-[#060D1A]" />

                    <div className="relative z-10 mx-auto max-w-7xl  px-4 md:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="text-center"
                        >
                            <motion.div variants={staggerItem}>
                                <Badge className="mb-4 md:mb-6 px-3 py-1 flex items-center justify-center mx-auto max-w-fit">
                                    <Zap className="mr-1 h-3 w-3" />
                                    Automate Your LinkedIn Lead Gen
                                </Badge>
                            </motion.div>

                            <motion.h1
                                variants={staggerItem}
                                className=" md:text-[48px] lg:text-[72px] font-bold tracking-tight mb-4 md:mb-6 text-center leading-[1.1]"
                            >
                                {/* Line 1 — character stagger */}
                                <span className="block">
                                    {"Turn LinkedIn Engagement".split("").map((char, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.4 + i * 0.025,
                                                duration: 0.3,
                                                ease: [0.4, 0, 0.2, 1],
                                            }}
                                            className="inline-block"
                                        >
                                            {char === " " ? "\u00A0" : char}
                                        </motion.span>
                                    ))}
                                </span>
                                {/* Line 2 — "Into" + rotating word, same center alignment */}
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                    className="block"
                                >
                                    <span className="bg-gradient-to-r from-[#1A6EF5] via-[#2D7FF6] to-[#4DB8FF] bg-clip-text text-transparent">
                                        Into
                                    </span>{" "}<RotatingWord />
                                </motion.span>
                            </motion.h1>

                            <motion.p
                                variants={staggerItem}
                                className="mx-auto max-w-2xl  leading-relaxed md:text-lg text-[#7A94BB] mb-8 md:mb-10  px-2 md:px-0"
                            >
                                Automate the comment-to-DM funnel. Boost post reach, grow your
                                network, and deliver lead magnets instantly—all while you sleep.
                            </motion.p>

                            <motion.div
                                variants={staggerItem}
                                className="flex flex-col w-full md:flex-row md:w-auto items-center justify-center  gap-3 md:gap-4 mb-8 md:mb-12"
                            >
                                <Link href="/signup" tabIndex={-1} className=" md:w-auto">
                                    <InstallButton size="lg" />
                                </Link>
                                <Button variant="outline" size="lg" className=" md:w-auto flex items-center justify-center">
                                    Watch Demo
                                </Button>
                            </motion.div>

                            <motion.div
                                variants={staggerItem}
                                className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8  sm:text-sm text-[#3D5A8A]"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                                    <span>100% LinkedIn safe</span>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={staggerItem}
                                className="mt-12 flex justify-center gap-4 opacity-80"
                            >
                                <Badge variant="success" className="px-4 py-2">
                                    <Check className="mr-2 w-4 h-4" /> DM Sent ✓
                                </Badge>
                                <Badge variant="warning" className="px-4 py-2">
                                    <Clock className="mr-2 w-4 h-4" /> Connect Request Pending
                                </Badge>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Social Proof ── */}
                <ScrollReveal>
                    <section className=" py-10 md:py-14 border-y border-[#1A3A6B]/40 bg-[#0A1628]">
                        <div className="mx-auto max-w-7xl  px-4 md:px-6 lg:px-8">
                            <div className="grid  grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-center justify-items-center">
                                {[
                                    { num: "10K+", label: "Active Users" },
                                    { num: "500K+", label: "DMs Delivered" },
                                    { num: "98%", label: "Delivery Rate" },
                                    { num: "4.9★", label: "Chrome Rating" },
                                ].map((stat) => (
                                    <div key={stat.num} className="text-center w-full">
                                        <div className=" text-[28px] md:text-3xl font-bold bg-gradient-to-r from-[#EDF2FB] to-[#4DB8FF] bg-clip-text text-transparent">
                                            {stat.num}
                                        </div>
                                        <div className=" text-[13px] md:text-xs text-[#7A94BB] mt-1 uppercase tracking-widest leading-tight">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </ScrollReveal>

                {/* ── Workload Comparison ── */}
                <section className=" py-12 md:py-24 relative">
                    <div className="mx-auto max-w-7xl  px-4 md:px-6 lg:px-8 w-full">
                        <ScrollReveal>
                            <div className="text-center mb-10 md:mb-16">
                                <h2 className=" text-[32px] md:text-4xl font-bold mb-3 md:mb-4 leading-tight">
                                    Stop Wasting Hours on{" "}
                                    <span className="block md:inline bg-gradient-to-r from-[#FF4D4D] to-[#FF8C42] bg-clip-text text-transparent">Manual Work</span>
                                </h2>
                                <p className="text-[#7A94BB]  text-[15px] md:text-lg">
                                    See the difference automation makes
                                </p>
                            </div>
                        </ScrollReveal>

                        <div className="grid  md:grid-cols-2 gap-6 md:gap-8 w-full">
                            <ScrollReveal delay={0}>
                                <SpotlightCard className="h-full w-full border-[#FF4D4D]/15 bg-gradient-to-br from-[#0F2040] to-[#120E1E]">
                                    {/* Subtle red ambient glow */}
                                    <div className="absolute top-0 left-0 w-48 h-48 bg-[#FF4D4D]/[0.03] rounded-full blur-3xl pointer-events-none" />
                                    <CardHeader>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4D4D]/10 border border-[#FF4D4D]/20">
                                                <X className="h-6 w-6 text-[#FF4D4D]" />
                                            </div>
                                            <CardTitle className=" text-[#EDF2FB]">
                                                The Manual Way
                                            </CardTitle>
                                        </div>
                                        <p className=" text-sm text-[#7A94BB]">Painful, slow, unsustainable</p>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-4">
                                            {[
                                                "Manually check every comment",
                                                "Copy-paste DMs one by one",
                                                "Miss leads while you sleep",
                                                "Waste 3+ hours per post",
                                                "Inconsistent follow-up",
                                            ].map((item, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.08, duration: 0.3, ease: EASE }}
                                                    className="flex items-start gap-3 text-[#8A9BBF]"
                                                >
                                                    <X className="h-5 w-5 text-[#E8575A] mt-0.5 flex-shrink-0" />
                                                    <span className=" line-through decoration-[#E8575A]/40">{item}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                        <div className="mt-6 pt-4 border-t border-[#1A3A6B]/20">
                                            <p className="text-xs text-[#7A94BB] italic">~ Average: 3.5 hrs wasted per post</p>
                                        </div>
                                    </CardContent>
                                </SpotlightCard>
                            </ScrollReveal>

                            <ScrollReveal delay={0.1}>
                                <SpotlightCard className="w-full border-[#1A6EF5]/50 relative h-full bg-gradient-to-br from-[#0F2040] to-[#0A1A3A]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A6EF5]/[0.06] rounded-full blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981]/[0.03] rounded-full blur-3xl pointer-events-none" />
                                    <CardHeader>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A6EF5]/15 border border-[#1A6EF5]/30">
                                                <Zap className="h-6 w-6 text-[#4DB8FF]" />
                                            </div>
                                            <CardTitle className=" text-[#4DB8FF]">
                                                The Automated Way
                                            </CardTitle>
                                        </div>
                                        <p className=" text-sm text-[#7A94BB]">Effortless, instant, scalable</p>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-4">
                                            {[
                                                "Auto-scan all commenters instantly",
                                                "Send DMs in seconds, not hours",
                                                "24/7 lead capture—never miss anyone",
                                                "Set once, deliver forever",
                                                "100% consistent engagement",
                                            ].map((item, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.08, duration: 0.3, ease: EASE }}
                                                    className="flex items-start gap-3 text-[#EDF2FB]"
                                                >
                                                    <Check className="h-5 w-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                                                    <span className="">{item}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                        <div className="mt-6 pt-4 border-t border-[#1A6EF5]/20">
                                            <p className="text-xs text-[#10B981] font-medium">✦ Set up once — runs 24/7 on autopilot</p>
                                        </div>
                                    </CardContent>
                                </SpotlightCard>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* ── Features ── */}
                <section id="features" className=" py-12 md:py-24 relative bg-[#0A1628]">
                    <div className="mx-auto max-w-7xl  px-4 md:px-6 lg:px-8 w-full">
                        <ScrollReveal>
                            <div className="text-center mb-10 md:mb-16">
                                <h2 className=" text-[32px] md:text-4xl font-bold mb-3 md:mb-4 leading-tight">How <span className="bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">It Works</span></h2>
                                <p className="text-[#7A94BB]  text-[15px] md:text-lg">
                                    Three simple steps to automate your lead generation
                                </p>
                            </div>
                        </ScrollReveal>

                        <div className="grid  md:grid-cols-3 gap-6 md:gap-8 relative">
                            {/* Mobile Connector */}
                            <div className="absolute left-[39px] top-6 bottom-6 w-0 border-l-2 border-dashed border-[#1A3A6B]/40 md:hidden z-0" />
                            {[
                                {
                                    icon: MessageSquare,
                                    title: "Smart Connection Filtering",
                                    desc: "Instantly detects if commenters are 1st-degree connections. Sends DMs immediately to connections, auto-requests connection from others.",
                                    step: "01",
                                },
                                {
                                    icon: Zap,
                                    title: "Automated Delivery",
                                    desc: "Set your lead magnet once. The extension handles everything—from comment replies to DM delivery. Zero manual work required.",
                                    step: "02",
                                },
                                {
                                    icon: TrendingUp,
                                    title: "Algorithm Multiplier",
                                    desc: "More comments = More reach = More leads. Our automation creates a viral loop that grows your audience while building your list.",
                                    step: "03",
                                },
                            ].map((feature, i) => (
                                <ScrollReveal key={i} delay={i * 0.1} className="relative z-10">
                                    <SpotlightCard className="h-full w-full">
                                        <CardHeader>
                                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-[#1A6EF5]/10 border border-[#1A6EF5]/20 bg-[#0A1628]">
                                                    <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-[#4DB8FF]" />
                                                </div>
                                                <span className="text-3xl md:text-4xl font-black text-[#1A3A6B]/30">{feature.step}</span>
                                            </div>
                                            <CardTitle className=" text-lg md:text-xl">{feature.title}</CardTitle>
                                            <CardDescription className=" text-[#8A9BBF]">{feature.desc}</CardDescription>
                                        </CardHeader>
                                    </SpotlightCard>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Pricing ── */}
                <section id="pricing" className=" py-12 md:py-24 relative">
                    <BGPattern className="opacity-50 md:opacity-100" />
                    <div className="mx-auto max-w-7xl  px-4 md:px-6 lg:px-8 w-full">
                        <ScrollReveal>
                            <div className="text-center mb-10 md:mb-16">
                                <h2 className=" text-[32px] md:text-4xl font-bold mb-3 md:mb-4 leading-tight">
                                    Pay Only for <span className="bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">Results</span>
                                </h2>
                                <p className="text-[#7A94BB]  text-[15px] md:text-lg mb-6 md:mb-8">
                                    Credit-based pricing that scales with your success
                                </p>

                                <div className="flex items-center justify-center gap-3 text-[14px]">
                                    <span className="text-[#7A94BB]">Monthly</span>
                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#1A6EF5]">
                                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                    </button>
                                    <span className="text-[#EDF2FB] font-medium">Annually <span className="text-[#10B981] text-xs ml-1">(2 Months Free)</span></span>
                                </div>
                            </div>
                        </ScrollReveal>

                        <div className="grid  md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto w-full">
                            {[
                                {
                                    name: "Starter",
                                    price: "$29",
                                    desc: "100 successful deliveries/month",
                                    features: [
                                        "Smart filtering",
                                        "Auto DM delivery",
                                        "Basic analytics",
                                    ],
                                    popular: false,
                                    cta: "Get Started",
                                    ctaVariant: "outline" as const,
                                },
                                {
                                    name: "Growth",
                                    price: "$79",
                                    desc: "500 successful deliveries/month",
                                    features: [
                                        "Everything in Starter",
                                        "Priority support",
                                        "Advanced analytics",
                                        "Custom templates",
                                    ],
                                    popular: true,
                                    cta: "Get Started",
                                    ctaVariant: "default" as const,
                                },
                                {
                                    name: "Enterprise",
                                    price: "$199",
                                    desc: "Unlimited deliveries",
                                    features: [
                                        "Everything in Growth",
                                        "Dedicated manager",
                                        "API access",
                                        "White-label option",
                                    ],
                                    popular: false,
                                    cta: "Contact Sales",
                                    ctaVariant: "outline" as const,
                                },
                            ].map((plan, i) => (
                                <ScrollReveal key={i} delay={i * 0.1}>
                                    <SpotlightCard
                                        className={cn(
                                            "h-full",
                                            plan.popular
                                                ? "border-[#1A6EF5] shadow-lg shadow-[#1A6EF5]/10"
                                                : ""
                                        )}
                                    >
                                        {plan.popular && (
                                            <div className="absolute top-0 right-0 bg-[#1A6EF5] text-[#EDF2FB] text-xs font-bold px-3 py-1 rounded-bl-lg z-20">
                                                POPULAR
                                            </div>
                                        )}
                                        <CardHeader>
                                            <CardTitle className=" text-[17px] md:text-lg">{plan.name}</CardTitle>
                                            <div className="mt-3 md:mt-4 flex items-baseline gap-1">
                                                <span className=" text-[36px] md:text-4xl font-bold text-[#EDF2FB]">{plan.price}</span>
                                                <span className="text-[#3D5A8A]  text-sm md:text-base">/month</span>
                                            </div>
                                            <CardDescription className=" mt-2">
                                                {plan.desc}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3 mb-6">
                                                {plan.features.map((item, j) => (
                                                    <li
                                                        key={j}
                                                        className="flex items-center gap-2  text-sm text-[#EDF2FB]"
                                                    >
                                                        <Check className="h-4 w-4 text-[#1A6EF5]" />
                                                        <span className="">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button variant={plan.ctaVariant} className=" w-full">
                                                {plan.cta}
                                            </Button>
                                        </CardContent>
                                    </SpotlightCard>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ── */}
                <section className=" py-24 bg-[#0A1628] overflow-hidden">
                    <div className="mx-auto max-w-7xl  px-6 lg:px-8">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <h2 className=" text-4xl font-bold mb-4">
                                    Loved by <span className="bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">LinkedIn Creators</span>
                                </h2>
                            </div>
                        </ScrollReveal>

                        <TestimonialSlider />
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section id="faq" className=" py-12 md:py-24 relative">
                    <div className="mx-auto max-w-3xl  px-4 md:px-6 lg:px-8 w-full">
                        <ScrollReveal>
                            <div className="text-center mb-10 md:mb-16">
                                <h2 className=" text-[32px] md:text-4xl font-bold mb-3 md:mb-4 leading-tight">
                                    Frequently Asked <span className="bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">Questions</span>
                                </h2>
                            </div>
                        </ScrollReveal>

                        <div className="space-y-3 w-full">
                            {[
                                {
                                    q: "Is this safe for my LinkedIn account?",
                                    a: "Yes! Our extension runs locally in your browser and mimics human behavior. It follows LinkedIn's rate limits and best practices.",
                                },
                                {
                                    q: "How does the credit system work?",
                                    a: "You only pay for successful deliveries. If someone doesn't accept your connection request, you don't get charged.",
                                },
                                {
                                    q: "Can I customize the messages?",
                                    a: "Absolutely! You can create custom templates for connection requests and DMs with dynamic variables.",
                                },
                                {
                                    q: "What happens if I run out of credits?",
                                    a: "The extension will pause automatically. You can upgrade your plan or purchase additional credits anytime.",
                                },
                            ].map((faq, i) => (
                                <ScrollReveal key={i} delay={i * 0.06}>
                                    <div className="border border-[#1A3A6B]/40 rounded-xl bg-[#0F2040]/50 overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                                            className="w-full flex items-center justify-between p-4 md:p-6 text-left min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A6EF5]/50"
                                            aria-expanded={openFAQ === i}
                                        >
                                            <span className=" text-[14px] md:text-[16px] font-semibold text-[#EDF2FB] pr-4">
                                                {faq.q}
                                            </span>
                                            <ChevronRight
                                                className={cn(
                                                    "h-5 w-5 text-[#4DB8FF] flex-shrink-0 transition-transform duration-300",
                                                    openFAQ === i ? "rotate-90" : "rotate-0"
                                                )}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {openFAQ === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                                >
                                                    <div className="px-4 md:px-6 pb-4 md:pb-6  text-[13px] md:text-[15px] text-[#7A94BB] leading-relaxed">
                                                        {faq.a}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <ScrollReveal>
                    <section className=" py-12 md:py-24 relative overflow-hidden bg-[#0A1628]">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1A6EF5]/10 to-transparent" />
                        <div className="relative z-10 mx-auto max-w-4xl  px-4 md:px-6 lg:px-8 text-center flex flex-col items-center w-full">
                            <h2 className=" text-[24px] md:text-4xl font-bold mb-4 md:mb-6 leading-tight">
                                Ready to <span className="block md:inline bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">Automate</span> Your Lead Generation?
                            </h2>
                            <p className="text-[#7A94BB]  text-[15px] md:text-lg mb-8 md:mb-10 max-w-2xl">
                                Join 10,000+ creators who are turning LinkedIn engagement into
                                revenue
                            </p>
                            <Link href="/signup" tabIndex={-1} className=" w-full md:w-auto">
                                <InstallButton size="lg" />
                            </Link>
                        </div>
                    </section>
                </ScrollReveal>

                {/* ── Footer ── */}
                <footer className="border-t border-[#1A3A6B]/40 py-10 md:py-12 bg-[#060D1A]">
                    <div className="mx-auto max-w-7xl  px-4 md:px-6 lg:px-8">
                        <div className="grid  md:grid-cols-4 gap-8 md:gap-8">
                            <div className="flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0">
                                <div className="mb-4">
                                    <Logo />
                                </div>
                                <p className=" text-[13px] md:text-sm text-[#7A94BB] max-w-xs">
                                    Automate your LinkedIn lead generation safely and efficiently.
                                </p>
                            </div>
                            <div className="grid  grid-cols-2 md:grid-cols-3 gap-8 w-full col-span-3">
                                {[
                                    { title: "Product", links: ["Features", "Pricing", "FAQ"] },
                                    { title: "Company", links: ["About", "Blog", "Contact"] },
                                    { title: "Legal", links: ["Privacy", "Terms"] },
                                ].map((col) => (
                                    <div key={col.title}>
                                        <h3 className="font-bold mb-3 md:mb-4 text-[#EDF2FB]  text-[14px] md:text-base">
                                            {col.title}
                                        </h3>
                                        <ul className="space-y-2.5 text-[13px] md:text-sm text-[#7A94BB]">
                                            {col.links.map((link) => (
                                                <li key={link}>
                                                    <a
                                                        href="#"
                                                        className="transition-colors duration-200 hover:text-[#EDF2FB] block min-h-[44px] md:min-h-0 flex items-center md:block"
                                                    >
                                                        {link}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-10 md:mt-12 pt-8 border-t border-[#1A3A6B]/40 text-center  text-[13px] md:text-sm text-[#3D5A8A]">
                            © 2026 CommentFlow. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </CustomCursor>
    );
}

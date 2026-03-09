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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomCursor, useCursorVariant } from "@/components/CustomCursor";
import { useMousePosition } from "@/hooks/useMousePosition";
import Link from "next/link";

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
        sm: "h-9 px-4 py-2 text-sm",
        default: "h-11 px-6 py-3 text-base",
        lg: "h-14 px-8 py-4 text-lg",
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
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
            className="relative min-w-[240px]"
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
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
        className={cn("text-2xl font-bold leading-none tracking-tight", className)}
        {...props}
    />
);
const CardDescription = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-sm text-[#7A94BB]", className)} {...props} />
);
const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6 pt-0", className)} {...props} />
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

function TestimonialSlider() {
    const CARDS_PER_PAGE = 3;
    const totalPages = Math.ceil(TESTIMONIALS.length / CARDS_PER_PAGE);
    const [page, setPage] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const [direction, setDirection] = React.useState(1);

    // Auto-advance every 5 seconds
    React.useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setDirection(1);
            setPage((p) => (p + 1) % totalPages);
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, totalPages]);

    function goTo(p: number) {
        setDirection(p > page ? 1 : -1);
        setPage(p);
    }
    function prev() {
        setDirection(-1);
        setPage((p) => (p - 1 + totalPages) % totalPages);
    }
    function next() {
        setDirection(1);
        setPage((p) => (p + 1) % totalPages);
    }

    const visible = TESTIMONIALS.slice(
        page * CARDS_PER_PAGE,
        page * CARDS_PER_PAGE + CARDS_PER_PAGE
    );

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Cards */}
            <div className="relative min-h-[240px]">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -60 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        {visible.map((t, i) => (
                            <SpotlightCard key={t.author} className="h-full">
                                <CardContent className="pt-6">
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, s) => (
                                            <svg key={s} className="h-4 w-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-[#8A9BBF] mb-6 leading-relaxed">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1A6EF5] to-[#4DB8FF] flex items-center justify-center text-sm font-bold text-white">
                                            {t.initials}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[#EDF2FB]">{t.author}</div>
                                            <div className="text-sm text-[#7A94BB]">{t.role}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </SpotlightCard>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls: arrows + dots */}
            <div className="flex items-center justify-center gap-6 mt-10">
                <button
                    onClick={prev}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1A3A6B]/40 text-[#7A94BB] transition-all duration-200 hover:border-[#1A6EF5]/60 hover:text-[#4DB8FF] hover:shadow-[0_0_12px_rgba(26,110,245,0.2)]"
                    aria-label="Previous"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={cn(
                                "h-2.5 rounded-full transition-all duration-300",
                                i === page
                                    ? "w-8 bg-[#1A6EF5]"
                                    : "w-2.5 bg-[#1A3A6B]/60 hover:bg-[#1A6EF5]/40"
                            )}
                            aria-label={`Page ${i + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={next}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1A3A6B]/40 text-[#7A94BB] transition-all duration-200 hover:border-[#1A6EF5]/60 hover:text-[#4DB8FF] hover:shadow-[0_0_12px_rgba(26,110,245,0.2)]"
                    aria-label="Next"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN LANDING PAGE
// ============================================================================
export default function LinkedInAutomationLanding() {
    return (
        <CustomCursor>
            <div className="min-h-screen w-full bg-[#060D1A] text-[#EDF2FB]">
                {/* Global mouse-follow spotlight */}
                <GlobalSpotlight />

                {/* ── Navigation ── */}
                <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1A3A6B]/40 bg-[#060D1A]/80 backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <img src="/logo.png" alt="CommentFlow" className="h-8 w-8 rounded-lg" />
                                <span className="text-xl font-bold">CommentFlow</span>
                            </div>

                            <div className="hidden md:flex items-center space-x-8">
                                <NavLink href="#features">Features</NavLink>
                                <NavLink href="#pricing">Pricing</NavLink>
                                <NavLink href="#faq">FAQ</NavLink>
                            </div>

                            <div className="flex items-center gap-4">
                                <Link href="/login" tabIndex={-1}>
                                    <Button variant="ghost" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/signup" tabIndex={-1}>
                                    <Button size="sm">
                                        <Chrome className="mr-2 h-4 w-4" />
                                        Add to Chrome
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ── Hero ── */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <BGPattern />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060D1A]/50 to-[#060D1A]" />

                    <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="text-center"
                        >
                            <motion.div variants={staggerItem}>
                                <Badge className="mb-6">
                                    <Zap className="mr-1 h-3 w-3" />
                                    Automate Your LinkedIn Lead Generation
                                </Badge>
                            </motion.div>

                            <motion.h1
                                variants={staggerItem}
                                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-center"
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
                                className="mx-auto max-w-2xl text-lg text-[#7A94BB] mb-10"
                            >
                                Automate the comment-to-DM funnel. Boost post reach, grow your
                                network, and deliver lead magnets instantly—all while you sleep.
                            </motion.p>

                            <motion.div
                                variants={staggerItem}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                            >
                                <Link href="/signup" tabIndex={-1}>
                                    <InstallButton />
                                </Link>
                                <Button variant="outline" size="lg">
                                    Watch Demo
                                </Button>
                            </motion.div>

                            <motion.div
                                variants={staggerItem}
                                className="flex items-center justify-center gap-8 text-sm text-[#3D5A8A]"
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
                    <section className="py-14 border-y border-[#1A3A6B]/40 bg-[#0A1628]">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
                                {[
                                    { num: "10K+", label: "Active Users" },
                                    { num: "500K+", label: "DMs Delivered" },
                                    { num: "98%", label: "Delivery Rate" },
                                    { num: "4.9★", label: "Chrome Rating" },
                                ].map((stat) => (
                                    <div key={stat.num} className="text-center">
                                        <div className="text-3xl font-bold bg-gradient-to-r from-[#EDF2FB] to-[#4DB8FF] bg-clip-text text-transparent">
                                            {stat.num}
                                        </div>
                                        <div className="text-xs text-[#7A94BB] mt-1 uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </ScrollReveal>

                {/* ── Workload Comparison ── */}
                <section className="py-24 relative">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold mb-4">
                                    Stop Wasting Hours on{" "}
                                    <span className="bg-gradient-to-r from-[#FF4D4D] to-[#FF8C42] bg-clip-text text-transparent">Manual Work</span>
                                </h2>
                                <p className="text-[#7A94BB] text-lg">
                                    See the difference automation makes
                                </p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-2 gap-8">
                            <ScrollReveal delay={0}>
                                <SpotlightCard className="h-full border-[#FF4D4D]/15 bg-gradient-to-br from-[#0F2040] to-[#120E1E]">
                                    {/* Subtle red ambient glow */}
                                    <div className="absolute top-0 left-0 w-48 h-48 bg-[#FF4D4D]/[0.03] rounded-full blur-3xl pointer-events-none" />
                                    <CardHeader>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4D4D]/10 border border-[#FF4D4D]/20">
                                                <X className="h-6 w-6 text-[#FF4D4D]" />
                                            </div>
                                            <CardTitle className="text-[#EDF2FB]">
                                                The Manual Way
                                            </CardTitle>
                                        </div>
                                        <p className="text-sm text-[#7A94BB]">Painful, slow, unsustainable</p>
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
                                                    <span className="line-through decoration-[#E8575A]/40">{item}</span>
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
                                <SpotlightCard className="border-[#1A6EF5]/50 relative h-full bg-gradient-to-br from-[#0F2040] to-[#0A1A3A]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A6EF5]/[0.06] rounded-full blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981]/[0.03] rounded-full blur-3xl pointer-events-none" />
                                    <CardHeader>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A6EF5]/15 border border-[#1A6EF5]/30">
                                                <Zap className="h-6 w-6 text-[#4DB8FF]" />
                                            </div>
                                            <CardTitle className="text-[#4DB8FF]">
                                                The Automated Way
                                            </CardTitle>
                                        </div>
                                        <p className="text-sm text-[#7A94BB]">Effortless, instant, scalable</p>
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
                                                    <span>{item}</span>
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
                <section id="features" className="py-24 relative bg-[#0A1628]">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold mb-4">How <span className="bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">It Works</span></h2>
                                <p className="text-[#7A94BB] text-lg">
                                    Three simple steps to automate your lead generation
                                </p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-3 gap-8">
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
                                <ScrollReveal key={i} delay={i * 0.1}>
                                    <SpotlightCard className="h-full">
                                        <CardHeader>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A6EF5]/10 border border-[#1A6EF5]/20">
                                                    <feature.icon className="h-6 w-6 text-[#4DB8FF]" />
                                                </div>
                                                <span className="text-4xl font-black text-[#1A3A6B]/30">{feature.step}</span>
                                            </div>
                                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                                            <CardDescription className="text-[#8A9BBF]">{feature.desc}</CardDescription>
                                        </CardHeader>
                                    </SpotlightCard>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Pricing ── */}
                <section id="pricing" className="py-24 relative">
                    <BGPattern />
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold mb-4">
                                    Pay Only for <span className="bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">Results</span>
                                </h2>
                                <p className="text-[#7A94BB] text-lg">
                                    Credit-based pricing that scales with your success
                                </p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                                            <div className="mt-4">
                                                <span className="text-4xl font-bold">{plan.price}</span>
                                                <span className="text-[#3D5A8A]">/month</span>
                                            </div>
                                            <CardDescription className="mt-2">
                                                {plan.desc}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3 mb-6">
                                                {plan.features.map((item, j) => (
                                                    <li
                                                        key={j}
                                                        className="flex items-center gap-2 text-sm text-[#EDF2FB]"
                                                    >
                                                        <Check className="h-4 w-4 text-[#1A6EF5]" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button variant={plan.ctaVariant} className="w-full">
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
                <section className="py-24 bg-[#0A1628] overflow-hidden">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold mb-4">
                                    Loved by <span className="bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">LinkedIn Creators</span>
                                </h2>
                            </div>
                        </ScrollReveal>

                        <TestimonialSlider />
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section id="faq" className="py-24 relative">
                    <div className="mx-auto max-w-3xl px-6 lg:px-8">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold mb-4">
                                    Frequently Asked <span className="bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">Questions</span>
                                </h2>
                            </div>
                        </ScrollReveal>

                        <div className="space-y-4">
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
                                    <SpotlightCard>
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold">
                                                {faq.q}
                                            </CardTitle>
                                            <CardDescription className="text-[#7A94BB] mt-2">
                                                {faq.a}
                                            </CardDescription>
                                        </CardHeader>
                                    </SpotlightCard>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <ScrollReveal>
                    <section className="py-24 relative overflow-hidden bg-[#0A1628]">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1A6EF5]/10 to-transparent" />
                        <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8 text-center">
                            <h2 className="text-4xl font-bold mb-6">
                                Ready to <span className="bg-gradient-to-r from-[#1A6EF5] to-[#4DB8FF] bg-clip-text text-transparent">Automate</span> Your Lead Generation?
                            </h2>
                            <p className="text-[#7A94BB] text-lg mb-10">
                                Join 10,000+ creators who are turning LinkedIn engagement into
                                revenue
                            </p>
                            <Link href="/signup" tabIndex={-1}>
                                <InstallButton />
                            </Link>
                        </div>
                    </section>
                </ScrollReveal>

                {/* ── Footer ── */}
                <footer className="border-t border-[#1A3A6B]/40 py-12 bg-[#060D1A]">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <div className="flex items-center gap-2.5 mb-4">
                                    <img src="/logo.png" alt="CommentFlow" className="h-8 w-8 rounded-lg" />
                                    <span className="text-xl font-bold">CommentFlow</span>
                                </div>
                                <p className="text-sm text-[#7A94BB]">
                                    Automate your LinkedIn lead generation
                                </p>
                            </div>
                            {[
                                { title: "Product", links: ["Features", "Pricing", "FAQ"] },
                                { title: "Company", links: ["About", "Blog", "Contact"] },
                                { title: "Legal", links: ["Privacy", "Terms"] },
                            ].map((col) => (
                                <div key={col.title}>
                                    <h3 className="font-semibold mb-4 text-[#EDF2FB]">
                                        {col.title}
                                    </h3>
                                    <ul className="space-y-2 text-sm text-[#7A94BB]">
                                        {col.links.map((link) => (
                                            <li key={link}>
                                                <a
                                                    href="#"
                                                    className="transition-colors duration-200 hover:text-[#EDF2FB]"
                                                >
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 pt-8 border-t border-[#1A3A6B]/40 text-center text-sm text-[#3D5A8A]">
                            © 2026 CommentFlow. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </CustomCursor>
    );
}

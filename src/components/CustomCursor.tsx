"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useLerpedMouse } from "@/hooks/useMousePosition";

// ============================================================================
// CUSTOM CURSOR — magnetic trailing dot with state changes
// ============================================================================
type CursorVariant = "default" | "button" | "text" | "card";

interface CursorContextType {
    setVariant: (v: CursorVariant) => void;
}

export const CursorContext = React.createContext<CursorContextType>({
    setVariant: () => { },
});

export function useCursorVariant() {
    return React.useContext(CursorContext);
}

export function CustomCursor({ children }: { children: React.ReactNode }) {
    const [variant, setVariant] = React.useState<CursorVariant>("default");
    const [visible, setVisible] = React.useState(false);
    const lerped = useLerpedMouse(0.35);

    // Detect touch devices — hide custom cursor
    const [isTouch, setIsTouch] = React.useState(false);
    React.useEffect(() => {
        const mq = window.matchMedia("(pointer: coarse)");
        setIsTouch(mq.matches);
        function onChange(e: MediaQueryListEvent) {
            setIsTouch(e.matches);
        }
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    React.useEffect(() => {
        function onEnter() { setVisible(true); }
        function onLeave() { setVisible(false); }
        document.addEventListener("mouseenter", onEnter);
        document.addEventListener("mouseleave", onLeave);
        // Show cursor once we receive the first mouse event
        function onFirstMove() {
            setVisible(true);
            document.removeEventListener("mousemove", onFirstMove);
        }
        document.addEventListener("mousemove", onFirstMove);
        return () => {
            document.removeEventListener("mouseenter", onEnter);
            document.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("mousemove", onFirstMove);
        };
    }, []);

    const sizes: Record<CursorVariant, number> = {
        default: 16,
        button: 48,
        text: 4,
        card: 28,
    };

    const colors: Record<CursorVariant, string> = {
        default: "rgba(26, 110, 245, 0.8)",
        button: "rgba(26, 110, 245, 0.15)",
        text: "rgba(237, 242, 251, 0.7)",
        card: "rgba(26, 110, 245, 0.25)",
    };

    const borders: Record<CursorVariant, string> = {
        default: "2px solid rgba(26, 110, 245, 0.8)",
        button: "2px solid rgba(26, 110, 245, 0.5)",
        text: "none",
        card: "2px solid rgba(26, 110, 245, 0.4)",
    };

    const size = sizes[variant];

    if (isTouch) {
        return (
            <CursorContext.Provider value={{ setVariant }}>
                {children}
            </CursorContext.Provider>
        );
    }

    return (
        <CursorContext.Provider value={{ setVariant }}>
            {/* Hide native cursor globally */}
            <style jsx global>{`
        *, *::before, *::after {
          cursor: none !important;
        }
      `}</style>

            {children}

            {/* Trailing cursor ring */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-screen"
                animate={{
                    x: lerped.x - size / 2,
                    y: lerped.y - size / 2,
                    width: size,
                    height: size,
                    backgroundColor: variant === "text" ? colors.text : "transparent",
                    borderRadius: variant === "text" ? "1px" : "50%",
                    border: borders[variant],
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    width: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
                    height: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
                    backgroundColor: { duration: 0.2 },
                    border: { duration: 0.2 },
                    borderRadius: { duration: 0.15 },
                    opacity: { duration: 0.15 },
                    // x and y are driven by lerp — use near-instant spring so it doesn't double-smooth
                    x: { duration: 0 },
                    y: { duration: 0 },
                }}
            />

            {/* Inner dot — only for default state */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-[9999]"
                animate={{
                    x: lerped.x - 3,
                    y: lerped.y - 3,
                    width: 6,
                    height: 6,
                    opacity: visible && variant === "default" ? 1 : 0,
                    scale: variant === "default" ? 1 : 0,
                }}
                transition={{
                    opacity: { duration: 0.15 },
                    scale: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
                    x: { duration: 0 },
                    y: { duration: 0 },
                }}
                style={{
                    borderRadius: "50%",
                    backgroundColor: "rgba(26, 110, 245, 0.9)",
                }}
            />

            {/* Button-state background fill */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-[9998]"
                animate={{
                    x: lerped.x - size / 2,
                    y: lerped.y - size / 2,
                    width: size,
                    height: size,
                    opacity: visible && variant === "button" ? 1 : 0,
                    scale: variant === "button" ? 1 : 0.5,
                }}
                transition={{
                    opacity: { duration: 0.15 },
                    scale: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                    x: { duration: 0 },
                    y: { duration: 0 },
                }}
                style={{
                    borderRadius: "50%",
                    backgroundColor: colors.button,
                }}
            />
        </CursorContext.Provider>
    );
}

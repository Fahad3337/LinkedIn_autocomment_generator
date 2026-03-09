"use client";

import * as React from "react";

// ============================================================================
// Global mouse position hook — sets CSS custom properties on <html>
// ============================================================================
export function useMousePosition() {
    const [pos, setPos] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        function onMove(e: MouseEvent) {
            setPos({ x: e.clientX, y: e.clientY });
            document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
            document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
        }
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    return pos;
}

// ============================================================================
// Lerp utility for smooth trailing
// ============================================================================
export function useLerpedMouse(speed = 0.15) {
    const mouse = React.useRef({ x: 0, y: 0 });
    const lerped = React.useRef({ x: 0, y: 0 });
    const [pos, setPos] = React.useState({ x: 0, y: 0 });
    const raf = React.useRef<number>(0);

    React.useEffect(() => {
        function onMove(e: MouseEvent) {
            mouse.current = { x: e.clientX, y: e.clientY };
        }
        window.addEventListener("mousemove", onMove);

        function tick() {
            lerped.current.x += (mouse.current.x - lerped.current.x) * speed;
            lerped.current.y += (mouse.current.y - lerped.current.y) * speed;
            setPos({ x: lerped.current.x, y: lerped.current.y });
            raf.current = requestAnimationFrame(tick);
        }
        raf.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf.current);
        };
    }, [speed]);

    return pos;
}

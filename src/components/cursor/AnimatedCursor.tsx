"use client";
import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function AnimatedCursor() {
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [isTouch, setIsTouch] = useState(true); // SSR-safe default

  const x = useSpring(-200, { stiffness: 500, damping: 28, mass: 0.5 });
  const y = useSpring(-200, { stiffness: 500, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setIsTouch(false);

    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const over = (e: MouseEvent) => {
      setHovering(!!(e.target as HTMLElement).closest("a,button,[role=button],input,textarea,select,label"));
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (isTouch) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
        border: "1.5px solid rgba(212,160,23,0.8)",
        willChange: "transform",
      }}
      animate={{
        width: hovering ? 32 : clicking ? 8 : 12,
        height: hovering ? 32 : clicking ? 8 : 12,
        backgroundColor: hovering ? "rgba(212,160,23,0.18)" : "rgba(212,160,23,0)",
        scale: clicking ? 0.7 : 1,
        opacity: 1,
      }}
      transition={{ width: { duration: 0.12 }, height: { duration: 0.12 }, backgroundColor: { duration: 0.12 }, scale: { duration: 0.08 } }}
    />
  );
}

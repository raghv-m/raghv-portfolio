"use client";
import React, { useId, useCallback } from "react";
import Particles, { ParticlesProvider, useParticlesProvider } from "@tsparticles/react";
import type { Engine, SingleOrMultiple } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";

type SparklesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

function SparklesInner(props: SparklesProps) {
  const { id, className, background, minSize, maxSize, speed, particleColor, particleDensity } = props;
  const { loaded } = useParticlesProvider();
  const controls = useAnimation();
  const generatedId = useId();

  const particlesLoaded = useCallback(async () => {
    controls.start({ opacity: 1, transition: { duration: 1 } });
  }, [controls]);

  return (
    <motion.div animate={controls} className={cn("opacity-0", className)}>
      {loaded && (
        <Particles
          id={id || generatedId}
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: background || "transparent" } },
            fullScreen: { enable: false, zIndex: 1 },
            fpsLimit: 60,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: false, mode: "repulse" },
                resize: { enable: true },
              },
              modes: {
                push: { quantity: 2 },
                repulse: { distance: 200, duration: 0.4 },
              },
            },
            particles: {
              color: { value: particleColor || "#d4a017" },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" },
                random: false,
                speed: { min: 0.1, max: speed || 0.8 },
                straight: false,
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: particleDensity || 80,
              },
              opacity: {
                value: { min: 0.1, max: 0.8 },
                animation: {
                  enable: true,
                  speed: speed || 2,
                  sync: false,
                  startValue: "random" as const,
                  destroy: "none" as const,
                  count: 0,
                  decay: 0,
                  delay: 0,
                  mode: "auto" as const,
                },
              },
              shape: { type: "circle" },
              size: {
                value: { min: minSize || 0.5, max: maxSize || 2 },
              },
              effect: {
                close: true,
                options: {},
                type: {} as SingleOrMultiple<string> | undefined,
              },
              links: { enable: false },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
}

export function SparklesCore(props: SparklesProps) {
  const init = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <ParticlesProvider init={init}>
      <SparklesInner {...props} />
    </ParticlesProvider>
  );
}

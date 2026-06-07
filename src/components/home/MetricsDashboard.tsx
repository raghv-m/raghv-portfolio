"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Activity, Award, Zap } from "lucide-react";

const METRICS = [
  { label: "Labs Completed", value: 50, suffix: "+", icon: Activity, color: "var(--gold)" },
  { label: "Certs Earned", value: 3, suffix: "", icon: Award, color: "var(--green)" },
  { label: "Security Tools", value: 20, suffix: "+", icon: Shield, color: "var(--blue)" },
  { label: "Attack Simulations", value: 15, suffix: "+", icon: Zap, color: "var(--gold)" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 40;
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else {
        setCount(Math.floor(start));
      }
    }, 35);
    return () => clearInterval(id);
  }, [inView, target]);

  return (
    <span ref={ref} className="font-display text-3xl font-bold gradient-gold">
      {count}{suffix}
    </span>
  );
}

export default function MetricsDashboard() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {METRICS.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="glass rounded-xl p-5 text-center card-lift"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-3"
            style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}
          >
            <m.icon className="w-4 h-4" style={{ color: m.color }} />
          </div>
          <Counter target={m.value} suffix={m.suffix} />
          <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1 tracking-wider">
            {m.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

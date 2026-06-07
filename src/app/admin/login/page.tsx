"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/admin/messages");
    } else {
      setError("Invalid credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="glass rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]">
            <Lock className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">SECURE AREA</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider block mb-1.5">
                IDENTIFIER
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] text-sm font-mono focus:outline-none focus:border-[rgba(212,160,23,0.4)] transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider block mb-1.5">
                PASSPHRASE
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2.5 pr-10 text-[var(--text)] text-sm font-mono focus:outline-none focus:border-[rgba(212,160,23,0.4)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-mono text-[10px] text-[var(--red)] bg-[rgba(255,68,68,0.08)] px-3 py-2 rounded border border-[rgba(255,68,68,0.15)]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center mt-2"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3.5 h-3.5 border border-[var(--gold)] border-t-transparent rounded-full"
                />
              ) : (
                <><LogIn className="w-3.5 h-3.5" /> Authenticate</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[9px] text-[#2a2a2a] mt-4">
          Unauthorized access is logged and reported.
        </p>
      </motion.div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Circle, LogOut, Shield } from "lucide-react";
import { signOut } from "next-auth/react";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export default function AdminMessagesClient({ messages }: { messages: Message[] }) {
  const [selected, setSelected] = useState<Message | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(
    new Set(messages.filter((m) => m.read).map((m) => m.id))
  );

  const markRead = async (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
    await fetch(`/api/admin/messages/${id}/read`, { method: "PATCH" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[var(--gold)]" />
            <div>
              <p className="font-mono text-[9px] text-[var(--gold-muted)] tracking-wider">ADMIN CONSOLE</p>
              <h1 className="font-display text-xl font-bold">Contact Messages</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              {messages.length} total · {messages.filter((m) => !m.read).length} unread
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="btn-ghost gap-1.5 text-xs"
            >
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* Message list */}
          <div className="lg:col-span-2 space-y-2">
            {messages.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <Mail className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                <p className="font-mono text-[10px] text-[var(--text-muted)]">No messages yet.</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isRead = readIds.has(msg.id);
                const isSelected = selected?.id === msg.id;
                return (
                  <motion.button
                    key={msg.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      setSelected(msg);
                      if (!isRead) markRead(msg.id);
                    }}
                    className={`w-full text-left glass rounded-xl p-4 transition-all ${
                      isSelected ? "ring-1 ring-[rgba(212,160,23,0.3)]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isRead
                        ? <CheckCircle className="w-3 h-3 text-[var(--text-muted)] mt-0.5 shrink-0" />
                        : <Circle className="w-3 h-3 text-[var(--gold)] mt-0.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={`font-display text-sm truncate ${isRead ? "text-[var(--text-muted)]" : "text-[var(--text)] font-semibold"}`}>
                            {msg.name}
                          </p>
                          <span className="font-mono text-[8px] text-[var(--text-muted)] shrink-0">
                            {new Date(msg.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="font-mono text-[9px] text-[var(--gold)] truncate">{msg.subject}</p>
                        <p className="font-mono text-[9px] text-[var(--text-muted)] truncate mt-0.5">{msg.message}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl overflow-hidden h-full"
              >
                <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-base font-bold text-[var(--text)]">{selected.subject}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-[10px] text-[var(--gold)]">{selected.name}</p>
                        <span className="text-[var(--text-muted)]">·</span>
                        <a href={`mailto:${selected.email}`} className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                          {selected.email}
                        </a>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] text-[var(--text-muted)] shrink-0">
                      {new Date(selected.createdAt).toLocaleString("en-CA", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                  <div className="mt-6 pt-4 border-t border-[var(--border)]">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                      className="btn-gold"
                    >
                      <Mail className="w-3.5 h-3.5" /> Reply
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-2xl flex items-center justify-center h-48">
                <div className="text-center">
                  <Mail className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-30" />
                  <p className="font-mono text-[10px] text-[var(--text-muted)]">Select a message</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

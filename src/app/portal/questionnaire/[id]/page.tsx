import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { requirePortalUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { QuestionnaireForm } from "./QuestionnaireForm";

export const metadata: Metadata = { title: "Project questionnaire", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function QuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { profile, email } = await requirePortalUser();
  const supabase = await createSupabaseServerClient();
  // RLS: only the client's own questionnaire comes back.
  const { data: q } = await supabase.from("questionnaires").select("id, status, estimate_id").eq("id", id).maybeSingle();
  if (!q) notFound();
  const { data: estimate } = q.estimate_id ? await supabase.from("estimates").select("company, phone, address_line1, address_line2, city, region, postal_code, country, description").eq("id", q.estimate_id).maybeSingle() : { data: null };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/portal" className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] hover:text-[var(--gold)]">← Back to portal</Link>
        <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-[var(--gold)]">ONBOARDING</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--text)]">Project questionnaire</h1>
        {q.status === "submitted" ? (
          <p className="mt-6 text-[var(--text-muted)]">Thanks, this is submitted. I&apos;m preparing your agreement and will email you when it&apos;s ready to sign. Need to change something? Reply to any of my emails.</p>
        ) : (
          <>
            <p className="mt-3 text-sm text-[var(--text-muted)] max-w-2xl">
              About 10 minutes. Your answers go straight into our agreement, so please use your exact legal business
              name and address. Fields marked * are required.
            </p>
            <QuestionnaireForm
              id={q.id}
              defaults={{
                legalName: estimate?.company ?? "",
                signerName: profile.full_name ?? "",
                signerEmail: email,
                billingEmail: email,
                phone: estimate?.phone ?? "",
                addressLine1: estimate?.address_line1 ?? "",
                addressLine2: estimate?.address_line2 ?? "",
                city: estimate?.city ?? "",
                region: estimate?.region ?? "",
                postalCode: estimate?.postal_code ?? "",
                country: estimate?.country ?? "Canada",
                projectGoals: estimate?.description ?? "",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

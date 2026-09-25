"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase/client";

// Keeps the jobs table on /upload live. Supabase pushes every change to this
// user's rows (RLS applies to realtime too), and we re-run the server
// component to pick them up.
//
// The 15s interval is a fallback, not the mechanism: it only fires while a job
// is still running, and covers the case where the socket drops and reconnects
// after a status change has already gone past.
export default function JobsRealtime({
  userId,
  hasActiveJob,
}: {
  userId: string;
  hasActiveJob: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel(`jobs:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs", filter: `user_id=eq.${userId}` },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  useEffect(() => {
    if (!hasActiveJob) return;
    const id = setInterval(() => router.refresh(), 15000);
    return () => clearInterval(id);
  }, [hasActiveJob, router]);

  return null;
}

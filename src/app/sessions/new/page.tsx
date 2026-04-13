"use client";

import { useEffect, useTransition } from "react";
import { createSession } from "@/app/actions/sessionActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewSessionPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await createSession();
      if (result.success && result.sessionId) {
        router.push(`/sessions/${result.sessionId}`);
      } else {
        toast.error("Failed to initialize session");
        router.push("/sessions");
      }
    });
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="text-4xl animate-bounce">🎣</div>
      <h1 className="text-xl font-bold text-n-text">Initializing your session...</h1>
      <p className="text-sm text-n-muted">Please wait a moment.</p>
    </div>
  );
}

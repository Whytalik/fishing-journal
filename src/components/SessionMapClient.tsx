"use client";

import dynamic from "next/dynamic";

const SessionMap = dynamic(() => import("@/components/SessionMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-n-surface animate-pulse rounded-lg flex items-center justify-center text-sm text-n-muted">
      Завантаження карти…
    </div>
  ),
});

export default function SessionMapClient({ location }: { location: [number, number] }) {
  return <SessionMap location={location} />;
}

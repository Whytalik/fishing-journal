"use client";

import { useState } from "react";

export default function CopyButton({ text, label }: { text: string, label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
        copied ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-n-hover text-n-muted hover:text-n-text border border-n-border"
      }`}
    >
      {copied ? "СКОПІЙОВАНО! ✅" : (label || "КОПІЮВАТИ")}
    </button>
  );
}

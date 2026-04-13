"use client";

import { useState, useRef, useEffect } from "react";
import { logout } from "@/app/actions/authActions";
import { Session } from "next-auth";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  session: Session | null;
}

export default function UserMenu({ session }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user.email?.[0].toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-n-hover transition-colors select-none"
      >
        <div className="w-7 h-7 bg-n-accent/20 border border-n-accent/30 rounded flex items-center justify-center text-n-accent text-xs font-bold">
          {user.image ? (
            <img src={user.image} alt="" className="w-full h-full rounded" />
          ) : (
            initials
          )}
        </div>
        <span className="text-sm font-medium text-n-text hidden sm:inline-block max-w-[120px] truncate">
          {user.name || user.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-n-surface border border-n-border rounded shadow-xl py-1 z-50">
          <div className="px-4 py-2 border-b border-n-border mb-1">
            <p className="text-xs text-n-muted truncate">{user.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="w-full text-left px-4 py-2 text-sm text-n-text hover:bg-n-hover transition-colors flex items-center gap-2"
          >
            <span className="text-red-400">Вийти</span>
          </button>
        </div>
      )}
    </div>
  );
}

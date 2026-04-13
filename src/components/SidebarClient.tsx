"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { logout } from "@/app/actions/authActions";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { href: "/sessions", label: "Сесії", icon: "🎣" },
  { href: "/stats", label: "Статистика", icon: "📊" },
  { href: "/hypotheses", label: "Гіпотези", icon: "🧪" },
  { href: "/species", label: "Керування видами", icon: "🐟" },
];

interface SidebarClientProps {
  session: Session | null;
}

export default function SidebarClient({ session }: SidebarClientProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-px overflow-y-auto notion-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors group",
                isActive
                  ? "bg-n-active text-n-text font-medium"
                  : "text-n-muted hover:bg-n-hover hover:text-n-text",
              )}
            >
              <span
                className={cn(
                  "text-base flex-shrink-0 transition-opacity",
                  isActive
                    ? "opacity-100"
                    : "opacity-60 group-hover:opacity-100",
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section at bottom with Dropup Menu */}
      {user && (
        <div className="mt-auto border-t border-n-border p-2 relative" ref={menuRef}>
          {isMenuOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-1 bg-n-surface border border-n-border rounded shadow-xl py-1 z-50">
              <div className="px-3 py-2 border-b border-n-border mb-1">
                <p className="text-[10px] text-n-subtle truncate">{user.email}</p>
              </div>
              <button
                onClick={() => logout()}
                className="w-full text-left px-3 py-2 text-sm text-n-text hover:bg-n-hover transition-colors text-red-400"
              >
                Вийти
              </button>
            </div>
          )}
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-n-hover transition-colors text-left"
          >
            <div className="w-7 h-7 rounded bg-n-accent/20 border border-n-accent/30 flex items-center justify-center text-n-accent text-xs font-bold overflow-hidden flex-shrink-0">
              {user.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-n-text truncate">{user.name || user.email}</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

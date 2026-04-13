import Link from "next/link";
import { Button } from "./ui/Button";
import UserMenu from "./UserMenu";
import { Session } from "next-auth";

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-40 w-full h-[65px] bg-n-surface/80 backdrop-blur-md border-b border-n-border px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group px-2 py-1.5 rounded-md hover:bg-n-hover transition-colors">
          <div className="w-8 h-8 bg-n-accent rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
            FS
          </div>
          <span className="text-base md:text-lg font-bold text-n-text tracking-tight">Fishing Space</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {isLoggedIn ? (
          <div className="md:hidden">
            <UserMenu session={session} />
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold px-3 md:px-4 text-xs md:text-sm">
                Увійти
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="font-bold px-4 md:px-6 rounded-lg shadow-sm text-xs md:text-sm">
                Розпочати
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

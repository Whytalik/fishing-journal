import SessionList from "@/components/SessionList";
import prisma from "@/db/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Component for displaying fishing sessions with grouping options */
export default async function SessionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const sessions = await prisma.fishingSession.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      locationName: true,
      fishingType: true,
      catchesCount: true,
      fishType: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎣</span>
            <h1 className="text-2xl font-bold text-n-text">Сесії</h1>
          </div>
          <p className="text-sm text-n-muted">{sessions.length} записів зроблено</p>
        </div>
        <Link
          href="/sessions/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-n-accent text-white text-sm font-medium rounded hover:bg-n-accent-hover transition-colors"
        >
          <span>+</span> Нова сесія
        </Link>
      </div>

      <div className="border-t border-n-border" />

      {sessions.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-4xl mb-3">🎣</div>
          <h2 className="text-base font-semibold text-n-text mb-2">
            Сесій поки немає
          </h2>
          <p className="text-sm text-n-muted mb-6 max-w-sm mx-auto leading-relaxed">
            Почніть логувати свої поїздки на риболовлю, щоб створити свій особистий щоденник.
          </p>
          <Link
            href="/sessions/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-n-accent text-white text-sm font-medium rounded hover:bg-n-accent-hover transition-colors"
          >
            <span>+</span> Створити свою першу сесію
          </Link>
        </div>
      ) : (
        <SessionList sessions={sessions} />
      )}
    </div>
  );
}

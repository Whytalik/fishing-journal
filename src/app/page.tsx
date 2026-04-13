import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { auth } from "@/auth";
import JITStartButton from "@/components/JITStartButton";
import prisma from "@/db/prisma";
import SessionDurationBadge from "@/components/SessionDurationBadge";

const features = [
  {
    icon: "🐟",
    title: "Аналіз уловів",
    desc: "Види риб, розмір та наживка для кожного улову, щоб знаходити закономірності.",
    badge: "Аналітика" as const,
    variant: "blue" as const
  },
  {
    icon: "☀️",
    title: "Погодні умови",
    desc: "Температура води, вітер та тиск для кожної поїздки.",
    badge: "Довкілля" as const,
    variant: "orange" as const
  },
  {
    icon: "📍",
    title: "GPS Локації",
    desc: "Зберігайте свої улюблені місця з точними координатами.",
    badge: "Карти" as const,
    variant: "green" as const
  },
];

export default async function Home() {
  const sessionUser = await auth();
  
  let activeSession = null;
  if (sessionUser?.user?.id) {
    activeSession = await prisma.fishingSession.findFirst({
      where: {
        userId: sessionUser.user.id,
        status: "ACTIVE",
      },
      include: { catches: true },
    });
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 px-4 text-center">
      {/* Hero Section */}
      <div className="max-w-2xl mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-n-hover text-3xl mb-4">
          🎣
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-n-text mb-3 tracking-tight">
          Fishing Space
        </h1>
        <p className="text-base text-n-muted leading-relaxed mb-6 max-w-lg mx-auto">
          Логуйте свої улови, відстежуйте умови та знаходьте закономірності.
          Ваш особистий цифровий щоденник рибалки.
        </p>

        <div className="flex items-center justify-center gap-3">
          {sessionUser ? (
            activeSession ? (
              <div className="w-full max-w-md">
                <Link href={`/sessions/${activeSession.id}`}>
                  <Card className="border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer group text-left">
                    <CardContent className="py-6 px-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                          <span className="text-xxs font-bold text-red-500 uppercase tracking-widest">Активна сесія</span>
                        </div>
                        <div className="flex gap-2">
                          {activeSession.startTime && <SessionDurationBadge startTime={activeSession.startTime} />}
                          <Badge variant="red">НАЖИВО</Badge>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-n-text mb-1 group-hover:text-n-accent transition-colors">
                        {activeSession.locationName}
                      </h2>
                      <p className="text-xs text-n-muted mb-4">
                        {activeSession.catches.length} уловів наразі
                      </p>
                      <Button variant="primary" className="w-full bg-red-500 hover:bg-red-600 border-none">
                        Повернутися до сесії
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ) : (
              <>
                <JITStartButton />
                <Link href="/sessions/new">
                  <Button variant="secondary" size="md" className="rounded-lg px-5 h-10">
                    + Ручний запис
                  </Button>
                </Link>
                <Link href="/sessions">
                  <Button variant="ghost" size="md" className="rounded-lg px-5 h-10">
                    Переглянути сесії
                  </Button>
                </Link>
              </>
            )
          ) : (
            <Link href="/login">
              <Button variant="primary" size="lg" className="rounded-xl px-8 h-12 text-lg">
                Увійдіть, щоб почати
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="w-full max-w-3xl border-t border-n-border mb-8" />

      {/* Features Grid */}
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-center gap-2 mb-4">
          <p className="text-xxs font-bold text-n-subtle uppercase tracking-widest">
            Основні можливості
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="text-left">
              <CardContent className="py-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="mb-2">
                  <Badge variant={f.variant}>{f.badge}</Badge>
                </div>
                <h3 className="text-xs font-bold text-n-text mb-1">
                  {f.title}
                </h3>
                <p className="text-[11px] text-n-muted leading-tight">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

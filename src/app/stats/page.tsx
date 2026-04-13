import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/db/prisma';
import { auth } from '@/auth';
import { WeatherResult } from '@/lib/weather';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function StatsPage() {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    redirect("/login");
  }

  const sessions = await prisma.fishingSession.findMany({ 
    where: { userId: sessionUser.user.id },
    include: { catches: true } 
  });

  const totalSessions = sessions.length;
  const totalCatches  = sessions.reduce((acc, s) => acc + s.catchesCount, 0);
  const avgCatches    = totalSessions > 0 ? (totalCatches / totalSessions).toFixed(1) : 0;

  const fishTypes: Record<string, number> = {};
  sessions.forEach((s) => { if (s.fishType) fishTypes[s.fishType] = (fishTypes[s.fishType] || 0) + 1; });
  const mostCommonFish = Object.entries(fishTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Н/Д';

  let totalTemp = 0, tempCount = 0, bestCatchTemp = 0, maxCatches = -1;
  sessions.forEach((s) => {
    const weather = s.weatherJson as unknown as WeatherResult | null;
    if (weather) {
      totalTemp += weather.averages.temp; tempCount++;
      if (s.catchesCount > maxCatches) { maxCatches = s.catchesCount; bestCatchTemp = weather.averages.temp; }
    }
  });
  const avgTemp = tempCount > 0 ? (totalTemp / tempCount).toFixed(1) : 'Н/Д';

  const hourlyStats: Record<number, { count: number; totalCatches: number; totalTemp: number; tempCount: number }> = {};
  for (let i = 0; i < 24; i++) hourlyStats[i] = { count: 0, totalCatches: 0, totalTemp: 0, tempCount: 0 };
  sessions.forEach((s) => {
    const weather = s.weatherJson as unknown as WeatherResult | null;
    if (weather) {
      weather.hourly.time.forEach((time, i) => {
        const hour = new Date(time).getHours();
        hourlyStats[hour].count++;
        hourlyStats[hour].totalCatches += s.catchesCount / weather.hourly.time.length;
        hourlyStats[hour].totalTemp += weather.hourly.temperature[i];
        hourlyStats[hour].tempCount++;
      });
    }
  });

  const hourlyData = Object.entries(hourlyStats)
    .map(([hour, stats]) => ({
      hour:       parseInt(hour),
      avgCatches: stats.count > 0 ? (stats.totalCatches / stats.count).toFixed(2) : '0.00',
      avgTemp:    stats.tempCount > 0 ? (stats.totalTemp / stats.tempCount).toFixed(1) : 'Н/Д',
      activity:   stats.count,
    }))
    .filter((d) => d.activity > 0)
    .sort((a, b) => parseFloat(b.avgCatches) - parseFloat(a.avgCatches));

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📊</span>
          <h1 className="text-2xl font-bold text-n-text">Статистика</h1>
        </div>
        <p className="text-sm text-n-muted">Аналітичні дані ваших рибальських подорожей</p>
      </div>

      <div className="border-t border-n-border" />

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBlock label="Всього сесій" value={totalSessions} icon="⚓" />
        <StatBlock label="Всього уловів"  value={totalCatches}  icon="🐟" />
        <StatBlock label="Сер. за поїздку"   value={avgCatches}    icon="📈" />
        <StatBlock label="Топ видів"    value={mostCommonFish} icon="🎯" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <span className="text-base">☀️</span>
            <CardTitle>Аналіз погоди</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-n-border">
              <span className="text-sm text-n-muted">Сер. темп. сесії</span>
              <span className="text-sm font-semibold text-n-text">{avgTemp}°C</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-n-border">
              <span className="text-sm text-n-muted">Темп. найкращого улову</span>
              <span className="text-sm font-semibold text-n-accent">
                {bestCatchTemp > 0 ? `${bestCatchTemp.toFixed(1)}°C` : 'Н/Д'}
              </span>
            </div>
            <p className="text-xs text-n-subtle pt-1">На основі ваших сесій та історичних даних Open-Meteo.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-base">📈</span>
            <CardTitle>Ефективність</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-n-hover border border-n-border rounded p-3">
              <p className="text-xxs font-semibold text-n-subtle uppercase tracking-wider mb-1">Результативність</p>
              <p className="text-sm text-n-text">
                В середньому <span className="font-semibold text-n-accent">{avgCatches}</span> риб за одну поїздку.
              </p>
            </div>
            <div className="bg-n-hover border border-n-border rounded p-3">
              <p className="text-xxs font-semibold text-n-subtle uppercase tracking-wider mb-1">Основний метод</p>
              <p className="text-sm text-n-text">
                Більшість сесій записано як <span className="font-semibold text-n-green">поплавочна</span> риболовля.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly analysis */}
      <Card>
        <CardHeader>
          <span className="text-base">🕙</span>
          <CardTitle>Найкращі години для риболовлі</CardTitle>
          <span className="ml-auto text-xxs text-n-subtle">Ефективність за часом доби</span>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-n-border bg-n-hover">
                <th className="px-5 py-3 text-xxs font-semibold text-n-subtle uppercase tracking-wider">Година</th>
                <th className="px-5 py-3 text-xxs font-semibold text-n-subtle uppercase tracking-wider">Сер. темп улову</th>
                <th className="px-5 py-3 text-xxs font-semibold text-n-subtle uppercase tracking-wider">Сер. темп.</th>
                <th className="px-5 py-3 text-xxs font-semibold text-n-subtle uppercase tracking-wider">Сесії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-border">
              {hourlyData.length > 0 ? hourlyData.map((d) => (
                <tr key={d.hour} className="hover:bg-n-hover transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-n-text">{d.hour}:00</td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-medium ${
                      parseFloat(d.avgCatches) > parseFloat(avgCatches as string) / 4
                        ? 'text-n-green'
                        : 'text-n-text'
                    }`}>{d.avgCatches}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-n-muted">{d.avgTemp}°C</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 bg-n-hover border border-n-border rounded-sm text-xxs font-medium text-n-muted">
                      {d.activity}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-n-subtle">
                    Записуйте сесії з часом та локацією, щоб побачити погодинний аналіз
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Link
          href="/sessions/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-n-accent text-white text-sm font-medium rounded hover:bg-n-accent-hover transition-colors"
        >
          <span>+</span> Записати ще одну сесію
        </Link>
      </div>
    </div>
  );
}

function StatBlock({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-n-surface border border-n-border rounded-lg px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <p className="text-xxs font-semibold text-n-subtle uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-n-text truncate">{value}</p>
    </div>
  );
}

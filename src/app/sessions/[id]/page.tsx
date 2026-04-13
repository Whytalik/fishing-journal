import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/db/prisma';
import { formatDate } from '@/lib/utils';
import { FishingType } from '@/generated/client';
import { WeatherResult } from "@/lib/weather";
import { generateSessionSummary } from "@/lib/summarizer";
import CopyButton from "@/components/ui/CopyButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardSection } from "@/components/ui/Card";
import SessionMapClient from "@/components/SessionMapClient";
import ActiveSessionDashboard from "@/components/ActiveSessionDashboard";
import EditableSessionForm from "@/components/EditableSessionForm";
import SessionActions from "@/components/SessionActions";
import { getSpecies } from "@/app/actions/speciesActions";

const FISHING_TYPE_CONFIG: Record<FishingType, { label: string; badge: 'blue' | 'orange' | 'purple' | 'green' | 'gray' }> = {
  [FishingType.FLOAT]:    { label: 'Поплавок',    badge: 'blue'   },
  [FishingType.FEEDER]:   { label: 'Фідер',   badge: 'orange' },
  [FishingType.SPINNING]: { label: 'Спінінг', badge: 'purple' },
  [FishingType.HERABUNA]: { label: 'Херабуна', badge: 'green'  },
  [FishingType.OTHER]:    { label: 'Інше',    badge: 'gray'   },
};

export default async function SessionDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;

  const session = await prisma.fishingSession.findUnique({
    where: { id },
    include: { catches: true },
  });

  if (!session) notFound();

  const isLive = session.status === "ACTIVE";
  const isEditing = isLive || edit === "true";
  const species = await getSpecies();

  const formatTime = (date: Date | null) => {
    if (!date) return '—';
    return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  };

  const hasLocation = session.latitude && session.longitude;
  const weather = session.weatherJson as unknown as WeatherResult | null;
  const typeConfig = FISHING_TYPE_CONFIG[session.fishingType];

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/sessions" className="inline-flex items-center gap-1 text-xs text-n-muted hover:text-n-text transition-colors">
          ← Сесії
        </Link>
        <SessionActions sessionId={session.id} isEditing={isEditing && !isLive} />
      </div>

      {/* Page header */}
      <div className="border-b border-n-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={typeConfig.badge}>{typeConfig.label}</Badge>
            {isLive && <Badge variant="red" className="animate-pulse">Відстеження наживо</Badge>}
          </div>
          <h1 className="text-3xl font-bold text-n-text mb-1">{session.locationName || 'Сесія без назви'}</h1>
          <p className="text-sm text-n-muted">{formatDate(session.date)}</p>
        </div>
        {!isLive && (
           <div className="flex gap-2">
             <CopyButton text={generateSessionSummary(session)} label="Копіювати підсумок" />
           </div>
        )}
      </div>

      {isLive && (
        <ActiveSessionDashboard session={session} species={species} />
      )}

      {/* Unified Editable Form with Autosave */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          <h2 className="text-lg font-bold text-n-text">Налаштування сесії</h2>
        </div>
        <EditableSessionForm session={session} species={species} isEditing={isEditing} />
      </section>

      {!isLive && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-n-border">
          {/* Detailed Catches Grid */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-n-text flex items-center gap-2">
                <span>🎣</span> Галерея уловів
              </h2>
              <Badge variant="default">{session.catches.length} шт.</Badge>
            </div>
            
            {session.catches.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-n-border rounded-xl bg-n-surface/50">
                <p className="text-sm text-n-subtle">Для цієї сесії не записано детальних уловів.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {session.catches.map((c) => {
                  const catchWeather = c.weatherSnapshot as any;
                  return (
                    <div key={c.id} className="group bg-n-surface border border-n-border rounded-xl overflow-hidden hover:border-n-accent/50 transition-all shadow-sm">
                      {c.photoUrl && (
                        <div className="aspect-video w-full overflow-hidden border-b border-n-border relative">
                          <img src={c.photoUrl} alt={c.species} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-2 right-2">
                            <Badge variant="default" className="bg-n-bg/80 backdrop-blur-md border-n-border shadow-sm">
                              {new Date(c.caughtAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-n-text">{c.species}</h3>
                            {!c.photoUrl && (
                              <p className="text-[10px] text-n-muted">
                                {new Date(c.caughtAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                          {(c.weight || c.length) && (
                            <div className="text-right">
                              <p className="text-sm font-bold text-n-accent">{c.weight ? `${c.weight}кг` : ''}</p>
                              <p className="text-xxs text-n-muted">{c.length ? `${c.length}см` : ''}</p>
                            </div>
                          )}
                        </div>
                        {catchWeather?.averages && (
                          <div className="flex items-center gap-3 pt-2 border-t border-n-border/50">
                            <div className="flex items-center gap-1 text-[10px] text-n-muted">
                              <span>🌡️ {catchWeather.averages.temp}°C</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            {session.peakStartTime && session.peakEndTime && (
              <Card className="border-orange-500/30 bg-orange-500/5">
                <CardHeader>
                  <CardTitle className="text-orange-500 text-sm flex items-center gap-2">
                    <span>🔥</span> Пік активності
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xl font-mono font-bold text-n-text">
                    {formatTime(session.peakStartTime)} – {formatTime(session.peakEndTime)}
                  </p>
                  <div className="pt-3 border-t border-orange-500/20">
                    <p className="text-[11px] text-n-muted leading-relaxed">
                      Найпродуктивніший період: {session.catches.filter(c => 
                        c.caughtAt >= session.peakStartTime! && c.caughtAt <= session.peakEndTime!
                      ).length} уловів.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="overflow-hidden p-0 h-64">
              {hasLocation ? (
                <SessionMapClient location={[session.latitude!, session.longitude!]} />
              ) : (
                <div className="h-full bg-n-hover flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl">📍</span>
                  <p className="text-xs text-n-subtle">Координати на карті відсутні</p>
                </div>
              )}
            </Card>

            {weather && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Підсумок погоди</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs text-n-muted">
                    <span>Сер. темп.</span>
                    <span className="text-n-text font-medium">{weather.averages.temp}°C</span>
                  </div>
                  <div className="flex justify-between text-xs text-n-muted">
                    <span>Вітер</span>
                    <span className="text-n-text font-medium">{weather.averages.wind} км/год</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-n-surface border border-n-border rounded-lg px-4 py-3">
      <p className="text-xxs font-semibold text-n-subtle uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-n-text truncate">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xxs font-semibold text-n-subtle uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-n-text">{value ?? '—'}</p>
    </div>
  );
}

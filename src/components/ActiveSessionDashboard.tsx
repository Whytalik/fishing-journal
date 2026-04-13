"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { FishingSession, Catch, FishSpecies } from "@/generated/client";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { logCatch, endSession } from "@/app/actions/sessionActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import exifr from "exifr";

interface DashboardProps {
  session: FishingSession & { catches: Catch[] };
  species: FishSpecies[];
}

export default function ActiveSessionDashboard({ session, species }: DashboardProps) {
  const [elapsedTime, setElapsedTime] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState(species[0]?.name || "");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Timer logic
  useEffect(() => {
    const start = new Date(session.startTime || session.createdAt).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - start;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [session.startTime, session.createdAt]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      
      try {
        const metadata = await exifr.parse(file);
        if (metadata?.DateTimeOriginal) {
          toast.info(`Час витягнуто з фото: ${new Date(metadata.DateTimeOriginal).toLocaleTimeString()}`);
        }
      } catch (err) {
        console.warn("Could not parse EXIF", err);
      }
    }
  };

  const handleLogCatch = () => {
    startTransition(async () => {
      let caughtAt: Date | undefined = undefined;
      let latitude: number | undefined = undefined;
      let longitude: number | undefined = undefined;

      if (photo) {
        try {
          const meta = await exifr.parse(photo);
          if (meta?.DateTimeOriginal) caughtAt = new Date(meta.DateTimeOriginal);
          if (meta?.latitude && meta?.longitude) {
            latitude = meta.latitude;
            longitude = meta.longitude;
          }
        } catch (e) {}
      }

      const formData = new FormData();
      if (photo) formData.append("file", photo);

      const result = await logCatch({
        sessionId: session.id,
        species: selectedSpecies,
        weight: weight ? parseFloat(weight) : undefined,
        length: length ? parseFloat(length) : undefined,
        caughtAt,
        latitude,
        longitude,
        photo: photo ? formData : undefined
      });

      if (result.success) {
        toast.success(`Записано: ${selectedSpecies}!`);
        setWeight("");
        setLength("");
        setPhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast.error("Не вдалося записати улов");
      }
    });
  };

  const handleConfirmEndSession = () => {
    setIsEndModalOpen(false);
    startTransition(async () => {
      const result = await endSession(session.id);
      if (result.success) {
        toast.success("Сесію завершено!");
        router.refresh();
      } else {
        toast.error("Не вдалося завершити сесію");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <div>
            <p className="text-xxs font-bold text-red-500 uppercase tracking-widest">Сесія наживо</p>
            <p className="text-2xl font-mono font-bold text-n-text">{elapsedTime}</p>
          </div>
        </div>
        <Button variant="primary" className="bg-red-500 hover:bg-red-600 border-none" onClick={() => setIsEndModalOpen(true)} disabled={isPending}>
          Завершити сесію
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Log Catch */}
        <Card className="lg:col-span-2 border-n-accent/30 shadow-lg shadow-n-accent/5">
          <CardHeader className="bg-n-accent/5 border-b border-n-accent/10">
            <CardTitle className="text-n-accent flex items-center gap-2">
              <span>🐟</span> Швидкий запис улову
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <label className="text-xxs font-bold text-n-subtle uppercase tracking-widest">1. Оберіть вид</label>
              <Select 
                value={selectedSpecies} 
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full"
              >
                {species.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xxs font-bold text-n-subtle uppercase tracking-widest">2. Деталі (Опціонально)</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Вага (кг)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <Input
                    label="Довжина (см)"
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xxs font-bold text-n-subtle uppercase tracking-widest">3. Фото (Авто-дані)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[100px] border-2 border-dashed border-n-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-n-hover transition-colors overflow-hidden relative"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="text-2xl">📸</span>
                      <span className="text-[10px] text-n-muted font-bold mt-1 uppercase">Зробити фото або завантажити</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-n-accent hover:bg-n-accent-hover text-white font-bold py-7 text-xl rounded-2xl shadow-xl shadow-n-accent/20 transition-transform active:scale-[0.98]"
              onClick={handleLogCatch}
              disabled={isPending || !selectedSpecies}
            >
              {isPending ? "Запис..." : `Записати ${selectedSpecies}`}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Catches */}
        <Card className="flex flex-col h-full">
          <CardHeader className="py-4 px-5 border-b border-n-border">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              Останні улови
              <Badge variant="default" className="text-[10px]">{session.catches.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="h-full max-h-[550px] overflow-y-auto notion-scrollbar">
              {session.catches.length === 0 ? (
                <div className="p-12 text-center text-n-muted italic text-sm">
                  Чекаємо на перший улов... 🎣
                </div>
              ) : (
                <div className="divide-y divide-n-border">
                  {[...session.catches].reverse().map((c) => {
                    const catchWeather = c.weatherSnapshot as any;
                    return (
                      <div key={c.id} className="p-4 flex gap-3 hover:bg-n-hover/50 transition-colors">
                        {c.photoUrl && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-n-border">
                            <img src={c.photoUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className="text-sm font-bold text-n-text truncate">{c.species}</p>
                            <span className="text-[10px] font-mono text-n-accent">
                              {new Date(c.caughtAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                            {(c.weight || c.length) && (
                              <span className="text-[11px] text-n-text font-medium bg-n-active px-1.5 py-0.5 rounded">
                                {c.weight ? `${c.weight}кг` : ''}{c.weight && c.length ? ' • ' : ''}{c.length ? `${c.length}см` : ''}
                              </span>
                            )}
                            {catchWeather?.averages && (
                              <span className="text-[10px] text-n-muted flex items-center gap-1">
                                🌡️ {catchWeather.averages.temp}°C
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal 
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onConfirm={handleConfirmEndSession}
        title="Завершити риболовлю"
        description="Ви впевнені, що хочете завершити цю сесію? Ви зможете редагувати деталі пізніше, але живий таймер зупиниться."
        confirmText="Завершити"
        variant="danger"
        isLoading={isPending}
      />
    </div>
  );
}

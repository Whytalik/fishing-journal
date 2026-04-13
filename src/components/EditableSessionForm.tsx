"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FishingType, FishSpecies, FishingSession } from "@/generated/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { updateSession } from "@/app/actions/sessionActions";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-n-active animate-pulse rounded-lg flex items-center justify-center text-sm text-n-muted">
      Завантаження карти…
    </div>
  ),
});

const formSchema = z.object({
  date:         z.string(),
  locationName: z.string().min(1, "Назва локації обов'язкова"),
  spotName:     z.string().optional(),
  latitude:     z.number().optional(),
  longitude:    z.number().optional(),
  startTime:    z.string().optional(),
  endTime:      z.string().optional(),
  peakStartTime: z.string().optional(),
  peakEndTime:   z.string().optional(),
  fishingType:  z.nativeEnum(FishingType),
  fishType:     z.string().optional(),
  bait:         z.string().optional(),
  depth:        z.string().optional(),
  notes:        z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditableSessionFormProps {
  session: FishingSession;
  species: FishSpecies[];
  isEditing?: boolean;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xxs font-semibold text-n-subtle uppercase tracking-wider">
      {children}
    </p>
  );
}

export default function EditableSessionForm({ session, species, isEditing = true }: EditableSessionFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isInitialMount = useRef(true);

  const formatTimeToInput = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date:         new Date(session.date).toISOString().split("T")[0],
      locationName: session.locationName,
      spotName:     session.spotName || "",
      latitude:     session.latitude || undefined,
      longitude:    session.longitude || undefined,
      startTime:    formatTimeToInput(session.startTime),
      endTime:      formatTimeToInput(session.endTime),
      peakStartTime: formatTimeToInput(session.peakStartTime),
      peakEndTime:   formatTimeToInput(session.peakEndTime),
      fishingType:  session.fishingType,
      fishType:     session.fishType || "",
      bait:         session.bait || "",
      depth:        session.depth?.toString() || "",
      notes:        session.notes || "",
    },
  });

  const formData = watch();

  const handleAutosave = useCallback(async (data: FormValues) => {
    // Don't save if not in editing mode or there are errors
    if (!isEditing || Object.keys(errors).length > 0) return;
    
    setIsSaving(true);
    try {
      const result = await updateSession(session.id, data);
      if (result.success) {
        setLastSaved(new Date());
      } else {
        toast.error("Автозбереження не вдалося: " + (result.error || "Невідома помилка"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }, [session.id, errors, isEditing]);

  // Debounced effect for autosave
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isDirty || !isEditing) return;

    const timer = setTimeout(() => {
      handleAutosave(formData);
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [formData, isDirty, handleAutosave, isEditing]);

  const handleLocationSelect = (lat: number, lng: number) => {
    if (!isEditing) return;
    setValue("latitude", lat, { shouldDirty: true });
    setValue("longitude", lng, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SectionLabel>Конфігурація сесії</SectionLabel>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="text-[10px] text-n-accent animate-pulse flex items-center gap-1">
                <span className="w-1 h-1 bg-n-accent rounded-full animate-bounce" /> Збереження...
              </span>
            ) : lastSaved ? (
              <span className="text-[10px] text-n-green opacity-70">
                Останнє збереження: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-n-surface border border-n-border rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-n-border bg-n-hover">
              <SectionLabel>Загальна інформація</SectionLabel>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Дата" type="date" disabled={!isEditing} {...register("date")} />
                <Select label="Тип риболовлі" disabled={!isEditing} {...register("fishingType")}>
                  <option value={FishingType.FLOAT}>Поплавок</option>
                  <option value={FishingType.FEEDER}>Фідер</option>
                  <option value={FishingType.SPINNING}>Спінінг</option>
                  <option value={FishingType.HERABUNA}>Херабуна</option>
                  <option value={FishingType.OTHER}>Інше</option>
                </Select>
              </div>
              <Input label="Назва локації" disabled={!isEditing} {...register("locationName")} error={errors.locationName?.message} />
              <Input label="Назва точки" disabled={!isEditing} placeholder="напр. Біля старого мосту" {...register("spotName")} />
            </div>
          </div>

          <div className="bg-n-surface border border-n-border rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-n-border bg-n-hover">
              <SectionLabel>Точка на карті</SectionLabel>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className={`h-[300px] w-full rounded-lg overflow-hidden border border-n-border ${!isEditing ? 'pointer-events-none opacity-80' : ''}`}>
                <MapPicker onLocationSelect={handleLocationSelect} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-n-surface border border-n-border rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-n-border bg-n-hover">
              <SectionLabel>Деталі поїздки</SectionLabel>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Час початку" type="time" disabled={!isEditing} {...register("startTime")} />
                <Input label="Час завершення"   type="time" disabled={!isEditing} {...register("endTime")}   />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Цільова риба" disabled={!isEditing} {...register("fishType")}>
                  <option value="">Будь-який вид</option>
                  {species.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </Select>
                <Input label="Наживка / Приманка" disabled={!isEditing} placeholder="напр. Хробаки" {...register("bait")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Глибина (м)" disabled={!isEditing} type="number" step="0.1" {...register("depth")} />
                <div className="flex flex-col gap-1.5">
                   <label className="text-xxs font-bold text-n-subtle uppercase tracking-widest">Записана статистика</label>
                   <div className="h-9 px-3 flex items-center bg-n-active/30 border border-n-border rounded text-sm text-n-text font-medium">
                     {session.catchesCount} уловів
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-n-surface border border-n-border rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-n-border bg-n-hover">
              <SectionLabel>Нотатки журналу</SectionLabel>
            </div>
            <div className="px-5 py-4">
              <Textarea
                rows={8}
                disabled={!isEditing}
                placeholder="Яким був ваш досвід?"
                {...register("notes")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

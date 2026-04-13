"use client";

import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FishingType, FishSpecies } from "@/generated/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createSession } from "@/app/actions/sessionActions";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-n-active animate-pulse rounded-lg flex items-center justify-center text-sm text-n-muted">
      Loading map…
    </div>
  ),
});

const formSchema = z.object({
  date:         z.string().min(1, "Date is required"),
  locationName: z.string().min(1, "Location is required"),
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
  catchesCount: z.string(),
  notes:        z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewSessionFormProps {
  species: FishSpecies[];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xxs font-semibold text-n-subtle uppercase tracking-wider">
      {children}
    </p>
  );
}

export default function NewSessionForm({ species }: NewSessionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date:         new Date().toISOString().split("T")[0],
      fishingType:  FishingType.FLOAT,
      catchesCount: "0",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      await createSession(data);
    });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      // Use Nominatim OpenStreetMap API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "uk,en" } }
      );
      
      if (!response.ok) throw new Error("Geocoding failed");
      
      const data = await response.json();
      const address = data.address;
      
      // Heuristic: prioritize water bodies or natural landmarks
      let name = "";
      if (address.waterway) name = address.waterway;
      else if (address.natural) name = address.natural;
      else if (address.lake) name = address.lake;
      else if (address.river) name = address.river;
      else if (address.village) name = address.village;
      else if (address.town) name = address.town;
      else if (address.city) name = address.city;
      else if (data.display_name) {
        // Fallback to first part of display name
        name = data.display_name.split(",")[0];
      }

      if (name) {
        setValue("locationName", name, { shouldValidate: true });
        toast.success(`Location set to: ${name}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
    reverseGeocode(lat, lng);
  };

  const lat = watch("latitude");
  const lng = watch("longitude");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: General Info & Map */}
        <div className="space-y-6">
          <div className="bg-n-surface border border-n-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-n-border bg-n-hover">
              <SectionLabel>General Info</SectionLabel>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Date" type="date" error={errors.date?.message} {...register("date")} />
                <Select label="Fishing Type" error={errors.fishingType?.message} {...register("fishingType")}>
                  <option value={FishingType.FLOAT}>Float</option>
                  <option value={FishingType.FEEDER}>Feeder</option>
                  <option value={FishingType.SPINNING}>Spinning</option>
                  <option value={FishingType.HERABUNA}>Herabuna</option>
                  <option value={FishingType.OTHER}>Other</option>
                </Select>
              </div>
              <Input 
                label="Location Name" 
                placeholder={isGeocoding ? "Detecting location..." : "e.g. Dnipro River"} 
                error={errors.locationName?.message} 
                {...register("locationName")} 
              />
              <Input label="Spot Name" placeholder="e.g. Near the old bridge (optional)" {...register("spotName")} />
            </div>
          </div>

          <div className="bg-n-surface border border-n-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-n-border bg-n-hover">
              <SectionLabel>Map Spot</SectionLabel>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="h-[400px] w-full rounded-lg overflow-hidden border border-n-border">
                <MapPicker onLocationSelect={handleLocationSelect} />
              </div>
              {lat && lng && (
                <p className="text-xxs font-mono text-n-subtle text-right">
                  {isGeocoding ? "Identifying location..." : `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Trip Details & Notes */}
        <div className="space-y-6">
          <div className="bg-n-surface border border-n-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-n-border bg-n-hover">
              <SectionLabel>Trip Details</SectionLabel>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time" type="time" {...register("startTime")} />
                <Input label="End Time"   type="time" {...register("endTime")}   />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Best Bite Start" type="time" {...register("peakStartTime")} />
                <Input label="Best Bite End"   type="time" {...register("peakEndTime")}   />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Target Fish" error={errors.fishType?.message} {...register("fishType")}>
                  <option value="">Any Species</option>
                  {species.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </Select>
                <Input label="Bait / Lure" placeholder="e.g. Worms, Corn" {...register("bait")}     />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Depth (m)"     type="number" step="0.1" placeholder="0.0" {...register("depth")}        />
                <Input label="Catches Count" type="number"                               {...register("catchesCount")} />
              </div>
            </div>
          </div>

          <div className="bg-n-surface border border-n-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-n-border bg-n-hover">
              <SectionLabel>Notes</SectionLabel>
            </div>
            <div className="px-5 py-4">
              <Textarea
                rows={9}
                placeholder="How was the experience? Any specific observations?"
                error={errors.notes?.message}
                {...register("notes")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className={`w-full justify-center ${isPending ? "opacity-60" : ""}`}
        >
          {isPending ? "Saving Session…" : "Save Fishing Session"}
        </Button>
      </div>
    </form>
  );
}

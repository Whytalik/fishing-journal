"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { startLiveSession } from "@/app/actions/sessionActions";
import { toast } from "sonner";

export default function JITStartButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setIsLoading(true);
    toast.info("Отримуємо локацію...");

    if (!navigator.geolocation) {
      toast.error("Геолокація не підтримується вашим браузером");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Reverse geocode to get a name
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "Accept-Language": "uk,en" } }
        );
        const data = await response.json();
        
        const locationName = data.address.waterway || 
                           data.address.natural || 
                           data.address.lake || 
                           data.address.river || 
                           data.address.village || 
                           data.address.town || 
                           data.address.city || 
                           "Поточне місце";

        const result = await startLiveSession({ latitude, longitude, locationName });
        
        if (result.success) {
          toast.success("Сесію наживо розпочато!");
          router.push(`/sessions/${result.sessionId}`);
        } else {
          toast.error(result.error || "Не вдалося розпочати сесію");
        }
      } catch (error) {
        toast.error("Помилка під час початку сесії");
      } finally {
        setIsLoading(false);
      }
    }, (error) => {
      toast.error("Не вдалося отримати вашу локацію. Перевірте дозволи.");
      setIsLoading(false);
    });
  };

  return (
    <Button 
      variant="primary" 
      size="md" 
      className="rounded-lg px-5 h-10 bg-red-500 hover:bg-red-600 border-none animate-pulse shadow-lg"
      onClick={handleStart}
      disabled={isLoading}
    >
      {isLoading ? "Початок..." : "🔴 Наживо"}
    </Button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

interface SessionDurationBadgeProps {
  startTime: Date;
}

export default function SessionDurationBadge({ startTime }: SessionDurationBadgeProps) {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const calculate = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      setMinutes(Math.floor((now - start) / 60000));
    };

    calculate();
    const interval = setInterval(calculate, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <Badge variant="orange" className="font-mono">
      ⏱️ {minutes} хв
    </Badge>
  );
}

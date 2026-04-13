"use client";

import React, { useMemo, useState } from "react";
import SessionCard from "./SessionCard";
import { FishingType } from "@/generated/client";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "./ui/Badge";

type GroupBy = "none" | "date" | "season" | "type" | "location";

interface Session {
  id: string;
  date: Date;
  locationName: string;
  fishingType: FishingType;
  catchesCount: number;
  fishType?: string | null;
}

interface SessionListProps {
  sessions: Session[];
}

const FISHING_TYPE_LABELS: Record<FishingType, string> = {
  [FishingType.FLOAT]: "Поплавок",
  [FishingType.FEEDER]: "Фідер",
  [FishingType.SPINNING]: "Спінінг",
  [FishingType.HERABUNA]: "Херабуна",
  [FishingType.OTHER]: "Інше",
};

export default function SessionList({ sessions }: SessionListProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  const groupedSessions = useMemo(() => {
    if (groupBy === "none") return { "Усі сесії": sessions };

    const groups: Record<string, Session[]> = {};

    sessions.forEach((session) => {
      let key = "";
      if (groupBy === "date") {
        const d = new Date(session.date);
        key = d.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
      } else if (groupBy === "season") {
        const month = new Date(session.date).getMonth();
        if ([11, 0, 1].includes(month)) key = "Зима ❄️";
        else if ([2, 3, 4].includes(month)) key = "Весна 🌱";
        else if ([5, 6, 7].includes(month)) key = "Літо ☀️";
        else key = "Осінь 🍂";
      } else if (groupBy === "type") {
        key = FISHING_TYPE_LABELS[session.fishingType];
      } else if (groupBy === "location") {
        key = session.locationName;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });

    return groups;
  }, [sessions, groupBy]);

  const groupKeys = Object.keys(groupedSessions);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-1 bg-n-hover rounded-lg w-fit overflow-x-auto max-w-full no-scrollbar">
        <button
          onClick={() => setGroupBy("none")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
            groupBy === "none"
              ? "bg-n-surface text-n-text shadow-sm"
              : "text-n-muted hover:text-n-text"
          )}
        >
          Усі
        </button>
        <button
          onClick={() => setGroupBy("date")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
            groupBy === "date"
              ? "bg-n-surface text-n-text shadow-sm"
              : "text-n-muted hover:text-n-text"
          )}
        >
          За місяцями
        </button>
        <button
          onClick={() => setGroupBy("season")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
            groupBy === "season"
              ? "bg-n-surface text-n-text shadow-sm"
              : "text-n-muted hover:text-n-text"
          )}
        >
          За сезонами
        </button>
        <button
          onClick={() => setGroupBy("type")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
            groupBy === "type"
              ? "bg-n-surface text-n-text shadow-sm"
              : "text-n-muted hover:text-n-text"
          )}
        >
          За типами
        </button>
        <button
          onClick={() => setGroupBy("location")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
            groupBy === "location"
              ? "bg-n-surface text-n-text shadow-sm"
              : "text-n-muted hover:text-n-text"
          )}
        >
          За локаціями
        </button>
      </div>

      <div className="space-y-10">
        {groupKeys.map((group) => (
          <div key={group} className="space-y-4">
            {groupBy !== "none" && (
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-n-text capitalize">
                  {group}
                </h2>
                <Badge variant="default" className="text-xxs opacity-70">
                  {groupedSessions[group].length}
                </Badge>
                <div className="h-px flex-1 bg-n-border/50" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {groupedSessions[group].map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

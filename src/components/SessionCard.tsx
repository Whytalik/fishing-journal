import React from 'react';
import Link from 'next/link';
import { FishingType } from '@/generated/client';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface SessionCardProps {
  session: {
    id: string;
    date: Date;
    locationName: string;
    fishingType: FishingType;
    catchesCount: number;
    fishType?: string | null;
  };
}

const FISHING_TYPE_CONFIG: Record<FishingType, { label: string; badge: 'blue' | 'orange' | 'purple' | 'green' | 'gray' }> = {
  [FishingType.FLOAT]:    { label: 'Поплавок',    badge: 'blue'   },
  [FishingType.FEEDER]:   { label: 'Фідер',   badge: 'orange' },
  [FishingType.SPINNING]: { label: 'Спінінг', badge: 'purple' },
  [FishingType.HERABUNA]: { label: 'Херабуна', badge: 'green'  },
  [FishingType.OTHER]:    { label: 'Інше',    badge: 'gray'   },
};

export default function SessionCard({ session }: SessionCardProps) {
  const config = FISHING_TYPE_CONFIG[session.fishingType];

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group block bg-n-surface border border-n-border rounded-lg p-4 hover:bg-n-hover transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={config.badge}>{config.label}</Badge>
            {session.fishType && (
              <span className="text-xxs text-n-subtle truncate">{session.fishType}</span>
            )}
          </div>
          <p className="text-sm font-medium text-n-text truncate group-hover:text-n-accent transition-colors">
            {session.locationName}
          </p>
          <p className="text-xs text-n-subtle mt-1">{formatDate(session.date)}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-semibold text-n-text tabular-nums">{session.catchesCount}</p>
          <p className="text-xxs text-n-subtle uppercase tracking-wide">уловів</p>
        </div>
      </div>
    </Link>
  );
}

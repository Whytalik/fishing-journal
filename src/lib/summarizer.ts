import { FishingType } from "../generated/client";
import { WeatherResult } from "./weather";

interface SummaryData {
  locationName: string;
  startTime?: Date | null;
  endTime?: Date | null;
  catchesCount: number;
  fishType?: string | null;
  fishingType: FishingType;
  weatherJson?: any;
  notes?: string | null;
}

const FISHING_TYPE_LABELS: Record<FishingType, string> = {
  [FishingType.FLOAT]: 'Поплавок',
  [FishingType.FEEDER]: 'Фідер',
  [FishingType.SPINNING]: 'Спінінг',
  [FishingType.HERABUNA]: 'Херабуна',
  [FishingType.OTHER]: 'Риболовля',
};

/**
 * Generates a concise summary of a fishing session for content creation (e.g., YouTube).
 */
export function generateSessionSummary(session: SummaryData): string {
  const formatTime = (d?: Date | null) => d ? d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : '';
  
  const timeRange = session.startTime && session.endTime 
    ? `${formatTime(session.startTime)} - ${formatTime(session.endTime)}` 
    : 'Ранкова/Денна сесія';

  const weather = session.weatherJson as WeatherResult | null;
  const weatherPart = weather 
    ? `Умови: ${weather.averages.temp}°C, вітер ${weather.averages.wind} км/год.` 
    : 'Дані про погоду відсутні.';

  const catchPart = session.catchesCount > 0 
    ? `Результат: спіймано ${session.catchesCount} ${session.fishType || 'шт.'}, метод: ${FISHING_TYPE_LABELS[session.fishingType].toLowerCase()}.`
    : `Результат: невдалий день, сьогодні без улову.`;

  // Key Insight Logic
  let insight = "Ключовий висновок: ";
  if (session.notes && session.notes.length > 10) {
    insight += session.notes.split('.')[0] + '.';
  } else if (weather && weather.averages.wind < 10) {
    insight += "Слабкий вітер забезпечив чудову презентацію наживки.";
  } else if (weather && weather.averages.temp > 25) {
    insight += "Висока температура змусила рибу піти на глибину.";
  } else {
    insight += "Стабільне підгодовування точки було головним фактором сьогодні.";
  }

  return `\u{1F3A3} ${session.locationName} | ${timeRange}\n\n${weatherPart}\n${catchPart}\n${insight}\n\n#риболовля #fishing #fishingukraine`;
}

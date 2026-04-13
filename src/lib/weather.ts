export interface WeatherHourlyData {
  time: string[];
  temperature_2m: number[];
  wind_speed_10m: number[];
  surface_pressure: number[];
  cloud_cover: number[];
  precipitation: number[];
}

export interface WeatherResult {
  hourly: {
    time: string[];
    temperature: number[];
    windSpeed: number[];
    pressure: number[];
    cloudCover: number[];
    precipitation: number[];
  };
  averages: {
    temp: number;
    wind: number;
  };
}

/**
 * Fetches hourly weather data from Open-Meteo and filters it by the session time range.
 */
export async function getSessionWeather(
  lat: number,
  lng: number,
  date: Date,
  startTime?: Date,
  endTime?: Date
): Promise<WeatherResult | null> {
  try {
    const dateStr = date.toISOString().split("T")[0];
    
    // Determine API endpoint (archive for past, forecast for current/future)
    const isPast = new Date(dateStr) < new Date(new Date().toISOString().split("T")[0]);
    const baseUrl = isPast 
      ? "https://archive-api.open-meteo.com/v1/archive" 
      : "https://api.open-meteo.com/v1/forecast";

    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      start_date: dateStr,
      end_date: dateStr,
      hourly: "temperature_2m,wind_speed_10m,surface_pressure,cloud_cover,precipitation",
      timezone: "auto",
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) throw new Error("Weather API error");

    const data = await response.json();
    const hourly = data.hourly as WeatherHourlyData;

    // Filtering logic
    // Open-Meteo returns hourly data for the full day (00:00 - 23:00)
    let filteredIndices = hourly.time.map((_, index) => index);

    if (startTime || endTime) {
      filteredIndices = hourly.time.reduce((acc: number[], timeStr, index) => {
        const hour = new Date(timeStr).getHours();
        const startHour = startTime ? startTime.getHours() : 0;
        const endHour = endTime ? endTime.getHours() : 23;

        if (hour >= startHour && hour <= endHour) {
          acc.push(index);
        }
        return acc;
      }, []);
    }

    const result: WeatherResult = {
      hourly: {
        time: filteredIndices.map(i => hourly.time[i]),
        temperature: filteredIndices.map(i => hourly.temperature_2m[i]),
        windSpeed: filteredIndices.map(i => hourly.wind_speed_10m[i]),
        pressure: filteredIndices.map(i => hourly.surface_pressure[i]),
        cloudCover: filteredIndices.map(i => hourly.cloud_cover[i]),
        precipitation: filteredIndices.map(i => hourly.precipitation[i]),
      },
      averages: {
        temp: 0,
        wind: 0,
      }
    };

    // Calculate Averages
    if (result.hourly.temperature.length > 0) {
      const sumTemp = result.hourly.temperature.reduce((a, b) => a + b, 0);
      result.averages.temp = parseFloat((sumTemp / result.hourly.temperature.length).toFixed(1));
      
      const sumWind = result.hourly.windSpeed.reduce((a, b) => a + b, 0);
      result.averages.wind = parseFloat((sumWind / result.hourly.windSpeed.length).toFixed(1));
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}

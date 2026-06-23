// Helper partagé pour obtenir la météo locale dynamique via OpenWeatherMap
export async function getWeatherForecast(lat: number | null, lon: number | null, scheduledAt: string): Promise<string> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  
  if (!lat || !lon || !apiKey || apiKey.includes('votre_') || apiKey.length < 5) {
    // Fallback simulation dynamique si pas de clé
    const dateObj = new Date(scheduledAt);
    const hour = dateObj.getHours();
    const isNight = hour >= 20 || hour <= 6;
    const temp = isNight ? '14°C' : '20°C';
    
    if (isNight) {
      return `🌙 ${temp}, ciel dégagé. Frontale conseillée`;
    } else {
      return `☀️ ${temp}, ensoleillé. Short idéal`;
    }
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;
    const res = await fetch(url, { next: { revalidate: 600 } }); // Cache 10 minutes
    
    if (!res.ok) {
      console.warn(`[OpenWeatherMap API] Statut de réponse invalide: ${res.status}`);
      return `🏃 Conditions locales de saison.`;
    }

    const data = await res.json();
    const runTimeMs = new Date(scheduledAt).getTime();
    
    // Trouver le créneau de prévision le plus proche (OpenWeatherMap renvoie toutes les 3 heures)
    let closestForecast = data.list?.[0];
    let minDiff = Infinity;
    
    for (const forecast of data.list || []) {
      const forecastTimeMs = forecast.dt * 1000;
      const diff = Math.abs(forecastTimeMs - runTimeMs);
      if (diff < minDiff) {
        minDiff = diff;
        closestForecast = forecast;
      }
    }

    if (!closestForecast) {
      return `🏃 Conditions météo locales habituelles.`;
    }

    const temp = Math.round(closestForecast.main.temp);
    const desc = closestForecast.weather?.[0]?.description || '';
    const mainWeather = closestForecast.weather?.[0]?.main || '';

    // Définir des icônes et conseils précis
    let icon = '☀️';
    let advice = 'short idéal';
    
    if (mainWeather === 'Rain' || mainWeather === 'Drizzle' || desc.includes('pluie') || desc.includes('rain')) {
      icon = '🌧️';
      advice = 'k-way requis, chaussures de route OK';
    } else if (mainWeather === 'Snow' || desc.includes('neige') || desc.includes('snow')) {
      icon = '❄️';
      advice = 'vêtements thermiques requis';
    } else if (mainWeather === 'Clouds' || desc.includes('nuage') || desc.includes('clouds')) {
      icon = '☁️';
      advice = 't-shirt OK';
    } else if (temp < 10) {
      icon = '❄️';
      advice = 'couvre-chef et gants recommandés';
    } else if (temp > 25) {
      icon = '☀️';
      advice = 'casquette et hydratation indispensables';
    }

    return `${icon} ${temp}°C, ${advice}`;
  } catch (err) {
    console.error('[OpenWeatherMap API Exception]:', err);
    return `🏃 Conditions météo locales habituelles.`;
  }
}

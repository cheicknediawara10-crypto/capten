// --- STRUCTURED JSON LOGGER FOR RAILWAY & MONITORING ---
export type LogLevel = 'info' | 'warn' | 'error';

export const log = (level: LogLevel, event: string, data?: Record<string, any>) => {
  const logPayload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data
  };

  const jsonString = JSON.stringify(logPayload);

  switch (level) {
    case 'error':
      console.error(jsonString);
      break;
    case 'warn':
      console.warn(jsonString);
      break;
    case 'info':
    default:
      console.log(jsonString);
      break;
  }
};

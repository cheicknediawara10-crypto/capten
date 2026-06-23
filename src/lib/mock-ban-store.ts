// Shared in-memory store for banned/blacklisted runners in offline/development mock mode
export const mockBannedPhones = new Set<string>();
export const mockBannedRunnerIds = new Set<string>();

export function banRunner(phoneOrId: string) {
  const clean = phoneOrId.replace(/[\s\.\-\(\)]/g, '');
  if (clean.length > 5 && /^\d+$/.test(clean)) {
    mockBannedPhones.add(clean);
  } else {
    mockBannedRunnerIds.add(phoneOrId);
  }
}

export function unbanRunner(phoneOrId: string) {
  const clean = phoneOrId.replace(/[\s\.\-\(\)]/g, '');
  mockBannedPhones.delete(clean);
  mockBannedPhones.delete(phoneOrId);
  mockBannedRunnerIds.delete(phoneOrId);
}

export function isRunnerBanned(phone: string, id?: string): boolean {
  const clean = phone.replace(/[\s\.\-\(\)]/g, '');
  if (mockBannedPhones.has(clean) || mockBannedPhones.has(phone)) {
    return true;
  }
  if (id && mockBannedRunnerIds.has(id)) {
    return true;
  }
  return false;
}

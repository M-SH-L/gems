export const mockPlayCalls: Array<{ theme: string; action: string }> = [];

export function resetMockAudio() {
  mockPlayCalls.length = 0;
}

export function trackPlay(theme: string, action: string) {
  mockPlayCalls.push({ theme, action });
}

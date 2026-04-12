export interface TestRunCategory {
  id: string;
  en: string;
  ok: number;
  blocked: number;
  dpi: number;
  suspicious: number;
  geoBlocked: number;
  total: number;
}

export interface TestRun {
  id: string;
  timestamp: number;
  categories: TestRunCategory[];
}

export const STORAGE_KEY = 'dpi-checker-history';
const MAX_RUNS = 100;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeHistory(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function saveTestRun(data: Omit<TestRun, 'id'>): void {
  const history = getHistory();
  const run: TestRun = { ...data, id: crypto.randomUUID() };
  history.unshift(run);
  if (history.length > MAX_RUNS) history.length = MAX_RUNS;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    notify();
  } catch {}
}

export function getHistory(): TestRun[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TestRun[]) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

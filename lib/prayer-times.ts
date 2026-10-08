import { PRAYERS, type PrayerKey } from "./schedule";

const API_BASE = "https://api.myquran.com/v2/sholat/jadwal";
//const API_BASE = "https://api.myquran.com/v3/sholat/jadwal/";
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const CITY_ID_RE = /^[A-Za-z0-9]{1,40}$/;

export type PrayerTimes = { lokasi: string; times: Record<PrayerKey, string> };

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** Data dari luar dianggap tidak dipercaya sampai lolos validasi. */
export function parsePayload(json: unknown): PrayerTimes | null {
  if (!isRecord(json) || !isRecord(json.data)) return null;
  const { lokasi, jadwal } = json.data;
  if (!isRecord(jadwal)) return null;

  const times = {} as Record<PrayerKey, string>;
  for (const p of PRAYERS) {
    const v = jadwal[p];
    if (typeof v !== "string" || !TIME_RE.test(v)) return null;
    times[p] = v;
  }
  return { lokasi: typeof lokasi === "string" ? lokasi : "", times };
}

export async function fetchPrayerTimes(
  cityId: string,
  dateISO: string,
  signal?: AbortSignal,
): Promise<PrayerTimes> {
  if (!CITY_ID_RE.test(cityId)) throw new Error("City ID tidak valid");

  const cacheKey = `jadwal:${cityId}:${dateISO}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    const parsed = cached ? parsePayload({ data: JSON.parse(cached) }) : null;
    if (parsed) return parsed;
  } catch {
    /* storage diblokir atau isinya rusak: lanjut fetch */
  }

  const res = await fetch(
    `${API_BASE}/${encodeURIComponent(cityId)}/${dateISO}`,
    { signal, headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json: unknown = await res.json();
  const parsed = parsePayload(json);
  if (!parsed) throw new Error("Format respons tidak dikenali");

  try {
    const data = (json as { data: unknown }).data;
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    /* abaikan */
  }
  return parsed;
}

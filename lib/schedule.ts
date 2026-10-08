import { ANCHOR_DATE, SURAH_GROUPS } from "./surah-groups";

export const PRAYERS = ["subuh", "dzuhur", "ashar", "maghrib", "isya"] as const;
export type PrayerKey = (typeof PRAYERS)[number];

export const PRAYER_LABEL: Record<PrayerKey, string> = {
  subuh: "Subuh",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Maghrib",
  isya: "Isya",
};

const DAY_MS = 86_400_000;
const TIMEZONE = "Asia/Jakarta";
const ANCHOR_UTC = Date.UTC(ANCHOR_DATE[0], ANCHOR_DATE[1] - 1, ANCHOR_DATE[2]);

const mod = (n: number, m: number) => ((n % m) + m) % m;

const wibFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export type WibNow = { dateISO: string; minutes: number; dayOffset: number };

/** Tanggal, jam, dan selisih hari dari anchor, semuanya berdasarkan WIB. */
export function getWibNow(now: Date = new Date()): WibNow {
  const p = Object.fromEntries(
    wibFormatter.formatToParts(now).map((x) => [x.type, x.value]),
  );
  const todayUTC = Date.UTC(+p.year, +p.month - 1, +p.day);
  return {
    dateISO: `${p.year}-${p.month}-${p.day}`,
    minutes: +p.hour * 60 + +p.minute,
    dayOffset: Math.floor((todayUTC - ANCHOR_UTC) / DAY_MS),
  };
}

/**
 * Waktu solat yang sedang aktif = solat terakhir yang jamnya sudah lewat.
 * Sebelum Subuh, yang aktif masih Isya dari hari sebelumnya (dayShift -1).
 */
export function getActivePrayer(
  times: Record<PrayerKey, number>, // menit sejak 00:00
  minutes: number,
): { prayer: PrayerKey; dayShift: 0 | -1 } {
  if (minutes < times.subuh) return { prayer: "isya", dayShift: -1 };
  let active: PrayerKey = "subuh";
  for (const p of PRAYERS) if (minutes >= times[p]) active = p;
  return { prayer: active, dayShift: 0 };
}

/** Judul surat untuk satu waktu solat pada satu hari (dayOffset dari anchor). */
export function getSurahTitles(
  prayer: PrayerKey,
  dayOffset: number,
): readonly string[] {
  const slot = PRAYERS.indexOf(prayer);
  return SURAH_GROUPS[mod(slot - dayOffset, SURAH_GROUPS.length)];
}

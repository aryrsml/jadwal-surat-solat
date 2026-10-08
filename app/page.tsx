"use client";

import { useEffect, useState } from "react";
import { fetchPrayerTimes, toMinutes, type PrayerTimes } from "@/lib/prayer-times";
import {
  PRAYERS,
  PRAYER_LABEL,
  getActivePrayer,
  getSurahTitles,
  getWibNow,
  type PrayerKey,
  type WibNow,
} from "@/lib/schedule";

const CITY_ID = process.env.NEXT_PUBLIC_CITY_ID ?? "1301";

export default function Page() {
  const [now, setNow] = useState<WibNow | null>(null);
  const [data, setData] = useState<PrayerTimes | null>(null);
  const [failed, setFailed] = useState(false);

  // Dihitung di client supaya "hari ini" tidak ikut terbakar di HTML static.
  useEffect(() => {
    setNow(getWibNow());
    const id = setInterval(() => setNow(getWibNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Fetch ulang hanya saat tanggal WIB berganti.
  const dateISO = now?.dateISO;
  useEffect(() => {
    if (!dateISO) return;
    let cancelled = false;
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8_000);

    setFailed(false);
    fetchPrayerTimes(CITY_ID, dateISO, ctrl.signal)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setFailed(true))
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(timeout);
    };
  }, [dateISO]);

  if (!now || !data) {
    return (
      <main className="screen" data-prayer="isya">
        <p className="status" role="status">
          {failed
            ? "Jadwal solat belum bisa dimuat. Periksa koneksi, lalu muat ulang halaman."
            : "Memuat jadwal solat"}
        </p>
      </main>
    );
  }

  const minutesMap = Object.fromEntries(
    PRAYERS.map((p) => [p, toMinutes(data.times[p])]),
  ) as Record<PrayerKey, number>;

  const { prayer, dayShift } = getActivePrayer(minutesMap, now.minutes);
  const titles = getSurahTitles(prayer, now.dayOffset + dayShift);

  return (
    <main className="screen" data-prayer={prayer}>
      <header className="top">
        <h1 className="prayer">{PRAYER_LABEL[prayer]}</h1>
        <p className="clock">{data.times[prayer]} WIB</p>
      </header>

      <ol className="surah-list" aria-live="polite">
        {titles.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>

      <ul className="timeline" aria-label="Jadwal solat hari ini">
        {PRAYERS.map((p) => (
          <li key={p} aria-current={p === prayer ? "true" : undefined}>
            <span>{PRAYER_LABEL[p]}</span>
            <b>{data.times[p]}</b>
          </li>
        ))}
      </ul>
    </main>
  );
}

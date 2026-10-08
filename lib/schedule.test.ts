import { describe, expect, test } from "vitest";
import { getActivePrayer, getSurahTitles, getWibNow, PRAYERS } from "./schedule";
import { SURAH_GROUPS } from "./surah-groups";
import { parsePayload } from "./prayer-times";

const times = { subuh: 270, dzuhur: 715, ashar: 905, maghrib: 1090, isya: 1175 };

describe("rotasi surat", () => {
  test("jumlah grup sama dengan jumlah waktu solat", () => {
    expect(SURAH_GROUPS.length).toBe(PRAYERS.length);
  });

  test("hari ke-0: grup[i] jatuh di waktu solat ke-i", () => {
    PRAYERS.forEach((p, i) => {
      expect(getSurahTitles(p, 0)).toEqual(SURAH_GROUPS[i]);
    });
  });

  test("hari ke-1: Subuh pindah ke grup terakhir, Dzuhur ke grup pertama", () => {
    expect(getSurahTitles("subuh", 1)).toEqual(SURAH_GROUPS[4]);
    expect(getSurahTitles("dzuhur", 1)).toEqual(SURAH_GROUPS[0]);
  });

  test("siklus balik tiap 5 hari", () => {
    for (const p of PRAYERS) {
      expect(getSurahTitles(p, 5)).toEqual(getSurahTitles(p, 0));
    }
  });

  test("offset negatif tetap valid", () => {
    expect(getSurahTitles("subuh", -1)).toEqual(SURAH_GROUPS[1]);
  });
});

describe("solat aktif", () => {
  test("sebelum Subuh masih Isya kemarin", () => {
    expect(getActivePrayer(times, 120)).toEqual({ prayer: "isya", dayShift: -1 });
  });
  test("tepat masuk Dzuhur", () => {
    expect(getActivePrayer(times, 715).prayer).toBe("dzuhur");
  });
  test("malam setelah Isya", () => {
    expect(getActivePrayer(times, 1400)).toEqual({ prayer: "isya", dayShift: 0 });
  });
});

describe("waktu WIB", () => {
  test("pergantian hari mengikuti WIB, bukan UTC", () => {
    // 2026-10-07 17:30 UTC = 2026-10-08 00:30 WIB
    const r = getWibNow(new Date("2026-10-07T17:30:00Z"));
    expect(r.dateISO).toBe("2026-10-08");
    expect(r.dayOffset).toBe(0);
    expect(r.minutes).toBe(30);
  });
});

describe("validasi respons API", () => {
  const ok = {
    data: {
      lokasi: "KOTA X",
      jadwal: { subuh: "04:30", dzuhur: "11:55", ashar: "15:10", maghrib: "17:58", isya: "19:08" },
    },
  };
  test("terima payload valid", () => {
    expect(parsePayload(ok)?.times.subuh).toBe("04:30");
  });
  test("tolak jam rusak", () => {
    const bad = structuredClone(ok);
    bad.data.jadwal.isya = "25:99";
    expect(parsePayload(bad)).toBeNull();
  });
  test("tolak struktur asing", () => {
    expect(parsePayload(null)).toBeNull();
    expect(parsePayload({ data: {} })).toBeNull();
  });
});

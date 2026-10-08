/**
 * DAFTAR SURAT. Edit file ini saja untuk mengganti daftar surat.
 *
 * - Tiap elemen = satu grup (satu "piring" di conveyor).
 * - Tiap grup boleh berisi 1 atau lebih judul surat.
 * - Jumlah grup HARUS sama dengan jumlah waktu solat (5).
 * - Urutan grup = urutan pada ANCHOR_DATE di bawah:
 *   grup[0] -> Subuh, grup[1] -> Dzuhur, grup[2] -> Ashar, grup[3] -> Maghrib, grup[4] -> Isya
 *   Setiap hari berikutnya, grup bergeser satu waktu solat ke depan.
 */
export const SURAH_GROUPS: readonly (readonly string[])[] = [
  ["At-Takatsur", "Al-Ma'un"],
  ["Az-Zalzalah", "Al-Humazah"],
  ["Ad-Dhuha", "Al-Qadr"],
  ["At-Tin", "Al-Insyirah"],
  ["Quraisy", "Al-Fil"],
];

/** Tanggal acuan (hari ke-0) dalam WIB: [tahun, bulan 1-12, tanggal]. */
export const ANCHOR_DATE: readonly [number, number, number] = [2026, 10, 8];

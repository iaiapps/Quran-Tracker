import type { FC } from "hono/jsx";
import { Layout } from "../Layout.js";
import { Header } from "../components/Header.js";
import type { User } from "../../types.js";
import { TOTAL_PAGES, getPositionForPage, getSurah, getJuzForPosition } from "../../data/quran-meta.js";
import { APP_NAME } from "../../config.js";

interface ProgressHistoryItem {
  id: number;
  pageFrom: number;
  pageTo: number;
  loggedAt: string;
}

export const ProgressPage: FC<{
  user: User;
  history: ProgressHistoryItem[];
  cycle: number;
  target: number;
  progressPercent: number;
  currentPosition: { page: number; surahNumber: number; ayah: number; surahName: string; juz: number };
  ramadanYear: number;
  success?: string;
  error?: string;
}> = ({ user, history, cycle, target, progressPercent, currentPosition, ramadanYear, success, error }) => {

  return (
    <Layout title={`Update Progress - ${APP_NAME}`}>
      <Header user={user} currentPath="/progress" />
      <main class="flex-1 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div class="w-full flex flex-col gap-2 mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium mb-2">
            <span class="material-symbols-outlined text-lg">calendar_month</span>
            Ramadan {ramadanYear} H
          </div>
          <h1 class="text-text-main text-3xl font-black leading-tight tracking-[-0.033em]">
            Update Progress
          </h1>
          <p class="text-text-secondary text-base font-normal leading-normal">
            Catat progress membaca Al-Quran kamu hari ini.
          </p>
        </div>

        <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white border border-border-light rounded-xl p-5 text-center">
            <p class="text-text-secondary text-xs font-medium mb-1">Khatam</p>
            <p class="text-2xl font-black text-primary">{cycle.toFixed(1)}x</p>
          </div>
          <div class="bg-white border border-border-light rounded-xl p-5 text-center">
            <p class="text-text-secondary text-xs font-medium mb-1">Target</p>
            <p class="text-2xl font-black text-text-main">{target}x</p>
          </div>
          <div class="bg-white border border-border-light rounded-xl p-5 text-center">
            <p class="text-text-secondary text-xs font-medium mb-1">Halaman</p>
            <p class="text-2xl font-black text-text-main">{currentPosition.page}/{TOTAL_PAGES}</p>
          </div>
          <div class="bg-white border border-border-light rounded-xl p-5 text-center">
            <p class="text-text-secondary text-xs font-medium mb-1">Juz</p>
            <p class="text-2xl font-black text-text-main">{currentPosition.juz || 1}/30</p>
          </div>
        </div>

        {success && (
          <div class="w-full bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-6 border border-emerald-200 flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">check_circle</span>
            {success.replace(/\+/g, " ")}
          </div>
        )}

        {error && (
          <div class="w-full bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6 border border-red-200 flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">error</span>
            {error.replace(/\+/g, " ")}
          </div>
        )}

        <div class="w-full bg-white border border-border-light rounded-xl p-6 shadow-sm mb-8">
          <h2 class="text-text-main text-lg font-bold mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">edit_note</span>
            Input Bacaan <br />(Mushaf Standar Usmani)
          </h2>
          <form method="post" action="/progress" class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-text-secondary text-xs font-bold mb-1 uppercase tracking-wider">
                Halaman (1 - {TOTAL_PAGES})
              </label>
              <input
                type="number"
                name="last_page"
                min="1"
                max={TOTAL_PAGES}
                placeholder={`cth. ${Math.min(currentPosition.page + 1, TOTAL_PAGES)}`}
                class="w-full bg-slate-50 text-text-main text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none py-2 px-3 transition-all"
                required
              />
              <p class="text-text-secondary text-xs mt-1">
                Sekarang di: {currentPosition.page > 0 ? `Halaman ${currentPosition.page} - ${currentPosition.surahName}` : "Belum mulai"}
              </p>
            </div>
            <div class="flex items-center">
              <button
                type="submit"
                class="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors shadow-sm"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>

        <div class="w-full bg-white border border-border-light rounded-xl overflow-hidden shadow-sm">
          <div class="px-6 py-4 border-b border-border-light bg-slate-50/50">
            <h2 class="text-text-main text-lg font-bold flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">history</span>
              Riwayat Update
            </h2>
          </div>
          <div class="divide-y divide-border-light">
            {history.length === 0 ? (
              <div class="px-6 py-12 text-center text-text-secondary">
                <span class="material-symbols-outlined text-3xl mb-2">book</span>
                <p>Belum ada progress. Mulai baca Al-Quran hari ini!</p>
              </div>
            ) : (
              history.map((item) => {
                const pos = getPositionForPage(item.pageTo);
                const surah = pos ? getSurah(pos.surah) : undefined;
                const juz = pos ? getJuzForPosition(pos.surah, pos.ayah) : 1;

                const date = new Date(item.loggedAt);
                const timeStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                const dateStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                const isKhatam = item.pageTo >= TOTAL_PAGES;

                return (
                  <div class="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                    <div class="flex items-center gap-3">
                      <div class={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isKhatam ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                        {item.pageTo}
                      </div>
                      <div>
                        <p class="text-text-main text-sm font-medium">
                          {isKhatam ? '🎉 Khatam!' : `Halaman ${item.pageFrom} → ${item.pageTo}`}
                        </p>
                        <p class="text-text-secondary text-xs">
                          {surah?.name || 'Unknown'} - Juz {juz}
                        </p>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p class="text-text-secondary text-xs font-medium">{timeStr}</p>
                      <p class="text-text-secondary text-xs">{dateStr}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

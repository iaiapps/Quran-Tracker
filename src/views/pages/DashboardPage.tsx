import type { FC } from "hono/jsx";
import { Layout } from "../Layout.js";
import { Header } from "../components/Header.js";
import type { User, RankedUser } from "../../types.js";
import { TOTAL_PAGES } from "../../data/quran-meta.js";
import { APP_NAME } from "../../config.js";

export const DashboardPage: FC<{
  user: User;
  cycle: number;
  target: number;
  progressPercent: number;
  totalMemorized: number;
  rank: RankedUser | null;
  currentPosition: { page: number; surahNumber: number; ayah: number; surahName: string; juz: number };
  ramadanYear: number;
}> = ({ user, cycle, target, progressPercent, totalMemorized, rank, currentPosition, ramadanYear }) => {
  return (
    <Layout title={`Dashboard - ${APP_NAME}`}>
      <Header user={user} currentPath="/dashboard" />
      <main class="flex-1 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div class="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium mb-2">
              <span class="material-symbols-outlined text-lg">calendar_month</span>
              Ramadan {ramadanYear} H
            </div>
            <h1 class="text-text-main text-3xl font-black leading-tight tracking-[-0.033em]">
              Assalamu'alaikum, {user.name.split(" ")[0]}!
            </h1>
            <p class="text-text-secondary text-base">Mari tadarrus Al-Quran hari ini.</p>
          </div>
          <a
            href="/progress"
            class="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors shadow-sm"
          >
            <span class="material-symbols-outlined text-lg">add</span>
            Update Progress
          </a>
        </div>

        <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white border border-border-light rounded-xl p-5 text-center">
            <p class="text-text-secondary text-xs font-medium mb-1">Rank</p>
            <p class="text-3xl font-black text-primary">#{rank?.rank || "-"}</p>
          </div>
          <div class="bg-white border border-border-light rounded-xl p-5 text-center">
            <p class="text-text-secondary text-xs font-medium mb-1">Khatam</p>
            <p class="text-3xl font-black text-text-main">{cycle.toFixed(1)}x</p>
          </div>
          <div class="bg-white border border-border-light rounded-xl p-5 text-center">
            <p class="text-text-secondary text-xs font-medium mb-1">Target</p>
            <p class="text-3xl font-black text-text-main">{target}x</p>
          </div>
          <div class="bg-white border border-border-light rounded-xl p-5 text-center">
            <p class="text-text-secondary text-xs font-medium mb-1">Halaman</p>
            <p class="text-2xl font-black text-text-main mt-2">{totalMemorized}/{TOTAL_PAGES}</p>
          </div>
        </div>

        {currentPosition.page > 0 && (
          <div class="w-full bg-white border-2 border-primary/20 rounded-xl p-6 mb-8 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <span class="material-symbols-outlined text-primary text-2xl">menu_book</span>
              <h2 class="text-text-main text-lg font-bold">Posisi Saat Ini</h2>
            </div>
            <div class="flex flex-wrap gap-6 text-sm">
              <div>
                <span class="text-text-secondary">Halaman</span>
                <p class="text-text-main font-bold text-lg">{currentPosition.page}</p>
              </div>
              <div>
                <span class="text-text-secondary">Surah</span>
                <p class="text-text-main font-bold text-lg">{currentPosition.surahName}</p>
              </div>
              <div>
                <span class="text-text-secondary">Juz</span>
                <p class="text-text-main font-bold text-lg">{currentPosition.juz}</p>
              </div>
            </div>
          </div>
        )}

        <div class="w-full bg-white border border-border-light rounded-xl p-6 mb-8 shadow-sm">
          <h2 class="text-text-main text-lg font-bold mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">speed</span>
            Tilawah Progress
          </h2>
          <div class="w-full bg-slate-100 rounded-full h-6 overflow-hidden border border-slate-200 mb-3">
            <div
              class="bg-primary h-6 rounded-full relative overflow-hidden transition-all duration-500 flex items-center justify-center"
              style={`width: ${progressPercent}%`}
            >
              {progressPercent > 10 && (
                <span class="text-white text-sm font-bold">
                  {cycle.toFixed(1)} / {target}x
                </span>
              )}
            </div>
          </div>
          <div class="flex justify-between text-sm text-text-secondary">
            <span>{progressPercent}% complete</span>
            <span>{totalMemorized} / {TOTAL_PAGES} halaman</span>
          </div>
        </div>

        {cycle >= target && (
          <div class="w-full bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-8 text-center">
            <span class="material-symbols-outlined text-green-600 text-4xl mb-2">celebration</span>
            <h2 class="text-green-800 text-xl font-bold mb-1">MashaAllah!</h2>
            <p class="text-green-700">Anda telah menyelesaikan target {target}x khatam Al-Quran!</p>
          </div>
        )}
      </main>
    </Layout>
  );
};

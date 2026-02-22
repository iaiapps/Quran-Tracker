import type { FC } from "hono/jsx";
import { Layout } from "../Layout.js";
import { Header } from "../components/Header.js";
import type { User } from "../../types.js";
import { APP_NAME } from "../../config.js";

export const AdminPage: FC<{
  user: User;
  pendingUsers: User[];
  allUsers: User[];
  targetKhatam: number;
  ramadanYear: number;
  success?: string;
  error?: string;
}> = ({ user, pendingUsers, allUsers, targetKhatam, ramadanYear, success, error }) => {
  return (
    <Layout title={`Admin Panel - ${APP_NAME}`}>
      <Header user={user} currentPath="/admin" />
      <main class="flex-1 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div class="w-full flex flex-col gap-2 mb-8">
          <h1 class="text-text-main text-3xl font-black leading-tight tracking-[-0.033em]">
            Admin Panel
          </h1>
          <p class="text-text-secondary text-base font-normal leading-normal">
            Kelola pengaturan Ramadan dan anggota komunitas.
          </p>
        </div>

        {success && (
          <div class="w-full bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-6 border border-emerald-200 flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">check_circle</span>
            {success.replace(/-/g, " ")}
          </div>
        )}

        {error && (
          <div class="w-full bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6 border border-red-200 flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">error</span>
            {error.replace(/-/g, " ")}
          </div>
        )}

        {/* Ramadan Settings */}
        <div class="w-full bg-white border border-border-light rounded-xl p-6 shadow-sm mb-8">
          <h2 class="text-text-main text-lg font-bold mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">settings</span>
            Pengaturan Ramadan
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <form method="post" action="/admin/settings/target" class="flex flex-col gap-2">
                <label class="text-text-secondary text-sm font-medium">Target Khatam</label>
                <div class="flex gap-2">
                  <select 
                    name="target" 
                    class="flex-1 bg-slate-50 text-text-main text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none py-2 px-3 transition-all"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option value={n} selected={n === targetKhatam}>{n}x Khatam</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors"
                  >
                    Simpan
                  </button>
                </div>
                <p class="text-text-secondary text-xs">Target khatam untuk semua user</p>
              </form>
            </div>

            <div>
              <form method="post" action="/admin/settings/year" class="flex flex-col gap-2">
                <label class="text-text-secondary text-sm font-medium">Tahun Ramadan</label>
                <div class="flex gap-2">
                  <select 
                    name="year" 
                    class="flex-1 bg-slate-50 text-text-main text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none py-2 px-3 transition-all"
                  >
                    {[1444,1445,1446,1447,1448,1449,1450].map(y => (
                      <option value={y} selected={y === ramadanYear}>{y} H / {y - 570} M</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors"
                  >
                    Simpan
                  </button>
                </div>
                <p class="text-text-secondary text-xs">Tahun Ramadan yang sedang aktif</p>
              </form>
            </div>
          </div>
        </div>

        {/* Reset Progress */}
        <div class="w-full bg-white border border-red-200 rounded-xl p-6 shadow-sm mb-8">
          <h2 class="text-text-main text-lg font-bold mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-red-500">restart_alt</span>
            Reset Progress
          </h2>
          <p class="text-text-secondary text-sm mb-4">
            Reset semua progress user. Progress akan diarsipkan ke history sebelum dihapus.
          </p>
          <form method="post" action="/admin/reset/all" class="flex flex-col gap-3">
            <div>
              <label class="text-text-secondary text-sm font-medium">Ketik RESET untuk konfirmasi </label>
              <input 
                type="text" 
                name="confirm" 
                placeholder="RESET"
                class="w-full md:w-64 mt-1 bg-slate-50 text-text-main text-sm rounded-lg border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none py-2 px-3 transition-all"
              />
            </div>
            <button
              type="submit"
              class="w-full md:w-auto px-6 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors"
            >
              Reset Semua Progress
            </button>
          </form>
        </div>

        {/* Pending approvals */}
        {pendingUsers.length > 0 && (
          <div class="w-full bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm mb-8">
            <div class="px-6 py-4 border-b border-amber-200 bg-amber-50/50">
              <h2 class="text-text-main text-lg font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-500">hourglass_top</span>
                Menunggu Approvals ({pendingUsers.length})
              </h2>
            </div>
            <div class="divide-y divide-border-light">
              {pendingUsers.map((u) => (
                <div class="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="size-10 rounded-full bg-slate-100 flex items-center justify-center text-text-secondary text-xs font-bold border border-slate-200">
                      {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p class="text-text-main text-sm font-bold">{u.name}</p>
                      <p class="text-text-secondary text-xs">{u.username}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <form method="post" action={`/admin/users/${u.id}/approve`}>
                      <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors">
                        Approve
                      </button>
                    </form>
                    <form method="post" action={`/admin/users/${u.id}/reject`}>
                      <button type="submit" class="px-4 py-2 bg-white text-red-500 border border-red-200 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors">
                        Tolak
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All members */}
        <div class="w-full bg-white border border-border-light rounded-xl overflow-hidden shadow-sm">
          <div class="px-6 py-4 border-b border-border-light bg-slate-50/50">
            <h2 class="text-text-main text-lg font-bold flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">group</span>
              Semua Anggota ({allUsers.length})
            </h2>
          </div>
          <div class="divide-y divide-border-light">
            {allUsers.map((u) => (
              <div class="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-full bg-slate-100 flex items-center justify-center text-text-secondary text-xs font-bold border border-slate-200">
                    {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p class="text-text-main text-sm font-bold flex items-center gap-2">
                      {u.name}
                      {u.id === user.id && (
                        <span class="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-black">
                          Anda
                        </span>
                      )}
                    </p>
                    <p class="text-text-secondary text-xs">@{u.username}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class={`text-xs font-bold px-2 py-1 rounded ${u.role === "admin" ? "bg-purple-50 text-purple-600 border border-purple-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                    {u.role}
                  </span>
                  {u.role === "member" && u.id !== user.id && (
                    <form method="post" action={`/admin/users/${u.id}/role`}>
                      <input type="hidden" name="role" value="admin" />
                      <button type="submit" class="text-text-secondary hover:text-primary text-xs font-medium transition-colors">
                        Jadikan Admin
                      </button>
                    </form>
                  )}
                  {u.role !== "admin" && u.id !== user.id && (
                    <form method="post" action={`/admin/users/${u.id}/delete`} onsubmit={`return confirm("Hapus ${u.name}?")`}>
                      <button type="submit" class="text-text-secondary hover:text-red-500 text-xs font-medium transition-colors">
                        Hapus
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
};

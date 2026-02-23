import type { FC } from "hono/jsx";
import { Layout } from "../Layout.js";
import { Header } from "../components/Header.js";
import type { User } from "../../types.js";
import { APP_NAME } from "../../config.js";

export const ProfilePage: FC<{ user: User; error?: string; success?: string }> = ({
  user,
  error,
  success,
}) => {
  return (
    <Layout title={`Edit Profile - ${APP_NAME}`}>
      <Header user={user} currentPath="/profile" />
      <main class="flex-1 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
        <div class="w-full">
          <h1 class="text-text-main text-2xl font-black mb-6">Edit Profile</h1>

          {error && (
            <div class="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6 border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div class="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-6 border border-green-200">
              {success}
            </div>
          )}

          <div class="bg-white border border-border-light rounded-2xl p-6 shadow-sm">
            <form method="post" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-text-main mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={user.name}
                  class="w-full px-4 py-2 bg-slate-50 text-text-main text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-main mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={user.username}
                  class="w-full px-4 py-2 bg-slate-50 text-text-main text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  placeholder="Your username"
                />
              </div>

              <div class="pt-4 border-t border-border-light">
                <h2 class="text-text-main font-semibold mb-4">Change Password (optional)</h2>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-text-main mb-1">Current Password</label>
                    <input
                      type="password"
                      name="current_password"
                      class="w-full px-4 py-2 bg-slate-50 text-text-main text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-text-main mb-1">New Password</label>
                    <input
                      type="password"
                      name="new_password"
                      minLength={6}
                      class="w-full px-4 py-2 bg-slate-50 text-text-main text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  type="submit"
                  class="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Save Changes
                </button>
                <a
                  href="/dashboard"
                  class="px-6 py-2 bg-slate-100 text-text-secondary font-bold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>
    </Layout>
  );
};

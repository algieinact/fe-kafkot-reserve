import React from "react";
import { Link } from "react-router";
import Button from "../../components/ui/button/Button";

const LandingPage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 to-blue-light-50 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Text Content */}
            <div className="flex flex-col justify-center">
              <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                Reservasi Mudah,
                <br />
                <span className="bg-gradient-to-r from-brand-500 to-blue-light-500 bg-clip-text text-transparent">
                  Pengalaman Berkesan
                </span>
              </h1>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
                Nikmati kopi pilihan dan makanan lezat di cafe Kafkot. Reservasi online dalam
                hitungan menit, tanpa ribet.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/reservation">
                  <Button size="md">Reservasi Sekarang</Button>
                </Link>
                <Link to="/menu">
                  <Button size="md" variant="outline">
                    Lihat Menu
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image/Illustration */}
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-blue-light-400 shadow-2xl">
                <div className="flex h-full items-center justify-center text-white">
                  {/* Placeholder - Replace with actual image */}
                  <svg
                    className="h-48 w-48 opacity-30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Kenapa Pilih Kafkot?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Pengalaman reservasi yang mudah dan nyaman
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                <svg
                  className="h-6 w-6 text-brand-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Reservasi Cepat
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Proses reservasi dalam hitungan menit. Pilih tanggal, waktu, dan meja favorit Anda.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
                <svg
                  className="h-6 w-6 text-success-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Konfirmasi Langsung
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Dapatkan konfirmasi reservasi langsung setelah verifikasi pembayaran.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/10">
                <svg
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Pesan Menu Sebelumnya
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Pilih menu favorit Anda sebelum datang untuk pengalaman yang lebih efisien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-500 to-blue-light-500 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Siap Reservasi Meja Anda?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Mulai reservasi sekarang dan nikmati pengalaman kuliner yang berkesan
          </p>
          <Link to="/reservation">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-medium text-brand-500 shadow-theme-lg transition hover:bg-gray-50">
              Reservasi Sekarang
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </Link>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Locations */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Pilihan Tempat Duduk
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <span className="text-xl font-bold text-brand-500">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Indoor</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ruangan ber-AC dengan suasana nyaman dan tenang
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <span className="text-xl font-bold text-brand-500">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Semi Outdoor</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Area terbuka dengan atap, cocok untuk berkumpul
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <span className="text-xl font-bold text-brand-500">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Outdoor</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Area terbuka dengan pemandangan taman yang asri
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Jam Operasional
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Senin - Jumat</span>
                  <span className="font-semibold text-gray-900 dark:text-white">10:00 - 22:00</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Sabtu</span>
                  <span className="font-semibold text-gray-900 dark:text-white">09:00 - 23:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Minggu</span>
                  <span className="font-semibold text-gray-900 dark:text-white">09:00 - 23:00</span>
                </div>
              </div>
              <div className="mt-6 rounded-lg bg-warning-50 p-4 dark:bg-warning-900/20">
                <p className="text-sm text-warning-800 dark:text-warning-200">
                  💡 <strong>Tips:</strong> Reservasi minimal 2 jam sebelum kedatangan untuk memastikan
                  ketersediaan meja
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

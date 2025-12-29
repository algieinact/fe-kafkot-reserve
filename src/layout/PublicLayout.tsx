import React from "react";
import { Outlet, Link } from "react-router";

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
                <span className="text-xl font-bold text-white">K</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Kafkot Reserve
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400"
              >
                Beranda
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400"
              >
                <svg 
                  className="h-5 w-5" 
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
                Riwayat
              </Link>
              <Link
                to="/reservation"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
              >
                Reservasi Sekarang
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem-16rem)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* About */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Tentang Kafkot
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cafe nyaman dengan berbagai pilihan menu lezat. Reservasi mudah, pembayaran
                fleksibel.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Kontak
              </h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>0812-3456-7890</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>info@kafkot.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Jl. Telekomunikasi No. 1, Bandung</span>
                </li>
              </ul>
            </div>

            {/* Opening Hours */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Jam Operasional
              </h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex justify-between">
                  <span>Senin - Jumat</span>
                  <span className="font-medium">10:00 - 22:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Sabtu - Minggu</span>
                  <span className="font-medium">09:00 - 23:00</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Kafkot Reserve. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

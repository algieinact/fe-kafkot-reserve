import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/api";
import { DashboardStats } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import { StatsCardSkeleton, Skeleton } from "../../components/ui/skeleton";

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await dashboardApi.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                setError(response.error || "Gagal memuat statistik");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat memuat data");
            console.error("Stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <StatsCardSkeleton count={4} />
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Skeleton className="h-20" variant="rectangular" />
                        <Skeleton className="h-20" variant="rectangular" />
                        <Skeleton className="h-20" variant="rectangular" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Terjadi Kesalahan</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchStats}
                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Dashboard Admin | Reservasi Ruang Dugamasa"
                description="Dashboard admin untuk mengelola reservasi restoran"
            />

            <div className="space-y-6">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Dashboard Admin
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Ringkasan statistik dan aktivitas sistem reservasi
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
                    {/* Total Reservations */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                {stats?.summary.total_reservations || 0}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Reservasi</p>
                        </div>
                    </div>

                    {/* Pending Verifications */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                {stats?.summary.pending_verifications || 0}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu Verifikasi</p>
                        </div>
                    </div>

                    {/* Confirmed Reservations */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                {stats?.summary.confirmed_reservations || 0}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Dikonfirmasi</p>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                }).format(stats?.summary.total_revenue || 0)}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pendapatan</p>
                        </div>
                    </div>
                </div>
                {/* Quick Actions */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Aksi Cepat
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <a
                            href="/admin/reservations"
                            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/20">
                                <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 dark:text-white">Kelola Reservasi</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Verifikasi pembayaran</p>
                            </div>
                        </a>

                        <a
                            href="/admin/menus"
                            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 dark:text-white">Kelola Menu</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Tambah/edit menu</p>
                            </div>
                        </a>

                        <a
                            href="/admin/tables"
                            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 dark:text-white">Kelola Meja</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Atur ketersediaan</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

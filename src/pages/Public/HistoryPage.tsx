import React, { useState, useEffect } from "react";
import { reservationStorage, ReservationHistory } from "../../services/localStorage";
import { reservationApi } from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import { Card } from "../../components/ui/card";

const HistoryPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  // Load reservations from localStorage
  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = () => {
    setLoading(true);
    const data = reservationStorage.getAll();
    setReservations(data);
    setLoading(false);
  };

  // Refresh status from backend
  const refreshStatus = async (bookingCode: string) => {
    try {
      setRefreshing(bookingCode);
      const response = await reservationApi.getByBookingCode(bookingCode);
      
      if (response.success && response.data) {
        // Update localStorage
        reservationStorage.updateStatus(bookingCode, response.data.status);
        // Reload reservations
        loadReservations();
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
    } finally {
      setRefreshing(null);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending_verification: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Menunggu Verifikasi",
      },
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Terkonfirmasi",
      },
      completed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Selesai",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Ditolak",
      },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Dibatalkan",
      },
    };

    const config = statusMap[status] || statusMap.pending_verification;
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Riwayat Reservasi</h1>
          <p className="text-gray-600">
            Lihat semua reservasi yang pernah Anda buat di browser ini
          </p>
        </div>

        {/* Empty State */}
        {reservations.length === 0 && (
          <Card>
            <div className="py-16 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Belum Ada Reservasi
              </h3>
              <p className="mt-2 text-gray-600">
                Anda belum pernah membuat reservasi di browser ini
              </p>
              <a
                href="/menu"
                className="mt-6 inline-block rounded-lg bg-brand-500 px-6 py-3 text-white transition hover:bg-brand-600"
              >
                Buat Reservasi
              </a>
            </div>
          </Card>
        )}

        {/* Reservations List */}
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.bookingCode}>
              <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.bookingCode}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {reservation.customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(reservation.status)}
                    <button
                      onClick={() => refreshStatus(reservation.bookingCode)}
                      disabled={refreshing === reservation.bookingCode}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                      title="Refresh Status"
                    >
                      <svg
                        className={`h-5 w-5 ${refreshing === reservation.bookingCode ? "animate-spin" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  {/* Date & Time */}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tanggal & Waktu</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(reservation.reservationDate)}
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatTime(reservation.reservationTime)} - {formatTime(calculateEndTime(reservation.reservationTime, reservation.durationHours))}
                      <span className="ml-2 text-gray-500">({reservation.durationHours} jam)</span>
                    </p>
                  </div>

                  {/* Table */}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Meja</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {reservation.tableNumber || "-"}
                      {reservation.tableType && (
                        <span className="ml-2 text-gray-500">({reservation.tableType})</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {reservation.numberOfPeople} orang
                    </p>
                  </div>

                  {/* Contact */}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kontak</p>
                    <p className="mt-1 text-sm text-gray-900">{reservation.customerEmail}</p>
                    <p className="text-sm text-gray-900">{reservation.customerPhone}</p>
                  </div>

                  {/* Created */}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dibuat</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(reservation.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="mb-3 text-sm font-medium text-gray-500">Pesanan</p>
                  <div className="space-y-2">
                    {reservation.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <span className="text-gray-900">{item.menuName}</span>
                          <span className="ml-2 text-gray-500">x{item.quantity}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-brand-500">
                      {formatCurrency(reservation.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function
function calculateEndTime(startTime: string, duration: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const endHour = h + duration;
  return `${endHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export default HistoryPage;

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { formatCurrency, formatDate, formatTime, formatReservationStatus } from "../../utils/formatters";
import { Card, CardTitle } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";

const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams();
  const [reservation, setReservation] = useState<any>(null);

  useEffect(() => {
    // Get reservation from sessionStorage
    if (orderId) {
      const data = sessionStorage.getItem(`reservation_${orderId}`);
      if (data) {
        setReservation(JSON.parse(data));
      }
    }
  }, [orderId]);

  if (!reservation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card>
          <div className="p-8 text-center">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Reservasi tidak ditemukan
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              ID reservasi tidak valid atau sudah dihapus
            </p>
            <Link to="/" className="mt-4 inline-block">
              <Button>Kembali ke Beranda</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_verification":
        return "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/20 dark:text-warning-400 dark:border-warning-800";
      case "confirmed":
        return "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/20 dark:text-success-400 dark:border-success-800";
      case "rejected":
        return "bg-error-50 text-error-700 border-error-200 dark:bg-error-900/20 dark:text-error-400 dark:border-error-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_verification":
        return (
          <svg className="h-12 w-12 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "confirmed":
        return (
          <svg className="h-12 w-12 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "rejected":
        return (
          <svg className="h-12 w-12 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const totalAmount = reservation.order_items.reduce(
    (sum: number, item: any) => sum + item.subtotal,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Status Reservasi</h1>
          <p className="text-gray-600 dark:text-gray-400">
            ID Reservasi: <span className="font-mono font-semibold">{reservation.id}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <div className="flex flex-col items-center py-8 text-center">
              {getStatusIcon(reservation.status)}
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                {reservation.status === "pending_verification" && "Menunggu Verifikasi"}
                {reservation.status === "confirmed" && "Reservasi Dikonfirmasi"}
                {reservation.status === "rejected" && "Pembayaran Ditolak"}
              </h2>
              <div className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-medium ${getStatusColor(reservation.status)}`}>
                {formatReservationStatus(reservation.status)}
              </div>
              
              {reservation.status === "pending_verification" && (
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Kami sedang memverifikasi bukti pembayaran Anda. Proses ini biasanya memakan waktu maksimal 1x24 jam.
                </p>
              )}

              {reservation.status === "confirmed" && (
                <div className="mt-6 w-full max-w-md">
                  <div className="rounded-lg bg-success-50 p-6 dark:bg-success-900/20">
                    <p className="mb-4 text-sm font-medium text-success-800 dark:text-success-200">
                      Reservasi Anda telah dikonfirmasi! Tunjukkan QR code ini saat tiba di cafe.
                    </p>
                    <div className="flex items-center justify-center rounded-lg bg-white p-4">
                      <div className="text-center">
                        <svg className="mx-auto h-32 w-32" viewBox="0 0 100 100">
                          <rect width="100" height="100" fill="white"/>
                          <text x="50" y="50" fontSize="8" textAnchor="middle" dominantBaseline="middle" fill="black">
                            {reservation.id}
                          </text>
                        </svg>
                        <p className="mt-2 text-xs text-gray-600">
                          {reservation.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reservation.status === "rejected" && (
                <div className="mt-6 w-full max-w-md">
                  <div className="rounded-lg bg-error-50 p-4 dark:bg-error-900/20">
                    <p className="text-sm text-error-800 dark:text-error-200">
                      {reservation.rejection_reason || "Bukti pembayaran tidak valid. Silakan upload ulang bukti pembayaran yang benar."}
                    </p>
                  </div>
                  <Button className="mt-4 w-full">Upload Ulang Bukti Pembayaran</Button>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <CardTitle>Timeline</CardTitle>
            <div className="mt-6">
              <div className="relative space-y-8 pl-8">
                {/* Step 1: Reservasi Created */}
                <div className="relative">
                  <div className="absolute -left-8 flex h-8 w-8 items-center justify-center rounded-full bg-success-500">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Reservasi Dibuat</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(reservation.created_at)} - {formatTime(reservation.created_at)}
                    </div>
                  </div>
                </div>

                {/* Step 2: Payment Proof Uploaded */}
                <div className="relative">
                  <div className={`absolute -left-8 flex h-8 w-8 items-center justify-center rounded-full ${
                    reservation.payment_proof_url ? "bg-success-500" : "bg-gray-300"
                  }`}>
                    {reservation.payment_proof_url ? (
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Bukti Pembayaran Diunggah</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {reservation.payment_proof_url ? "Berhasil diunggah" : "Menunggu"}
                    </div>
                  </div>
                </div>

                {/* Step 3: Verification */}
                <div className="relative">
                  <div className={`absolute -left-8 flex h-8 w-8 items-center justify-center rounded-full ${
                    reservation.status === "confirmed" ? "bg-success-500" : 
                    reservation.status === "rejected" ? "bg-error-500" :
                    "bg-warning-500"
                  }`}>
                    {reservation.status === "confirmed" || reservation.status === "rejected" ? (
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="h-3 w-3 animate-pulse rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Verifikasi Pembayaran</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {reservation.status === "confirmed" && "Terverifikasi"}
                      {reservation.status === "rejected" && "Ditolak"}
                      {reservation.status === "pending_verification" && "Sedang diverifikasi..."}
                    </div>
                  </div>
                </div>

                {/* Step 4: Confirmed (if applicable) */}
                {reservation.status === "confirmed" && (
                  <div className="relative">
                    <div className="absolute -left-8 flex h-8 w-8 items-center justify-center rounded-full bg-success-500">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Reservasi Dikonfirmasi</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Siap untuk kunjungan Anda!
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Reservation Details */}
          <Card>
            <CardTitle>Detail Reservasi</CardTitle>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Nama</div>
                  <div className="font-medium text-gray-900 dark:text-white">{reservation.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                  <div className="font-medium text-gray-900 dark:text-white">{reservation.customer_email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Telepon</div>
                  <div className="font-medium text-gray-900 dark:text-white">{reservation.customer_phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Jumlah Orang</div>
                  <div className="font-medium text-gray-900 dark:text-white">{reservation.number_of_people} orang</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Tanggal & Waktu Kedatangan</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(reservation.reservation_date)}
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Pukul {reservation.reservation_time}
                </div>
              </div>

              {reservation.special_notes && (
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Catatan Khusus</div>
                  <div className="font-medium text-gray-900 dark:text-white">{reservation.special_notes}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardTitle>Ringkasan Pesanan</CardTitle>
            <div className="mt-4 space-y-3">
              {reservation.order_items.map((item: any, index: number) => (
                <div key={index} className="flex items-start justify-between text-sm">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{item.menu?.name}</div>
                    <div className="text-gray-600 dark:text-gray-400">x{item.quantity}</div>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900 dark:text-white">Total Pembayaran</div>
                  <div className="text-2xl font-bold text-brand-500">{formatCurrency(totalAmount)}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Back to Home */}
          <div className="text-center">
            <Link to="/">
              <Button variant="outline">Kembali ke Beranda</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;

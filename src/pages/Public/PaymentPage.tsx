import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";
import { OrderItem } from "../../types";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { validatePaymentProof } from "../../utils/validators";
import { Card, CardTitle } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [reservationData, setReservationData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get reservation data from sessionStorage
    const data = sessionStorage.getItem("pending_reservation");
    if (data) {
      setReservationData(JSON.parse(data));
    } else {
      // No pending reservation, redirect to menu
      navigate("/menu");
    }
  }, [navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePaymentProof(file);
    if (validation !== true) {
      setError(validation);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validation = validatePaymentProof(file);
    if (validation !== true) {
      setError(validation);
      return;
    }

    setSelectedFile(file);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setError("Silakan upload bukti pembayaran terlebih dahulu");
      return;
    }

    setUploading(true);

    // Simulate upload (in real app, upload to server)
    setTimeout(() => {
      // Generate mock reservation ID
      const generatedId = `RES-${Date.now()}`;

      // Store in sessionStorage for order status page
      const fullReservation = {
        ...reservationData,
        id: generatedId,
        payment_proof_url: previewUrl,
        status: "pending_verification",
        payment_status: "waiting_verification",
        created_at: new Date().toISOString(),
      };

      sessionStorage.setItem(`reservation_${generatedId}`, JSON.stringify(fullReservation));
      sessionStorage.removeItem("pending_reservation");

      // Clear cart
      clearCart();

      setUploading(false);

      // Navigate to order status
      navigate(`/order-status/${generatedId}`);
    }, 1500);
  };

  if (!reservationData) {
    return null;
  }

  const totalAmount = reservationData.order_items.reduce(
    (sum: number, item: OrderItem) => sum + item.subtotal,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Pembayaran</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Silakan lakukan transfer dan upload bukti pembayaran
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bank Account Info */}
            <Card>
              <CardTitle>Informasi Transfer</CardTitle>
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-500/10">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Bank:
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    Bank Central Asia (BCA)
                  </div>
                </div>

                <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-500/10">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Nomor Rekening:
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      1234567890
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("1234567890");
                        alert("Nomor rekening berhasil disalin!");
                      }}
                      className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                    >
                      Salin
                    </button>
                  </div>
                </div>

                <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-500/10">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Atas Nama:
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    PT Kafkot Indonesia
                  </div>
                </div>

                <div className="rounded-lg bg-warning-50 p-4 dark:bg-warning-900/20">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Total yang Harus Dibayar:
                  </div>
                  <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
              </div>
            </Card>

            {/* Instructions */}
            <Card>
              <CardTitle>Instruksi Pembayaran</CardTitle>
              <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    1
                  </div>
                  <div>
                    Transfer sejumlah <strong className="text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</strong> ke rekening yang tertera di atas
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    2
                  </div>
                  <div>
                    Setelah transfer, simpan bukti pembayaran dalam format gambar (JPG/PNG)
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    3
                  </div>
                  <div>
                    Upload bukti pembayaran melalui form di bawah ini
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    4
                  </div>
                  <div>
                    Tunggu verifikasi dari admin (maksimal 1x24 jam)
                  </div>
                </div>
              </div>
            </Card>

            {/* Upload Payment Proof */}
            <Card>
              <CardTitle>Upload Bukti Pembayaran</CardTitle>
              <div className="mt-4">
                {!previewUrl ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-500/5"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <svg
                      className="mb-4 h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Klik untuk upload atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG hingga 5MB
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview bukti pembayaran"
                      className="w-full rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-error-500 p-2 text-white hover:bg-error-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mt-3 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-900/20 dark:text-error-400">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedFile || uploading}
                  className="mt-4 w-full"
                >
                  {uploading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Reservation Summary */}
          <div>
            <Card>
              <CardTitle>Ringkasan Reservasi</CardTitle>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Nama</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {reservationData.customer_name}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Tanggal & Waktu</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(reservationData.reservation_date)}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {reservationData.reservation_time}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Jumlah Orang</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {reservationData.number_of_people} orang
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="mb-2 text-gray-600 dark:text-gray-400">Pesanan</div>
                  {reservationData.order_items.map((item: OrderItem) => (
                    <div key={item.menu_id} className="mb-2 flex justify-between">
                      <div>
                        {item.menu?.name} x{item.quantity}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="flex justify-between">
                    <div className="font-semibold text-gray-900 dark:text-white">Total</div>
                    <div className="text-xl font-bold text-brand-500">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

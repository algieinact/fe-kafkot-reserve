import { useState, useCallback, useEffect } from "react";
import { RotateCcw, QrCode, Search } from "lucide-react";
import { reservationApi } from "../../services/api";
import { Reservation } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { ReservationDetailView } from "../../components/reservation/ReservationDetailView";

const SCAN_INPUT_ID = "scan-booking-code-input";

const focusInput = () => {
    setTimeout(() => {
        (document.getElementById(SCAN_INPUT_ID) as HTMLInputElement | null)?.focus();
    }, 100);
};

export default function ScanReservation() {
    const [bookingCode, setBookingCode] = useState("");
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Focus the input on mount
    useEffect(() => {
        focusInput();
    }, []);

    const handleScan = useCallback(async () => {
        const code = bookingCode.trim();
        if (!code) {
            setError("Masukkan booking code atau scan QR code terlebih dahulu.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await reservationApi.getByBookingCode(code);

            if (response.success && response.data) {
                const apiData = response.data as any;
                const reservationData = {
                    ...response.data,
                    items: apiData.items || apiData.reservation_items || apiData.order_items || [],
                };
                setReservation(reservationData as Reservation);
            } else {
                setError(`Reservasi dengan kode "${code}" tidak ditemukan.`);
                setReservation(null);
                setBookingCode("");
                focusInput();
            }
        } catch (err) {
            console.error("Scan error:", err);
            setError("Terjadi kesalahan. Pastikan kode benar dan coba lagi.");
            setReservation(null);
            setBookingCode("");
            focusInput();
        } finally {
            setLoading(false);
        }
    }, [bookingCode]);

    const handleReset = useCallback(() => {
        setReservation(null);
        setBookingCode("");
        setError(null);
        focusInput();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && bookingCode.trim() && !loading) {
            e.preventDefault();
            handleScan();
        }
    };

    // Auto-submit when booking code matches RSV-XXXXXXXX-XXXXXX format
    useEffect(() => {
        const code = bookingCode.trim().toUpperCase();
        if (/^RSV-\d{8}-[A-Z0-9]{6}$/.test(code) && !loading && !reservation) {
            const timeout = setTimeout(() => {
                handleScan();
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [bookingCode, loading, reservation, handleScan]);

    return (
        <>
            <PageMeta
                title="Scan Reservasi | Reservasi Ruang Dugamasa"
                description="Scan QR code reservasi pelanggan"
            />
            <PageBreadcrumb pageTitle="Scan Reservasi" showHome={false} />

            <div className="space-y-5 sm:space-y-6">
                {/* Scan Input Card */}
                <ComponentCard title="Scan QR Code Reservasi">
                    <div className="space-y-4">
                        {/* Instructions */}
                        <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
                            <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Arahkan scanner QR ke kode QR pelanggan, atau ketik booking code secara manual lalu tekan <strong>Enter</strong>.
                            </p>
                        </div>

                        {/* Input */}
                        <div>
                            <Label>Booking Code / QR Code</Label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        id={SCAN_INPUT_ID}
                                        type="text"
                                        value={bookingCode}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setBookingCode(e.target.value);
                                            setError(null);
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Contoh: RSV-20260211-IYJ7ZQ"
                                        disabled={loading}
                                        autoComplete="off"
                                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-40 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handleScan}
                                    disabled={loading || !bookingCode.trim()}
                                >
                                    <Search className="w-4 h-4" />
                                    {loading ? "Mencari..." : "Cari"}
                                </Button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                {error}
                            </div>
                        )}
                    </div>
                </ComponentCard>

                {/* Reservation Result */}
                {reservation && (
                    <div className="space-y-4">
                        {/* Scan New Button */}
                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={handleReset}>
                                <RotateCcw className="w-4 h-4" />
                                Scan Baru
                            </Button>
                        </div>

                        {/* Reservation Detail */}
                        <ReservationDetailView
                            reservation={reservation}
                            showQRCode={false}
                            showActions={false}
                            showPaymentProof={true}
                            showBackButton={false}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

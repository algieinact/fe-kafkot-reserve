import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { reservationApi } from "../../services/api";
import { Reservation } from "../../types";
import { ReservationDetailView } from "../../components/reservation/ReservationDetailView";
import { Card } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";

export default function AdminReservationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchReservation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchReservation = async () => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await reservationApi.getReservations({ id: parseInt(id) });
            if (response.success && response.data && response.data.data.length > 0) {
                setReservation(response.data.data[0]);
            } else {
                setError("Reservasi tidak ditemukan");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat memuat data");
            console.error("Reservation error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPayment = async () => {
        if (!reservation) return;

        try {
            setProcessing(true);
            const response = await reservationApi.verifyPayment(reservation.id.toString(), {});
            if (response.success) {
                await fetchReservation();
                setShowVerifyModal(false);
            }
        } catch (err) {
            console.error("Verify error:", err);
            setError("Gagal memverifikasi pembayaran");
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectPayment = async () => {
        if (!reservation || !rejectionReason.trim()) {
            return;
        }

        try {
            setProcessing(true);
            const response = await reservationApi.rejectPayment(
                reservation.id.toString(),
                { rejection_reason: rejectionReason }
            );
            if (response.success) {
                await fetchReservation();
                setShowRejectModal(false);
                setRejectionReason("");
            }
        } catch (err) {
            console.error("Reject error:", err);
            setError("Gagal menolak pembayaran");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <>
                <PageMeta
                    title="Detail Reservasi | Reservasi Ruang Dugamasa"
                    description="Detail reservasi"
                />
                <PageBreadcrumb
                    pageTitle="Detail Reservasi"
                    showHome={false}
                    parentItems={[{ label: "Kelola Reservasi", path: "/dashboard/reservations" }]}
                />
                <div className="flex items-center justify-center py-12">
                    <Card>
                        <div className="p-8 text-center">
                            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data reservasi...</p>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    if (error || !reservation) {
        return (
            <>
                <PageMeta
                    title="Detail Reservasi | Reservasi Ruang Dugamasa"
                    description="Detail reservasi"
                />
                <PageBreadcrumb
                    pageTitle="Detail Reservasi"
                    showHome={false}
                    parentItems={[{ label: "Kelola Reservasi", path: "/dashboard/reservations" }]}
                />
                <div className="flex items-center justify-center py-12">
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
                                {error || "Reservasi tidak ditemukan"}
                            </h3>
                            <div className="mt-4">
                                <Button onClick={() => navigate("/dashboard/reservations")}>
                                    Kembali ke Daftar Reservasi
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <PageMeta
                title={`Detail Reservasi #${reservation.booking_code} | Reservasi Ruang Dugamasa`}
                description="Detail reservasi"
            />
            <PageBreadcrumb
                pageTitle="Detail Reservasi"
                showHome={false}
                parentItems={[{ label: "Kelola Reservasi", path: "/dashboard/reservations" }]}
            />

            <ReservationDetailView
                reservation={reservation}
                showQRCode={false}
                showActions={reservation.status === 'pending_verification'}
                showBackButton={true}
                onApprove={() => setShowVerifyModal(true)}
                onReject={() => setShowRejectModal(true)}
                onClose={() => navigate("/dashboard/reservations")}
                closeButtonText="Kembali"
            />

            {/* Reject Modal */}
            <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} className="max-w-lg p-5 lg:p-10">
                <div className="space-y-5">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                        Tolak Pembayaran
                    </h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Alasan Penolakan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                            placeholder="Jelaskan alasan penolakan pembayaran..."
                            required
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Alasan ini akan dikirimkan kepada pelanggan.
                        </p>
                    </div>

                    <div className="flex items-center justify-end w-full gap-3 mt-6">
                        <Button
                            onClick={() => setShowRejectModal(false)}
                            size="sm"
                            variant="outline"
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <button
                            onClick={handleRejectPayment}
                            disabled={!rejectionReason.trim() || processing}
                            className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                        >
                            {processing ? "Memproses..." : "Tolak Pembayaran"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Verify Confirmation Modal */}
            <ConfirmationModal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onConfirm={handleVerifyPayment}
                title="Konfirmasi Pembayaran"
                message="Apakah Anda yakin ingin memverifikasi pembayaran ini? Status reservasi akan berubah menjadi Dikonfirmasi."
                variant="success"
                confirmText="Verifikasi"
                isLoading={processing}
            />
        </>
    );
}

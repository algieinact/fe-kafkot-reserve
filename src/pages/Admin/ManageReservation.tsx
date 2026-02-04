import { useEffect, useMemo, useState } from "react";
import { Eye, CheckCircle, X } from "lucide-react";
import { reservationApi } from "../../services/api";
import { Reservation, ReservationStatus } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { DataTableSkeleton } from "../../components/ui/skeleton";

export default function ManageReservation() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [filterStatus, setFilterStatus] = useState<ReservationStatus | "all">("all");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchReservations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = filterStatus !== "all" ? { status: filterStatus } : {};
            const response = await reservationApi.getReservations(params);
            if (response.success && response.data) {
                setReservations(response.data.data || []);
            } else {
                setError(response.error || "Gagal memuat reservasi");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat memuat data");
            console.error("Reservation error:", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmVerifyPayment = (reservationId: number) => {
        if (!selectedReservation || selectedReservation.id !== reservationId) {
            const res = reservations.find(r => r.id === reservationId);
            if (res) setSelectedReservation(res);
        }
        setShowVerifyModal(true);
    };

    const handleVerifyPayment = async () => {
        if (!selectedReservation) return;

        try {
            setProcessing(true);
            const response = await reservationApi.verifyPayment(selectedReservation.id.toString(), {});
            if (response.success) {
                await fetchReservations();
                setShowDetailModal(false);
                setShowVerifyModal(false);
                setSelectedReservation(null);
            }
        } catch (err) {
            console.error("Verify error:", err);
            setError("Gagal memverifikasi pembayaran");
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectPayment = async () => {
        if (!selectedReservation || !rejectionReason.trim()) {
            return;
        }

        try {
            setProcessing(true);
            const response = await reservationApi.rejectPayment(
                selectedReservation.id.toString(),
                { rejection_reason: rejectionReason }
            );
            if (response.success) {
                await fetchReservations();
                setShowDetailModal(false);
                setShowRejectModal(false);
                setRejectionReason("");
                setSelectedReservation(null);
            }
        } catch (err) {
            console.error("Reject error:", err);
            setError("Gagal menolak pembayaran");
        } finally {
            setProcessing(false);
        }
    };

    const openDetailModal = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedReservation(null);
    };

    const openRejectModal = () => {
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setRejectionReason("");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusBadge = (status: ReservationStatus) => {
        const badges = {
            pending_verification: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return badges[status] || badges.pending_verification;
    };

    const getStatusText = (status: ReservationStatus) => {
        const texts = {
            pending_verification: "Menunggu Verifikasi",
            confirmed: "Dikonfirmasi",
            rejected: "Ditolak",
            completed: "Selesai",
            cancelled: "Dibatalkan",
        };
        return texts[status] || status;
    };

    const columns: ColumnConfig[] = useMemo(() => [
        {
            key: "id",
            label: "ID",
            sortable: true,
        },
        {
            key: "customer_name",
            label: "Pelanggan",
            sortable: true,
            render: (_val, row) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {row.customer_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {row.customer_email}
                    </div>
                </div>
            )
        },
        {
            key: "reservation_date",
            label: "Waktu Reservasi",
            sortable: true,
            render: (_val, row) => (
                <div>
                    <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(row.reservation_date)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(row.reservation_time)}
                    </div>
                </div>
            )
        },
        {
            key: "table",
            label: "Meja",
            sortable: true,
            render: (_val, row) => (
                <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                    Meja {row.table?.table_number || "-"}
                </span>
            )
        },

        {
            key: "total_amount",
            label: "Total",
            sortable: true,
            render: (val) => (
                <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                    {formatPrice(val as number)}
                </span>
            )
        },
        {
            key: "payment_proof",
            label: "Bukti Pembayaran",
            sortable: false,
            render: (_val, row) => (
                <div className="flex justify-center">
                    {row.payment_proof_url ? (
                        <button
                            onClick={() => {
                                setSelectedImageUrl(row.payment_proof_url!);
                                setShowImageModal(true);
                            }}
                            className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                            title="Lihat Bukti Pembayaran"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-600">-</span>
                    )}
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (val) => (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(val as ReservationStatus)}`}>
                    {getStatusText(val as ReservationStatus)}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (_val, row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => openDetailModal(row as Reservation)}
                        className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {row.status === 'pending_verification' && (
                        <>
                            <button
                                onClick={() => confirmVerifyPayment((row as Reservation).id)}
                                className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Terima Pembayaran"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedReservation(row as Reservation);
                                    openRejectModal();
                                }}
                                className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Tolak Pembayaran"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ], []);

    const filterTabs: { label: string; value: ReservationStatus | "all" }[] = [
        { label: "Semua", value: "all" },
        { label: "Menunggu Verifikasi", value: "pending_verification" },
        { label: "Dikonfirmasi", value: "confirmed" },
        { label: "Ditolak", value: "rejected" },
        { label: "Selesai", value: "completed" },
    ];

    return (
        <>
            <PageMeta
                title="Kelola Reservasi | Reservasi Ruang Dugamasa"
                description="Kelola reservasi dan verifikasi pembayaran"
            />
            <PageBreadcrumb pageTitle="Kelola Reservasi" />

            <div className="space-y-5 sm:space-y-6">
                {/* Tab Style Filter - Like ArrivalCheck */}
                <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => {
                                if (filterStatus !== tab.value) {
                                    setFilterStatus(tab.value);
                                    setReservations([]);
                                    setError(null);
                                }
                            }}
                            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm transition-colors ${filterStatus === tab.value
                                ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Data Table */}
                {loading ? (
                    <DataTableSkeleton />
                ) : (
                    <DataTableOne
                        title="Daftar Reservasi"
                        data={reservations}
                        columns={columns}
                        defaultItemsPerPage={10}
                        itemsPerPageOptions={[5, 10, 15, 20]}
                        defaultSortKey="id"
                        defaultSortOrder="desc"
                        searchable={true}
                        searchPlaceholder="Cari pelanggan, email, nomor meja..."
                    />
                )}
            </div>

            {/* Detail Modal */}
            <Modal isOpen={showDetailModal && !!selectedReservation} onClose={closeDetailModal} className="max-w-3xl p-5 lg:p-10">
                {selectedReservation && (
                    <div className="space-y-6">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                            Detail Reservasi #{selectedReservation.id}
                        </h4>

                        <div className="max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Info */}
                                <div>
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Informasi Pelanggan
                                    </h5>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Nama:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {selectedReservation.customer_name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {selectedReservation.customer_email}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Telepon:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {selectedReservation.customer_phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reservation Info */}
                                <div>
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Informasi Reservasi
                                    </h5>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Tanggal:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatDate(selectedReservation.reservation_date)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Waktu:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatTime(selectedReservation.reservation_time)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Meja:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Meja {selectedReservation.table?.table_number || "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                                            <p className="text-sm font-medium">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedReservation.status)}`}>
                                                    {getStatusText(selectedReservation.status)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            {selectedReservation.items && selectedReservation.items.length > 0 && (
                                <div className="mt-6">
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Pesanan Menu
                                    </h5>
                                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Menu</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Harga</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                                {selectedReservation.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                                            {item.menu?.menu_name || "-"}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-center text-gray-900 dark:text-white">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                                                            {formatPrice(item.price)}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                                                            {formatPrice(item.price * item.quantity)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50 dark:bg-gray-800">
                                                    <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                                                        Total:
                                                    </td>
                                                    <td className="px-4 py-2 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                        {formatPrice(selectedReservation.total_amount)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Payment Proof */}
                            {selectedReservation.payment_proof_url && (
                                <div className="mt-6">
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Bukti Pembayaran
                                    </h5>
                                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                                        <img
                                            src={selectedReservation.payment_proof_url}
                                            alt="Bukti Pembayaran"
                                            className="max-w-full h-auto rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {selectedReservation.status === "rejected" && selectedReservation.rejection_reason && (
                                <div className="mt-6">
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Alasan Penolakan
                                    </h5>
                                    <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                        <p className="text-sm text-red-800 dark:text-red-400">
                                            {selectedReservation.rejection_reason}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end w-full gap-3 mt-6">
                            <Button
                                onClick={closeDetailModal}
                                size="sm"
                                variant="outline"
                            >
                                Tutup
                            </Button>
                            {selectedReservation.status === "pending_verification" && (
                                <>
                                    <button
                                        onClick={openRejectModal}
                                        className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => confirmVerifyPayment(selectedReservation.id)}
                                        className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                                    >
                                        Terima
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={showRejectModal} onClose={closeRejectModal} className="max-w-lg p-5 lg:p-10">
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
                            onClick={closeRejectModal}
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

            {/* Payment Proof Image Modal */}
            <Modal
                isOpen={showImageModal}
                onClose={() => {
                    setShowImageModal(false);
                    setSelectedImageUrl(null);
                }}
                className="max-w-4xl p-5 lg:p-10"
            >
                <div className="space-y-5">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                        Bukti Pembayaran
                    </h4>

                    {selectedImageUrl && (
                        <div className="flex justify-center">
                            <img
                                src={selectedImageUrl}
                                alt="Bukti Pembayaran"
                                className="max-w-full h-auto rounded-lg shadow-lg"
                                style={{ maxHeight: '70vh' }}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-end w-full gap-3 mt-6">
                        <Button
                            onClick={() => {
                                setShowImageModal(false);
                                setSelectedImageUrl(null);
                            }}
                            size="sm"
                            variant="outline"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
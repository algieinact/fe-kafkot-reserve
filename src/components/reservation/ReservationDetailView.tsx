import React from "react";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters";
import { Card } from "../ui/card";
import Button from "../ui/button/Button";
import { Reservation } from "../../types";

interface ReservationDetailViewProps {
    reservation: Reservation;
    showQRCode?: boolean;
    showActions?: boolean;
    showPaymentProof?: boolean;
    showBackButton?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
    onClose?: () => void;
    closeButtonText?: string;
}

export const ReservationDetailView: React.FC<ReservationDetailViewProps> = ({
    reservation,
    showQRCode = false,
    showActions = false,
    showPaymentProof = false,
    showBackButton = true,
    onApprove,
    onReject,
    onClose,
    closeButtonText = "Tutup"
}) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending_verification":
                return (
                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                        Menunggu Konfirmasi
                    </span>
                );
            case "confirmed":
                return (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        Dikonfirmasi
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                        Ditolak
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1 text-sm font-medium text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                        {status}
                    </span>
                );
        }
    };

    // Safety check: ensure order_items is an array
    const orderItems = Array.isArray(reservation.items) ? reservation.items : [];

    const totalAmount = orderItems.reduce(
        (sum: number, item: any) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.menu?.price || item.price || 0);
            const itemSubtotal = Number(item.subtotal) || (quantity * price);
            return sum + itemSubtotal;
        },
        0
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Order ID : #{reservation.booking_code}
                        </h1>
                        {getStatusBadge(reservation.status)}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Due date: {formatDate(reservation.reservation_date)}
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {showPaymentProof && reservation.payment_proof_url && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(reservation.payment_proof_url, '_blank')}
                        >
                            View Payment Proof
                        </Button>
                    )}
                    {showActions && onReject && (
                        <button
                            onClick={onReject}
                            className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                        >
                            Tolak
                        </button>
                    )}
                    {showActions && onApprove && (
                        <button
                            onClick={onApprove}
                            className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                        >
                            Setujui
                        </button>
                    )}
                    {showBackButton && onClose && (
                        <Button variant="outline" size="sm" onClick={onClose}>
                            {closeButtonText}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-2 lg:grid-cols-3">
                {/* Main Content - Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Details Table */}
                    <Card>
                        <div className="p-2 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                                Order Details
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-2 sm:pb-3 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                                No.
                                            </th>
                                            <th className="pb-2 sm:pb-3 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Products
                                            </th>
                                            <th className="pb-2 sm:pb-3 text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Qty
                                            </th>
                                            <th className="pb-2 sm:pb-3 text-right text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Unit Cost
                                            </th>
                                            <th className="pb-2 sm:pb-3 text-right text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item: any, index: number) => {
                                            const menuName = item.menu?.menu_name ||
                                                item.menu?.name ||
                                                item.menu_name ||
                                                item.name ||
                                                'Menu';
                                            const quantity = Number(item.quantity) || 0;
                                            const unitPrice = Number(item.price_at_order ?? item.menu?.price ?? item.price ?? 0);
                                            const itemSubtotal = Number(item.subtotal) || (quantity * unitPrice);

                                            // Parse variations — may be array (from API cast) or already decoded
                                            const variations: { group_name: string; option_name: string; price: number }[] =
                                                Array.isArray(item.variations)
                                                    ? item.variations
                                                    : (typeof item.variations === 'string'
                                                        ? JSON.parse(item.variations)
                                                        : []);

                                            // Split menu name by spaces for better mobile display
                                            const menuNameParts = menuName.split(' ');

                                            return (
                                                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                                    <td className="py-2 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-2 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">
                                                        <div className="font-medium">
                                                            {menuNameParts.map((part: string, i: number) => (
                                                                <React.Fragment key={i}>
                                                                    {part}
                                                                    {i < menuNameParts.length - 1 && <br />}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                        {variations.length > 0 && (
                                                            <ul className="mt-1 space-y-0.5">
                                                                {variations.map((v, vi) => (
                                                                    <li key={vi} className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                                                        + {v.group_name}: {v.option_name}
                                                                        {v.price > 0 && ` (+${v.price.toLocaleString('id-ID')})`}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </td>
                                                    <td className="py-2 sm:py-4 text-center text-xs sm:text-sm text-gray-900 dark:text-white">
                                                        {quantity}
                                                    </td>
                                                    <td className="py-2 sm:py-4 text-right text-xs sm:text-sm text-gray-900 dark:text-white">
                                                        {formatCurrency(unitPrice)}
                                                    </td>
                                                    <td className="py-2 sm:py-4 text-right text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(itemSubtotal)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Order Summary */}
                            <div className="mt-4 sm:mt-6 flex justify-end">
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                                        <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Total</span>
                                        <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Reservation Details */}
                    <Card>
                        <div className="p-2 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                                Reservation Details
                            </h2>
                            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2">
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Table Number</div>
                                    <div className="mt-1 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                                        {reservation.table?.table_number || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Date</div>
                                    <div className="mt-1 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                                        {formatDate(reservation.reservation_date)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Time</div>
                                    <div className="mt-1 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                                        {reservation.reservation_time}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Duration</div>
                                    <div className="mt-1 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                                        {reservation.duration_hours || 'N/A'} hours
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar - Customer Details & Order History */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Customer Details */}
                    <Card>
                        <div className="p-2 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                                Customer Details
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Name</div>
                                    <div className="mt-1 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                                        {reservation.customer_name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Email</div>
                                    <div className="mt-1 text-sm sm:text-base font-medium text-gray-900 dark:text-white break-all">
                                        {reservation.customer_email}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Phone</div>
                                    <div className="mt-1 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                                        {reservation.customer_phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Order History */}
                    <Card>
                        <div className="p-2 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                                Order History
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                {/* Created */}
                                <div className="flex gap-2 sm:gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                            Checkout Started
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                            {formatTime(reservation.created_at)}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
                                            {formatDate(reservation.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Uploaded */}
                                {reservation.payment_proof_url && (
                                    <div className="flex gap-2 sm:gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                                Payment Proof Uploaded
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                Receipt uploaded successfully
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Verification Status */}
                                <div className="flex gap-2 sm:gap-3">
                                    <div className="flex-shrink-0">
                                        <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${reservation.status === 'confirmed'
                                            ? 'bg-green-50 dark:bg-green-900/20'
                                            : reservation.status === 'rejected'
                                                ? 'bg-red-50 dark:bg-red-900/20'
                                                : 'bg-yellow-50 dark:bg-yellow-900/20'
                                            }`}>
                                            {reservation.status === 'confirmed' ? (
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : reservation.status === 'rejected' ? (
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                            {reservation.status === 'confirmed' && 'Reservation Confirmed'}
                                            {reservation.status === 'rejected' && 'Payment Rejected'}
                                            {reservation.status === 'pending_verification' && 'Pending Verification'}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                            {reservation.status === 'confirmed' && 'Reservation has been confirmed'}
                                            {reservation.status === 'rejected' && (reservation.rejection_reason || 'Payment proof invalid')}
                                            {reservation.status === 'pending_verification' && 'Waiting for admin verification'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* QR Code for Confirmed Reservations */}
                    {showQRCode && reservation.status === 'confirmed' && (
                        <Card>
                            <div className="p-2 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center">
                                    Reservation QR Code
                                </h2>
                                <div className="flex flex-col items-center">
                                    <div className="rounded-lg bg-white p-3 sm:p-4 shadow-sm">
                                        <svg className="h-32 w-32 sm:h-40 sm:w-40" viewBox="0 0 100 100">
                                            <rect width="100" height="100" fill="white" />
                                            <text x="50" y="50" fontSize="6" textAnchor="middle" dominantBaseline="middle" fill="black">
                                                {reservation.booking_code}
                                            </text>
                                        </svg>
                                    </div>
                                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400">
                                        Show this QR code when you arrive
                                    </p>
                                    <p className="mt-1 text-[10px] sm:text-xs font-mono text-gray-500 dark:text-gray-500">
                                        {reservation.booking_code}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReservationDetailView;

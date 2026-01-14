import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters";
import { Card } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";
import { reservationApi } from "../../services/api";

const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // First, try to get from sessionStorage
        const cachedData = sessionStorage.getItem(`reservation_${orderId}`);
        
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          
          // Check if we have basic reservation data
          if (parsed.customer_name && parsed.booking_code) {
            setReservation(parsed);
            setLoading(false);
            return;
          }
        }

        // If not in sessionStorage or incomplete, fetch from API
        const response = await reservationApi.getByBookingCode(orderId);
        
        if (response.success && response.data) {
          // Map items or reservation_items to order_items for consistency
          const apiData = response.data as any;
          const reservationData = {
            ...response.data,
            order_items: apiData.items || apiData.reservation_items || []
          };
          
          // Save to sessionStorage for future use
          sessionStorage.setItem(`reservation_${orderId}`, JSON.stringify(reservationData));
          setReservation(reservationData);
        }
      } catch (error) {
        console.error("Error fetching reservation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card>
          <div className="p-8 text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data reservasi...</p>
          </div>
        </Card>
      </div>
    );
  }

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

  const totalAmount = reservation.order_items.reduce(
    (sum: number, item: any) => sum + item.subtotal,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order ID : #{reservation.booking_code}
                </h1>
                {getStatusBadge(reservation.status)}
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Due date: {formatDate(reservation.reservation_date)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {reservation.payment_proof_url && (
              <Button 
                variant="outline"
                onClick={() => window.open(reservation.payment_proof_url, '_blank')}
              >
                View Receipt
              </Button>
            )}
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-3">
          {/* Main Content - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details Table */}
            <Card>
              <div className="p-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Details
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                          No.
                        </th>
                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                          Products
                        </th>
                        <th className="pb-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                          Quantity
                        </th>
                        <th className="pb-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                          Unit Cost
                        </th>
                        <th className="pb-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservation.order_items.map((item: any, index: number) => {
                        const menuName = item.menu?.menu_name || 
                                        item.menu?.name || 
                                        item.menu_name || 
                                        item.name || 
                                        'Menu';
                        const unitPrice = item.menu?.price || item.price || (item.subtotal / item.quantity);
                        
                        return (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-4 text-sm text-gray-900 dark:text-white">
                              {index + 1}
                            </td>
                            <td className="py-4 text-sm text-gray-900 dark:text-white">
                              {menuName}
                            </td>
                            <td className="py-4 text-center text-sm text-gray-900 dark:text-white">
                              {item.quantity}
                            </td>
                            <td className="py-4 text-right text-sm text-gray-900 dark:text-white">
                              {formatCurrency(unitPrice)}
                            </td>
                            <td className="py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Order Summary */}
                <div className="mt-6 flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                      <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reservation Details */}
            <Card>
              <div className="p-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Reservation Details
                </h2>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Table Number</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                      {reservation.table?.table_number || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Date</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                      {formatDate(reservation.reservation_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                      {reservation.reservation_time}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                      {reservation.duration_hours || 'N/A'} hours
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Customer Details & Order History */}
          <div className="space-y-6">
            {/* Customer Details */}
            <Card>
              <div className="p-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Customer Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Name</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                      {reservation.customer_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white break-all">
                      {reservation.customer_email}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Phone</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                      {reservation.customer_phone}
                    </div>
                  </div>
                  {reservation.table?.area && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Area</div>
                      <div className="mt-1 font-medium text-gray-900 dark:text-white">
                        {reservation.table.area}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Order History */}
            <Card>
              <div className="p-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order History
                </h2>
                <div className="space-y-4">
                  {/* Created */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Checkout Started
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {formatTime(reservation.created_at)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(reservation.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Uploaded */}
                  {reservation.payment_proof_url && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Payment Proof Uploaded
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          Receipt uploaded successfully
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Verification Status */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        reservation.status === 'confirmed' 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : reservation.status === 'rejected'
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : 'bg-yellow-50 dark:bg-yellow-900/20'
                      }`}>
                        {reservation.status === 'confirmed' ? (
                          <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : reservation.status === 'rejected' ? (
                          <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {reservation.status === 'confirmed' && 'Reservation Confirmed'}
                        {reservation.status === 'rejected' && 'Payment Rejected'}
                        {reservation.status === 'pending_verification' && 'Pending Verification'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {reservation.status === 'confirmed' && 'Your reservation is confirmed'}
                        {reservation.status === 'rejected' && (reservation.rejection_reason || 'Payment proof invalid')}
                        {reservation.status === 'pending_verification' && 'Waiting for admin verification'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* QR Code for Confirmed Reservations */}
            {reservation.status === 'confirmed' && (
              <Card>
                <div className="p-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                    Reservation QR Code
                  </h2>
                  <div className="flex flex-col items-center">
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <svg className="h-40 w-40" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="white"/>
                        <text x="50" y="50" fontSize="6" textAnchor="middle" dominantBaseline="middle" fill="black">
                          {reservation.booking_code}
                        </text>
                      </svg>
                    </div>
                    <p className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400">
                      Show this QR code when you arrive
                    </p>
                    <p className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-500">
                      {reservation.booking_code}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;

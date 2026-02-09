import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";
import { reservationApi } from "../../services/api";
import { ReservationDetailView } from "../../components/reservation/ReservationDetailView";

const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // Always fetch from API to get the latest status
        const response = await reservationApi.getByBookingCode(orderId);

        if (response.success && response.data) {
          // Map items or reservation_items to items for consistency
          const apiData = response.data as any;
          const reservationData = {
            ...response.data,
            items: apiData.items || apiData.reservation_items || apiData.order_items || []
          };

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
            <div className="mt-4">
              <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ReservationDetailView
          reservation={reservation}
          showQRCode={true}
          showActions={false}
          showBackButton={true}
          onClose={() => navigate("/")}
          closeButtonText="Back to Home"
        />
      </div>
    </div>
  );
};

export default OrderStatusPage;


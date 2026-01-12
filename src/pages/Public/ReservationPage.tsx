import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";
import { Table } from "../../types";
import {
  validateEmail,
  validatePhone,
  validateReservationDate,
} from "../../utils/validators";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardTitle } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import { reservationStorage } from "../../services/localStorage";
import DynamicTableLayout from "../../components/reservation/DynamicTableLayout";

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice } = useCart();

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    reservation_date: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(2);
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);


  // Generate time slots (09:00 - 22:00, every 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Calculate duration in hours from start and end time
  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const durationMinutes = endMinutes - startMinutes;
    return durationMinutes / 60; // Convert to hours
  };

  // Get available end time slots based on start time
  const getAvailableEndTimes = (start: string) => {
    if (!start) return [];
    const [startH, startM] = start.split(':').map(Number);
    const slots = [];
    const closingHour = 22;
    const maxDurationHours = 5;

    // Generate slots from 30 minutes after start time
    for (let hour = startH; hour <= closingHour; hour++) {
      for (let minute of [0, 30]) {
        if (hour === startH && (hour * 60 + minute) <= (startH * 60 + startM)) continue;

        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const duration = calculateDuration(start, timeSlot);

        // Only include slots that are within max duration and before closing
        if (duration > 0 && duration <= maxDurationHours && hour < closingHour) {
          slots.push(timeSlot);
        }
        // Include closing time if within max duration
        if (hour === closingHour && minute === 0 && duration > 0 && duration <= maxDurationHours) {
          slots.push(timeSlot);
        }
      }
    }
    return slots;
  };

  // Update duration when start time or end time changes
  useEffect(() => {
    if (startTime && endTime) {
      const calculatedDuration = calculateDuration(startTime, endTime);
      setDuration(calculatedDuration);
    } else {
      setDuration(0);
    }
  }, [startTime, endTime]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate customer info
    if (!formData.customer_name || formData.customer_name.trim().length < 2) {
      newErrors.customer_name = "Nama minimal 2 karakter";
    }

    if (!validateEmail(formData.customer_email)) {
      newErrors.customer_email = "Format email tidak valid";
    }

    if (!validatePhone(formData.customer_phone)) {
      newErrors.customer_phone = "Nomor telepon tidak valid";
    }

    // Validate date
    const dateValidation = validateReservationDate(formData.reservation_date);
    if (dateValidation !== true) {
      newErrors.reservation_date = dateValidation;
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkTableAvailability = async () => {
    console.log("=== Checking Table Availability ===");

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    if (!startTime) {
      alert("Pilih jam mulai terlebih dahulu");
      return;
    }

    if (!endTime) {
      alert("Pilih jam selesai terlebih dahulu");
      return;
    }

    if (duration <= 0 || duration > 5) {
      alert("Durasi harus antara 0.5 - 5 jam");
      return;
    }


    try {
      setCheckingAvailability(true);
      setShowTableSelection(false);
      setSelectedTable(null);
      setErrors({});

      const requestData = {
        reservation_date: formData.reservation_date,
        reservation_time: startTime,
        duration_hours: duration,
      };

      console.log("Request data:", requestData);

      // Call API to get all tables with availability status
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/tables/availability-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      console.log("API Response:", data);

      if (data.success && data.data && data.data.tables) {
        const tables = data.data.tables;

        console.log("Tables from API:", tables);

        // Just store tables directly - no need for position mapping
        setAvailableTables(tables);
        setShowTableSelection(true);

        if (tables.length === 0) {
          setErrors((prev) => ({
            ...prev,
            table: "Tidak ada meja tersedia untuk kriteria yang dipilih"
          }));
        }
      } else {
        console.error("API returned error:", data.error);
        setErrors((prev) => ({
          ...prev,
          table: data.error || "Gagal memeriksa ketersediaan meja"
        }));
        setShowTableSelection(true);
      }
    } catch (error: any) {
      console.error("Exception during availability check:", error);
      setErrors((prev) => ({
        ...prev,
        table: "Terjadi kesalahan saat memeriksa ketersediaan meja"
      }));
      setShowTableSelection(true);
    } finally {
      setCheckingAvailability(false);
      console.log("=== Availability Check Complete ===");
    }
  };

  const handleTableSelection = (tableId: number) => {
    const table = availableTables.find(t => t.id === tableId);
    if (table) {
      setSelectedTable(table);
      setErrors((prev) => ({ ...prev, table: "" }));
    }
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, payment_proof: "File harus berupa gambar" }));
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, payment_proof: "Ukuran file maksimal 2MB" }));
        return;
      }

      setPaymentProof(file);
      setErrors((prev) => ({ ...prev, payment_proof: "" }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTable) {
      setErrors((prev) => ({ ...prev, table: "Pilih meja terlebih dahulu" }));
      return;
    }

    if (!startTime) {
      setErrors((prev) => ({ ...prev, startTime: "Pilih jam mulai terlebih dahulu" }));
      return;
    }

    if (!endTime) {
      setErrors((prev) => ({ ...prev, endTime: "Pilih jam selesai terlebih dahulu" }));
      return;
    }

    if (duration <= 0 || duration > 5) {
      setErrors((prev) => ({ ...prev, duration: "Durasi harus antara 0.5 - 5 jam" }));
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      // Validate payment proof
      if (!paymentProof) {
        setErrors((prev) => ({ ...prev, payment_proof: "Bukti pembayaran wajib diupload" }));
        setSubmitting(false);
        return;
      }

      // Prepare FormData for API (with file upload)
      const formDataToSend = new FormData();
      formDataToSend.append('customer_name', formData.customer_name);
      formDataToSend.append('customer_email', formData.customer_email);
      formDataToSend.append('customer_phone', formData.customer_phone);
      formDataToSend.append('table_id', selectedTable.id.toString());
      formDataToSend.append('reservation_date', formData.reservation_date);
      formDataToSend.append('reservation_time', startTime);
      formDataToSend.append('duration_hours', duration.toString());
      formDataToSend.append('payment_proof', paymentProof);

      // Add order items
      cartItems.forEach((item, index) => {
        formDataToSend.append(`order_items[${index}][menu_id]`, item.menu.id.toString());
        formDataToSend.append(`order_items[${index}][quantity]`, item.quantity.toString());
      });

      // Call backend API with FormData
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/reservations`, {
        method: 'POST',
        body: formDataToSend, // Don't set Content-Type header, browser will set it with boundary
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Get table type name from selected table
        const tableTypeName = selectedTable.table_type?.type_name || "Unknown";

        // Save to localStorage as backup/cache
        reservationStorage.add({
          bookingCode: data.data.booking_code,
          customerName: formData.customer_name,
          customerEmail: formData.customer_email,
          customerPhone: formData.customer_phone,
          reservationDate: formData.reservation_date,
          reservationTime: startTime,
          durationHours: duration,
          tableNumber: selectedTable.table_number,
          tableType: tableTypeName,
          totalAmount: data.data.total_amount || totalPrice,
          status: data.data.status || "pending_verification",
          orderItems: cartItems.map(item => ({
            menuName: item.menu.menu_name,
            quantity: item.quantity,
            price: item.menu.price,
          })),
          createdAt: new Date().toISOString(),
        });


        // Store in sessionStorage for payment page
        sessionStorage.setItem("pending_reservation", JSON.stringify({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          table_id: selectedTable.id,
          reservation_date: formData.reservation_date,
          reservation_time: startTime,
          duration_hours: duration,
          booking_code: data.data.booking_code,
          id: data.data.id,
          // Add complete order items with menu details for payment page
          order_items: cartItems.map(item => ({
            menu_id: item.menu.id,
            quantity: item.quantity,
            menu: item.menu,
            price: item.menu.price,
            subtotal: item.menu.price * item.quantity
          }))
        }));

        // Navigate to payment page with booking code
        navigate(`/payment/${data.data.booking_code}`);
      } else {
        // Handle API error
        setErrors({ submit: data.error || "Gagal membuat reservasi. Silakan coba lagi." });
      }
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      setErrors({ submit: error.message || "Terjadi kesalahan. Silakan coba lagi." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Reservasi Meja</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Lengkapi form di bawah untuk melanjutkan reservasi
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardTitle>Informasi Pelanggan</CardTitle>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nama Lengkap <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${errors.customer_name ? "border-error-500" : "border-gray-200"
                      } bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white`}
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.customer_name && (
                    <p className="mt-1 text-sm text-error-500">{errors.customer_name}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${errors.customer_email ? "border-error-500" : "border-gray-200"
                      } bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white`}
                    placeholder="nama@email.com"
                  />
                  {errors.customer_email && (
                    <p className="mt-1 text-sm text-error-500">{errors.customer_email}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nomor Telepon <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${errors.customer_phone ? "border-error-500" : "border-gray-200"
                      } bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white`}
                    placeholder="08123456789"
                  />
                  {errors.customer_phone && (
                    <p className="mt-1 text-sm text-error-500">{errors.customer_phone}</p>
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
                    <DatePicker
                      id="reservation_date"
                      label="Tanggal *"
                      placeholder="Pilih tanggal reservasi"
                      defaultDate={formData.reservation_date || undefined}
                      onChange={(selectedDates) => {
                        if (selectedDates && selectedDates.length > 0) {
                          const date = selectedDates[0];
                          // Format date in local timezone to avoid date shift
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const formattedDate = `${year}-${month}-${day}`;
                          setFormData((prev) => ({ ...prev, reservation_date: formattedDate }));
                          setErrors((prev) => ({ ...prev, reservation_date: "" }));
                        }
                      }}
                    />
                    {errors.reservation_date && (
                      <p className="mt-1 text-sm text-error-500">{errors.reservation_date}</p>
                    )}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Start Time */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Jam Mulai <span className="text-error-500">*</span>
                    </label>
                    <select
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        setEndTime(""); // Reset end time when start time changes
                      }}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white"
                      required
                    >
                      <option value="">Pilih Jam Mulai</option>
                      {generateTimeSlots().map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Jam Selesai <span className="text-error-500">*</span>
                    </label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white"
                      required
                      disabled={!startTime}
                    >
                      <option value="">Pilih Jam Selesai</option>
                      {getAvailableEndTimes(startTime).map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration Info */}
                {startTime && endTime && duration > 0 && (
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-semibold">Durasi:</span> {duration} jam ({startTime} - {endTime})
                    </p>
                  </div>
                )}
                {!startTime && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cafe buka: 09:00 - 22:00 • Maksimal durasi: 5 jam
                  </p>
                )}
                {startTime && !endTime && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pilih jam selesai (maksimal 5 jam dari jam mulai)
                  </p>
                )}

                <Button
                  onClick={checkTableAvailability}
                  className="w-full"
                  disabled={checkingAvailability}
                >
                  {checkingAvailability ? "Memeriksa..." : "Cek Ketersediaan Meja"}
                </Button>
              </div>
            </Card>

            {/* Visual Table Selection */}
            {showTableSelection && (
              <Card>
                <CardTitle>Pilih Meja</CardTitle>
                <div className="mt-4">
                  {/* Dynamic Table Layout */}
                  <DynamicTableLayout
                    tables={availableTables}
                    selectedTableId={selectedTable?.id || null}
                    onTableSelect={handleTableSelection}
                  />

                  {/* Selected Table Info */}
                  {selectedTable && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            Meja Terpilih: {selectedTable.table_number}
                          </p>
                          <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                            Kapasitas: {selectedTable.capacity} orang
                          </p>
                        </div>
                        <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Payment Information & Upload - Show after table selection */}
                  {selectedTable && (
                    <div className="mt-6 space-y-6">
                      {/* Bank Account Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Informasi Transfer
                        </h3>
                        <div className="space-y-3">
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
                                type="button"
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
                              PT Ruang Dugamasa Indonesia
                            </div>
                          </div>

                          <div className="rounded-lg bg-warning-50 p-4 dark:bg-warning-900/20">
                            <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                              Total yang Harus Dibayar:
                            </div>
                            <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
                              {formatCurrency(totalPrice)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Instructions */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Instruksi Pembayaran
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex gap-3">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                              1
                            </div>
                            <div>
                              Transfer sejumlah <strong className="text-gray-900 dark:text-white">{formatCurrency(totalPrice)}</strong> ke rekening yang tertera di atas
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                              2
                            </div>
                            <div>
                              Setelah transfer, simpan bukti pembayaran dalam format gambar (JPG/PNG/WEBP)
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
                      </div>

                      {/* Upload Bukti Pembayaran */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Upload Bukti Pembayaran
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Bukti Transfer <span className="text-error-500">*</span>
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePaymentProofChange}
                              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Format: JPG, PNG, WEBP. Maksimal 2MB
                            </p>
                            {errors.payment_proof && (
                              <p className="mt-1 text-sm text-error-500">{errors.payment_proof}</p>
                            )}
                          </div>

                          {/* Preview */}
                          {paymentProofPreview && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Preview:
                              </p>
                              <div className="relative inline-block">
                                <img
                                  src={paymentProofPreview}
                                  alt="Payment proof preview"
                                  className="max-w-sm rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentProof(null);
                                    setPaymentProofPreview(null);
                                  }}
                                  className="absolute right-2 top-2 rounded-full bg-error-500 p-2 text-white hover:bg-error-600"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Messages */}
                  {errors.table && (
                    <div className="mt-4 rounded-lg bg-error-50 p-3 dark:bg-error-900/20">
                      <p className="text-sm text-error-800 dark:text-error-200">{errors.table}</p>
                    </div>
                  )}
                  {errors.submit && (
                    <div className="mt-4 rounded-lg bg-error-50 p-3 dark:bg-error-900/20">
                      <p className="text-sm text-error-800 dark:text-error-200">{errors.submit}</p>
                    </div>
                  )}

                  {/* Confirmation Button */}
                  {selectedTable && (
                    <Button
                      onClick={handleSubmit}
                      className="w-full mt-4"
                      disabled={submitting}
                    >
                      {submitting ? "Memproses..." : "Konfirmasi Reservasi"}
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardTitle>Ringkasan Pesanan</CardTitle>
              <div className="mt-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-center">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Keranjang pesanan kosong
                    </p>
                    <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-300">
                      Silakan pilih menu terlebih dahulu di halaman Menu
                    </p>
                    <button
                      onClick={() => navigate('/menu')}
                      className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      Pilih Menu →
                    </button>
                  </div>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.menu.id} className="flex items-start justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{item.menu.menu_name}</div>
                          <div className="text-gray-600 dark:text-gray-400">x{item.quantity}</div>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.menu.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900 dark:text-white">Total</div>
                        <div className="text-xl font-bold text-brand-500">{formatCurrency(totalPrice)}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
              <div className="flex gap-3">
                <svg className="h-5 w-5 flex-shrink-0 text-blue-light-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-900">
                  <strong>Catatan:</strong> Setelah konfirmasi, Anda akan diarahkan ke halaman pembayaran
                  untuk melakukan transfer dan upload bukti pembayaran.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;

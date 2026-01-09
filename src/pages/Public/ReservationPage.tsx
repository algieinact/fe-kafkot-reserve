import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";
import { Table, TableTypeDetail } from "../../types";
import {
  validateEmail,
  validatePhone,
  validateReservationDate,

  validateNumberOfPeople,
} from "../../utils/validators";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardTitle } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import { reservationStorage } from "../../services/localStorage";
import { reservationApi, tableApi } from "../../services/api";

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice } = useCart();

  // Table types from API
  const [tableTypes, setTableTypes] = useState<TableTypeDetail[]>([]);
  const [loadingTableTypes, setLoadingTableTypes] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    reservation_date: "",
    reservation_time: "",
    number_of_people: 2,
    table_type_id: 0,
    special_notes: "",
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

  // Check if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      // Redirect to menu if no items
      navigate("/menu");
    }
  }, [cartItems, navigate]);

  // Fetch table types on mount
  useEffect(() => {
    const fetchTableTypes = async () => {
      try {
        setLoadingTableTypes(true);
        const response = await tableApi.getTableTypes();
        if (response.success && response.data && response.data.length > 0) {
          setTableTypes(response.data);
          // Set default table type to first one
          setFormData(prev => ({ ...prev, table_type_id: response.data![0].id }));
        }
      } catch (error) {
        console.error("Error fetching table types:", error);
      } finally {
        setLoadingTableTypes(false);
      }
    };

    fetchTableTypes();
  }, []);

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

  const handleTableTypeChange = (typeId: number) => {
    setFormData((prev) => ({ ...prev, table_type_id: typeId }));
    setShowTableSelection(false);
    setSelectedTable(null);
    setErrors((prev) => ({ ...prev, table_type: "" }));
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

    // Validate number of people
    const peopleValidation = validateNumberOfPeople(formData.number_of_people);
    if (peopleValidation !== true) {
      newErrors.number_of_people = peopleValidation;
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

    if (!formData.table_type_id) {
      alert("Pilih tipe meja terlebih dahulu");
      return;
    }

    try {
      setCheckingAvailability(true);
      setShowTableSelection(false);
      setErrors({});
      const requestData = {
        reservation_date: formData.reservation_date,
        reservation_time: startTime,
        table_type_id: formData.table_type_id.toString(),
        number_of_people: formData.number_of_people,
        duration_hours: duration,
      };

      console.log("Request data:", requestData);

      // Call API to check availability
      const response = await tableApi.checkAvailability(requestData);

      console.log("API Response:", response);

      if (response.success && response.data) {
        const availableTables = response.data.available_tables || [];
        console.log("Available tables:", availableTables);

        setAvailableTables(availableTables);
        setShowTableSelection(true);

        if (availableTables.length === 0) {
          setErrors((prev) => ({
            ...prev,
            table: "Tidak ada meja tersedia untuk kriteria yang dipilih"
          }));
        }
      } else {
        console.error("API returned error:", response.error);
        setErrors((prev) => ({
          ...prev,
          table: response.error || "Gagal memeriksa ketersediaan meja"
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

  const handleTableSelection = (table: Table) => {
    setSelectedTable(table);
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

      // Prepare reservation data for API
      const reservationData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        table_id: selectedTable.id,
        reservation_date: formData.reservation_date,
        reservation_time: startTime, // Use startTime instead of formData.reservation_time
        number_of_people: formData.number_of_people,
        duration_hours: duration,
        special_notes: formData.special_notes,
        order_items: cartItems.map(item => ({
          menu_id: item.menu.id,
          quantity: item.quantity
        }))
      };

      // Call backend API
      const response = await reservationApi.createReservation(reservationData);

      if (response.success && response.data) {
        // Get table type name from selected table
        const tableTypeName = selectedTable.table_type?.type_name ||
          tableTypes.find(t => t.id === formData.table_type_id)?.type_name ||
          "Unknown";

        // Save to localStorage as backup/cache
        reservationStorage.add({
          bookingCode: response.data.booking_code,
          customerName: formData.customer_name,
          customerEmail: formData.customer_email,
          customerPhone: formData.customer_phone,
          reservationDate: formData.reservation_date,
          reservationTime: startTime,
          durationHours: duration,
          numberOfPeople: formData.number_of_people,
          tableNumber: selectedTable.table_number,
          tableType: tableTypeName,
          totalAmount: response.data.total_amount || totalPrice,
          status: response.data.status || "pending_verification",
          orderItems: cartItems.map(item => ({
            menuName: item.menu.menu_name,
            quantity: item.quantity,
            price: item.menu.price,
          })),
          createdAt: new Date().toISOString(),
        });


        // Store in sessionStorage for payment page
        sessionStorage.setItem("pending_reservation", JSON.stringify({
          ...reservationData,
          booking_code: response.data.booking_code,
          id: response.data.id,
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
        navigate(`/payment/${response.data.booking_code}`);
      } else {
        // Handle API error
        setErrors({ submit: response.error || "Gagal membuat reservasi. Silakan coba lagi." });
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

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Jumlah Orang <span className="text-error-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="number_of_people"
                      value={formData.number_of_people}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className={`w-full rounded-lg border ${errors.number_of_people ? "border-error-500" : "border-gray-200"
                        } bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white`}
                    />
                    {errors.number_of_people && (
                      <p className="mt-1 text-sm text-error-500">{errors.number_of_people}</p>
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipe Meja <span className="text-error-500">*</span>
                  </label>
                  {loadingTableTypes ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Memuat tipe meja...</p>
                    </div>
                  ) : tableTypes.length > 0 ? (
                    <div className={`grid gap-3 ${tableTypes.length === 3 ? 'sm:grid-cols-3' : tableTypes.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
                      {tableTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleTableTypeChange(type.id)}
                          className={`rounded-lg border-2 p-4 text-left transition ${formData.table_type_id === type.id
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                            : "border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-dark"
                            }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{type.type_name}</div>
                          {type.description && (
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                              {type.description}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-500">Tidak ada tipe meja tersedia</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Catatan Khusus (Opsional)
                  </label>
                  <textarea
                    name="special_notes"
                    value={formData.special_notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white"
                    placeholder="Tambahkan catatan khusus jika ada..."
                  />
                </div>

                <Button
                  onClick={checkTableAvailability}
                  className="w-full"
                  disabled={checkingAvailability}
                >
                  {checkingAvailability ? "Memeriksa..." : "Cek Ketersediaan Meja"}
                </Button>
              </div>
            </Card>

            {/* Available Tables */}
            {showTableSelection && (
              <Card>
                <CardTitle>Pilih Meja</CardTitle>
                <div className="mt-4">
                  {availableTables.length > 0 ? (
                    <>
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        {availableTables.length} meja tersedia untuk {formData.number_of_people} orang
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {availableTables.map((table) => (
                          <button
                            key={table.id}
                            onClick={() => handleTableSelection(table)}
                            className={`rounded-lg border-2 p-4 text-left transition ${selectedTable?.id === table.id
                              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                              : "border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-dark"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  Meja {table.table_number}
                                </div>
                                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                  Kapasitas: {table.capacity} orang
                                </div>
                              </div>
                              {selectedTable?.id === table.id && (
                                <svg className="h-6 w-6 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.table && (
                        <p className="mt-2 text-sm text-error-500">{errors.table}</p>
                      )}
                      {errors.submit && (
                        <div className="mt-4 rounded-lg bg-error-50 p-3 dark:bg-error-900/20">
                          <p className="text-sm text-error-800 dark:text-error-200">{errors.submit}</p>
                        </div>
                      )}
                      {selectedTable && (
                        <Button
                          onClick={handleSubmit}
                          className="w-full mt-4"
                          disabled={submitting}
                        >
                          {submitting ? "Memproses..." : "Konfirmasi Reservasi"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="rounded-lg bg-error-50 p-4 text-center dark:bg-error-900/20">
                      <p className="text-sm font-medium text-error-800 dark:text-error-200">
                        Tidak ada meja tersedia untuk kriteria yang dipilih
                      </p>
                      <p className="mt-1 text-xs text-error-600 dark:text-error-300">
                        Coba pilih tanggal/waktu lain atau tipe meja berbeda
                      </p>
                    </div>
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

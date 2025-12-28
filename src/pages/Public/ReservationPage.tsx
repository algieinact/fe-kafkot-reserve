import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";
import { TableType, Table, OrderItem } from "../../types";
import { mockTables } from "../../data/mockData";
import {
  validateEmail,
  validatePhone,
  validateReservationDate,
  validateReservationTime,
  validateNumberOfPeople,
} from "../../utils/validators";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardTitle } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice } = useCart();

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    reservation_date: "",
    reservation_time: "",
    number_of_people: 2,
    table_type: TableType.INDOOR,
    special_notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableSelection, setShowTableSelection] = useState(false);

  // Check if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      // Redirect to menu if no items
      navigate("/menu");
    }
  }, [cartItems, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTableTypeChange = (type: TableType) => {
    setFormData((prev) => ({ ...prev, table_type: type }));
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

    // Validate time
    const timeValidation = validateReservationTime(
      formData.reservation_time,
      formData.reservation_date
    );
    if (timeValidation !== true) {
      newErrors.reservation_time = timeValidation;
    }

    // Validate number of people
    const peopleValidation = validateNumberOfPeople(formData.number_of_people);
    if (peopleValidation !== true) {
      newErrors.number_of_people = peopleValidation;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkTableAvailability = () => {
    if (!validateForm()) {
      return;
    }

    // Filter tables by type and capacity
    const filtered = mockTables.filter(
      (table) =>
        table.type === formData.table_type &&
        table.capacity >= formData.number_of_people &&
        table.is_available
    );

    // Sort by capacity (closest match first)
    const sorted = filtered.sort((a, b) => a.capacity - b.capacity);

    setAvailableTables(sorted);
    setShowTableSelection(true);
  };

  const handleTableSelection = (table: Table) => {
    setSelectedTable(table);
  };

  const handleSubmit = () => {
    if (!selectedTable) {
      setErrors((prev) => ({ ...prev, table: "Pilih meja terlebih dahulu" }));
      return;
    }

    // Create reservation object
    const orderItems: OrderItem[] = cartItems.map((item) => ({
      menu_id: item.menu.id,
      menu: item.menu,
      quantity: item.quantity,
      price: item.menu.price,
      subtotal: item.menu.price * item.quantity,
    }));

    const reservationData = {
      ...formData,
      order_items: orderItems,
      table_id: selectedTable.id,
    };

    // Store in sessionStorage for payment page
    sessionStorage.setItem("pending_reservation", JSON.stringify(reservationData));

    // Navigate to payment page
    navigate("/payment/pending");
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
                    className={`w-full rounded-lg border ${
                      errors.customer_name ? "border-error-500" : "border-gray-200"
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
                    className={`w-full rounded-lg border ${
                      errors.customer_email ? "border-error-500" : "border-gray-200"
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
                    className={`w-full rounded-lg border ${
                      errors.customer_phone ? "border-error-500" : "border-gray-200"
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
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tanggal <span className="text-error-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="reservation_date"
                      value={formData.reservation_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full rounded-lg border ${
                        errors.reservation_date ? "border-error-500" : "border-gray-200"
                      } bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white`}
                    />
                    {errors.reservation_date && (
                      <p className="mt-1 text-sm text-error-500">{errors.reservation_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Waktu <span className="text-error-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="reservation_time"
                      value={formData.reservation_time}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border ${
                        errors.reservation_time ? "border-error-500" : "border-gray-200"
                      } bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white`}
                    />
                    {errors.reservation_time && (
                      <p className="mt-1 text-sm text-error-500">{errors.reservation_time}</p>
                    )}
                  </div>
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
                    className={`w-full rounded-lg border ${
                      errors.number_of_people ? "border-error-500" : "border-gray-200"
                    } bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white`}
                  />
                  {errors.number_of_people && (
                    <p className="mt-1 text-sm text-error-500">{errors.number_of_people}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipe Meja <span className="text-error-500">*</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => handleTableTypeChange(TableType.INDOOR)}
                      className={`rounded-lg border-2 p-4 text-left transition ${
                        formData.table_type === TableType.INDOOR
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                          : "border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-dark"
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">Indoor</div>
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        Ruangan ber-AC
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTableTypeChange(TableType.SEMI_OUTDOOR)}
                      className={`rounded-lg border-2 p-4 text-left transition ${
                        formData.table_type === TableType.SEMI_OUTDOOR
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                          : "border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-dark"
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">Semi Outdoor</div>
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        Area beratap terbuka
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTableTypeChange(TableType.OUTDOOR)}
                      className={`rounded-lg border-2 p-4 text-left transition ${
                        formData.table_type === TableType.OUTDOOR
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                          : "border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-dark"
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">Outdoor</div>
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        Taman terbuka
                      </div>
                    </button>
                  </div>
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

                <Button onClick={checkTableAvailability} className="w-full">
                  Cek Ketersediaan Meja
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
                            className={`rounded-lg border-2 p-4 text-left transition ${
                              selectedTable?.id === table.id
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
                      {selectedTable && (
                        <Button onClick={handleSubmit} className="w-full mt-4">
                          Konfirmasi Reservasi
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
                      <div className="font-medium text-gray-900 dark:text-white">{item.menu.name}</div>
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

            <div className="mt-4 rounded-lg bg-blue-light-50 p-4 dark:bg-blue-light-900/20">
              <div className="flex gap-3">
                <svg className="h-5 w-5 flex-shrink-0 text-blue-light-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-light-800 dark:text-blue-light-200">
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

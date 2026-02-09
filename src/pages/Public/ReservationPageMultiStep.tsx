import React, { useState } from "react";
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
import DatePicker from "../../components/form/date-picker";
import { reservationStorage } from "../../services/localStorage";
import DynamicTableLayout from "../../components/reservation/DynamicTableLayout";
import StepIndicator from "../../components/reservation/StepIndicator";

const ReservationPageMultiStep: React.FC = () => {
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
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState(0);
    const [endTime, setEndTime] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { number: 1, title: "Info Pelanggan" },
        { number: 2, title: "Detail Reservasi" },
        { number: 3, title: "Pilih Meja" },
        { number: 4, title: "Pembayaran" },
    ];

    // Generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour < 22; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
    };

    const calculateDuration = (start: string, end: string): number => {
        if (!start || !end) return 0;
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const durationMinutes = endMinutes - startMinutes;
        return durationMinutes / 60;
    };

    const getAvailableEndTimes = (start: string) => {
        if (!start) return [];
        const [startH, startM] = start.split(':').map(Number);
        const slots = [];
        const closingHour = 22;
        const maxDurationHours = 5;

        for (let minutes = 30; minutes <= maxDurationHours * 60; minutes += 30) {
            const totalMinutes = startH * 60 + startM + minutes;
            const hour = Math.floor(totalMinutes / 60);
            const minute = totalMinutes % 60;

            if (hour < closingHour || (hour === closingHour && minute === 0)) {
                slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
            }
        }

        return slots;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStartTime = e.target.value;
        setStartTime(newStartTime);
        setEndTime("");
        setDuration(0);
        setErrors(prev => ({ ...prev, startTime: "", endTime: "", duration: "" }));
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEndTime = e.target.value;
        setEndTime(newEndTime);
        const newDuration = calculateDuration(startTime, newEndTime);
        setDuration(newDuration);
        setErrors(prev => ({ ...prev, endTime: "", duration: "" }));
    };

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.customer_name.trim()) {
            newErrors.customer_name = "Nama lengkap wajib diisi";
        } else if (formData.customer_name.trim().length < 2) {
            newErrors.customer_name = "Nama minimal 2 karakter";
        }

        if (!formData.customer_email.trim()) {
            newErrors.customer_email = "Email wajib diisi";
        } else {
            const emailValidation = validateEmail(formData.customer_email);
            if (typeof emailValidation === 'string') {
                newErrors.customer_email = emailValidation;
            }
        }

        if (!formData.customer_phone.trim()) {
            newErrors.customer_phone = "Nomor telepon wajib diisi";
        } else {
            const phoneValidation = validatePhone(formData.customer_phone);
            if (typeof phoneValidation === 'string') {
                newErrors.customer_phone = phoneValidation;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.reservation_date) {
            newErrors.reservation_date = "Tanggal reservasi wajib dipilih";
        } else {
            const dateValidation = validateReservationDate(formData.reservation_date);
            if (dateValidation !== true) {
                newErrors.reservation_date = dateValidation;
            }
        }

        if (!startTime) {
            newErrors.startTime = "Jam mulai wajib dipilih";
        }

        if (!endTime) {
            newErrors.endTime = "Jam selesai wajib dipilih";
        }

        if (startTime && endTime && (duration <= 0 || duration > 5)) {
            newErrors.duration = "Durasi harus antara 0.5 - 5 jam";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkTableAvailability = async () => {
        setCheckingAvailability(true);
        setErrors({});

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const requestData = {
                reservation_date: formData.reservation_date,
                reservation_time: startTime,
                duration_hours: duration,
            };

            const response = await fetch(`${apiUrl}/tables/availability-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (data.success && data.data && data.data.tables) {
                const tables = data.data.tables;
                setAvailableTables(tables);

                if (tables.length === 0) {
                    setErrors((prev) => ({
                        ...prev,
                        table: "Tidak ada meja tersedia untuk kriteria yang dipilih"
                    }));
                } else {
                    // Auto proceed to step 3
                    setCurrentStep(3);
                }
            } else {
                setErrors((prev) => ({
                    ...prev,
                    table: data.error || "Gagal memeriksa ketersediaan meja"
                }));
            }
        } catch (error: any) {
            setErrors((prev) => ({
                ...prev,
                table: "Terjadi kesalahan saat memeriksa ketersediaan meja"
            }));
        } finally {
            setCheckingAvailability(false);
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
            if (!file.type.startsWith('image/')) {
                setErrors((prev) => ({ ...prev, payment_proof: "File harus berupa gambar" }));
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, payment_proof: "Ukuran file maksimal 2MB" }));
                return;
            }

            setPaymentProof(file);
            setErrors((prev) => ({ ...prev, payment_proof: "" }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProofPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            if (validateStep1()) {
                setErrors({});
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            if (validateStep2()) {
                await checkTableAvailability();
            }
        } else if (currentStep === 3) {
            if (!selectedTable) {
                setErrors({ table: "Silakan pilih meja terlebih dahulu untuk melanjutkan" });
                return;
            }
            setErrors({});
            setCurrentStep(4);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!paymentProof) {
            setErrors((prev) => ({ ...prev, payment_proof: "Bukti pembayaran wajib diupload" }));
            return;
        }

        if (!selectedTable) {
            setErrors((prev) => ({ ...prev, table: "Pilih meja terlebih dahulu" }));
            return;
        }

        setSubmitting(true);
        setErrors({});

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('customer_name', formData.customer_name);
            formDataToSend.append('customer_email', formData.customer_email);
            formDataToSend.append('customer_phone', formData.customer_phone);
            formDataToSend.append('table_id', selectedTable.id.toString());
            formDataToSend.append('reservation_date', formData.reservation_date);
            formDataToSend.append('reservation_time', startTime);
            formDataToSend.append('duration_hours', duration.toString());
            formDataToSend.append('payment_proof', paymentProof);

            cartItems.forEach((item, index) => {
                formDataToSend.append(`order_items[${index}][menu_id]`, item.menu.id.toString());
                formDataToSend.append(`order_items[${index}][quantity]`, item.quantity.toString());
            });

            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${apiUrl}/reservations`, {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (data.success && data.data) {
                const tableTypeName = selectedTable.table_type?.type_name || "Unknown";

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
                    order_items: cartItems.map(item => ({
                        menu_id: item.menu.id,
                        quantity: item.quantity,
                        menu: item.menu,
                        price: item.menu.price,
                        subtotal: item.menu.price * item.quantity
                    }))
                }));

                // Clear cart after successful reservation
                // clearCart(); // Uncomment if you want to clear cart

                // Redirect to order status page (payment already uploaded)
                navigate(`/order-status/${data.data.booking_code}`);
            } else {
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
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-white sm:text-3xl">Reservasi Meja</h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                        Lengkapi form di bawah untuk melanjutkan reservasi
                    </p>
                </div>

                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} steps={steps} />

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            {/* Step 1: Customer Information */}
                            {currentStep === 1 && (
                                <div>
                                    <CardTitle>Informasi Pelanggan</CardTitle>
                                    <div className="mt-6 space-y-4">
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
                                </div>
                            )}

                            {/* Step 2: Reservation Details */}
                            {currentStep === 2 && (
                                <div>
                                    <CardTitle>Detail Reservasi</CardTitle>
                                    <div className="mt-6 space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tanggal Reservasi <span className="text-error-500">*</span>
                                            </label>
                                            <DatePicker
                                                id="reservation_date"
                                                defaultDate={formData.reservation_date}
                                                onChange={(_selectedDates, dateStr) => {
                                                    setFormData(prev => ({ ...prev, reservation_date: dateStr }));
                                                    if (errors.reservation_date) {
                                                        setErrors(prev => ({ ...prev, reservation_date: "" }));
                                                    }
                                                }}
                                                placeholder="Pilih tanggal reservasi"
                                            />
                                            {errors.reservation_date && (
                                                <p className="mt-1 text-sm text-error-500">{errors.reservation_date}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Jam Mulai <span className="text-error-500">*</span>
                                            </label>
                                            <select
                                                value={startTime}
                                                onChange={handleStartTimeChange}
                                                className={`w-full rounded-lg border ${errors.startTime ? "border-error-500" : "border-gray-200"
                                                    } bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white`}
                                            >
                                                <option value="">Pilih jam mulai</option>
                                                {generateTimeSlots().map(slot => (
                                                    <option key={slot} value={slot}>{slot}</option>
                                                ))}
                                            </select>
                                            {errors.startTime && (
                                                <p className="mt-1 text-sm text-error-500">{errors.startTime}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Jam Selesai <span className="text-error-500">*</span>
                                            </label>
                                            <select
                                                value={endTime}
                                                onChange={handleEndTimeChange}
                                                disabled={!startTime}
                                                className={`w-full rounded-lg border ${errors.endTime ? "border-error-500" : "border-gray-200"
                                                    } bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                <option value="">Pilih jam selesai</option>
                                                {getAvailableEndTimes(startTime).map(slot => (
                                                    <option key={slot} value={slot}>{slot}</option>
                                                ))}
                                            </select>
                                            {errors.endTime && (
                                                <p className="mt-1 text-sm text-error-500">{errors.endTime}</p>
                                            )}
                                        </div>

                                        {duration > 0 && (
                                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    Durasi: <strong>{duration} jam</strong>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Table Selection */}
                            {currentStep === 3 && (
                                <div>
                                    <CardTitle>Pilih Meja</CardTitle>
                                    <div className="mt-6">
                                        {checkingAvailability ? (
                                            <div className="text-center py-8">
                                                <p className="text-gray-600 dark:text-gray-400">Memeriksa ketersediaan meja...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <DynamicTableLayout
                                                    tables={availableTables}
                                                    selectedTableId={selectedTable?.id || null}
                                                    onTableSelect={handleTableSelection}
                                                />

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

                                                {errors.table && (
                                                    <div className="mt-4 rounded-lg bg-error-50 p-3 dark:bg-error-900/20">
                                                        <p className="text-sm text-error-800 dark:text-error-200">{errors.table}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Payment */}
                            {currentStep === 4 && (
                                <div>
                                    <CardTitle>Pembayaran</CardTitle>
                                    <div className="mt-6 space-y-6">
                                        {/* Bank Info */}
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 sm:text-lg">
                                                Informasi Transfer
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-500/10">
                                                    <div className="mb-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">Bank:</div>
                                                    <div className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                                        Bank Central Asia (BCA)
                                                    </div>
                                                </div>

                                                <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-500/10">
                                                    <div className="mb-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">Nomor Rekening:</div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">1234567890</div>
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
                                                    <div className="mb-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">Atas Nama:</div>
                                                    <div className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                                        PT Ruang Dugamasa Indonesia
                                                    </div>
                                                </div>

                                                <div className="rounded-lg bg-warning-50 p-4 dark:bg-warning-900/20">
                                                    <div className="mb-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">Total yang Harus Dibayar:</div>
                                                    <div className="text-2xl font-bold text-warning-600 dark:text-warning-400 sm:text-3xl">
                                                        {formatCurrency(totalPrice)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Instructions */}
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 sm:text-lg">
                                                Instruksi Pembayaran
                                            </h3>
                                            <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">1</div>
                                                    <div>Transfer sejumlah <strong className="text-gray-900 dark:text-white">{formatCurrency(totalPrice)}</strong> ke rekening yang tertera di atas</div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">2</div>
                                                    <div>Setelah transfer, simpan bukti pembayaran dalam format gambar (JPG/PNG/WEBP)</div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">3</div>
                                                    <div>Upload bukti pembayaran melalui form di bawah ini</div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">4</div>
                                                    <div>Tunggu verifikasi dari admin (maksimal 1x24 jam)</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upload */}
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 sm:text-lg">
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
                                                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Format: JPG, PNG, WEBP. Maksimal 2MB
                                                    </p>
                                                    {errors.payment_proof && (
                                                        <p className="mt-1 text-sm text-error-500">{errors.payment_proof}</p>
                                                    )}
                                                </div>

                                                {paymentProofPreview && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                                                        <div className="relative w-full">
                                                            <img
                                                                src={paymentProofPreview}
                                                                alt="Payment proof preview"
                                                                className="w-full max-w-sm rounded-lg border-2 border-gray-200 dark:border-gray-700"
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

                                        {errors.submit && (
                                            <div className="rounded-lg bg-error-50 p-3 dark:bg-error-900/20">
                                                <p className="text-sm text-error-800 dark:text-error-200">{errors.submit}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-6 flex justify-between">
                                {currentStep > 1 && (
                                    <button
                                        onClick={handleBack}
                                        disabled={submitting}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 sm:px-5 sm:py-3"
                                    >
                                        Kembali
                                    </button>
                                )}

                                {currentStep < 4 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={checkingAvailability}
                                        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300 disabled:opacity-50 sm:px-5 sm:py-3 ${currentStep === 1 ? "ml-auto" : ""}`}
                                    >
                                        {checkingAvailability ? "Memeriksa..." : "Lanjut"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="ml-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300 disabled:opacity-50 sm:px-5 sm:py-3"
                                    >
                                        {submitting ? "Memproses..." : "Konfirmasi Reservasi"}
                                    </button>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Order Summary Sidebar */}
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
                                            onClick={() => navigate('/')}
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
                                                <div className="text-base font-bold text-brand-500 sm:text-xl">{formatCurrency(totalPrice)}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
                            <div className="flex gap-3">
                                <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Catatan:</strong> Setelah konfirmasi, reservasi Anda akan diverifikasi oleh admin dalam waktu 1x24 jam.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationPageMultiStep;

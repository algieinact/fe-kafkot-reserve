import { ReservationFormData } from "../types";

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indonesian phone number
 * @param phone - Phone number to validate
 * @returns True if valid, false otherwise
 */
export const validatePhone = (phone: string): boolean => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Indonesian phone numbers: 08xx-xxxx-xxxx (11-13 digits)
  // or 62xxx (country code format)
  if (cleaned.startsWith("08") && cleaned.length >= 11 && cleaned.length <= 13) {
    return true;
  }

  if (cleaned.startsWith("62") && cleaned.length >= 12 && cleaned.length <= 14) {
    return true;
  }

  return false;
};

/**
 * Validate reservation date (must be today or future)
 * @param date - Date string (YYYY-MM-DD)
 * @returns True if valid, error message otherwise
 */
export const validateReservationDate = (date: string): true | string => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(selectedDate.getTime())) {
    return "Tanggal tidak valid";
  }

  if (selectedDate < today) {
    return "Tanggal reservasi tidak boleh di masa lalu";
  }

  // Optional: Limit to max 30 days in advance
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  if (selectedDate > maxDate) {
    return "Reservasi maksimal 30 hari ke depan";
  }

  return true;
};

/**
 * Validate reservation time (must be within operating hours)
 * @param time - Time string (HH:mm)
 * @param date - Date string (YYYY-MM-DD) - optional, for checking if past time today
 * @returns True if valid, error message otherwise
 */
export const validateReservationTime = (time: string, date?: string): true | string => {
  const [hours, minutes] = time.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    return "Waktu tidak valid";
  }

  // Operating hours: 10:00 - 22:00
  if (hours < 10 || hours > 22) {
    return "Jam operasional cafe: 10:00 - 22:00";
  }

  if (hours === 22 && minutes > 0) {
    return "Jam operasional cafe: 10:00 - 22:00";
  }

  // If date is today, check if time is not in the past
  if (date) {
    const selectedDate = new Date(date);
    const today = new Date();

    if (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    ) {
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);

      const now = new Date();
      // Add 2 hours minimum booking time
      now.setHours(now.getHours() + 2);

      if (selectedTime < now) {
        return "Reservasi minimal 2 jam dari sekarang";
      }
    }
  }

  return true;
};

/**
 * Validate number of people for reservation
 * @param numberOfPeople - Number of people
 * @returns True if valid, error message otherwise
 */
export const validateNumberOfPeople = (numberOfPeople: number): true | string => {
  if (numberOfPeople < 1) {
    return "Jumlah orang minimal 1";
  }

  if (numberOfPeople > 20) {
    return "Untuk reservasi lebih dari 20 orang, mohon hubungi cafe langsung";
  }

  return true;
};

/**
 * Validate file upload (image)
 * @param file - File object
 * @returns True if valid, error message otherwise
 */
export const validateImageFile = (file: File): true | string => {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return "Format file harus JPG, PNG, atau WebP";
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return "Ukuran file maksimal 5MB";
  }

  return true;
};

/**
 * Validate payment proof file
 * @param file - File object
 * @returns True if valid, error message otherwise
 */
export const validatePaymentProof = (file: File): true | string => {
  return validateImageFile(file);
};

/**
 * Validate reservation form data
 * @param data - Reservation form data
 * @returns Object with field errors, or null if valid
 */
export const validateReservationForm = (
  data: ReservationFormData
): Record<string, string> | null => {
  const errors: Record<string, string> = {};

  // Validate customer name
  if (!data.customer_name || data.customer_name.trim().length < 2) {
    errors.customer_name = "Nama minimal 2 karakter";
  }

  // Validate email
  if (!data.customer_email) {
    errors.customer_email = "Email wajib diisi";
  } else if (!validateEmail(data.customer_email)) {
    errors.customer_email = "Format email tidak valid";
  }

  // Validate phone
  if (!data.customer_phone) {
    errors.customer_phone = "Nomor telepon wajib diisi";
  } else if (!validatePhone(data.customer_phone)) {
    errors.customer_phone = "Nomor telepon tidak valid";
  }

  // Validate date
  if (!data.reservation_date) {
    errors.reservation_date = "Tanggal reservasi wajib diisi";
  } else {
    const dateValidation = validateReservationDate(data.reservation_date);
    if (dateValidation !== true) {
      errors.reservation_date = dateValidation;
    }
  }

  // Validate time
  if (!data.reservation_time) {
    errors.reservation_time = "Waktu reservasi wajib diisi";
  } else {
    const timeValidation = validateReservationTime(data.reservation_time, data.reservation_date);
    if (timeValidation !== true) {
      errors.reservation_time = timeValidation;
    }
  }

  // Validate number of people
  if (!data.number_of_people) {
    errors.number_of_people = "Jumlah orang wajib diisi";
  } else {
    const peopleValidation = validateNumberOfPeople(data.number_of_people);
    if (peopleValidation !== true) {
      errors.number_of_people = peopleValidation;
    }
  }

  // Validate table type
  if (!data.table_type) {
    errors.table_type = "Tipe meja wajib dipilih";
  }

  // Validate order items
  if (!data.order_items || data.order_items.length === 0) {
    errors.order_items = "Minimal pilih 1 menu";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validate required field
 * @param value - Field value
 * @param fieldName - Field name for error message
 * @returns True if valid, error message otherwise
 */
export const validateRequired = (value: any, fieldName: string): true | string => {
  if (value === null || value === undefined || value === "") {
    return `${fieldName} wajib diisi`;
  }
  return true;
};

/**
 * Validate minimum length
 * @param value - String value
 * @param minLength - Minimum length
 * @param fieldName - Field name for error message
 * @returns True if valid, error message otherwise
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): true | string => {
  if (value.length < minLength) {
    return `${fieldName} minimal ${minLength} karakter`;
  }
  return true;
};

/**
 * Validate maximum length
 * @param value - String value
 * @param maxLength - Maximum length
 * @param fieldName - Field name for error message
 * @returns True if valid, error message otherwise
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): true | string => {
  if (value.length > maxLength) {
    return `${fieldName} maksimal ${maxLength} karakter`;
  }
  return true;
};

/**
 * Validate number range
 * @param value - Number value
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Field name for error message
 * @returns True if valid, error message otherwise
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): true | string => {
  if (value < min || value > max) {
    return `${fieldName} harus antara ${min} dan ${max}`;
  }
  return true;
};

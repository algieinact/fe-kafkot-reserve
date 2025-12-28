/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "Rp 25.000")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to Indonesian locale
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string (e.g., "28 Desember 2025")
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", options).format(dateObj);
};

/**
 * Format date to short format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "28/12/2025")
 */
export const formatDateShort = (date: string | Date): string => {
  return formatDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format time from date
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "19:30")
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dateObj);
};

/**
 * Format datetime to combined date and time
 * @param date - Date string or Date object
 * @returns Formatted datetime string (e.g., "28 Desember 2025, 19:30")
 */
export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)}, ${formatTime(date)}`;
};

/**
 * Format phone number to Indonesian format
 * @param phone - Phone number string
 * @returns Formatted phone number (e.g., "0812-3456-7890")
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format: 0812-3456-7890
  if (cleaned.length === 11 || cleaned.length === 12) {
    return cleaned.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  }

  // Return original if format doesn't match
  return phone;
};

/**
 * Format table type to readable string
 * @param type - Table type enum value
 * @returns Formatted table type (e.g., "Indoor", "Semi Outdoor")
 */
export const formatTableType = (type: string): string => {
  const typeMap: Record<string, string> = {
    indoor: "Indoor",
    semi_outdoor: "Semi Outdoor",
    outdoor: "Outdoor",
  };
  return typeMap[type] || type;
};

/**
 * Format reservation status to readable string
 * @param status - Reservation status enum value
 * @returns Formatted status (e.g., "Menunggu Pembayaran")
 */
export const formatReservationStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending_payment: "Menunggu Pembayaran",
    pending_verification: "Menunggu Verifikasi",
    confirmed: "Dikonfirmasi",
    rejected: "Ditolak",
    cancelled: "Dibatalkan",
    completed: "Selesai",
  };
  return statusMap[status] || status;
};

/**
 * Format payment status to readable string
 * @param status - Payment status enum value
 * @returns Formatted status (e.g., "Menunggu Verifikasi")
 */
export const formatPaymentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "Menunggu Pembayaran",
    waiting_verification: "Menunggu Verifikasi",
    verified: "Terverifikasi",
    rejected: "Ditolak",
  };
  return statusMap[status] || status;
};

/**
 * Format menu category to readable string
 * @param category - Menu category enum value
 * @returns Formatted category (e.g., "Makanan")
 */
export const formatMenuCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    food: "Makanan",
    drink: "Minuman",
    dessert: "Dessert",
  };
  return categoryMap[category] || category;
};

/**
 * Get relative time from date (e.g., "2 hours ago", "in 3 days")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

  // Past
  if (diffInSeconds > 0) {
    if (diffInSeconds < 60) return rtf.format(-diffInSeconds, "second");
    if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
    if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
    if (diffInSeconds < 604800) return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
    if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 604800), "week");
    if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
    return rtf.format(-Math.floor(diffInSeconds / 31536000), "year");
  }

  // Future
  const absDiff = Math.abs(diffInSeconds);
  if (absDiff < 60) return rtf.format(absDiff, "second");
  if (absDiff < 3600) return rtf.format(Math.floor(absDiff / 60), "minute");
  if (absDiff < 86400) return rtf.format(Math.floor(absDiff / 3600), "hour");
  if (absDiff < 604800) return rtf.format(Math.floor(absDiff / 86400), "day");
  if (absDiff < 2592000) return rtf.format(Math.floor(absDiff / 604800), "week");
  if (absDiff < 31536000) return rtf.format(Math.floor(absDiff / 2592000), "month");
  return rtf.format(Math.floor(absDiff / 31536000), "year");
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncating
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Convert file size to readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

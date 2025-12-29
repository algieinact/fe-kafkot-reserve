// LocalStorage service for managing reservation history
export interface ReservationHistory {
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  durationHours: number;
  numberOfPeople: number;
  tableNumber?: string;
  tableType?: string;
  totalAmount: number;
  status: string;
  orderItems: Array<{
    menuName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

const STORAGE_KEY = 'kafkot_reservations';

export const reservationStorage = {
  /**
   * Get all reservations from localStorage
   */
  getAll(): ReservationHistory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  /**
   * Add new reservation to localStorage
   */
  add(reservation: ReservationHistory): void {
    try {
      const reservations = this.getAll();
      // Add to beginning (most recent first)
      reservations.unshift(reservation);
      // Keep only last 50 reservations
      const limited = reservations.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  /**
   * Get reservation by booking code
   */
  getByBookingCode(bookingCode: string): ReservationHistory | null {
    const reservations = this.getAll();
    return reservations.find(r => r.bookingCode === bookingCode) || null;
  },

  /**
   * Update reservation status
   */
  updateStatus(bookingCode: string, status: string): void {
    try {
      const reservations = this.getAll();
      const index = reservations.findIndex(r => r.bookingCode === bookingCode);
      if (index !== -1) {
        reservations[index].status = status;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  },

  /**
   * Clear all reservations
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Get count of reservations
   */
  count(): number {
    return this.getAll().length;
  }
};

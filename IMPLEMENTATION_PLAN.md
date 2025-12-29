# 🎯 Implementation Plan - Kafkot Reserve Features

## ✅ **Tasks Overview**

### **1. Remove Dark Mode (Set Light Mode as Default)**
- [ ] Remove `dark:` classes from all components (or keep but ensure light mode is default)
- [ ] Update tailwind config to disable dark mode
- [ ] Ensure all components render in light mode

### **2. Add Duration Selector to Reservation Page**
**Requirements:**
- Dropdown with 1-5 hours
- Start time dropdown (business hours)
- End time dropdown (auto-calculated based on start + duration, max 5 hours)
- Validation: End time cannot exceed business hours

**Implementation:**
```typescript
// State
const [startTime, setStartTime] = useState("");
const [duration, setDuration] = useState(2);

// Calculate end time
const calculateEndTime = (start: string, hours: number) => {
  const [h, m] = start.split(':').map(Number);
  const endHour = h + hours;
  return `${endHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Validate max duration based on start time
const getMaxDuration = (startTime: string) => {
  const [h] = startTime.split(':').map(Number);
  const closingHour = 22; // 10 PM
  return Math.min(5, closingHour - h);
};
```

### **3. Update Table Availability Check**
**Backend Already Supports:**
- `duration_hours` parameter in `/api/tables/check-availability`
- Conflict detection based on date, time, and duration

**Frontend Update:**
```typescript
const checkAvailability = async () => {
  const response = await tableApi.checkAvailability({
    reservation_date: formData.reservation_date,
    reservation_time: startTime,
    number_of_people: formData.number_of_people,
    duration_hours: duration,
    table_type_id: selectedTableTypeId,
  });
};
```

### **4. Create LocalStorage Service**
**File:** `src/services/localStorage.ts`

```typescript
interface ReservationHistory {
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  durationHours: number;
  numberOfPeople: number;
  tableNumber?: string;
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
  // Get all reservations
  getAll(): ReservationHistory[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Add new reservation
  add(reservation: ReservationHistory): void {
    const reservations = this.getAll();
    reservations.unshift(reservation); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  },

  // Update reservation status (fetch from backend)
  async updateStatus(bookingCode: string): Promise<void> {
    const response = await reservationApi.getByBookingCode(bookingCode);
    if (response.success) {
      const reservations = this.getAll();
      const index = reservations.findIndex(r => r.bookingCode === bookingCode);
      if (index !== -1) {
        reservations[index].status = response.data.status;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
      }
    }
  },

  // Clear all
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
```

### **5. Create History Page**
**File:** `src/pages/Public/HistoryPage.tsx`

**Features:**
- Display all reservations from localStorage
- Show status badges (pending, confirmed, completed, rejected)
- Display menu items ordered
- Refresh status from backend
- Read-only (no actions)

**UI Structure:**
```
┌─────────────────────────────────────┐
│ Riwayat Reservasi                   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ RSV-20251229-ABC123             │ │
│ │ Status: Pending Verification    │ │
│ │ Tanggal: 30 Des 2025, 14:00     │ │
│ │ Durasi: 2 jam                   │ │
│ │ Meja: T-001 (Indoor)            │ │
│ │ Menu:                           │ │
│ │  - Espresso x2                  │ │
│ │  - Croissant x1                 │ │
│ │ Total: Rp 78,000                │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ RSV-20251228-XYZ789             │ │
│ │ Status: Confirmed               │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **6. Add History to Navbar**
**File:** `src/components/layout/Navbar.tsx`

Add menu item:
```typescript
<Link to="/history">
  <svg>...</svg>
  Riwayat
</Link>
```

### **7. Update Reservation Flow**
**File:** `src/pages/Public/ReservationPage.tsx`

After successful reservation creation:
```typescript
const handleSubmit = async () => {
  // ... create reservation
  
  if (response.success) {
    // Save to localStorage
    reservationStorage.add({
      bookingCode: response.data.booking_code,
      customerName: formData.customer_name,
      customerEmail: formData.customer_email,
      customerPhone: formData.customer_phone,
      reservationDate: formData.reservation_date,
      reservationTime: startTime,
      durationHours: duration,
      numberOfPeople: formData.number_of_people,
      totalAmount: response.data.total_amount,
      status: response.data.status,
      orderItems: cartItems.map(item => ({
        menuName: item.menu.menu_name,
        quantity: item.quantity,
        price: item.menu.price,
      })),
      createdAt: new Date().toISOString(),
    });
    
    // Redirect to success page or history
    navigate(`/reservation-success/${response.data.booking_code}`);
  }
};
```

---

## 📝 **Implementation Order**

1. ✅ **Create LocalStorage Service** (foundation)
2. ✅ **Add Duration Selector** to ReservationPage
3. ✅ **Update Table Availability** to include duration
4. ✅ **Update Reservation Creation** to save to localStorage
5. ✅ **Create History Page**
6. ✅ **Add History to Navbar**
7. ✅ **Remove/Disable Dark Mode**

---

## 🎨 **Light Mode Strategy**

**Option 1: Remove all `dark:` classes** (Time-consuming)
**Option 2: Disable dark mode in tailwind.config** (Recommended)

```javascript
// tailwind.config.js
module.exports = {
  darkMode: false, // Disable dark mode
  // ... rest of config
}
```

This will make all `dark:` classes inactive, and only light mode styles will apply.

---

## ⏱️ **Estimated Time**

- LocalStorage Service: 15 min
- Duration Selector: 30 min
- Table Availability Update: 15 min
- Reservation Flow Update: 20 min
- History Page: 45 min
- Navbar Update: 10 min
- Dark Mode Disable: 5 min

**Total: ~2.5 hours**

---

## 🚀 **Ready to Start?**

Confirm and I'll begin implementation in this order:
1. LocalStorage Service
2. Duration Selector + Availability Update
3. History Page
4. Dark Mode Disable

Let me know if you want any changes to the plan!

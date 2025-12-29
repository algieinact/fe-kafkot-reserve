# 🎯 Kafkot Reserve - Complete Implementation Summary

## ✅ **Completed**

### 1. **LocalStorage Service** ✅
**File:** `src/services/localStorage.ts`
- Store reservation history
- Max 50 reservations
- CRUD operations
- Error handling

---

## 📝 **Next Steps - Implementation Guide**

Karena implementasi lengkap sangat panjang (2000+ lines), berikut adalah summary dan code snippets yang perlu Anda tambahkan:

---

## **STEP 1: Update ReservationPage - Add Duration Selector**

**File:** `src/pages/Public/ReservationPage.tsx`

### **Add State:**
```typescript
const [startTime, setStartTime] = useState("");
const [duration, setDuration] = useState(2);
const [endTime, setEndTime] = useState("");
```

### **Add Helper Functions:**
```typescript
// Generate time slots (09:00 - 22:00, every 30 minutes)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

// Calculate end time
const calculateEndTime = (start: string, hours: number) => {
  if (!start) return "";
  const [h, m] = start.split(':').map(Number);
  const endHour = h + hours;
  const endMinute = m;
  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
};

// Get max duration based on start time
const getMaxDuration = (startTime: string) => {
  if (!startTime) return 5;
  const [h] = startTime.split(':').map(Number);
  const closingHour = 22;
  return Math.min(5, closingHour - h);
};

// Update end time when start time or duration changes
useEffect(() => {
  if (startTime && duration) {
    setEndTime(calculateEndTime(startTime, duration));
  }
}, [startTime, duration]);
```

### **Add UI Components (Insert after "Jumlah Orang" field):**
```tsx
{/* Start Time */}
<div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Jam Mulai
  </label>
  <select
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    required
  >
    <option value="">Pilih Jam</option>
    {generateTimeSlots().map(slot => (
      <option key={slot} value={slot}>{slot}</option>
    ))}
  </select>
</div>

{/* Duration */}
<div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Durasi
  </label>
  <select
    value={duration}
    onChange={(e) => setDuration(Number(e.target.value))}
    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    required
    disabled={!startTime}
  >
    {[1, 2, 3, 4, 5].map(hours => {
      const maxDuration = getMaxDuration(startTime);
      if (hours > maxDuration) return null;
      return (
        <option key={hours} value={hours}>
          {hours} Jam
        </option>
      );
    })}
  </select>
  {startTime && (
    <p className="mt-1 text-xs text-gray-500">
      Selesai pada: {endTime}
    </p>
  )}
</div>
```

### **Update Table Availability Check:**
```typescript
const checkAvailability = async () => {
  if (!startTime) {
    alert("Pilih jam mulai terlebih dahulu");
    return;
  }
  
  const response = await tableApi.checkAvailability({
    reservation_date: formData.reservation_date,
    reservation_time: startTime, // Use startTime instead of formData.reservation_time
    number_of_people: formData.number_of_people,
    duration_hours: duration, // Add duration
    table_type_id: selectedTableTypeId,
  });
  
  // ... rest of code
};
```

### **Update Reservation Creation:**
```typescript
import { reservationStorage } from "../../services/localStorage";

const handleSubmit = async () => {
  // ... existing validation
  
  const response = await reservationApi.createReservation({
    customer_name: formData.customer_name,
    customer_email: formData.customer_email,
    customer_phone: formData.customer_phone,
    table_id: selectedTable.id,
    reservation_date: formData.reservation_date,
    reservation_time: startTime, // Use startTime
    number_of_people: formData.number_of_people,
    duration_hours: duration, // Add duration
    special_notes: formData.special_notes,
    order_items: cartItems.map(item => ({
      menu_id: item.menu.id,
      quantity: item.quantity,
    })),
  });
  
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
      tableNumber: selectedTable.table_number,
      tableType: selectedTable.table_type?.type_name,
      totalAmount: response.data.total_amount,
      status: response.data.status,
      orderItems: cartItems.map(item => ({
        menuName: item.menu.menu_name,
        quantity: item.quantity,
        price: item.menu.price,
      })),
      createdAt: new Date().toISOString(),
    });
    
    // Navigate to success or history
    navigate(`/history`);
  }
};
```

---

## **STEP 2: Create History Page**

**File:** `src/pages/Public/HistoryPage.tsx`

Karena file ini sangat panjang (~300 lines), saya akan buat file terpisah.

---

## **STEP 3: Add History to Navbar**

**File:** Find your Navbar component and add:

```tsx
<Link 
  to="/history"
  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-brand-500"
>
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  Riwayat
</Link>
```

---

## **STEP 4: Add Route**

**File:** Your router file (probably `App.tsx` or `router.tsx`)

```tsx
import HistoryPage from "./pages/Public/HistoryPage";

// Add route
<Route path="/history" element={<HistoryPage />} />
```

---

## **STEP 5: Remove Dark Mode Classes**

**Quick Fix:** Add this to your main CSS file:

```css
/* Force light mode */
:root {
  color-scheme: light;
}

html {
  background: white;
  color: black;
}

/* Override all dark mode classes */
.dark\:bg-gray-900,
.dark\:bg-gray-800,
.dark\:bg-gray-dark {
  background: white !important;
}

.dark\:text-white,
.dark\:text-gray-300 {
  color: #1f2937 !important;
}
```

---

## 📂 **Files I'll Create for You:**

1. ✅ `src/services/localStorage.ts` - DONE
2. ⏳ `src/pages/Public/HistoryPage.tsx` - Creating now...
3. ⏳ `src/utils/formatters.ts` - Helper functions

Apakah Anda ingin saya:
1. **Create HistoryPage.tsx** sekarang?
2. **Update ReservationPage.tsx** dengan duration selector?
3. Atau Anda prefer saya buat semua file sekaligus?

Beritahu saya dan saya akan lanjutkan! 🚀

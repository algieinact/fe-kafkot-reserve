# 🎯 FINAL IMPLEMENTATION STEPS

## ✅ Already Completed:
1. ✅ LocalStorage Service (`src/services/localStorage.ts`)
2. ✅ History Page (`src/pages/Public/HistoryPage.tsx`)

---

## 📝 TODO: Update ReservationPage.tsx

### **Step 1: Add Imports**
At the top of `ReservationPage.tsx`, add:
```typescript
import { reservationStorage } from "../../services/localStorage";
```

### **Step 2: Add State Variables**
After existing state declarations (around line 20-30), add:
```typescript
const [startTime, setStartTime] = useState("");
const [duration, setDuration] = useState(2);
const [endTime, setEndTime] = useState("");
```

### **Step 3: Add Helper Functions**
After state declarations, before `handleInputChange`, add:
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

### **Step 4: Update checkTableAvailability Function**
Find the `checkTableAvailability` function and update it:
```typescript
const checkTableAvailability = async () => {
  if (!validateForm()) return;
  
  if (!startTime) {
    alert("Pilih jam mulai terlebih dahulu");
    return;
  }

  setCheckingAvailability(true);
  setAvailabilityError("");

  try {
    const response = await tableApi.checkAvailability({
      reservation_date: formData.reservation_date,
      reservation_time: startTime, // Changed from formData.reservation_time
      number_of_people: formData.number_of_people,
      duration_hours: duration, // Added
      table_type_id: selectedTableType === TableType.INDOOR ? 1 : 
                     selectedTableType === TableType.SEMI_OUTDOOR ? 2 : 3,
    });

    if (response.success && response.data) {
      setAvailableTables(response.data);
    } else {
      setAvailabilityError(response.error || "Tidak ada meja tersedia");
    }
  } catch (error) {
    setAvailabilityError("Gagal memeriksa ketersediaan meja");
  } finally {
    setCheckingAvailability(false);
  }
};
```

### **Step 5: Update handleSubmit Function**
Find the `handleSubmit` function and update it:
```typescript
const handleSubmit = async () => {
  if (!selectedTable) {
    alert("Pilih meja terlebih dahulu");
    return;
  }

  setSubmitting(true);

  try {
    const response = await reservationApi.createReservation({
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      table_id: selectedTable.id,
      reservation_date: formData.reservation_date,
      reservation_time: startTime, // Changed from formData.reservation_time
      number_of_people: formData.number_of_people,
      duration_hours: duration, // Added
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

      // Clear cart
      cartItems.forEach(item => removeItem(item.menu.id));
      
      // Navigate to history
      navigate("/history");
    } else {
      alert(response.error || "Gagal membuat reservasi");
    }
  } catch (error) {
    alert("Gagal membuat reservasi");
  } finally {
    setSubmitting(false);
  }
};
```

### **Step 6: Add Duration UI**
Find the section with "Jumlah Orang" input field (around line 250-280).
After that field, add these two new fields:

```tsx
{/* Start Time */}
<div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Jam Mulai <span className="text-red-500">*</span>
  </label>
  <select
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    required
  >
    <option value="">Pilih Jam Mulai</option>
    {generateTimeSlots().map(slot => (
      <option key={slot} value={slot}>{slot}</option>
    ))}
  </select>
  <p className="mt-1 text-xs text-gray-500">
    Cafe buka: 09:00 - 22:00
  </p>
</div>

{/* Duration */}
<div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Durasi <span className="text-red-500">*</span>
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
  {startTime && endTime && (
    <p className="mt-1 text-xs text-gray-500">
      Reservasi selesai pada: <span className="font-semibold">{endTime}</span>
    </p>
  )}
  {!startTime && (
    <p className="mt-1 text-xs text-gray-500">
      Pilih jam mulai terlebih dahulu
    </p>
  )}
</div>
```

---

## 📝 TODO: Add Route for History Page

### **File:** `src/App.tsx` or your router file

Find where routes are defined and add:
```typescript
import HistoryPage from "./pages/Public/HistoryPage";

// In your routes:
<Route path="/history" element={<HistoryPage />} />
```

---

## 📝 TODO: Update Navbar

### **File:** Find your Navbar component (probably in `src/components/layout/`)

Add this menu item:
```tsx
<Link 
  to="/history"
  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-brand-500 transition"
>
  <svg 
    className="h-5 w-5" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
  Riwayat
</Link>
```

---

## 📝 TODO: Disable Dark Mode

### **Option 1: Add to main CSS file** (`src/index.css`)

Add at the top:
```css
/* Force light mode */
:root {
  color-scheme: light only;
}

html {
  background: white;
  color: #1f2937;
}

/* Override dark mode classes */
.dark\:bg-gray-900,
.dark\:bg-gray-800,
.dark\:bg-gray-dark {
  background: white !important;
}

.dark\:bg-white\/\[0\.03\] {
  background: white !important;
}

.dark\:text-white,
.dark\:text-gray-300,
.dark\:text-gray-400 {
  color: #1f2937 !important;
}

.dark\:border-gray-800,
.dark\:border-gray-700 {
  border-color: #e5e7eb !important;
}
```

### **Option 2: Remove dark: classes globally** (if you have time)

Use Find & Replace in your editor:
- Find: `dark:[a-zA-Z0-9-_\/\[\]\.]+`
- Replace: (empty)
- Files: `*.tsx`, `*.ts`

---

## ✅ Testing Checklist

After implementation:

1. **Menu Page:**
   - [ ] Menu cards display correctly
   - [ ] Filter by category works
   - [ ] Search works
   - [ ] Add to cart works

2. **Reservation Page:**
   - [ ] Duration selector appears
   - [ ] Start time dropdown shows 09:00-22:00
   - [ ] Duration limited based on start time
   - [ ] End time calculated correctly
   - [ ] Table availability check includes duration
   - [ ] Reservation creation includes duration
   - [ ] Saves to localStorage after creation
   - [ ] Redirects to history page

3. **History Page:**
   - [ ] Shows all reservations from localStorage
   - [ ] Status badges display correctly
   - [ ] Refresh status button works
   - [ ] Menu items display correctly
   - [ ] Empty state shows when no reservations

4. **Navbar:**
   - [ ] "Riwayat" menu item visible
   - [ ] Links to /history

5. **Light Mode:**
   - [ ] No dark backgrounds
   - [ ] All text readable
   - [ ] No dark mode artifacts

---

## 🚀 Quick Implementation Order

1. ✅ Add route for History page (5 min)
2. ✅ Update Navbar (5 min)
3. ✅ Add CSS for light mode (5 min)
4. ✅ Update ReservationPage.tsx (30 min)
5. ✅ Test everything (15 min)

**Total: ~1 hour**

---

## 📞 Need Help?

If you encounter any errors:
1. Check console for error messages
2. Verify all imports are correct
3. Make sure types match (especially for duration_hours)
4. Test API endpoints in Network tab

Good luck! 🎉

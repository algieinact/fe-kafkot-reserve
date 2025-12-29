# 🎨 Kafkot Reserve - Frontend Integration Guide

## ✅ Perubahan yang Sudah Diimplementasikan

### 📋 **Type Updates**

#### 1. **Menu Interface**
```typescript
// BEFORE
interface Menu {
  name: string;
  // ...
}

// AFTER
interface Menu {
  menu_name: string;  // ✅ Changed to match backend
  // ...
}
```

#### 2. **Table Interface**
```typescript
// AFTER
interface Table {
  id: string;
  table_number: string;
  table_type_id: string;
  capacity: number;
  status: string;
  table_type?: {
    id: string;
    type_name: string;
    description?: string;
  };
  created_at: string;
  updated_at: string;
}
```

#### 3. **Reservation Interface**
```typescript
// AFTER
interface Reservation {
  id: string;
  booking_code: string;
  // Customer Info
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Reservation Details
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  duration_hours: number;  // ✅ NEW FIELD
  special_notes?: string;  // ✅ Changed from 'notes'
  
  // Table Assignment
  table_id?: string;
  table?: Table;
  
  // Order
  reservation_items?: OrderItem[];
  total_amount: number;
  
  // Payment
  payment?: {
    id: string;
    payment_proof_url?: string;
    payment_status: string;
    verified_at?: string;
  };
  
  // Status
  status: ReservationStatus;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}
```

#### 4. **Form Data Interfaces**
```typescript
interface ReservationFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  duration_hours: number;  // ✅ NEW FIELD
  table_id: string;
  special_notes?: string;
  order_items: {
    menu_id: string;
    quantity: number;
  }[];
}

interface TableAvailabilityRequest {
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  duration_hours: number;  // ✅ NEW FIELD
  table_type_id: string;
}
```

---

## 🔌 **API Service Updates**

### **Updated Endpoints**

All admin endpoints now use `/api/admin/*` prefix:

```typescript
// Menu API
menuApi.createMenu()   // → /api/admin/menus
menuApi.updateMenu()   // → /api/admin/menus/{id}
menuApi.deleteMenu()   // → /api/admin/menus/{id}

// Table API
tableApi.createTable() // → /api/admin/tables
tableApi.updateTable() // → /api/admin/tables/{id}
tableApi.deleteTable() // → /api/admin/tables/{id}

// Reservation API (Admin)
reservationApi.getReservations()     // → /api/admin/reservations
reservationApi.verifyPayment()       // → /api/admin/reservations/{id}/verify
reservationApi.rejectPayment()       // → /api/admin/reservations/{id}/reject
reservationApi.completeReservation() // → /api/admin/reservations/{id}/complete
reservationApi.cancelReservation()   // → /api/admin/reservations/{id} (DELETE)

// Dashboard API
dashboardApi.getStats() // → /api/admin/dashboard/stats
```

### **New Methods**

```typescript
// Separate verify and reject methods
reservationApi.verifyPayment(reservationId, {})
reservationApi.rejectPayment(reservationId, { rejection_reason: "..." })
reservationApi.completeReservation(reservationId)
```

---

## 📝 **Component Updates Required**

### 1. **Add Duration Selector to Reservation Form**

You need to add a duration selector in your reservation form:

```typescript
// Example implementation
const [durationHours, setDurationHours] = useState(2);

<div>
  <label>Durasi Reservasi</label>
  <select 
    value={durationHours}
    onChange={(e) => setDurationHours(Number(e.target.value))}
  >
    <option value={1}>1 Jam</option>
    <option value={2}>2 Jam</option>
    <option value={3}>3 Jam</option>
    <option value={4}>4 Jam</option>
    <option value={5}>5 Jam</option>
    <option value={6}>6 Jam</option>
    <option value={7}>7 Jam</option>
    <option value={8}>8 Jam</option>
  </select>
</div>
```

### 2. **Update Table Availability Check**

```typescript
// Include duration_hours in availability check
const checkAvailability = async () => {
  const response = await tableApi.checkAvailability({
    reservation_date: formData.reservation_date,
    reservation_time: formData.reservation_time,
    number_of_people: formData.number_of_people,
    duration_hours: formData.duration_hours,  // ✅ NEW
    table_type_id: selectedTableTypeId,
  });
  
  if (response.success) {
    setAvailableTables(response.data);
  }
};
```

### 3. **Update Reservation Creation**

```typescript
// Include duration_hours in reservation data
const createReservation = async () => {
  const response = await reservationApi.createReservation({
    customer_name: formData.customer_name,
    customer_email: formData.customer_email,
    customer_phone: formData.customer_phone,
    table_id: selectedTable.id,
    reservation_date: formData.reservation_date,
    reservation_time: formData.reservation_time,
    number_of_people: formData.number_of_people,
    duration_hours: formData.duration_hours,  // ✅ NEW
    special_notes: formData.special_notes,
    order_items: cartItems.map(item => ({
      menu_id: item.menu.id,
      quantity: item.quantity,
    })),
  });
};
```

---

## 🎯 **Files That Were Updated**

### Types:
- ✅ `src/types/index.ts` - Updated all interfaces

### Services:
- ✅ `src/services/api.ts` - Updated all API endpoints

### Components:
- ✅ `src/pages/Public/MenuPage.tsx` - Changed `menu.name` → `menu.menu_name`
- ✅ `src/pages/Public/ReservationPage.tsx` - Changed `menu.name` → `menu.menu_name`

### Data:
- ✅ `src/data/mockData.ts` - Changed `name:` → `menu_name:`

---

## 🚧 **TODO: Components to Update**

### 1. **ReservationPage.tsx**
Add duration selector to the reservation form:
- [ ] Add state for `duration_hours`
- [ ] Add duration selector UI
- [ ] Include `duration_hours` in availability check
- [ ] Include `duration_hours` in reservation creation

### 2. **Admin Dashboard** (If exists)
- [ ] Update menu management to use `menu_name`
- [ ] Update table management to use new table structure
- [ ] Update reservation management to use new endpoints

### 3. **Order Status Page** (If exists)
- [ ] Display `duration_hours` in reservation details
- [ ] Display `special_notes` (not `notes`)
- [ ] Display `rejection_reason` if status is rejected

---

## 🔄 **Migration Checklist**

### Step 1: Update Environment
```bash
# In fe-kafkot-reserve/.env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 2: Clear Cache & Restart
```bash
# Stop dev server (Ctrl+C)
npm run dev
```

### Step 3: Test Integration
- [ ] Test menu browsing
- [ ] Test table availability with duration
- [ ] Test reservation creation
- [ ] Test payment upload
- [ ] Test admin login
- [ ] Test admin CRUD operations

---

## 📊 **Response Format Examples**

### Menu Response:
```json
{
  "id": "1",
  "menu_name": "Espresso",  // ✅ Note: menu_name, not name
  "category": "drink",
  "description": "...",
  "price": 25000,
  "image_url": "storage/menu-images/...",
  "is_available": true
}
```

### Table Response:
```json
{
  "id": "1",
  "table_number": "T-001",
  "table_type_id": "1",
  "capacity": 4,
  "status": "available",
  "table_type": {
    "id": "1",
    "type_name": "Indoor",
    "description": "Indoor seating area"
  }
}
```

### Reservation Response:
```json
{
  "id": "1",
  "booking_code": "RSV-20251229-ABC123",
  "customer_name": "John Doe",
  "duration_hours": 2,  // ✅ NEW
  "special_notes": "Window seat please",  // ✅ Not 'notes'
  "status": "pending_verification",
  "payment": {
    "id": "1",
    "payment_proof_url": "storage/payment-proofs/...",
    "payment_status": "unpaid"
  }
}
```

---

## ⚠️ **Breaking Changes**

### 1. Menu Field Name
```typescript
// OLD
menu.name

// NEW
menu.menu_name
```

### 2. Reservation Notes Field
```typescript
// OLD
reservation.notes

// NEW
reservation.special_notes
```

### 3. Table Structure
```typescript
// OLD
table.type  // String enum
table.is_available  // Boolean

// NEW
table.table_type_id  // Foreign key
table.status  // String: 'available', 'reserved', 'inactive'
table.table_type  // Nested object
```

---

## 🎨 **UI Recommendations**

### Duration Selector Design:
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">
    Durasi Reservasi
  </label>
  <div className="grid grid-cols-4 gap-2">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
      <button
        key={hours}
        onClick={() => setDuration(hours)}
        className={`
          px-4 py-2 rounded-lg border-2 transition
          ${duration === hours 
            ? 'border-brand-500 bg-brand-50 text-brand-700' 
            : 'border-gray-200 hover:border-brand-300'
          }
        `}
      >
        {hours} Jam
      </button>
    ))}
  </div>
  <p className="text-xs text-gray-500">
    Reservasi Anda akan berlaku dari {formData.reservation_time} 
    hingga {calculateEndTime(formData.reservation_time, duration)}
  </p>
</div>
```

---

## ✅ **Verification Steps**

After implementing changes:

1. **Check Types**
   ```bash
   npm run type-check  # If you have this script
   ```

2. **Test API Calls**
   - Open browser DevTools → Network tab
   - Verify request/response formats
   - Check for 404 or 500 errors

3. **Test User Flow**
   - Browse menu → Add to cart → Reserve → Upload payment
   - Verify all data is saved correctly

4. **Test Admin Flow**
   - Login → Manage menus → Manage tables → Verify payments

---

## 📞 **Troubleshooting**

### Issue: "menu_name is undefined"
**Solution:** Make sure mockData.ts has been updated (all `name:` → `menu_name:`)

### Issue: "duration_hours is required"
**Solution:** Add duration selector to reservation form and include in API call

### Issue: "404 Not Found on /api/admin/*"
**Solution:** Make sure backend routes are updated and server is running

### Issue: "CORS Error"
**Solution:** Check backend CORS configuration in `config/cors.php`

---

## 🎯 **Next Steps**

1. ✅ Types updated
2. ✅ API service updated
3. ✅ Mock data updated
4. ✅ Existing components updated
5. ⏳ **TODO:** Add duration selector to ReservationPage
6. ⏳ **TODO:** Test complete user flow
7. ⏳ **TODO:** Test admin flow

---

Good luck with the integration! 🚀

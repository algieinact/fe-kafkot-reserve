# 🎨 Admin Pages Styling - Correct Reference (ArrivalManage)

## ✅ Correct Pattern from AMS

### **Reference:** `ams/fe-ams/src/pages/MainPage/ArrivalManage.tsx`

This is the CORRECT reference for CRUD pages, not ArrivalSchedule!

---

## 📋 Key Components Used in ArrivalManage

### 1. **Imports**
```tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Edit, Trash2 } from "lucide-react"; // Icons
import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DataTableOne from "../../components/tables/DataTables/TableOne/DataTableOne";
import { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import { SkeletonArrivalManage } from "../../components/ui/skeleton/Skeleton";
import { useToast } from "../../hooks/useToast";
import apiService from "../../services/api";
import ConfirmationPopup from "../../components/popups/ConfirmationPopup";
```

### 2. **Page Structure**
```tsx
<>
  <PageMeta title="..." description="..." />
  <PageBreadcrumb pageTitle="..." />
  
  <div className="space-y-5 sm:space-y-6">
    {loading ? (
      <SkeletonArrivalManage />
    ) : (
      <DataTableOne
        title="..."
        data={data}
        columns={columns}
        defaultItemsPerPage={10}
        itemsPerPageOptions={[5, 10, 15, 20]}
        defaultSortKey="id"
        defaultSortOrder="asc"
        searchable={true}
        searchPlaceholder="..."
        actionButton={<Button>Add New</Button>}
      />
    )}
  </div>
  
  <ConfirmationPopup ... />
</>
```

---

## 🎯 Key Differences from Current Implementation

### **Current (Kafkot):**
- ❌ Using basic HTML `<table>`
- ❌ Manual pagination logic
- ❌ No search functionality
- ❌ Custom modal for forms
- ❌ Text links for actions

### **Should Be (Like ArrivalManage):**
- ✅ Using `DataTableOne` component
- ✅ Built-in pagination
- ✅ Built-in search
- ✅ Separate page for add/edit forms
- ✅ Icon buttons for actions
- ✅ `ConfirmationPopup` for delete

---

## 📊 Column Configuration Pattern

```tsx
const columns: ColumnConfig[] = useMemo(() => [
  {
    key: "id",
    label: "ID",
    sortable: true,
  },
  {
    key: "customer_name",
    label: "Customer",
    sortable: true,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
        {value}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    render: (_value, row) => (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleEdit(row.id)}
          className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDeleteTarget(row)}
          className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
], []);
```

---

## 🎨 Action Button Styling (Correct Pattern)

### **Icon Buttons (Small, Minimal):**
```tsx
// Edit Button
<button
  className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
  title="Edit"
>
  <Edit className="w-4 h-4" />
</button>

// Delete Button
<button
  className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
  title="Delete"
>
  <Trash2 className="w-4 h-4" />
</button>
```

### **Add New Button (Primary):**
```tsx
<Button
  variant="primary"
  size="sm"
  onClick={handleAddNew}
>
  <Plus className="w-4 h-4" />
  Add New
</Button>
```

---

## 🔄 Recommended Changes for Kafkot Admin Pages

### **1. ManageReservation.tsx**

**Current Structure:**
```tsx
// Using HTML table
<table className="w-full">
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

**Should Be:**
```tsx
// Using DataTableOne
<DataTableOne
  title="Daftar Reservasi"
  data={reservations}
  columns={columns}
  defaultItemsPerPage={10}
  itemsPerPageOptions={[5, 10, 15, 20]}
  defaultSortKey="reservation_date"
  defaultSortOrder="desc"
  searchable={true}
  searchPlaceholder="Cari reservasi..."
  actionButton={
    <Button variant="primary" size="sm" onClick={() => navigate('/admin/reservations/add')}>
      <Plus className="w-4 h-4" />
      Tambah Reservasi
    </Button>
  }
/>
```

### **2. ManageMenu.tsx**

**Current Structure:**
```tsx
// Modal for add/edit
{showModal && (
  <div className="fixed inset-0">
    <form>...</form>
  </div>
)}
```

**Should Be:**
```tsx
// Separate page for add/edit
// Navigate to /admin/menu/add or /admin/menu/edit/:id
// Use ConfirmationPopup for delete only
<ConfirmationPopup
  isOpen={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={handleDelete}
  title="Hapus Menu"
  message={`Hapus menu ${deleteTarget?.menu_name}?`}
  variant="danger"
/>
```

---

## 📦 Required Components

### **1. DataTableOne**
Already exists in Kafkot project (copied from AMS template)

**Location:** `src/components/tables/DataTables/TableOne/DataTableOne.tsx`

**Features:**
- ✅ Pagination
- ✅ Sorting
- ✅ Search
- ✅ Responsive
- ✅ Dark mode
- ✅ Action button slot

### **2. ConfirmationPopup**
Need to check if exists, if not, create it

**Props:**
```tsx
interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}
```

### **3. Icons (lucide-react)**
```bash
npm install lucide-react
```

**Common Icons:**
- `Plus` - Add new
- `Edit` - Edit action
- `Trash2` - Delete action
- `Eye` - View details
- `X` - Close

---

## 🎯 Implementation Steps

### **Step 1: Check DataTableOne Component**
```bash
# Check if component exists
ls src/components/tables/DataTables/TableOne/
```

### **Step 2: Install Icons**
```bash
npm install lucide-react
```

### **Step 3: Update ManageReservation.tsx**
1. Import DataTableOne and icons
2. Define columns with useMemo
3. Replace HTML table with DataTableOne
4. Update action buttons to use icons
5. Add ConfirmationPopup for delete

### **Step 4: Update ManageMenu.tsx**
1. Same as above
2. Consider moving add/edit to separate page (optional)

### **Step 5: Create/Update ConfirmationPopup**
If doesn't exist, create based on AMS pattern

---

## 📝 Example: ManageReservation with DataTableOne

```tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react";
import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationPopup from "../../components/popups/ConfirmationPopup";

export default function ManageReservation() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyTarget, setVerifyTarget] = useState(null);

  const columns: ColumnConfig[] = useMemo(() => [
    {
      key: "booking_code",
      label: "Booking Code",
      sortable: true,
    },
    {
      key: "customer_name",
      label: "Customer",
      sortable: true,
    },
    {
      key: "reservation_date",
      label: "Date",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(value)}`}>
          {getStatusText(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_value, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/admin/reservations/${row.id}`)}
            className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'pending_verification' && (
            <>
              <button
                onClick={() => handleVerify(row.id)}
                className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Verify"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRejectTarget(row)}
                className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Kelola Reservasi | Kafkot Reserve" />
      <PageBreadcrumb pageTitle="Kelola Reservasi" />
      
      <div className="space-y-5 sm:space-y-6">
        {loading ? (
          <SkeletonTable />
        ) : (
          <DataTableOne
            title="Daftar Reservasi"
            data={reservations}
            columns={columns}
            defaultItemsPerPage={10}
            itemsPerPageOptions={[5, 10, 15, 20]}
            defaultSortKey="reservation_date"
            defaultSortOrder="desc"
            searchable={true}
            searchPlaceholder="Cari reservasi..."
          />
        )}
      </div>
      
      <ConfirmationPopup
        isOpen={!!verifyTarget}
        onClose={() => setVerifyTarget(null)}
        onConfirm={handleVerifyConfirm}
        title="Verifikasi Pembayaran"
        message="Konfirmasi pembayaran untuk reservasi ini?"
        variant="info"
      />
    </>
  );
}
```

---

## ✅ Benefits of This Approach

1. **Consistency** - Matches AMS pattern exactly
2. **Less Code** - DataTableOne handles pagination, sorting, search
3. **Better UX** - Professional table with all features
4. **Maintainable** - Easier to update and debug
5. **Reusable** - Same pattern for all CRUD pages

---

## 🎨 Color Reference (From ArrivalManage)

```tsx
// Status Badge Colors
const statusColors = {
  regular: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  additional: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  // For Kafkot:
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

// Action Button Hover Colors
const actionColors = {
  view: "hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  edit: "hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  delete: "hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
  verify: "hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
};
```

---

**Last Updated:** 2026-01-05 13:25
**Reference:** ArrivalManage.tsx (CORRECT CRUD pattern)
**Status:** Ready for implementation

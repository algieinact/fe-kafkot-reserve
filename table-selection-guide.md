# Panduan Membuat Sistem Table Selector untuk Cafe/Restaurant

Dokumentasi lengkap untuk membangun sistem pemilihan meja yang fleksibel dan customizable menggunakan React.

---

## Daftar Isi

1. [Konsep Dasar](#konsep-dasar)
2. [Struktur Data](#struktur-data)
3. [Implementasi Step-by-Step](#implementasi-step-by-step)
4. [Kustomisasi Layout](#kustomisasi-layout)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Konsep Dasar

### Perbedaan dengan Layout Bioskop

| Aspek | Bioskop | Cafe/Restaurant |
|-------|---------|-----------------|
| **Layout** | Grid teratur | Custom positioning |
| **Ukuran** | Seragam | Bervariasi |
| **Kapasitas** | 1 orang/kursi | Berbeda per meja |
| **Tipe** | Sama semua | Bulat, persegi, dll |

### Komponen Utama

Sistem table selector terdiri dari 3 komponen utama:

1. **Data Model** - Struktur data meja
2. **State Management** - Pengelolaan status pilihan
3. **Visual Layout** - Tampilan posisi meja

---

## Struktur Data

### 1. Model Data Meja

Setiap meja memiliki properti berikut:

```javascript
{
  id: 1,                    // Identifier unik
  x: 50,                    // Posisi horizontal (px)
  y: 50,                    // Posisi vertikal (px)
  width: 80,                // Lebar meja (px)
  height: 80,               // Tinggi meja (px)
  capacity: 2,              // Kapasitas orang
  status: 'available',      // Status: available/occupied
  type: 'round'             // Bentuk: round/square/rectangle
}
```

### 2. Contoh Array Meja

```javascript
const [tables] = useState([
  // Meja bulat 2 orang
  { 
    id: 1, 
    x: 50, 
    y: 50, 
    width: 80, 
    height: 80, 
    capacity: 2, 
    status: 'available', 
    type: 'round' 
  },
  
  // Meja persegi panjang 4 orang
  { 
    id: 2, 
    x: 180, 
    y: 50, 
    width: 100, 
    height: 60, 
    capacity: 4, 
    status: 'occupied', 
    type: 'rectangle' 
  },
  
  // Meja besar 8 orang
  { 
    id: 3, 
    x: 330, 
    y: 320, 
    width: 150, 
    height: 80, 
    capacity: 8, 
    status: 'available', 
    type: 'rectangle' 
  }
]);
```

---

## Implementasi Step-by-Step

### Step 1: Setup State

```javascript
import { useState } from 'react';

export default function TableReservation() {
  // State untuk menyimpan data meja
  const [tables] = useState([/* data meja */]);
  
  // State untuk menyimpan meja yang dipilih
  const [selectedTables, setSelectedTables] = useState([]);
  
  // ... rest of component
}
```

**Penjelasan:**
- `tables`: Array yang menyimpan semua data meja (tidak berubah)
- `selectedTables`: Array berisi ID meja yang dipilih user

### Step 2: Fungsi Toggle Selection

```javascript
const toggleTable = (tableId) => {
  // Cari data meja berdasarkan ID
  const table = tables.find(t => t.id === tableId);
  
  // Jika meja sudah terisi, tidak bisa dipilih
  if (table.status === 'occupied') return;

  // Toggle: tambah atau hapus dari selectedTables
  setSelectedTables(prev => 
    prev.includes(tableId) 
      ? prev.filter(id => id !== tableId)  // Hapus jika sudah ada
      : [...prev, tableId]                 // Tambah jika belum ada
  );
};
```

### Step 3: Fungsi Helper Status

```javascript
// Menentukan status visual meja
const getTableStatus = (table) => {
  if (table.status === 'occupied') return 'occupied';
  if (selectedTables.includes(table.id)) return 'selected';
  return 'available';
};

// Menentukan warna berdasarkan status
const getTableColor = (status) => {
  switch(status) {
    case 'available': 
      return 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200';
    case 'selected': 
      return 'bg-blue-500 border-blue-600';
    case 'occupied': 
      return 'bg-red-200 border-red-400';
    default: 
      return 'bg-gray-100';
  }
};

// Menentukan border radius berdasarkan tipe
const getBorderRadius = (type) => {
  switch(type) {
    case 'round': return 'rounded-full';
    case 'square': return 'rounded-lg';
    case 'rectangle': return 'rounded-lg';
    default: return 'rounded-lg';
  }
};
```

### Step 4: Render Meja dengan Positioning

```javascript
<div className="relative bg-stone-100 rounded-xl p-4" 
     style={{ height: '500px' }}>
  {tables.map((table) => {
    const status = getTableStatus(table);
    const isClickable = table.status !== 'occupied';
    
    return (
      <button
        key={table.id}
        onClick={() => toggleTable(table.id)}
        disabled={!isClickable}
        className={`absolute border-3 shadow-lg ${getTableColor(status)} ${getBorderRadius(table.type)}`}
        style={{
          left: `${table.x}px`,      // Posisi horizontal
          top: `${table.y}px`,       // Posisi vertikal
          width: `${table.width}px`, // Lebar meja
          height: `${table.height}px` // Tinggi meja
        }}
      >
        <span>#{table.id}</span>
        <span>{table.capacity} kursi</span>
      </button>
    );
  })}
</div>
```

**Key Points:**
- `position: absolute` digunakan untuk custom positioning
- `style` prop untuk positioning dinamis
- `className` untuk styling visual

### Step 5: Hitung Total Kapasitas

```javascript
const getTotalCapacity = () => {
  return selectedTables.reduce((total, tableId) => {
    const table = tables.find(t => t.id === tableId);
    return total + (table?.capacity || 0);
  }, 0);
};
```

---

## Kustomisasi Layout

### 1. Merencanakan Layout

Sebelum coding, buat sketsa layout cafe Anda:

```
┌─────────────────────────────────┐
│  Window Area                    │
│  [T1] [T2]    [T3]      [T4]   │
│                                 │
│       [T5]   [T6]   [T7]       │
│                                 │
│  [T8]        [T9]              │
│                          [Bar] │
└─────────────────────────────────┘
```

### 2. Menentukan Koordinat

Gunakan sistem koordinat dengan origin (0,0) di kiri atas:

```
(0,0) ──────────────────────► X
  │
  │    [Meja 1]
  │    (x:50, y:50)
  │
  │           [Meja 2]
  │           (x:180, y:50)
  │
  ▼
  Y
```

### 3. Tips Positioning

**Spacing yang baik:**
```javascript
// Jarak antar meja minimum 20-30px
const SPACING = 30;

// Meja 1
{ x: 50, y: 50, width: 80, height: 80 }

// Meja 2 (di sebelah kanan dengan spacing)
{ x: 50 + 80 + SPACING, y: 50, width: 80, height: 80 }
// x = 50 + 80 + 30 = 160
```

**Area zones:**
```javascript
// Definisikan zona-zona
const ZONES = {
  WINDOW: { startY: 0, endY: 150 },
  CENTER: { startY: 150, endY: 300 },
  BAR: { startX: 550, endX: 650 }
};

// Meja di zona window
{ x: 50, y: 50 } // y dalam range WINDOW

// Meja di zona bar
{ x: 580, y: 100 } // x dalam range BAR
```

### 4. Ukuran Meja Berdasarkan Kapasitas

Rekomendasi ukuran:

```javascript
// 2 orang (meja kecil bulat)
{ width: 80, height: 80, capacity: 2, type: 'round' }

// 4 orang (meja persegi/rectangle)
{ width: 100, height: 80, capacity: 4, type: 'rectangle' }

// 6 orang (meja rectangle besar)
{ width: 120, height: 80, capacity: 6, type: 'rectangle' }

// 8 orang (meja panjang)
{ width: 150, height: 80, capacity: 8, type: 'rectangle' }
```

---

## Best Practices

### 1. Responsive Design

#### Masalah dengan Fixed Pixel Positioning

Positioning menggunakan pixel (`px`) akan menyebabkan masalah di layar kecil:

```javascript
// ❌ TIDAK RESPONSIF - Meja akan keluar dari container di mobile
style={{
  left: `${table.x}px`,      // 50px, 180px, dll
  top: `${table.y}px`,
  width: `${table.width}px`,
  height: `${table.height}px`
}}
```

**Masalah yang terjadi:**
- Meja keluar dari container di layar kecil
- Layout tidak proporsional
- Posisi relatif antar meja berubah

#### Solusi: Percentage-Based Positioning

Gunakan persentase untuk membuat layout yang benar-benar responsif:

```javascript
// ✅ RESPONSIF - Layout tetap proporsional di semua ukuran
const CANVAS_WIDTH = 700;   // Lebar canvas referensi
const CANVAS_HEIGHT = 500;  // Tinggi canvas referensi

style={{
  left: `${(table.x / CANVAS_WIDTH) * 100}%`,
  top: `${(table.y / CANVAS_HEIGHT) * 100}%`,
  width: `${(table.width / CANVAS_WIDTH) * 100}%`,
  height: `${(table.height / CANVAS_HEIGHT) * 100}%`
}}
```

**Cara kerja:**
1. Tentukan dimensi canvas referensi (misalnya 700x500)
2. Buat data meja dengan koordinat pixel sesuai canvas tersebut
3. Convert ke persentase saat rendering
4. Layout akan scale proporsional di semua ukuran layar

#### Implementasi Lengkap Container Responsif

```javascript
// Container dengan aspect ratio tetap
<div className="relative w-full overflow-hidden">
  <div 
    className="relative bg-gradient-to-br from-stone-100 to-stone-50 rounded-xl p-2 md:p-4"
    style={{ 
      width: '100%',
      paddingBottom: '71.43%', // Aspect ratio: (500/700) * 100 = 71.43%
    }}
  >
    {/* Absolute positioning wrapper */}
    <div className="absolute inset-0 p-2 md:p-4">
      {tables.map((table) => (
        <button
          key={table.id}
          className="absolute border-3 shadow-lg"
          style={{
            left: `${(table.x / 700) * 100}%`,
            top: `${(table.y / 500) * 100}%`,
            width: `${(table.width / 700) * 100}%`,
            height: `${(table.height / 500) * 100}%`,
          }}
        >
          {/* Table content */}
        </button>
      ))}
    </div>
  </div>
</div>
```

**Penjelasan Aspect Ratio:**
```javascript
// Rumus padding-bottom untuk aspect ratio
paddingBottom = (height / width) * 100 + '%'

// Contoh:
// Canvas 700x500
paddingBottom = (500 / 700) * 100 = 71.43%

// Canvas 640x500
paddingBottom = (500 / 640) * 100 = 78.125%

// Canvas 800x600
paddingBottom = (600 / 800) * 100 = 75%
```

#### Responsive Typography & Icons

Gunakan Tailwind responsive classes:

```javascript
<button className="absolute">
  {/* Font size responsif */}
  <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg">
    #{table.id}
  </span>
  
  {/* Icon size responsif */}
  <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
  
  {/* Padding responsif */}
  <div className="p-1 sm:p-2 md:p-3">
    {table.capacity} kursi
  </div>
</button>
```

#### Responsive Breakpoints

```javascript
// Tailwind breakpoints
sm: 640px   // Small devices
md: 768px   // Medium devices (tablets)
lg: 1024px  // Large devices (desktops)
xl: 1280px  // Extra large devices
2xl: 1536px // 2X Extra large devices

// Contoh penggunaan
<div className="p-2 sm:p-4 md:p-6 lg:p-8">
  {/* Padding 8px di mobile, 16px di tablet, 24px di desktop, 32px di large */}
</div>
```

#### Testing Responsiveness

Checklist untuk testing:

```javascript
// ✅ Test di berbagai ukuran
Mobile:   320px - 480px
Tablet:   481px - 768px
Desktop:  769px - 1024px
Large:    1025px+

// ✅ Yang harus di-check:
1. Semua meja masih di dalam container
2. Spacing antar meja proporsional
3. Text masih terbaca (tidak terlalu kecil)
4. Button masih bisa di-klik (min 44x44px untuk touch)
5. Tidak ada horizontal scroll
```

#### Helper Function untuk Responsive Positioning

```javascript
// Buat helper function untuk konversi
const useResponsiveTable = (canvasWidth = 700, canvasHeight = 500) => {
  const toPercentage = (table) => ({
    left: (table.x / canvasWidth) * 100,
    top: (table.y / canvasHeight) * 100,
    width: (table.width / canvasWidth) * 100,
    height: (table.height / canvasHeight) * 100,
  });

  const toPixel = (percentageTable, containerWidth, containerHeight) => ({
    x: (percentageTable.left / 100) * containerWidth,
    y: (percentageTable.top / 100) * containerHeight,
    width: (percentageTable.width / 100) * containerWidth,
    height: (percentageTable.height / 100) * containerHeight,
  });

  return { toPercentage, toPixel };
};

// Penggunaan
const { toPercentage } = useResponsiveTable(700, 500);

<button
  style={{
    left: `${toPercentage(table).left}%`,
    top: `${toPercentage(table).top}%`,
    width: `${toPercentage(table).width}%`,
    height: `${toPercentage(table).height}%`,
  }}
>
```

#### Alternative: Scale Transform

Untuk kasus tertentu, bisa juga gunakan CSS transform:

```javascript
// Container dengan scale
const [scale, setScale] = useState(1);

useEffect(() => {
  const updateScale = () => {
    const container = containerRef.current;
    if (container) {
      const scale = container.offsetWidth / 700; // 700 = canvas width
      setScale(scale);
    }
  };
  
  updateScale();
  window.addEventListener('resize', updateScale);
  return () => window.removeEventListener('resize', updateScale);
}, []);

<div 
  ref={containerRef}
  className="relative overflow-hidden"
  style={{ height: `${500 * scale}px` }}
>
  <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
    {/* Tables with fixed pixel positioning */}
  </div>
</div>
```

**Catatan:** Percentage-based lebih direkomendasikan karena lebih native dan tidak ada rendering issues.

### 2. Accessibility

```javascript
<button
  onClick={() => toggleTable(table.id)}
  aria-label={`Meja ${table.id}, kapasitas ${table.capacity} orang`}
  aria-pressed={selectedTables.includes(table.id)}
  disabled={table.status === 'occupied'}
>
  {/* Content */}
</button>
```

### 3. Visual Feedback

```javascript
// Hover effect
className="hover:shadow-xl transform hover:scale-105 transition-all duration-200"

// Selected state dengan animasi
className={`transition-all duration-300 ${
  isSelected ? 'ring-4 ring-blue-400 shadow-2xl' : ''
}`}
```

### 4. Validation

```javascript
const validateReservation = () => {
  if (selectedTables.length === 0) {
    alert('Pilih minimal satu meja');
    return false;
  }
  
  const totalCapacity = getTotalCapacity();
  if (totalCapacity < guestCount) {
    alert(`Kapasitas tidak cukup. Tersedia: ${totalCapacity}, Dibutuhkan: ${guestCount}`);
    return false;
  }
  
  return true;
};
```

### 5. Data Persistence

```javascript
// Simpan ke localStorage
useEffect(() => {
  localStorage.setItem('selectedTables', JSON.stringify(selectedTables));
}, [selectedTables]);

// Load dari localStorage
useEffect(() => {
  const saved = localStorage.getItem('selectedTables');
  if (saved) {
    setSelectedTables(JSON.parse(saved));
  }
}, []);
```

---

## Troubleshooting

### Problem 1: Meja Overlap

**Gejala:** Meja saling bertumpuk

**Solusi:**
```javascript
// Fungsi untuk check overlap
const checkOverlap = (table1, table2) => {
  return !(
    table1.x + table1.width < table2.x ||
    table2.x + table2.width < table1.x ||
    table1.y + table1.height < table2.y ||
    table2.y + table2.height < table1.y
  );
};

// Validasi saat menambah meja
const addTable = (newTable) => {
  const hasOverlap = tables.some(table => checkOverlap(table, newTable));
  if (hasOverlap) {
    console.error('Meja overlap dengan meja lain');
    return;
  }
  setTables([...tables, newTable]);
};
```

### Problem 2: Meja Keluar dari Container

**Gejala:** Meja tidak terlihat atau terpotong

**Solusi:**
```javascript
// Validasi boundaries
const validatePosition = (table, containerWidth, containerHeight) => {
  if (table.x < 0 || table.y < 0) return false;
  if (table.x + table.width > containerWidth) return false;
  if (table.y + table.height > containerHeight) return false;
  return true;
};
```

### Problem 3: Click Event Tidak Berfungsi

**Gejala:** Tidak bisa klik meja

**Checklist:**
1. Pastikan `z-index` tidak tertutup elemen lain
2. Check apakah ada `pointer-events: none`
3. Pastikan button tidak disabled untuk meja available
4. Periksa console untuk error JavaScript

```javascript
// Debug click
const handleTableClick = (tableId) => {
  console.log('Clicked table:', tableId);
  toggleTable(tableId);
};
```

### Problem 4: Performance Issue dengan Banyak Meja

**Gejala:** Lag saat banyak meja

**Solusi:**
```javascript
// Gunakan React.memo untuk optimization
const TableButton = React.memo(({ table, onToggle, isSelected }) => {
  return (
    <button onClick={() => onToggle(table.id)}>
      {/* Content */}
    </button>
  );
});

// Gunakan useCallback
const toggleTable = useCallback((tableId) => {
  // Toggle logic
}, []);
```

---

## Contoh Lengkap: Konfigurasi Real Cafe

```javascript
const cafeLayout = [
  // Area Depan (Near entrance)
  { id: 1, x: 30, y: 30, width: 70, height: 70, capacity: 2, status: 'available', type: 'round' },
  { id: 2, x: 130, y: 30, width: 70, height: 70, capacity: 2, status: 'available', type: 'round' },
  
  // Area Jendela (Window side)
  { id: 3, x: 30, y: 130, width: 100, height: 60, capacity: 4, status: 'available', type: 'rectangle' },
  { id: 4, x: 160, y: 130, width: 100, height: 60, capacity: 4, status: 'occupied', type: 'rectangle' },
  
  // Area Tengah (Center)
  { id: 5, x: 290, y: 30, width: 90, height: 90, capacity: 4, status: 'available', type: 'square' },
  { id: 6, x: 290, y: 150, width: 120, height: 70, capacity: 6, status: 'available', type: 'rectangle' },
  
  // Area VIP (Back corner)
  { id: 7, x: 440, y: 30, width: 150, height: 80, capacity: 8, status: 'available', type: 'rectangle' },
  
  // Counter Bar (Right side)
  { id: 8, x: 620, y: 30, width: 60, height: 60, capacity: 2, status: 'available', type: 'round' },
  { id: 9, x: 620, y: 110, width: 60, height: 60, capacity: 2, status: 'available', type: 'round' },
  { id: 10, x: 620, y: 190, width: 60, height: 60, capacity: 2, status: 'occupied', type: 'round' },
];
```

---

## Resources & Next Steps

### Untuk Dipelajari Lebih Lanjut:

1. **Drag & Drop:** Implementasi fitur drag meja untuk admin
2. **Real-time Updates:** Integrasi WebSocket untuk update real-time
3. **Time Slots:** Tambahkan pemilihan waktu reservasi
4. **Floor Plans:** Multiple lantai atau area
5. **Backend Integration:** Simpan ke database

### Library Tambahan:

- **react-dnd**: Untuk drag and drop
- **framer-motion**: Untuk animasi advanced
- **react-grid-layout**: Alternative untuk grid-based layout
- **konva / fabric.js**: Untuk canvas-based editor

---

## Kesimpulan

Sistem table selector yang baik memiliki karakteristik:

✅ **Fleksibel** - Mudah dikustomisasi sesuai layout cafe
✅ **Intuitif** - User friendly dan mudah dipahami  
✅ **Visual** - Representasi yang jelas dari layout fisik
✅ **Responsive** - Berfungsi di berbagai ukuran layar
✅ **Maintainable** - Code yang bersih dan terstruktur

Dengan mengikuti panduan ini, Anda dapat membuat sistem reservasi meja yang sesuai dengan kebutuhan bisnis Anda.

---

**Happy Coding! ☕**
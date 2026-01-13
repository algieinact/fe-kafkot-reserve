# Fitur Varian Menu - Bottom Sheet

## Ringkasan Perubahan

Telah ditambahkan fitur **Variant Selection Bottom Sheet** pada halaman Menu (`MenuPage.tsx`). Sekarang ketika user klik tombol "Pesan", akan muncul bottom sheet untuk memilih varian menu sebelum ditambahkan ke keranjang.

---

## Perubahan UI/UX

### 1. **Tombol Menu Card**
**Sebelum:**
- Tombol berubah menjadi quantity controls (+/-) setelah item ditambahkan ke cart
- User bisa langsung tambah/kurang quantity dari card

**Sesudah:**
- Tombol **selalu menampilkan "Pesan"** 
- Tidak ada quantity controls di card
- Setiap klik "Pesan" akan membuka bottom sheet untuk pilih varian

### 2. **Bottom Sheet Varian**
Ketika user klik "Pesan", muncul bottom sheet dengan:

#### **Informasi Menu**
- Gambar menu
- Nama menu
- Deskripsi
- Harga

#### **Opsi Varian**
1. **Tingkat Gula** (Sugar Level)
   - Kurang Manis (less)
   - Normal
   - Lebih Manis (plus)

2. **Tingkat Es** (Ice Level)
   - Sedikit Es (less)
   - Normal
   - Banyak Es (plus)

3. **Jumlah** (Quantity)
   - Kontrol +/- untuk mengatur jumlah pesanan
   - Minimal 1

#### **Footer**
- Menampilkan total harga (harga × quantity)
- Tombol "Tambah ke Keranjang"

---

## State Management

### State Baru yang Ditambahkan:
```typescript
const [showVariantSheet, setShowVariantSheet] = useState(false);
const [selectedMenuForVariant, setSelectedMenuForVariant] = useState<Menu | null>(null);
const [selectedSugar, setSelectedSugar] = useState<"less" | "normal" | "plus">("normal");
const [selectedIce, setSelectedIce] = useState<"less" | "normal" | "plus">("normal");
const [variantQuantity, setVariantQuantity] = useState(1);
```

### Handler Functions:

#### `handleAddToCart(menu: Menu)`
- Membuka bottom sheet
- Set menu yang dipilih
- Reset varian ke default (normal, normal, qty: 1)

#### `handleConfirmVariant()`
- Menambahkan item ke cart dengan quantity yang dipilih
- Menutup bottom sheet
- Reset semua state varian

---

## Grid Layout Update

Grid menu card juga diupdate untuk layar besar:
- **Mobile:** 2 kolom
- **Small (sm):** 2 kolom  
- **Large (lg):** 3 kolom
- **Extra Large (xl):** **5 kolom** ✨

---

## TODO - Integrasi API

Saat ini varian belum tersimpan di cart karena menunggu API. Yang perlu dilakukan:

### 1. Update Cart Context
Tambahkan support untuk menyimpan varian:

```typescript
interface CartItem {
  menu: Menu;
  quantity: number;
  variants?: {
    sugar: "less" | "normal" | "plus";
    ice: "less" | "normal" | "plus";
  };
}
```

### 2. Update addItem Function
```typescript
const addItem = (menu: Menu, quantity: number, variants?: Variants) => {
  // Logic untuk menambahkan item dengan varian
  // Jika varian berbeda, treat sebagai item terpisah
};
```

### 3. Update handleConfirmVariant
```typescript
const handleConfirmVariant = () => {
  if (!selectedMenuForVariant) return;
  
  addItem(selectedMenuForVariant, variantQuantity, {
    sugar: selectedSugar,
    ice: selectedIce,
  });
  
  // Close and reset...
};
```

### 4. Update Cart Display
Tampilkan varian di cart modal dan floating cart:
```
Matcha Latte
- Gula: Normal
- Es: Sedikit Es
```

### 5. Update Order API
Kirim varian ke backend saat checkout:
```json
{
  "order_items": [
    {
      "menu_id": 1,
      "quantity": 2,
      "variants": {
        "sugar": "normal",
        "ice": "less"
      }
    }
  ]
}
```

---

## Fitur Tambahan yang Bisa Dikembangkan

1. **Varian Dinamis dari API**
   - Baca varian yang tersedia dari menu API
   - Beberapa menu mungkin tidak punya varian tertentu
   - Contoh: makanan tidak perlu opsi "Es"

2. **Catatan Khusus**
   - Tambah textarea untuk catatan tambahan
   - "Tanpa gula", "Extra shot", dll

3. **Add-ons/Toppings**
   - Pilihan topping dengan harga tambahan
   - Pearl, Jelly, Cream Cheese, dll

4. **Validasi Varian**
   - Beberapa kombinasi mungkin tidak valid
   - Contoh: "Hot drink" tidak bisa "Banyak Es"

---

## File yang Diubah

- ✅ `src/pages/Public/MenuPage.tsx`
  - Tambah state untuk variant selection
  - Tambah bottom sheet UI
  - Update tombol card (selalu "Pesan")
  - Update grid layout (5 kolom di xl)

---

## Testing Checklist

- [ ] Klik "Pesan" membuka bottom sheet
- [ ] Bisa pilih tingkat gula (3 opsi)
- [ ] Bisa pilih tingkat es (3 opsi)
- [ ] Bisa ubah quantity dengan +/-
- [ ] Total harga update sesuai quantity
- [ ] Klik "Tambah ke Keranjang" menutup sheet dan tambah item
- [ ] Klik X atau backdrop menutup sheet tanpa tambah item
- [ ] Bottom sheet responsive di mobile dan desktop
- [ ] Grid 5 kolom terlihat bagus di layar besar
- [ ] Tombol "Pesan" tidak berubah setelah item di cart

---

Dibuat pada: 2026-01-13

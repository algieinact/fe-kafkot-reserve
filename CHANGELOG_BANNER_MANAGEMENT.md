# Dokumentasi Perubahan - Menu Card & Banner Management

## Ringkasan Perubahan

Berikut adalah perubahan yang telah dilakukan sesuai permintaan:

### 1. Pemisahan Komponen Card untuk Menu

**Masalah:** 
- Komponen `Card` yang sama digunakan untuk menu card dan komponen lain
- Hal ini menyebabkan layout berantakan di halaman lain yang menggunakan komponen `Card`

**Solusi:**
- ✅ Membuat komponen baru `MenuCard.tsx` khusus untuk menu items
- ✅ Mengembalikan komponen `Card` ke layout semula dengan padding `p-6`
- ✅ Mengupdate `MenuPage.tsx` untuk menggunakan `MenuCard` bukan `Card`

**File yang Diubah:**
- `src/components/ui/card/MenuCard.tsx` (BARU)
- `src/components/ui/card/index.tsx` (DIPERBARUI - ditambahkan padding)
- `src/pages/Public/MenuPage.tsx` (DIPERBARUI - menggunakan MenuCard)

---

### 2. Halaman Admin untuk Mengelola Banner

**Fitur yang Dibuat:**
- ✅ Halaman admin lengkap untuk mengelola banner carousel di MenuPage
- ✅ Form dengan komponen dari `src/components/form`
- ✅ Upload gambar menggunakan DropZone dengan preview
- ✅ Data table untuk menampilkan daftar banner
- ✅ CRUD functionality (Create, Read, Update, Delete)
- ✅ Validasi form
- ✅ Confirmation modal untuk delete

**File yang Dibuat:**
- `src/pages/Admin/ManageBanner.tsx` (BARU)
- `src/components/form/form-elements/BannerDropZone.tsx` (BARU)

**File yang Diubah:**
- `src/App.tsx` - Menambahkan route `/dashboard/banners`
- `src/layout/AppSidebar.tsx` - Menambahkan menu "Kelola Banner"

---

## Detail Komponen Banner Management

### Interface Banner
```typescript
interface Banner {
  id: number;
  title: string;           // Judul banner
  subtitle: string;        // Subjudul banner
  image_url: string;       // URL gambar banner
  order: number;           // Urutan tampilan (1 = pertama)
  is_active: boolean;      // Status aktif/nonaktif
  created_at?: string;
  updated_at?: string;
}
```

### Fitur Form
1. **Upload Gambar**
   - Drag & drop atau browse file
   - Preview gambar sebelum upload
   - Format: PNG, JPG, WebP, SVG
   - Rekomendasi ukuran: 1200x400 pixels (rasio 3:1)

2. **Input Fields**
   - Judul Banner (text)
   - Subjudul Banner (text)
   - Urutan Tampilan (number, min: 1)
   - Status Aktif (checkbox)

3. **Validasi**
   - Semua field wajib diisi (ditandai dengan *)
   - Urutan minimal 1

### Data Saat Ini
Saat ini menggunakan **mock data** dengan 3 banner default:
1. "Selamat Datang di Ruang Dugamasa"
2. "Promo Spesial Hari Ini"
3. "Reservasi Mudah & Cepat"

---

## TODO - Integrasi API

Ketika API sudah siap, berikut yang perlu dilakukan:

### 1. Buat API Endpoints
```
GET    /api/banners              - Get all banners
POST   /api/banners              - Create new banner
PUT    /api/banners/:id          - Update banner
DELETE /api/banners/:id          - Delete banner
POST   /api/banners/upload       - Upload banner image
```

### 2. Update ManageBanner.tsx
Ganti bagian berikut:

```typescript
// Di bagian useEffect, tambahkan:
useEffect(() => {
  fetchBanners();
}, []);

const fetchBanners = async () => {
  try {
    setLoading(true);
    const response = await bannerApi.getBanners(); // Buat bannerApi di services/api
    if (response.success && response.data) {
      setBanners(response.data);
    }
  } catch (err) {
    setError("Gagal memuat banner");
  } finally {
    setLoading(false);
  }
};

// Di handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (editingBanner) {
      await bannerApi.updateBanner(editingBanner.id, formData);
    } else {
      await bannerApi.createBanner(formData);
    }
    await fetchBanners();
    closeModal();
  } catch (err) {
    setError("Gagal menyimpan banner");
  }
};

// Di handleDelete:
const handleDelete = async () => {
  if (!bannerToDelete) return;
  try {
    setDeleting(true);
    await bannerApi.deleteBanner(bannerToDelete);
    await fetchBanners();
    setShowDeleteModal(false);
  } catch (err) {
    setError("Gagal menghapus banner");
  } finally {
    setDeleting(false);
  }
};

// Di handleImageDrop:
const handleImageDrop = async (acceptedFiles: File[]) => {
  if (acceptedFiles.length > 0) {
    const file = acceptedFiles[0];
    try {
      // Upload ke server
      const uploadResponse = await bannerApi.uploadImage(file);
      if (uploadResponse.success) {
        setImagePreview(uploadResponse.data.url);
        setFormData({ ...formData, image_url: uploadResponse.data.url });
      }
    } catch (err) {
      setError("Gagal upload gambar");
    }
  }
};
```

### 3. Update MenuPage.tsx
Ganti `carouselImages` dengan data dari API:

```typescript
const [banners, setBanners] = useState([]);

useEffect(() => {
  const fetchBanners = async () => {
    const response = await bannerApi.getBanners({ is_active: true });
    if (response.success) {
      // Sort by order
      const sortedBanners = response.data.sort((a, b) => a.order - b.order);
      setBanners(sortedBanners);
    }
  };
  fetchBanners();
}, []);

// Ganti carouselImages dengan banners di JSX
```

---

## Cara Mengakses

1. **Login sebagai Admin/Super Admin**
2. **Buka sidebar** dan klik "Kelola Banner"
3. **Atau akses langsung:** `/dashboard/banners`

---

## Catatan Penting

- ⚠️ **API belum diimplementasikan** - Saat ini menggunakan mock data
- ⚠️ **Upload gambar** - Saat ini hanya preview, belum upload ke server
- ✅ **UI/UX sudah lengkap** - Siap untuk integrasi API
- ✅ **Form validation** - Sudah ada validasi dasar
- ✅ **Responsive design** - Sudah responsive untuk mobile dan desktop

---

## Struktur File

```
src/
├── components/
│   ├── ui/
│   │   └── card/
│   │       ├── index.tsx           (Card utama dengan padding)
│   │       └── MenuCard.tsx        (Card khusus menu tanpa padding)
│   └── form/
│       └── form-elements/
│           └── BannerDropZone.tsx  (Dropzone untuk upload banner)
├── pages/
│   ├── Admin/
│   │   └── ManageBanner.tsx        (Halaman kelola banner)
│   └── Public/
│       └── MenuPage.tsx            (Menggunakan MenuCard)
├── layout/
│   └── AppSidebar.tsx              (Sidebar dengan menu banner)
└── App.tsx                         (Route untuk /dashboard/banners)
```

---

## Testing Checklist

- [ ] Card di halaman lain sudah kembali normal (dengan padding)
- [ ] Menu card di MenuPage masih terlihat bagus
- [ ] Bisa akses halaman /dashboard/banners
- [ ] Bisa tambah banner baru
- [ ] Bisa edit banner
- [ ] Bisa hapus banner
- [ ] Upload gambar menampilkan preview
- [ ] Form validation berfungsi
- [ ] Table sorting dan search berfungsi
- [ ] Responsive di mobile

---

Dibuat pada: 2026-01-13

# Kafkot Reserve - Frontend Application

Aplikasi frontend untuk sistem reservasi dan pemesanan cafe Kafkot, dibangun dengan React 19, TypeScript, dan TailwindCSS 4.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 atau lebih tinggi)
- npm atau yarn

### Installation

1. Clone repository ini
2. Install dependencies:
```bash
npm install
```

3. Copy file `.env.example` menjadi `.env`:
```bash
copy .env.example .env
```

4. Jalankan development server:
```bash
npm run dev
```

5. Buka browser di `http://localhost:5173`

## 📁 Struktur Proyek

```
src/
├── components/       # Reusable components
│   ├── common/      # Common components (LoadingSpinner, ProtectedRoute)
│   └── ui/          # UI components dari template (Button, Card, dll)
├── context/         # React Context (AuthContext, CartContext)
├── data/            # Mock data
├── layout/          # Layout components (PublicLayout, AppLayout)
├── pages/           # Page components
│   ├── Public/      # Customer-facing pages
│   └── Dashboard/   # Admin pages (coming soon)
├── services/        # API services
├── types/           # TypeScript types &interfaces
└── utils/           # Utility functions (validators, formatters)
```

## 🎯 Fitur yang Sudah Diimplementasikan

### Customer Pages (Public)
- ✅ **Landing Page** - Hero section dengan informasi cafe
- ✅ **Menu Page** - Browse menu dengan filter kategori dan search
- ✅ **Reservation Page** - Form reservasi dengan pemilihan meja
- ✅ **Payment Page** - Upload bukti pembayaran
- ✅ **Order Status Page** - Track status reservasi

### Core Features
- ✅ **Shopping Cart** - Persistent cart dengan localStorage
- ✅ **Table Selection** - Menampilkan list meja available ber

dasarkan kapasitas dan tipe
- ✅ **Form Validation** - Client-side validation lengkap
- ✅ **Mock Data** - 15 menu items dan 14 meja untuk testing

## 🔧 Tech Stack

- **React 19** - UI library
- **TypeScript 5.7** - Type safety
- **React Router v7** - Routing
- **TailwindCSS 4** - Styling
- **Vite 6** - Build tool

## 📝 Alur Aplikasi

### Customer Flow:
1. Landing Page → Lihat informasi cafe
2. Menu Page → Pilih menu dan tambahkan ke cart
3. Reservation Page → Isi data diri & pilih tanggal/waktu
4. Pilih tipe meja (Indoor/Semi Outdoor/Outdoor)
5. Sistem menampilkan list meja available
6. Pilih meja dari list
7. Review dan konfirmasi reservasi
8. Payment Page → Upload bukti transfer
9. Order Status Page → Track status verifikasi

### Admin Flow (Coming Soon):
1. Login admin
2. Dashboard dengan statistics
3. Manage menu (CRUD)
4. Manage tables (CRUD)
5. Verify payment proofs
6. Approve/reject reservations

## 🎨 Design Features

- ✅ Modern gradient backgrounds
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Smooth transitions & animations
- ✅ Accessible UI components

## 🧪 Testing

Untuk saat ini menggunakan mock data. Flow yang bisa ditest:

1. Tambah menu ke cart → Total price akan update
2. Form validation → Coba submit form kosong
3. Table availability → Pilih tipe meja dan lihat available tables
4. Payment upload → Drag & drop atau click untuk upload
5. Status tracking → Lihat timeline status reservasi

## 📦 Build untuk Production

```bash
npm run build
```

Output akan ada di

 folder `dist/`.

## 🔗 API Integration

Saat ini menggunakan mock data. Untuk integrasi dengan backend:

1. Update `VITE_API_BASE_URL` di file `.env`
2. Services di `src/services/api.ts` sudah siap untuk API calls
3. Replace mock data responses dengan actual API calls

## 👨‍💻 Development Notes

- Semua types ada di `src/types/index.ts`
- API endpoints ada di `src/services/api.ts`
- Validators ada di `src/utils/validators.ts`
- Formatters ada di `src/utils/formatters.ts`
- Mock data ada di `src/data/mockData.ts`

## 📄 License

Private project untuk Tugas Akhir.

## 👤 Author

Telkom University Student

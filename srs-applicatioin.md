# Software Requirements Specification (SRS)

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen Software Requirements Specification (SRS) ini bertujuan untuk mendefinisikan kebutuhan fungsional dan non-fungsional dari Sistem Reservasi dan Pemesanan Cafe berbasis website. Dokumen ini menjadi acuan bagi pengembang, pemilik cafe, dan pihak terkait agar tidak terjadi salah paham di tengah jalan (karena yang paling mahal itu revisi dadakan).

### 1.2 Ruang Lingkup Sistem

Sistem ini memungkinkan pelanggan untuk:

* Melakukan reservasi meja cafe berdasarkan tanggal, jam, dan jumlah orang
* Memesan menu cafe sebelum datang
* Melihat informasi pembayaran manual (transfer bank)
* Mengunggah bukti pembayaran
* Pelanggan tidak perlu authentikasi pada website (hanya mencantumkan informasi reservasi saja pada saat ingin reservasi)

Sistem ini memungkinkan admin cafe untuk:

* Mengelola data menu dan meja
* Memverifikasi bukti pembayaran
* Menerima atau menolak pesanan dan reservasi
* Admin harus authentikasi

Sistem **tidak** menggunakan payment gateway. Semua pembayaran dilakukan secara manual melalui transfer bank.

### 1.3 Definisi, Akronim, dan Singkatan

* **SRS**: Software Requirements Specification
* **Admin**: Pegawai atau pemilik cafe yang mengelola sistem
* **Pelanggan**: Pengunjung cafe yang melakukan reservasi dan pemesanan

### 1.4 Referensi

* IEEE 830 Software Requirements Specification

---

## 2. Deskripsi Umum

### 2.1 Perspektif Produk

Sistem Reservasi dan Pemesanan Cafe merupakan aplikasi berbasis web yang berdiri sendiri (standalone) dan dapat diakses melalui browser tanpa perlu instalasi aplikasi tambahan.

### 2.2 Fungsi Produk

Fungsi utama sistem meliputi:

* Manajemen reservasi meja berbasis kapasitas meja (bukan per kursi)
* Pemilihan tipe posisi duduk (indoor, semi-outdoor, outdoor)
* Pemesanan menu cafe (wajib)
* Perhitungan ketersediaan meja secara otomatis
* Upload dan re-upload bukti pembayaran
* Verifikasi pembayaran oleh admin
* Manajemen menu dan meja

### 2.3 Karakteristik Pengguna

| Jenis Pengguna | Deskripsi                                                       |
| -------------- | --------------------------------------------------------------- |
| Pelanggan      | Pengunjung cafe yang memesan menu dan reservasi meja            |
| Admin          | Pengelola cafe yang memverifikasi pembayaran dan mengelola data |

### 2.4 Batasan Sistem

* Sistem tidak menggunakan payment gateway
* Validasi pembayaran dilakukan secara manual oleh admin
* Ketersediaan meja dihitung berdasarkan kapasitas meja, bukan jumlah kursi
* Logic meja misalnya jika ada meja dengan kapasitas 4 orang dan 2 orang reservasi, maka meja tersebut akan dihitung sebagai ketersediaan
* Satu reservasi akan mengunci satu meja sesuai kapasitas terdekat

### 2.5 Asumsi dan Ketergantungan

* Pelanggan memiliki akses internet
* Admin secara rutin memeriksa bukti pembayaran
* Rekening cafe bersifat statis (tidak sering berubah)

---

## 3. Kebutuhan Fungsional

### 3.1 Kebutuhan Fungsional Pelanggan

**FR-01** Pelanggan dapat melihat daftar menu cafe

**FR-02** Pelanggan wajib memilih menu dan jumlah pesanan sebelum reservasi dikonfirmasi

**FR-03** Pelanggan dapat memilih tipe posisi duduk:

* Indoor
* Semi-outdoor
* Outdoor

**FR-04** Pelanggan dapat melakukan reservasi meja dengan input:

* Tanggal reservasi
* Jam kedatangan
* Jumlah orang

**FR-05** Sistem secara otomatis memilih meja dengan kapasitas terdekat yang masih tersedia

**FR-06** Sistem menolak reservasi secara otomatis jika tidak ada meja tersedia sesuai kriteria atau sistem tidak akan memberikan list meja tersebut apabila meja tersebut terdapat reservasi

**FR-07** Sistem menampilkan ringkasan pesanan, reservasi, dan total pembayaran

**FR-08** Sistem menampilkan halaman informasi pembayaran berisi:

* Nomor rekening cafe
* Total pembayaran
* Instruksi pembayaran

**FR-09** Pelanggan dapat mengunggah bukti pembayaran

**FR-10** Pelanggan dapat mengunggah ulang bukti pembayaran jika pembayaran ditolak

**FR-11** Pelanggan dapat melihat status pesanan:

* Menunggu verifikasi
* Diterima
* Ditolak

### 3.2 Kebutuhan Fungsional Admin

**FR-08** Admin dapat login ke sistem

**FR-09** Admin dapat mengelola data menu (tambah, ubah, hapus)

**FR-10** Admin dapat mengelola data meja dan kapasitas

**FR-11** Admin dapat melihat daftar pesanan dan reservasi

**FR-12** Admin dapat melihat bukti pembayaran pelanggan

**FR-13** Admin dapat memverifikasi pembayaran dengan status:

* Valid (pesanan diterima)
* Tidak valid (pesanan ditolak)

**FR-14** Sistem mengirim notifikasi status pesanan kepada pelanggan melalui:

* Email
* Halaman status di website

---

## 4. Kebutuhan Non-Fungsional

### 4.1 Kebutuhan Kinerja

* Sistem harus mampu menangani minimal 50 pengguna secara bersamaan
* Waktu respon halaman maksimal 3 detik

### 4.2 Kebutuhan Keamanan

* Autentikasi admin menggunakan username dan password
* File bukti pembayaran disimpan secara aman
* Akses admin dibatasi sesuai hak akses

### 4.3 Kebutuhan Usability

* Antarmuka mudah digunakan oleh pengguna awam
* Informasi pembayaran ditampilkan dengan jelas (biar tidak salah transfer)

### 4.4 Kebutuhan Reliabilitas

* Sistem tersedia minimal 99% selama jam operasional cafe

### 4.5 Kebutuhan Portabilitas

* Sistem dapat diakses melalui browser desktop dan mobile

---

## 5. Use Case Utama

### 5.1 Use Case Pelanggan

1. Pelanggan membuka website
2. Pelanggan memilih menu (wajib)
3. Pelanggan memilih tipe posisi duduk
4. Pelanggan mengisi data reservasi
5. Sistem menentukan ketersediaan meja
6. Pelanggan melihat informasi pembayaran
7. Pelanggan melakukan transfer
8. Pelanggan mengunggah bukti pembayaran
9. Menunggu verifikasi admin

### 5.2 Use Case Admin

1. Admin login
2. Admin melihat daftar pesanan
3. Admin memeriksa bukti pembayaran
4. Admin menyetujui atau menolak pesanan

---

## 6. Penutup

Dokumen SRS ini menjadi dasar pengembangan Sistem Reservasi dan Pemesanan Cafe. Setiap perubahan kebutuhan harus diperbarui dalam dokumen ini agar tidak menimbulkan interpretasi berbeda di tahap implementasi.

Kalau di tahap coding nanti tiba-tiba muncul ide "sekalian aja bisa split bill", itu bukan bug—itu scope creep.

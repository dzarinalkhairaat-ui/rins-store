# Rins Store 🛒

**Rins Store** adalah platform E-commerce Mobile-Only yang dirancang khusus untuk bisnis **Dropship** dan **Affiliate Marketing**. Dibangun dengan pendekatan *Mobile-First Design*, aplikasi ini menawarkan pengalaman belanja yang premium, cepat, dan responsif.

![Rins Store Banner](https://via.placeholder.com/1200x600?text=Rins+Store+Preview) 
*(Ganti link ini dengan screenshot aplikasi Anda nanti)*

---

## ✨ Fitur Unggulan

### 📱 Sisi Pengguna (Frontend)
* **Mobile-First UI:** Desain responsif dengan tema *Green Gradient Elegance* dan Glassmorphism.
* **Sistem Pencarian Pintar:** Cari produk berdasarkan kata kunci dengan hasil instan.
* **Navigasi Lengkap:** Filter Kategori, Sub-Kategori (Pills), dan Sorting (Termurah/Termahal/Terbaru).
* **Detail Produk Premium:** Tampilan gambar besar, deskripsi rapi, dan rekomendasi *Produk Serupa*.
* **Keranjang Belanja:** Simpan produk sementara di *local storage*.
* **Checkout WhatsApp:** Integrasi langsung ke WhatsApp Admin dengan format pesan otomatis yang rapi.

### 🛡️ Sisi Admin (Dashboard)
* **Secure Login:** Sistem autentikasi aman menggunakan JWT (JSON Web Token).
* **Manajemen Produk:**
    * Upload Produk (Dropship & Affiliate).
    * Edit & Hapus Produk.
    * Pengaturan Stok & Link Affiliate.
* **Keamanan:** Fitur Ganti Password Admin terintegrasi.
* **Validasi Otomatis:** Cek validitas link affiliate (Shopee/Tokopedia/TikTok) secara *real-time*.

---

## 🛠️ Teknologi yang Digunakan

**Backend:**
* **Node.js** & **Express.js**: Server API yang cepat dan ringan.
* **MongoDB Atlas**: Database Cloud NoSQL untuk menyimpan data produk dan admin.
* **Mongoose**: ODM untuk manajemen skema database.
* **JWT & Bcrypt**: Keamanan autentikasi dan enkripsi password.

**Frontend:**
* **HTML5 & CSS3**: Struktur semantik.
* **SCSS (Sass)**: Styling modular dengan variabel dan mixins.
* **Vanilla JavaScript (ES6+)**: Logika interaktif tanpa framework berat (ringan & cepat).
* **Phosphor Icons**: Ikon vektor modern.

**Deployment:**
* **Vercel**: Hosting untuk Frontend dan Serverless Function Backend.

---

## 🚀 Cara Menjalankan (Localhost)

Ikuti langkah ini untuk menjalankan proyek di komputer Anda:

### 1. Persiapan
Pastikan Anda sudah menginstall **Node.js** dan **Git**.

### 2. Instalasi Dependensi
Buka terminal di folder proyek dan jalankan:
```bash
npm install
// Format angka ke Rupiah
export const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
};

// Fungsi untuk menampilkan notifikasi toast sederhana (Opsional tapi bagus untuk UX)
export const showToast = (message, type = 'success') => {
    // Kita akan buat elemen toast nanti jika perlu, sementara console log dulu
    console.log(`[${type.toUpperCase()}] ${message}`);
};
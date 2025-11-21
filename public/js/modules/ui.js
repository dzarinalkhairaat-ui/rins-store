import { formatRupiah } from './utils.js';

export const renderProducts = (products, containerId) => {
    const container = document.getElementById(containerId);
    
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #94A3B8;">
                <i class="ph ph-package" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p style="font-size: 0.9rem;">Belum ada produk tersedia saat ini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
        // Tentukan aksi tombol kecil di kartu
        const actionButton = product.type === 'affiliate'
            ? `<a href="${product.affiliateLink}" target="_blank" class="btn-add" style="text-decoration: none;">
                 <i class="ph ph-link"></i> Beli
               </a>`
            : `<button class="btn-add" onclick="event.stopPropagation(); window.addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
                 <i class="ph ph-plus"></i> Tambah
               </button>`;

        const imageSrc = product.image || 'assets/images/placeholder.png';

        // Tambahkan onclick="goToDetail(...)" pada kartu utama
        return `
        <div class="product-card" onclick="window.location.href='product.html?id=${product._id}'" style="cursor: pointer;">
            <img src="${imageSrc}" class="card-img" alt="${product.name}" loading="lazy" 
                 onerror="this.src='https://placehold.co/300x300/1e293b/FFF?text=No+Image'">
            <div class="card-body">
                <h3>${product.name}</h3>
                <div class="price">${formatRupiah(product.price)}</div>
                <div onclick="event.stopPropagation()">
                    ${actionButton}
                </div>
            </div>
        </div>
        `;
    }).join('');
};
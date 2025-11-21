import { getProducts, getProductById } from './modules/api.js'; 
import { renderProducts } from './modules/ui.js';
import { addToCart, updateCartBadge } from './modules/cart.js';
import { formatRupiah } from './modules/utils.js'; 

const subcategoriesMap = {
    'Fashion Pria': ['Atasan', 'Bawahan', 'Outer', 'Sepatu', 'Aksesoris'],
    'Fashion Wanita': ['Atasan', 'Bawahan', 'Dress & Terusan', 'Outer', 'Sepatu & Sandal', 'Tas', 'Aksesoris'],
    'Skincare': ['Facial Cleanser', 'Toner & Essence', 'Serum & Ampoule', 'Moisturizer', 'Sunscreen', 'Treatment & Mask', 'Exfoliator', 'Specialized Care'],
    'Pulsa': ['Pulsa Reguler', 'Paket Data', 'Paket Khusus'],
    'Top Up Game': ['Mobile Games', 'Platform Games'],
    'Token Listrik': ['Token PLN Prabayar'],
    'Ebook Digital': ['Fiksi', 'Non-fiksi', 'Pendidikan', 'Hoby & Lifestyle', 'Komik & Manga', 'Majalah Digital', 'Buku Agama', 'Anak & Remaja', 'Motivasi'],
    'Elektronik': ['Smartphone', 'Laptop', 'Televisi & Audio', 'Kamera & Fotografi', 'Peralatan Rumah Tangga', 'Gaming & Konsol', 'Wearable Devices', 'Peralatan Kantor', 'Jaringan & Internet', 'Elektronik Otomotif'],
    'Aksesoris HP Laptop': ['Power Bank', 'Charger Fast Charging', 'Wireless Charger', 'Kabel Data', 'Earphone Kabel', 'Headset Bluetooth', 'Speaker Mini', 'Adapter Audio', 'Casing HP', 'Skin Laptop', 'Tempered Glass', 'Keyboard Cover', 'Tas Laptop', 'Sleeve Laptop', 'Holder HP/Laptop', 'Car/Bike Mount', 'Mouse Wireless', 'Mousepad', 'Stylus Pen', 'External Keyboard', 'USB Hub', 'OTG Adapter', 'Docking Station', 'HDMI Converter', 'Flashdisk', 'SSD Eksternal', 'Card Reader', 'MicroSD', 'WiFi Dongle', 'LAN Adapter', 'Signal Booster', 'Cleaning Kit'],
    'Emas': ['Emas Antam', 'Emas Perhiasan'],
    'Food & Drink': ['Frozen Food', 'Minuman', 'Snack']
};

let currentMainCategory = '';
let currentSort = 'newest';

// VARIABLE GLOBAL UNTUK PILIHAN VARIANT
let selectedSize = null;
let selectedColor = null;

document.addEventListener('DOMContentLoaded', async () => {
    updateCartBadge();
    
    // 1. LOAD BANNER DARI DATABASE (FITUR BARU)
    await loadDynamicBanners();
    
    // 2. JALANKAN SLIDER (Setelah banner terload)
    initBannerSlider();

    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    const categoryQuery = urlParams.get('cat');
    const productId = urlParams.get('id'); 

    // --- 1. HALAMAN SEMUA PRODUK ---
    if (path.includes('products.html')) {
        await loadProducts('', '', '', currentSort);
        const localInput = document.getElementById('local-search-input');
        const localBtn = document.getElementById('local-search-btn');
        if(localInput) {
            localInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') loadProducts(localInput.value, '', '', currentSort); });
        }
        if(localBtn && localInput) {
            localBtn.addEventListener('click', () => { loadProducts(localInput.value, '', '', currentSort); });
        }
    }

    // --- 2. HALAMAN DETAIL PRODUK ---
    else if (productId && path.includes('product.html')) {
        await loadProductDetail(productId);
    }

    // --- 3. HALAMAN SEARCH GLOBAL ---
    else if (searchQuery) {
        const keywordTitle = document.getElementById('search-keyword');
        if(keywordTitle) keywordTitle.innerText = `"${searchQuery}"`;
        const inputPage = document.getElementById('search-input-page');
        if(inputPage) inputPage.value = searchQuery;
        await loadProducts(searchQuery, '', '', currentSort);
        setupSearchListener('search-input-page');
    } 
    
    // --- 4. HALAMAN KATEGORI ---
    else if (categoryQuery) {
        currentMainCategory = categoryQuery;
        updatePageTitles(categoryQuery);
        const subContainer = document.getElementById('subcategory-container');
        if (subContainer && subcategoriesMap[categoryQuery]) {
            let pillsHTML = `<button onclick="filterSubCategory('')" class="sub-pill active" id="sub-all">Semua</button>`;
            subcategoriesMap[categoryQuery].forEach(sub => {
                pillsHTML += `<button onclick="filterSubCategory('${sub}', this)" class="sub-pill">${sub}</button>`;
            });
            subContainer.innerHTML = pillsHTML;
        }
        await loadProducts('', categoryQuery, '', currentSort);
    }

    // --- 5. HALAMAN HOME ---
    else {
        initBannerSlider();
        if(document.getElementById('product-list')) {
            await loadProducts('', '', '', 'newest', 6); 
        }
        setupSearchRedirect();
    }
});

window.handleSort = (sortValue) => {
    currentSort = sortValue;
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    if (path.includes('products.html')) {
        const keyword = document.getElementById('local-search-input')?.value || '';
        loadProducts(keyword, '', '', sortValue);
    } else if (urlParams.get('q')) {
        loadProducts(urlParams.get('q'), '', '', sortValue);
    } else {
        const activePill = document.querySelector('.sub-pill.active');
        const subCat = (activePill && activePill.innerText !== 'Semua') ? activePill.innerText : '';
        loadProducts('', currentMainCategory, subCat, sortValue);
    }
};

async function loadProducts(keyword, category, subcategory, sort, limit = 0) {
    const productList = document.getElementById('product-list');
    const loadingSpinner = document.getElementById('loading');
    if (!productList) return;
    if(loadingSpinner) loadingSpinner.style.display = 'flex';
    productList.innerHTML = '';
    let products = await getProducts(keyword, category, subcategory, sort);
    if (limit > 0) { products = products.slice(0, limit); }
    if(loadingSpinner) loadingSpinner.style.display = 'none';
    renderProducts(products, 'product-list');
}

function initBannerSlider() {
    const wrapper = document.querySelector('.banner-wrapper');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.banner-slide');
    if (!wrapper || slides.length === 0) return; 
    setInterval(() => {
        const width = wrapper.offsetWidth;
        let currentIndex = Math.round(wrapper.scrollLeft / width);
        let nextIndex = currentIndex + 1;
        if (nextIndex >= slides.length) { nextIndex = 0; }
        wrapper.scrollTo({ left: width * nextIndex, behavior: 'smooth' });
        dots.forEach(d => d.classList.remove('active'));
        if(dots[nextIndex]) dots[nextIndex].classList.add('active');
    }, 5000);
}

// --- FUNGSI DETAIL PRODUK (DENGAN LOGIKA VARIAN) ---
async function loadProductDetail(id) {
    const product = await getProductById(id);
    if (!product) { alert('Produk tidak ditemukan!'); window.location.href = 'index.html'; return; }
    
    document.title = `${product.name} | Rins Store`;
    document.getElementById('p-image').src = product.image;
    document.getElementById('p-category').innerText = product.subcategory || product.category;
    document.getElementById('p-name').innerText = product.name;
    document.getElementById('p-price').innerText = formatRupiah(product.price);
    document.getElementById('p-desc').innerText = product.description;

    // --- RENDER VARIAN FASHION ---
    const fashionVariants = document.getElementById('fashion-variants');
    const colorContainer = document.getElementById('color-container');
    const sizeContainer = document.getElementById('size-container');
    const colorOptions = document.getElementById('color-options');
    const sizeOptions = document.getElementById('size-options');
    const btnShowChart = document.getElementById('btn-show-chart');
    const sizeChartImg = document.getElementById('size-chart-img');

    // Cek apakah ini produk fashion dan punya data varian
    let hasVariants = false;
    if (product.category.includes('Fashion')) {
        // Render Warna
        if (product.colors && product.colors.length > 0) {
            hasVariants = true;
            colorContainer.style.display = 'block';
            colorOptions.innerHTML = product.colors.map(color => 
                `<button class="btn-variant" onclick="selectVariant('color', '${color}', this)">${color}</button>`
            ).join('');
        }
        // Render Ukuran
        if (product.sizes && product.sizes.length > 0) {
            hasVariants = true;
            sizeContainer.style.display = 'block';
            sizeOptions.innerHTML = product.sizes.map(size => 
                `<button class="btn-variant" onclick="selectVariant('size', '${size}', this)">${size}</button>`
            ).join('');
        }
        // Render Tombol Tabel Ukuran
        if (product.sizeChartImage) {
            btnShowChart.style.display = 'flex';
            sizeChartImg.src = product.sizeChartImage;
        }

        if (hasVariants) {
            fashionVariants.style.display = 'block';
        }
    }

    // --- RENDER TOMBOL AKSI ---
    const actionBtnContainer = document.getElementById('action-buttons');
    if (product.type === 'affiliate') {
        // Tombol Affiliate (Langsung ke link luar)
        actionBtnContainer.innerHTML = `<a href="${product.affiliateLink}" target="_blank" class="btn-buy-full" style="text-decoration: none; display:flex; justify-content: center; align-items: center; gap: 8px;">Beli di ${product.affiliatePlatform || 'App'} <i class="ph ph-arrow-square-out"></i></a>`;
    } else {
        // Tombol Dropship (Tambah ke Troli dengan cek varian)
        actionBtnContainer.innerHTML = `<button class="btn-buy-full" onclick="addToCartWithVariant('${product._id}', '${product.name}', ${product.price}, '${product.image}', ${hasVariants})"><i class="ph ph-shopping-cart-plus" style="margin-right:8px; font-size: 1.2rem;"></i> Tambah ke Troli</button>`;
    }

    loadRelatedProducts(product.category, product._id);
    setupShareButton(product);
}

// --- FUNGSI PILIH VARIAN (Diklik user) ---
window.selectVariant = (type, value, btnElement) => {
    // Reset pilihan sebelumnya di grup yang sama
    const parent = btnElement.parentElement;
    parent.querySelectorAll('.btn-variant').forEach(btn => btn.classList.remove('active'));
    
    // Aktifkan tombol yang diklik
    btnElement.classList.add('active');

    // Simpan nilai ke variabel global
    if (type === 'size') selectedSize = value;
    if (type === 'color') selectedColor = value;
};

// --- FUNGSI TAMBAH KE TROLI (DENGAN CEK VARIAN) ---
window.addToCartWithVariant = (id, name, price, image, hasVariants) => {
    // Jika produk punya varian, wajib dipilih dulu
    if (hasVariants) {
        const colorContainer = document.getElementById('color-container');
        const sizeContainer = document.getElementById('size-container');

        // Cek Warna (jika ada pilihannya)
        if (colorContainer.style.display !== 'none' && !selectedColor) {
            alert('⚠️ Silakan pilih WARNA terlebih dahulu!');
            return;
        }
        // Cek Ukuran (jika ada pilihannya)
        if (sizeContainer.style.display !== 'none' && !selectedSize) {
            alert('⚠️ Silakan pilih UKURAN terlebih dahulu!');
            return;
        }
    }
    
    // Jika lolos validasi, panggil fungsi addToCart asli
    // Kita bisa kirim data varian juga jika nanti cart systemnya mendukung
    // Untuk sekarang, kita kirim data dasar dulu sesuai system cart yang ada
    
    // TODO NANTI: Modifikasi cart.js agar bisa menyimpan 'variant: "Merah, XL"'
    // addToCart({ _id: id, name, price, image, variant: `${selectedColor || ''} ${selectedSize || ''}`.trim() });
    
    // SEMENTARA: Pakai fungsi lama dulu
    addToCartDetail(id, name, price, image);
};


async function loadRelatedProducts(category, currentId) {
    const relatedContainer = document.getElementById('related-list');
    if (!relatedContainer) return;
    const allProducts = await getProducts('', category, '', 'newest');
    const related = allProducts.filter(p => p._id !== currentId).slice(0, 4); 
    if (related.length === 0) { relatedContainer.innerHTML = '<p style="color: #64748b; font-size: 0.9rem; grid-column: 1/-1; text-align: center;">Tidak ada produk serupa.</p>'; return; }
    renderProducts(related, 'related-list');
}

function setupShareButton(product) {
    const shareIcon = document.querySelector('.ph-share-network');
    if (shareIcon) {
        const shareBtn = shareIcon.closest('button');
        const newShareBtn = shareBtn.cloneNode(true);
        shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
        newShareBtn.addEventListener('click', async () => {
            const shareData = { title: 'Rins Store', text: `Cek produk ${product.name} ini!`, url: window.location.href };
            try { if (navigator.share) { await navigator.share(shareData); } else { await navigator.clipboard.writeText(window.location.href); alert('Link produk berhasil disalin!'); } } catch (err) { console.log('Share dibatalkan'); }
        });
    }
}

function updatePageTitles(text) {
    const headerTitle = document.getElementById('header-title');
    if(headerTitle) headerTitle.innerText = text;
}

window.filterSubCategory = (subName, btnElement) => {
    document.querySelectorAll('.sub-pill').forEach(el => el.classList.remove('active'));
    if (subName === '') { document.getElementById('sub-all').classList.add('active'); updatePageTitles(currentMainCategory); } 
    else { if(btnElement) btnElement.classList.add('active'); updatePageTitles(subName); }
    loadProducts('', currentMainCategory, subName);
};

window.filterCategory = (categoryName) => {
    if (!categoryName) { window.location.href = 'index.html'; return; }
    window.location.href = `category.html?cat=${encodeURIComponent(categoryName)}`;
};

function setupSearchRedirect() {
    const searchInput = document.querySelector('.search-box input');
    const searchIcon = document.querySelector('.search-box i');
    if (!searchInput) return;
    const doRedirect = () => { const keyword = searchInput.value.trim(); if (keyword) window.location.href = `search.html?q=${keyword}`; };
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') doRedirect(); });
    if(searchIcon) searchIcon.addEventListener('click', doRedirect);
}

function setupSearchListener(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') { const keyword = e.target.value.trim(); if (keyword) window.location.href = `search.html?q=${keyword}`; } });
}

window.addToCart = (id, name, price, image) => { addToCart({ _id: id, name, price, image }); };
window.addToCartDetail = (id, name, price, image) => { addToCart({ _id: id, name, price, image }); };

// --- FUNGSI LOAD DYNAMIC BANNER ---
async function loadDynamicBanners() {
    try {
        const res = await fetch('/api/banners'); // Panggil API
        const banners = await res.json();
        const path = window.location.pathname;

        // 1. Update Banner Home
        if (path === '/' || path.includes('index.html')) {
            updateHomeSlide(banners, 'home_1', 0);
            updateHomeSlide(banners, 'home_2', 1);
            updateHomeSlide(banners, 'home_3', 2);
        }
        
        // 2. Update Banner About
        if (path.includes('about.html') && banners['about_hero']) {
            const hero = document.querySelector('.info-hero');
            if(hero) hero.style.backgroundImage = `linear-gradient(to bottom, rgba(15,23,42,0.3), #0F172A), url('${banners['about_hero'].imageUrl}')`;
        }

        // 3. Update Banner Help
        if (path.includes('help.html') && banners['help_hero']) {
            const hero = document.querySelector('.info-hero'); // Khusus help.html yang style lama (gradient), kita timpa jika ada gambar
            // Jika Anda mau mengubah help.html jadi gambar juga, code ini akan jalan.
            // Tapi di desain terakhir help.html pakai gradient CSS.
            // Jika mau diubah jadi gambar, uncomment baris bawah:
            // if(hero) hero.style.background = `linear-gradient(to bottom, rgba(15,23,42,0.6), #0F172A), url('${banners['help_hero'].imageUrl}') no-repeat center/cover`;
        }

    } catch (err) {
        console.log('Gagal load banner dinamis, pakai default.');
    }
}

function updateHomeSlide(banners, key, index) {
    if (banners[key]) {
        const slides = document.querySelectorAll('.banner-slide');
        if (slides[index]) {
            const b = banners[key];
            // Ganti Background Gambar (Kanan)
            const imgEl = slides[index].querySelector('.banner-img img');
            if (imgEl && b.imageUrl) imgEl.src = b.imageUrl;

            // Ganti Teks
            const titleEl = slides[index].querySelector('h2');
            const subEl = slides[index].querySelector('p');
            const btnEl = slides[index].querySelector('.banner-btn');
            
            if (titleEl && b.title) titleEl.innerHTML = b.title; // innerHTML biar bisa pakai <br>
            if (subEl && b.subtitle) subEl.textContent = b.subtitle;
            if (btnEl && b.linkText) btnEl.textContent = b.linkText;
        }
    }
}
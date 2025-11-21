const BASE_URL = 'http://localhost:3000';

// --- DATA KATEGORI ---
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

let isLinkValid = false;
let tempProductData = null;

export const handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.querySelector('.btn-login');
    const originalText = btn.innerText; btn.innerText = 'Loading...'; btn.disabled = true;

    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminName', data.username);
            // SIMPAN DATA PROFIL
            localStorage.setItem('adminEmail', data.email);
            localStorage.setItem('adminWa1', data.whatsapp1 || '');
            localStorage.setItem('adminWa2', data.whatsapp2 || '');
            
            alert('Login Berhasil! Selamat datang bos.');
            window.location.href = 'admin.html';
        } else { alert(data.message || 'Login Gagal'); }
    } catch (error) { console.error(error); alert('Terjadi kesalahan koneksi'); } 
    finally { btn.innerText = originalText; btn.disabled = false; }
};

export const initAdminPage = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { window.location.href = 'login.html'; return; }
    loadAdminProducts();
    setupFormListeners(token);
    toggleBusinessType();
    toggleFashionFields(document.getElementById('category')?.value);

    window.logout = () => {
        localStorage.clear(); // Hapus semua data
        window.location.href = 'login.html';
    };
};

async function loadAdminProducts() {
    const tbody = document.getElementById('adminProductList');
    if(!tbody) return;
    try {
        const res = await fetch(`${BASE_URL}/api/products`);
        const products = await res.json();
        tbody.innerHTML = products.map(p => `
            <tr>
                <td><img src="${p.image}" class="td-img" onerror="this.src='https://placehold.co/50'"></td>
                <td><div style="font-weight:600; color:#fff;">${p.name}</div><div style="font-size:0.8rem; color:#94a3b8;">${p.category}</div></td>
                <td style="color:#4ade80;">Rp ${p.price.toLocaleString('id-ID')}</td>
                <td>
                    <button class="action-btn edit" onclick='window.editProduct(${JSON.stringify(p)})'><i class="ph ph-pencil-simple"></i></button>
                    <button class="action-btn delete" onclick="window.deleteProduct('${p._id}')"><i class="ph ph-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (error) { console.error('Gagal load produk:', error); }
}

function toggleBusinessType() {
    const typeSelect = document.getElementById('type');
    const dropshipFields = document.getElementById('dropshipFields');
    const affiliateFields = document.getElementById('affiliateFields');
    if(!typeSelect) return;
    if (typeSelect.value === 'affiliate') {
        dropshipFields.style.display = 'none'; affiliateFields.style.display = 'block';
    } else {
        dropshipFields.style.display = 'block'; affiliateFields.style.display = 'none';
    }
}

function toggleFashionFields(categoryVal) {
    const fashionFields = document.getElementById('fashionFields');
    if (!fashionFields) return;
    if (categoryVal && categoryVal.includes('Fashion')) { fashionFields.classList.remove('hidden'); } 
    else { fashionFields.classList.add('hidden'); }
}

function setupFormListeners(token) {
    const typeSelect = document.getElementById('type');
    if(typeSelect) { typeSelect.addEventListener('change', toggleBusinessType); }

    const affiliateLinkInput = document.getElementById('affiliateLink');
    if(affiliateLinkInput) {
        affiliateLinkInput.addEventListener('focus', () => {
            const currentType = document.getElementById('type').value;
            if (currentType === 'dropship') {
                alert('⚠️ Bagian ini khusus Affiliate!\nSilakan ganti "Tipe Bisnis" menjadi Affiliate jika ingin mengisi link.');
                document.getElementById('type').focus();
            }
        });
    }

    const catSelect = document.getElementById('category');
    if(catSelect) {
        catSelect.addEventListener('change', (e) => { 
            updateSubCategories(e.target.value);
            toggleFashionFields(e.target.value);
        });
    }

    const linkInput = document.getElementById('affiliateLink');
    const platformSelect = document.getElementById('affiliatePlatform');
    const linkMsg = document.getElementById('linkMsg');

    const validateLink = async () => {
        const link = linkInput.value; const platform = platformSelect.value;
        if (link.length < 5) { linkMsg.textContent = ""; isLinkValid = false; return; }
        try {
            const res = await fetch(`${BASE_URL}/api/affiliate/validate`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ link, platform })
            });
            const data = await res.json();
            if (data.valid) { linkMsg.textContent = "✅ " + data.message; linkMsg.className = "text-green"; isLinkValid = true; } 
            else { linkMsg.textContent = "❌ " + data.message; linkMsg.className = "text-red"; isLinkValid = false; }
        } catch (err) { console.error(err); isLinkValid = false; }
    };

    if(linkInput) { linkInput.addEventListener('input', validateLink); platformSelect.addEventListener('change', validateLink); }

    const form = document.getElementById('addProductForm');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = document.getElementById('type').value;
            const category = document.getElementById('category').value;

            let sizes = ''; let colors = ''; let sizeChartImage = '';
            if (category.includes('Fashion')) {
                sizes = document.getElementById('fashionSizes').value;
                colors = document.getElementById('fashionColors').value;
                sizeChartImage = document.getElementById('sizeChartImage').value;
            }

            tempProductData = {
                editId: document.getElementById('editProductId').value,
                name: document.getElementById('name').value,
                price: document.getElementById('price').value,
                description: document.getElementById('description').value,
                image: document.getElementById('image').value,
                category: category,
                subcategory: document.getElementById('subcategory').value,
                type: type,
                stock: document.getElementById('stock').value,
                affiliateLink: document.getElementById('affiliateLink').value,
                affiliatePlatform: document.getElementById('affiliatePlatform').value,
                sizes: sizes, colors: colors, sizeChartImage: sizeChartImage
            };

            if (type === 'affiliate') {
                if (!isLinkValid) { alert('⛔ Link Affiliate TIDAK VALID!'); linkInput.focus(); return; }
                document.getElementById('modalAffiliateCheck').checked = false;
                document.getElementById('confirmModal').style.display = 'flex';
            } else { submitProductData(); }
        });
    }
    document.getElementById('cancelEditBtn').addEventListener('click', resetForm);
}

export const submitProductData = async () => {
    if (!tempProductData) return;
    const token = localStorage.getItem('adminToken');
    const method = tempProductData.editId ? 'PUT' : 'POST';
    const url = tempProductData.editId 
        ? `${BASE_URL}/api/products/${tempProductData.editId}` 
        : `${BASE_URL}/api/products`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(tempProductData)
        });
        if (res.ok) {
            alert(tempProductData.editId ? 'Produk Berhasil Diupdate!' : 'Produk Berhasil Diupload!');
            document.getElementById('confirmModal').style.display = 'none';
            resetForm(); loadAdminProducts();
        } else { const err = await res.json(); alert('Gagal: ' + err.message); }
    } catch (error) { alert('Error koneksi'); }
};

window.updateSubCategories = (categoryVal, selectedSub = '') => {
    const subGroup = document.getElementById('subCatGroup');
    const subSelect = document.getElementById('subcategory');
    const subs = subcategoriesMap[categoryVal];
    if (subs) {
        subGroup.style.display = 'block';
        let optionsHTML = `<option value="">-- Pilih Subkategori --</option>`;
        subs.forEach(sub => { optionsHTML += `<option value="${sub}" ${sub === selectedSub ? 'selected' : ''}>${sub}</option>`; });
        subSelect.innerHTML = optionsHTML;
    } else { subGroup.style.display = 'none'; subSelect.innerHTML = ''; }
};

window.deleteProduct = async (id) => {
    if(!confirm('Yakin ingin menghapus produk ini?')) return;
    const token = localStorage.getItem('adminToken');
    try {
        const res = await fetch(`${BASE_URL}/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) { alert('Produk terhapus!'); loadAdminProducts(); } else { alert('Gagal menghapus'); }
    } catch (error) { alert('Error koneksi'); }
};

window.editProduct = (p) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('formTitle').innerText = 'Edit Produk';
    document.getElementById('btnText').innerText = 'Update Produk';
    document.getElementById('editProductId').value = p._id;
    document.getElementById('cancelEditBtn').style.display = 'block';

    document.getElementById('type').value = p.type;
    toggleBusinessType();

    document.getElementById('name').value = p.name;
    document.getElementById('price').value = p.price;
    document.getElementById('image').value = p.image;
    document.getElementById('description').value = p.description;
    document.getElementById('category').value = p.category;
    
    window.updateSubCategories(p.category, p.subcategory);
    toggleFashionFields(p.category);

    document.getElementById('fashionSizes').value = p.sizes ? p.sizes.join(', ') : '';
    document.getElementById('fashionColors').value = p.colors ? p.colors.join(', ') : '';
    document.getElementById('sizeChartImage').value = p.sizeChartImage || '';
    
    if(p.type === 'dropship') {
        document.getElementById('stock').value = p.stock;
    } else {
        document.getElementById('affiliateLink').value = p.affiliateLink;
        document.getElementById('affiliatePlatform').value = p.affiliatePlatform;
        isLinkValid = true; 
        document.getElementById('linkMsg').innerText = '';
    }
};

function resetForm() {
    document.getElementById('addProductForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('formTitle').innerText = 'Tambah Produk Baru';
    document.getElementById('btnText').innerText = 'Upload Produk';
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('subCatGroup').style.display = 'none';
    document.getElementById('linkMsg').innerText = '';
    isLinkValid = false;
    tempProductData = null;
    toggleBusinessType();
    toggleFashionFields('');
}

// --- UPDATE PROFILE (FITUR BARU) ---
export const updateProfile = async (email, wa1, wa2, password) => {
    const token = localStorage.getItem('adminToken');
    const payload = { email, whatsapp1: wa1, whatsapp2: wa2 };
    if(password) payload.password = password;

    try {
        const res = await fetch(`${BASE_URL}/api/auth/profile`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
            alert('✅ Pengaturan berhasil disimpan! Mohon login ulang.');
            window.closeSettingsModal();
            window.logout(); 
        } else { alert(data.message || 'Gagal update profil'); }
    } catch (error) { alert('Terjadi kesalahan koneksi'); }
};

// --- FITUR BANNER ---
export const fetchBanners = async () => {
    try {
        const res = await fetch(`${BASE_URL}/api/banners`);
        return await res.json();
    } catch (error) {
        console.error('Gagal ambil banner');
        return {};
    }
};

export const saveBannerData = async (payload) => {
    const token = localStorage.getItem('adminToken');
    try {
        const res = await fetch(`${BASE_URL}/api/banners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            alert('✅ Banner berhasil disimpan!');
        } else {
            alert('Gagal menyimpan banner');
        }
    } catch (error) {
        alert('Error koneksi');
    }
};
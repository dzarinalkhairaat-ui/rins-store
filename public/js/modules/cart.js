import { formatRupiah } from './utils.js';

const CART_KEY = 'rins_store_cart';
const BASE_URL = 'https://rins-store.vercel.app';

export const getCart = () => {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product) => {
    let cart = getCart();
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) { existingItem.qty += 1; } 
    else { cart.push({ ...product, qty: 1 }); }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge(true);
    showToast(`<b>${product.name}</b> masuk troli!`);
};

export const updateCartBadge = (animate = false) => {
    const cart = getCart();
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.innerText = totalQty;
        if (totalQty > 0) { badge.classList.remove('hidden'); } 
        else { badge.classList.add('hidden'); }
        if (animate) { badge.classList.add('pop'); setTimeout(() => badge.classList.remove('pop'), 300); }
    }
};

function showToast(message) {
    let toast = document.getElementById('custom-toast');
    if (!toast) {
        toast = document.createElement('div'); toast.id = 'custom-toast'; toast.className = 'toast-notification'; document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="ph ph-check-circle"></i> <span>${message}</span>`;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
}

// --- INIT HALAMAN CART (Fetch Info Toko) ---
export const initCartPage = async () => {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const checkoutArea = document.getElementById('checkout-area');
    const totalEl = document.getElementById('cart-total');
    
    // Fetch Nomor WA Admin dari Database
    try {
        const res = await fetch(`${BASE_URL}/api/auth/store-info`);
        const data = await res.json();
        const adminSelect = document.getElementById('admin-number');
        if(adminSelect && data) {
            adminSelect.innerHTML = `
                <option value="${data.whatsapp1}">Admin Rins 1</option>
                ${data.whatsapp2 ? `<option value="${data.whatsapp2}">Admin Rins 2</option>` : ''}
            `;
        }
    } catch (err) { console.error('Gagal ambil info toko'); }

    updateCartBadge();

    if (cart.length === 0) {
        if(checkoutArea) checkoutArea.style.display = 'none';
        return;
    }

    if(checkoutArea) checkoutArea.style.display = 'block';
    if(container) container.innerHTML = '';

    let grandTotal = 0;

    cart.forEach((item, index) => {
        grandTotal += item.price * item.qty;
        const imgSrc = item.image || 'assets/images/placeholder.png';
        container.innerHTML += `
            <div class="cart-item">
                <img src="${imgSrc}" class="cart-img" onerror="this.src='https://placehold.co/80'">
                <div class="cart-details">
                    <h4 style="font-size: 0.9rem; margin-bottom: 4px; color: white;">${item.name}</h4>
                    <div style="color: #22C55E; font-weight: bold;">${formatRupiah(item.price)}</div>
                    <div class="qty-control">
                        <button class="btn-qty" onclick="window.updateQty(${index}, -1)"><i class="ph ph-minus"></i></button>
                        <span style="color: white; font-size: 0.9rem; min-width: 20px; text-align: center;">${item.qty}</span>
                        <button class="btn-qty" onclick="window.updateQty(${index}, 1)"><i class="ph ph-plus"></i></button>
                        <button style="background: none; border: none; color: #ef4444; margin-left: 15px; cursor: pointer;" onclick="window.removeItem(${index})"><i class="ph ph-trash" style="font-size: 1.1rem;"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    if(totalEl) totalEl.innerText = formatRupiah(grandTotal);
};

window.updateQty = (index, change) => {
    let cart = getCart();
    cart[index].qty += change;
    if (cart[index].qty < 1) cart[index].qty = 1;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    initCartPage(); updateCartBadge(); 
};

window.removeItem = (index) => {
    let cart = getCart();
    cart.splice(index, 1);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    location.reload(); 
};

export const processCheckout = () => {
    const name = document.getElementById('cx-name').value;
    const phone = document.getElementById('cx-phone').value;
    const address = document.getElementById('cx-address').value;
    const payment = document.getElementById('payment-method').value;
    const adminNumber = document.getElementById('admin-number').value;

    if (!name || !phone || !address) { alert('Mohon lengkapi Nama, No HP, dan Alamat!'); return; }

    const cart = getCart();
    let message = `Halo Admin Rins Store, saya mau pesan:\n\n`;
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `📦 *${item.name}*\n`;
        message += `   ${item.qty} x ${formatRupiah(item.price)} = ${formatRupiah(subtotal)}\n`;
    });

    message += `\n💰 *Total: ${formatRupiah(total)}*`;
    message += `\n\n📋 *Data Pembeli:*`;
    message += `\nNama: ${name}`;
    message += `\nNo HP: ${phone}`;
    message += `\nAlamat: ${address}`;
    message += `\nMetode Bayar: ${payment}`;
    message += `\n\nMohon diproses ya kak!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminNumber}?text=${encodedMessage}`, '_blank');
};
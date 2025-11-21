const API_URL = 'http://localhost:3000/api'; 

// Update: Menambahkan parameter sort
export const getProducts = async (keyword = '', category = '', subcategory = '', sort = '') => {
    try {
        let url = `${API_URL}/products?`;
        
        if (keyword) url += `keyword=${keyword}&`;
        if (category) url += `category=${encodeURIComponent(category)}&`;
        if (subcategory) url += `subcategory=${encodeURIComponent(subcategory)}&`;
        // Parameter Baru
        if (sort) url += `sort=${sort}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Gagal mengambil data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

// ... (Fungsi getProductById biarkan tetap sama)
export const getProductById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error('Produk tidak ditemukan');
        return await response.json();
    } catch (error) {
        console.error('Error fetching product detail:', error);
        return null;
    }
};
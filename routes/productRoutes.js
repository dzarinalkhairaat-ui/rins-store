const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// AMBIL SEMUA PRODUK (Dengan Fitur Search, Filter Kategori, Subkategori & SORTING)
router.get('/', async (req, res) => {
  try {
    // 1. Filter Keyword, Category, Subcategory
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category
      ? { category: req.query.category }
      : {};

    const subcategory = req.query.subcategory
      ? { subcategory: req.query.subcategory }
      : {};

    const query = { ...keyword, ...category, ...subcategory };

    // 2. LOGIKA SORTING
    let sortOption = { createdAt: -1 }; // Default: Terbaru

    if (req.query.sort === 'price_asc') {
      sortOption = { price: 1 }; // Harga Terendah ke Tertinggi
    } else if (req.query.sort === 'price_desc') {
      sortOption = { price: -1 }; // Harga Tertinggi ke Terendah
    } else if (req.query.sort === 'oldest') {
        sortOption = { createdAt: 1 }; // Terlama
    }

    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AMBIL DETAIL SATU PRODUK
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product) res.json(product);
        else res.status(404).json({message: 'Produk tidak ditemukan'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// TAMBAH PRODUK (Admin Only)
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE PRODUK (Admin Only)
router.put('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product) {
            Object.assign(product, req.body);
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({message: "Produk tidak ditemukan"});
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// HAPUS PRODUK (Admin Only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Produk berhasil dihapus' });
        } else {
            res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
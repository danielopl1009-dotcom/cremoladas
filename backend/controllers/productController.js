import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
  try {
    const p = Product.create(req.body);
    res.status(201).json({ success: true, data: p });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getProducts = async (req, res) => {
  const list = Product.getAll({ activeOnly: req.query.activeOnly === 'true', search: req.query.search });
  res.json({ success: true, data: list });
};

export const getFlavors = async (req, res) => {
  try {
    const { query } = await import('../config/database.js');
    const result = query('SELECT id, name, sort_order FROM flavors WHERE active = 1 ORDER BY sort_order ASC');
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getProductById = async (req, res) => {
  const p = Product.getById(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'No encontrado' });
  res.json({ success: true, data: p });
};

export const updateProduct = async (req, res) => {
  try {
    const p = Product.update(req.params.id, req.body);
    res.json({ success: true, data: p });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const deleteProduct = async (req, res) => {
  const p = Product.delete(req.params.id);
  res.json({ success: true, data: p });
};

export const activateProduct = async (req, res) => {
  const p = Product.activate(req.params.id);
  res.json({ success: true, data: p });
};

export default { createProduct, getProducts, getProductById, updateProduct, deleteProduct, activateProduct };

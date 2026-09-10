import { query } from '../config/database.js';

class Product {
  static create(data) {
    const result = query(
      `INSERT INTO products (name,description,sizes,active,image_url)
       VALUES (?,?,?,?,?) RETURNING *`,
      [data.name, data.description || null, JSON.stringify(data.sizes),
       data.active !== undefined ? data.active : 1, data.imageUrl || null]
    );
    return result[0];
  }

  static getAll(filters = {}) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (filters.activeOnly) sql += ' AND active=1';
    if (filters.search) { 
      params.push(`%${filters.search}%`); 
      sql += ` AND name LIKE ?`; 
    }
    sql += ' ORDER BY name ASC';
    const result = query(sql, params);
    return result;
  }

  static getById(id) {
    const result = query('SELECT * FROM products WHERE id=?', [id]);
    return result[0] || null;
  }

  static update(id, data) {
    const sets = [], params = [];
    const add = (col, val) => { params.push(val); sets.push(`${col}=?`); };
    if (data.name        !== undefined) add('name', data.name);
    if (data.description !== undefined) add('description', data.description);
    if (data.sizes       !== undefined) add('sizes', JSON.stringify(data.sizes));
    if (data.active      !== undefined) add('active', data.active);
    if (data.imageUrl    !== undefined) add('image_url', data.imageUrl);
    if (!sets.length) throw new Error('Nada que actualizar');
    params.push(id);
    const result = query(
      `UPDATE products SET ${sets.join(',')} WHERE id=? RETURNING *`, params
    );
    return result[0] || null;
  }

  static delete(id) {
    const result = query('UPDATE products SET active=0 WHERE id=? RETURNING *', [id]);
    return result[0] || null;
  }

  static activate(id) {
    const result = query('UPDATE products SET active=1 WHERE id=? RETURNING *', [id]);
    return result[0] || null;
  }
}

export default Product;

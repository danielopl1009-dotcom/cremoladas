import { query } from '../config/database.js';

class Product {
  static async create(data) {
    const result = await query(
      `INSERT INTO products (name,description,sizes,active,image_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.name, data.description || null, JSON.stringify(data.sizes),
       data.active !== undefined ? data.active : 1, data.imageUrl || null]
    );
    return result[0];
  }

  static async getAll(filters = {}) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (filters.activeOnly) sql += ' AND active=1';
    if (filters.search) { 
      params.push(`%${filters.search}%`); 
      sql += ` AND name LIKE $${paramCount++}`; 
    }
    sql += ' ORDER BY name ASC';
    
    const result = await query(sql, params);
    return result;
  }

  static async getById(id) {
    const result = await query('SELECT * FROM products WHERE id=$1', [id]);
    return result[0] || null;
  }

  static async update(id, data) {
    const sets = [], params = [];
    let paramCount = 1;
    
    const add = (col, val) => { 
      params.push(val); 
      sets.push(`${col}=$${paramCount++}`); 
    };
    
    if (data.name        !== undefined) add('name', data.name);
    if (data.description !== undefined) add('description', data.description);
    if (data.sizes       !== undefined) add('sizes', JSON.stringify(data.sizes));
    if (data.active      !== undefined) add('active', data.active);
    if (data.imageUrl    !== undefined) add('image_url', data.imageUrl);
    if (!sets.length) throw new Error('Nada que actualizar');
    params.push(id);
    
    const result = await query(
      `UPDATE products SET ${sets.join(',')} WHERE id=$${paramCount++} RETURNING *`, params
    );
    return result[0] || null;
  }

  static async delete(id) {
    const result = await query('UPDATE products SET active=0 WHERE id=$1 RETURNING *', [id]);
    return result[0] || null;
  }

  static async activate(id) {
    const result = await query('UPDATE products SET active=1 WHERE id=$1 RETURNING *', [id]);
    return result[0] || null;
  }
}

export default Product;

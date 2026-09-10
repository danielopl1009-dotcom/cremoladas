import { query, exec } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create(data) {
    const hash = await bcrypt.hash(data.password, 10);
    const result = await query(
      `INSERT INTO users (name,email,password,role,active)
       VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,role,active,created_at`,
      [data.name, data.email, hash, data.role, data.active !== undefined ? data.active : 1]
    );
    return result[0];
  }

  static async getAll(filters = {}) {
    let sql = 'SELECT id,name,email,role,active,created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (filters.role) { 
      params.push(filters.role); 
      sql += ` AND role=$${paramCount++}`; 
    }    
    if (filters.activeOnly) { 
      sql += ' AND active=1'; 
    }
    sql += ' ORDER BY name ASC';
    
    const result = await query(sql, params);
    return result;
  }

  static async getById(id) {
    const result = await query('SELECT id,name,email,role,active,created_at FROM users WHERE id=$1', [id]);
    return result[0] || null;
  }

  static async getByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email=$1', [email]);
    return result[0] || null;
  }

  static async update(id, data) {
    const sets = [], params = [];
    let paramCount = 1;
    
    const add = (col, val) => { 
      params.push(val); 
      sets.push(`${col}=$${paramCount++}`); 
    };
    
    if (data.name     !== undefined) add('name', data.name);
    if (data.email    !== undefined) add('email', data.email);
    if (data.role     !== undefined) add('role', data.role);
    if (data.active   !== undefined) add('active', data.active);
    if (data.password !== undefined) add('password', await bcrypt.hash(data.password, 10));
    
    if (!sets.length) throw new Error('Nada que actualizar');
    
    sets.push(`updated_at=NOW()`);
    params.push(id);
    
    const result = await query(
      `UPDATE users SET ${sets.join(',')} WHERE id=$${paramCount++} RETURNING id,name,email,role,active`,
      params
    );
    return result[0] || null;
  }

  static verifyPassword(plain, hash) { return bcrypt.compare(plain, hash); }

  static async deactivate(id) {
    const result = await query('UPDATE users SET active=0 WHERE id=$1 RETURNING id,name,email,role,active', [id]);
    return result[0] || null;
  }

  static async activate(id) {
    const result = await query('UPDATE users SET active=1 WHERE id=$1 RETURNING id,name,email,role,active', [id]);
    return result[0] || null;
  }
}

export default User;
